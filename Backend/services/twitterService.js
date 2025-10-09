const { TwitterApi } = require('twitter-api-v2');
const cache = require('./cacheService'); // <-- Import the shared cache

// REMOVE the old local cache initialization: const twitterCache = new NodeCache({ stdTTL: 900 });

const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
const roClient = twitterClient.readOnly;

/**
 * Searches for recent, popular tweets by topic, with caching.
 * @param {string} topic - The topic to search for.
 * @returns {Promise<Array>} - A list of trend objects.
 */
const searchTwitterByTopic = async (topic) => {
  if (!topic) return [];

  const cacheKey = `twitter_trends_${topic.toLowerCase()}`;
  const cachedData = cache.get(cacheKey); // <-- Use the shared cache
  if (cachedData) {
    console.log(`Serving Twitter trends for "${topic}" from cache.`);
    return cachedData;
  }

  console.log(`Fetching new Twitter trends for "${topic}" from API.`);
  try {
    const response = await roClient.v2.search(`${topic} -is:retweet lang:en`, {
      'max_results': 10,
      'sort_order': 'relevancy',
    });

    if (!response.data.data) return [];

    const trends = response.data.data.map(tweet => ({
      keyword: tweet.text,
      platform: 'Twitter',
      industry: topic,
    }));
    
    cache.set(cacheKey, trends); // <-- Use the shared cache
    return trends;

  } catch (error) {
    console.error(`Error searching Twitter for topic "${topic}":`, error);
    return [];
  }
};

module.exports = { searchTwitterByTopic };