import { Context } from "grammy";

export async function getUserId(ctx: Context) {
  await ctx.editMessageText(
    `User ID: <code>${ctx.businessMessage?.chat.id}</code>`,
    { parse_mode: "HTML" }
  );
}