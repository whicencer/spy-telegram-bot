import dotenv from "dotenv";
dotenv.config();

import { Bot, Context } from "grammy";
import { getEnvVariable } from "./utils/getEnvVariable";
import { UserRepository, IUserRepository } from "../database/User";
import { IMessagesRepository, MessagesRepository } from "../database/Messages";
import { ResponseBuilder } from "./services/ResponseBuilder/ResponseBuilder";
import { sleep } from "./utils/sleep";
import { getTranslation } from "./utils/getTranslation";
import { LanguageCodes, LanguageTranslationKeys } from "./types/Language";
import { isLanguageCode } from "./utils/isLanguageCode";

export default class BotInstance {
  private bot: Bot = new Bot(getEnvVariable("BOT_TOKEN"));
	private usersCollection: IUserRepository = new UserRepository();
	private messagesCollection: IMessagesRepository = new MessagesRepository();
  constructor() {}

  public async run() {
    this.registerHandlers();
    await this.bot.start();
  }

  private registerHandlers() {
    this.bot.command("start", this.startCommandHandler);
		this.bot.callbackQuery(/start_choose_lang_\w{2,}/, this.startChooseLanguageHandler);
		
		this.bot.on("business_message", this.businessMessageHandler);
		this.bot.on("edited_business_message", this.businessEditedMessageHandler);
		this.bot.on("deleted_business_messages", this.deletedBusinessMessageHandler);
  }

	private businessMessageHandler = async (ctx: Context) => {
		const businessConnectionId = ctx.businessMessage?.business_connection_id;
		if (businessConnectionId) {
			const { user_chat_id } = await ctx.api.getBusinessConnection(businessConnectionId);
			
			await this.usersCollection.setAttribute(user_chat_id, "lastReceiveMessageAt", Date.now());
			if (ctx.businessMessage && ctx.from && ctx.businessMessage.text) {
				const { text, message_id } = ctx.businessMessage;
				await this.messagesCollection.create({
					messageId: message_id,
					userId: user_chat_id,
					text,
					senderId: ctx.from.id,
					senderName: ctx.from.first_name,
					senderUsername: ctx.from.username,
				});
			}
		}
	}

	private businessEditedMessageHandler = async (ctx: Context) => {
		try {
			const businessConnectionId = ctx.editedBusinessMessage?.business_connection_id;

			if (businessConnectionId && ctx.editedBusinessMessage && ctx.from) {
				const { user_chat_id: receiverId } = await ctx.api.getBusinessConnection(businessConnectionId);
				const { message_id, text: newMessageText } = ctx.editedBusinessMessage;
				const oldMessage = await this.messagesCollection.getById(message_id);

				if (newMessageText) {
					await this.messagesCollection.messageEdited(message_id, oldMessage.text, newMessageText);
					
					const { text, parse_mode } = await ResponseBuilder.buildEditedMessageResponse(
						ctx.from,
						oldMessage.text,
						newMessageText,
						receiverId
					);
					await ctx.api.sendMessage(receiverId, text, { parse_mode, link_preview_options: { is_disabled: true } });
				}
			}
		} catch (error: any) {
			console.error("Error in businessEditedMessageHandler:", error);
		}
	}

	private deletedBusinessMessageHandler = async (ctx: Context) => {
		try {
			const businessConnectionId = ctx.deletedBusinessMessages?.business_connection_id;

			if (businessConnectionId && ctx.chat && ctx.deletedBusinessMessages) {
				const { user_chat_id } = await ctx.api.getBusinessConnection(businessConnectionId);
				const { message_ids } = ctx.deletedBusinessMessages;

				for (const messageId of message_ids) {
					const deletedMessage = await this.messagesCollection.getById(messageId);
					if (deletedMessage) {
						await this.messagesCollection.setAttribute(messageId, "isDeleted", true);
						await this.messagesCollection.setAttribute(messageId, "deletedAt", Date.now());

						const { text, parse_mode } = await ResponseBuilder.buildDeletedMessageResponse(ctx.chat, deletedMessage.text, user_chat_id);
						await ctx.api.sendMessage(
							user_chat_id,
							text,
							{
								reply_markup: {
									inline_keyboard: [
										[{ text: "👁 View messages", callback_data: "view_all_deleted_messages" }],
									]
								},
								parse_mode,
								link_preview_options: { is_disabled: true }
							}
						);
					}
					await sleep(500);
				};
			}
		} catch (error: any) {
			console.error("Error in deletedBusinessMessageHandler:", error.description);
		}
	}

  private startCommandHandler = async (ctx: Context) => {
		try {
			if (ctx.from) {
				const isUserExists = await this.usersCollection.exists(ctx.from.id);
				
				if (!isUserExists) {
					await ctx.reply("Choose your language:", {
						reply_markup: {
							inline_keyboard: [
								[{ text: "🇬🇧 English", callback_data: `start_choose_lang_${LanguageCodes.en}` }],
								[{ text: "🇷🇺 Русский", callback_data: `start_choose_lang_${LanguageCodes.ru}` }],
								[{ text: "🇺🇦 Українська", callback_data: `start_choose_lang_${LanguageCodes.ua}` }]
							]
						}
					});
				} else {
					const greetingMessage = await getTranslation(
						LanguageTranslationKeys.start_message,
						{ firstName: ctx.from.first_name },
						ctx.from.id
					);

					await ctx.reply(greetingMessage);
				}
			}
		} catch (error: any) {
			await ctx.reply("An error occurred while processing your request. Please try again later.");
			console.error("Error in startCommandHandler:", error);
		}
  }

	private startChooseLanguageHandler = async (ctx: Context) => {
		try {
			await ctx.deleteMessage();
			if (ctx.callbackQuery?.data && ctx.from) {
				const languageCode = ctx.callbackQuery.data.split("_").pop();
	
				if (!languageCode || !isLanguageCode(languageCode)) {
					await ctx.answerCallbackQuery("Invalid language selected. Please try again.");
					await ctx.reply("Invalid language selected. Please try again.");
					return;
				}
	
				await this.usersCollection.create({
					userId: ctx.from.id,
					firstName: ctx.from.first_name,
					lastName: ctx.from.last_name,
					username: ctx.from.username,
					languageCode,
				});
	
				const greetingMessage = await getTranslation(
					LanguageTranslationKeys.start_message,
					{ firstName: ctx.from.first_name },
					ctx.from.id,
					languageCode
				);

				await ctx.answerCallbackQuery("Language set successfully!");
				await ctx.reply(greetingMessage);
			}
		} catch (error) {
			console.error("Error in startChooseLanguageHandler:", error);
			await ctx.answerCallbackQuery("An error occurred while processing your request. Please try again later.");
		}
	}
}