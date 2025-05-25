import BotInstance from "./bot";

(async () => {
  const bot = new BotInstance();
  await bot.run();
})();