const ApiClient = require('./apiClient');
const TelegramBotClient = require('./telegramBot');
const config = require('./config');

class OTPForwarder {
  constructor() {
    this.apiClient = new ApiClient();
    this.telegramBot = new TelegramBotClient();
    this.isRunning = false;
    this.pollInterval = null;
  }

  async initialize() {
    console.log('=================================');
    console.log('OTP Forwarder Bot Starting...');
    console.log('=================================');
    
    const telegramConnected = await this.telegramBot.testConnection();
    
    if (!telegramConnected) {
      console.error('Failed to connect to Telegram. Exiting...');
      process.exit(1);
    }
    
    console.log(`Poll Interval: ${config.pollInterval}ms`);
    console.log(`API Endpoint: ${config.api.baseUrl}`);
    console.log('=================================\n');
  }

  async pollAndForward() {
    try {
      const newSMS = await this.apiClient.fetchNewSMS();
      
      if (newSMS.length > 0) {
        console.log(`\n📨 Found ${newSMS.length} new SMS message(s)`);
        
        for (const sms of newSMS) {
          await this.telegramBot.sendOTP(sms);
          await this.delay(1000);
        }
      } else {
        process.stdout.write('.');
      }
    } catch (error) {
      console.error('\n❌ Error in polling cycle:', error.message);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async start() {
    await this.initialize();
    
    this.isRunning = true;
    console.log('✓ Bot is now running and polling for new OTPs...\n');
    
    await this.pollAndForward();
    
    this.pollInterval = setInterval(async () => {
      if (this.isRunning) {
        await this.pollAndForward();
      }
    }, config.pollInterval);
  }

  stop() {
    this.isRunning = false;
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    console.log('\n\n✓ Bot stopped gracefully');
  }
}

const forwarder = new OTPForwarder();

process.on('SIGINT', () => {
  console.log('\n\nReceived SIGINT signal...');
  forwarder.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\nReceived SIGTERM signal...');
  forwarder.stop();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  forwarder.stop();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

forwarder.start().catch((error) => {
  console.error('Failed to start bot:', error);
  process.exit(1);
});
