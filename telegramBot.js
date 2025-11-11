const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');

class TelegramBotClient {
  constructor() {
    this.bot = new TelegramBot(config.telegram.botToken, { polling: false });
    this.chatId = config.telegram.chatId;
  }

  formatOTPMessage(smsData) {
    const senderName = smsData.sender || smsData.from || 'Unknown Sender';
    const smsContent = smsData.message || smsData.text || smsData.content || 'No content';
    
    return `🟢 New OTP Received!\n\n${senderName}\n\n${smsContent}`;
  }

  async sendOTP(smsData) {
    try {
      const message = this.formatOTPMessage(smsData);
      
      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });
      
      console.log(`✓ OTP sent to Telegram - ID: ${smsData.id}`);
      return true;
    } catch (error) {
      console.error(`✗ Error sending OTP to Telegram:`, error.message);
      return false;
    }
  }

  async sendBulkOTPs(smsArray) {
    const results = [];
    
    for (const sms of smsArray) {
      const result = await this.sendOTP(sms);
      results.push(result);
      
      await this.delay(1000);
    }
    
    return results;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async testConnection() {
    try {
      const me = await this.bot.getMe();
      console.log(`✓ Telegram Bot connected: @${me.username}`);
      return true;
    } catch (error) {
      console.error('✗ Telegram Bot connection failed:', error.message);
      return false;
    }
  }
}

module.exports = TelegramBotClient;
