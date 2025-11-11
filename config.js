require('dotenv').config();

module.exports = {
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID
  },
  api: {
    baseUrl: process.env.API_BASE_URL,
    username: process.env.API_USERNAME,
    password: process.env.API_PASSWORD,
    perPage: parseInt(process.env.PER_PAGE) || 100
  },
  pollInterval: parseInt(process.env.POLL_INTERVAL) || 10000
};
