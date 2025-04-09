import dotenv from "dotenv";
dotenv.config();

import { Bot, Context } from "grammy";
import dedent from "dedent";
import { getEnvVariable } from "./utils/getEnvVariable";
import { UserRepository, IUserRepository } from "../database/User";
import { IMessagesRepository, MessagesRepository } from "../database/Messages";
import { ResponseBuilder } from "./services/ResponseBuilder/ResponseBuilder";

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
		this.bot.on("business_message", this.businessMessageHandler);
		this.bot.on("edited_business_message", this.businessEditedMessageHandler);
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

			if (businessConnectionId && ctx.editedBusinessMessage) {
				const { user_chat_id: receiverId } = await ctx.api.getBusinessConnection(businessConnectionId);
				const { message_id, text: newMessageText } = ctx.editedBusinessMessage;
				const oldMessage = await this.messagesCollection.getById(message_id);

				if (newMessageText && ctx.from) {
					await this.messagesCollection.messageEdited(message_id, oldMessage.text, newMessageText);
					
					const { text, parse_mode } = ResponseBuilder.buildEditedMessageResponse(ctx.from, oldMessage.text, newMessageText);
					await ctx.api.sendMessage(receiverId, text, { parse_mode, link_preview_options: { is_disabled: true } });
				}
			}
		} catch (error: any) {
			const { chat_id, parse_mode } = error.payload;
			const errorDescription = error.description;

			if (chat_id) {
				switch (errorDescription) {
					case "Bad Request: message is too long":
						await ctx.api.sendMessage(chat_id, "Error: limit of 4096 characters exceeded", { parse_mode });
						break;
					default:
						await ctx.api.sendMessage(chat_id, "Неизвестная ошибка", { parse_mode });
				}
			}
			console.error("Error in businessEditedMessageHandler:", error.description);
		}
	}

  private startCommandHandler = async (ctx: Context) => {
		if (ctx.from) {
			const isUserExists = await this.usersCollection.exists(ctx.from.id);
			
			if (!isUserExists) {
				await this.usersCollection.create({
					userId: ctx.from.id,
					firstName: ctx.from.first_name,
					lastName: ctx.from.last_name,
					username: ctx.from.username,
				});
			}
			
			await ctx.reply("Hello! I am your bot.");
		}
  }
}