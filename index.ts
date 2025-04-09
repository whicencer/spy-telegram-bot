import BotInstance from "./src/bot";

(async () => {
  const bot = new BotInstance();
  await bot.run();
})();