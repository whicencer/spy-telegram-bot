import dotenv from "dotenv";
dotenv.config();

import { Bot, Context } from "grammy";
import { getEnvVariable } from "./utils/getEnvVariable";
import { UserRepository, IUserRepository } from "../database/User";
import { IMessagesRepository, MessagesRepository } from "../database/Messages";
import dedent from "dedent";

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
		const businessConnectionId = ctx.editedBusinessMessage?.business_connection_id;

		if (businessConnectionId && ctx.editedBusinessMessage) {
			const { user_chat_id: receiverId } = await ctx.api.getBusinessConnection(businessConnectionId);
			const { message_id, text: newMessageText } = ctx.editedBusinessMessage;
			const oldMessage = await this.messagesCollection.getById(message_id);

			if (newMessageText) {
				await this.messagesCollection.messageEdited(message_id, oldMessage.text, newMessageText);
	
				const notifyUserMessage = dedent`
				*User ${ctx.from?.first_name} edited message:*
				
				*Old message:*\n\`${oldMessage.text}\`
	
				*New message:*\n\`${newMessageText}\`
				`;
	
				await ctx.api.sendMessage(receiverId, notifyUserMessage, { parse_mode: "Markdown" });
			}
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