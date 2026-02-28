// lib/rate-limiter.js
export class RateLimiter {
  constructor(requestsPerMinute = 10) {
    this.requestsPerMinute = requestsPerMinute;
    this.queue = [];
    this.timestamps = [];
  }

  async schedule(fn) {
    // Clean up old timestamps
    const now = Date.now();
    this.timestamps = this.timestamps.filter(
      timestamp => now - timestamp < 60000
    );

    // Check if we're at the limit
    if (this.timestamps.length >= this.requestsPerMinute) {
      const oldest = this.timestamps[0];
      const waitTime = 60000 - (now - oldest);
      console.log(`Rate limit reached, waiting ${Math.ceil(waitTime / 1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Execute the function
    this.timestamps.push(Date.now());
    return await fn();
  }
}

// Create a singleton instance
export const aiRateLimiter = new RateLimiter(8); // Use 8 of 10 available RPM