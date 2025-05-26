# Message Persistence Bot for Telegram

A Telegram bot that notifies you when someone edits or deletes messages in your private conversations.

## Features

- Tracks message edits and deletions in private chats
- Sends instant notifications when messages are deleted or modified
- In-dialog commands support (`/help` in bot to get the full list)

## Inspiration
I see that many Telegram users rely on third-party bots to track their private conversations: message deletions/edits/etc. But it's still unclear how all these bots work under the hood or what kind of data they collect about users.

As long as we don't know what the developers' intentions are, we shouldn't trust them. No matter how good or bad their intentions might be, it's always weird to share your own data with strangers. And it's very sad that hundreds of thousands of Telegram users don't understand the one key thing: when you connect such bot to your conversations, you're leaking not only your own data – you’re also exposing your friends, your family, your loved ones.

That's exactly why I created this bot and shared it on GitHub for free: so anyone can set it up themselves and stay fully in control of their privacy.  

## Installation guide
#### To install and run the bot you need only installed Docker and Docker Compose on your machine
- Create a bot using [BotFather](https://t.me/BotFather)
- Create `.env` file and paste the bot token BotFather gave you:
```
BOT_TOKEN=your_token
```
- Open terminal and run `docker-compose up --build` (add `-d` flag to run in detached mode)
- Open dialog with your bot and click **«Start»** button
- Further instructions will be provided within a bot

***P.S. only for Telegram Premium users**