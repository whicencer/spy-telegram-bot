import dotenv from "dotenv";
dotenv.config();

import { Bot, Context } from "grammy";
import { getEnvVariable } from "./utils/getEnvVariable";
import { UserRepository, type IUserRepository } from "./database/User";
import { type IMessagesRepository, MessagesRepository } from "./database/Messages";
import { sleep } from "./utils/sleep";
import dedent from "dedent";

export default class BotInstance {
  private bot: Bot = new Bot(getEnvVariable("BOT_TOKEN"));
	private usersCollection: IUserRepository = new UserRepository();
	private messagesCollection: IMessagesRepository = new MessagesRepository();
  constructor() {}

  public async run() {
    this.registerHandlers();
    await this.bot.start({
			onStart: () => console.log("Bot started successfully!")
		});
  }

  private registerHandlers() {
    this.bot.command("start", this.startCommandHandler);
		
		this.bot.on("business_message", this.businessMessageHandler);
		this.bot.on("edited_business_message", this.businessEditedMessageHandler);
		this.bot.on("deleted_business_messages", this.deletedBusinessMessageHandler);
  }

	private businessMessageHandler = async (ctx: Context) => {
		const businessConnectionId = ctx.businessMessage?.business_connection_id;
		
		if (businessConnectionId) {
			const { user_chat_id } = await ctx.api.getBusinessConnection(businessConnectionId);
			
			try {
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
			} catch (error: any) {
				console.error("Error in businessMessageHandler:", error);
			}
		}
	}

	private businessEditedMessageHandler = async (ctx: Context) => {
		const businessConnectionId = ctx.editedBusinessMessage?.business_connection_id;
		
		if (businessConnectionId && ctx.editedBusinessMessage && ctx.from) {
			const { user_chat_id: receiverId } = await ctx.api.getBusinessConnection(businessConnectionId);
			const { message_id, text: newMessageText } = ctx.editedBusinessMessage;
			const oldMessage = await this.messagesCollection.getById(message_id);
			
			if (newMessageText && oldMessage) {
				try {
					await this.messagesCollection.messageEdited(
						message_id,
						oldMessage.text,
						newMessageText
					);

					await ctx.api.sendMessage(
						receiverId,
						dedent`
							User <a href="t.me/${ctx.from.username || "whocencer"}"><b>${ctx.from.first_name}</b></a> <code>(${ctx.from.id})</code> edited a message:

							<i>Old message:</i>
							<blockquote>${oldMessage.text}</blockquote>
							
							<i>New message:</i>
							<blockquote>${newMessageText}</blockquote>
						`,
						{
							parse_mode: "HTML",
							link_preview_options: { is_disabled: true }
						}
					);
				} catch (error) {
					console.error("Error in businessEditedMessageHandler:", error);
				}
			}
		}
	}

	private deletedBusinessMessageHandler = async (ctx: Context) => {
		const businessConnectionId = ctx.deletedBusinessMessages?.business_connection_id;

		if (businessConnectionId && ctx.chat && ctx.deletedBusinessMessages) {
			try {
				const { user_chat_id } = await ctx.api.getBusinessConnection(businessConnectionId);
				const { message_ids } = ctx.deletedBusinessMessages;

				for (const messageId of message_ids) {
					const deletedMessage = await this.messagesCollection.getById(messageId);
					if (deletedMessage) {
						await this.messagesCollection.setAttribute(messageId, "isDeleted", true);
						await this.messagesCollection.setAttribute(messageId, "deletedAt", Date.now());

						await ctx.api.sendMessage(
							user_chat_id,
							dedent`
								User <a href="t.me/${ctx.chat.username || "whocencer"}"><b>${ctx.chat.first_name}</b></a> <i>(${ctx.chat.id})</i> deleted a message:
								\n<blockquote>${deletedMessage.text || "No text found."}</blockquote>
							`,
							{
								parse_mode: "HTML",
								link_preview_options: { is_disabled: true }
							}
						);
					}
					await sleep(500);
				};
			} catch (error) {
				console.error("Error in deletedBusinessMessageHandler:", error);
			}
		}
	}

  private startCommandHandler = async (ctx: Context) => {
		if (ctx.from) {
			try {
				await this.usersCollection.create({
					userId: ctx.from.id,
					firstName: ctx.from.first_name,
					lastName: ctx.from.last_name,
					username: ctx.from.username,
				});
				await ctx.reply("Привет! Я бот, который уведомляет вас, когда кто-то удаляет или редактирует сообщения в личных чатах.");
			} catch (error: any) {
				await ctx.reply("An error occurred while processing your request. Please try again later.");
				console.error("Error in startCommandHandler:", error);
			}
		}
  }
}