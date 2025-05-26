import dotenv from "dotenv";
dotenv.config();

import { Bot, Context } from "grammy";
import { getEnvVariable } from "./utils/getEnvVariable";
import { UserRepository, type IUserRepository } from "./database/User";
import dedent from "dedent";
import { updateHandlers } from "./updates";

export default class BotInstance {
  private bot: Bot = new Bot(getEnvVariable("BOT_TOKEN"));
	private usersCollection: IUserRepository = new UserRepository();
  constructor() {}

  public async run() {
    this.registerHandlers();
    await this.bot.start({
			onStart: () => console.log("Bot started successfully!")
		});
  }

  private registerHandlers() {
    this.bot.command("start", this.startCommandHandler);
		// this.bot.command("help", this)
		
		updateHandlers.forEach(handler => {
			const middlewares = handler.middlewares ?? [];
			this.bot.on(handler.updateName, ...middlewares, async (ctx: Context) => handler.run(ctx));
		});
  }

  private async startCommandHandler(ctx: Context) {
		if (ctx.from) {
			try {
				const botMe = await ctx.api.getMe();

				await this.usersCollection.create({
					userId: ctx.from.id,
					firstName: ctx.from.first_name,
					lastName: ctx.from.last_name,
					username: ctx.from.username,
				});

				await ctx.reply(
					dedent`
						Hello! I'm the bot which notificate you if someone deletes or modifies messages in personal chats.
						Run /help to see available commands in chats.

						Set up instructions:
						1. Open settings
						2. Go to <i>Telegram Business -> Chatbots</i>
						3. Set me (@${botMe.username}) as a chatbot
					`,
					{ parse_mode: "HTML" }
				);
			} catch (error: any) {
				await ctx.reply("An error occurred while processing your request. Please try again later.");
				console.error("Error in startCommandHandler:", error);
			}
		}
  }

	private async helpCommandHandler(ctx: Context) {
		await ctx.reply(
			dedent`
				Available commands in chats (use only in personal chats):

				.listed_gifts – List of all user's gifts listed on Tonnel Marketplace.
			`
		);
	}
}