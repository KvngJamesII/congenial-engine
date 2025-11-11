const fetch = require('node-fetch');
const config = require('./config');

class ApiClient {
  constructor() {
    this.baseUrl = config.api.baseUrl;
    this.authHeader = this.generateAuthHeader();
    this.lastProcessedId = 0;
  }

  generateAuthHeader() {
    const credentials = `${config.api.username}:${config.api.password}`;
    const base64Credentials = Buffer.from(credentials).toString('base64');
    return `Basic ${base64Credentials}`;
  }

  async fetchNewSMS() {
    try {
      let url = `${this.baseUrl}?page=1&per-page=${config.api.perPage}`;
      
      if (this.lastProcessedId > 0) {
        url += `&id=${this.lastProcessedId}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': this.authHeader,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const newMessages = data.sort((a, b) => a.id - b.id);
        
        const highestId = Math.max(...newMessages.map(msg => msg.id));
        if (highestId > this.lastProcessedId) {
          this.lastProcessedId = highestId;
        }
        
        return newMessages;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching SMS from API:', error.message);
      return [];
    }
  }

  getLastProcessedId() {
    return this.lastProcessedId;
  }

  setLastProcessedId(id) {
    this.lastProcessedId = id;
  }
}

module.exports = ApiClient;
