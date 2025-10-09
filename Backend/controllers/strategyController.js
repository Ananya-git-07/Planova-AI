const { generateContentStrategy } = require('../services/aiService');
const ContentStrategy = require('../models/ContentStrategy');
const { searchYouTubeByTopic } = require('../services/youtubeService');
const { searchRedditByTopic } = require('../services/redditService');
const { searchTwitterByTopic } = require('../services/twitterService');
const { getGeminiGeneratedTrends } = require('../services/geminiTrendsService');

const generateStrategy = async (req, res) => {
  const { targetAudience, topic, goals, startDate, endDate } = req.body;

  if (!targetAudience || !topic || !goals) {
    return res.status(400).json({
      success: false,
      error: 'Please provide targetAudience, topic, and goals',
    });
  }

  try {
    console.log(`Fetching trends for topic: ${topic}`);
    const trendSources = await Promise.all([
      searchYouTubeByTopic(topic),
      searchRedditByTopic(topic),
      searchTwitterByTopic(topic),
      getGeminiGeneratedTrends(topic),
    ]);
    
    const trendingKeywords = trendSources.flat().map(trend => trend.keyword).slice(0, 10);
    console.log(`Found trending keywords:`, trendingKeywords);

    const generatedPlan = await generateContentStrategy(
      targetAudience, 
      topic, 
      goals, 
      trendingKeywords,
      startDate,
      endDate
    );

    const newStrategy = new ContentStrategy({
      targetAudience,
      topic,
      goals,
      startDate: startDate || new Date(), // Use provided start date or default to now
      endDate: endDate || null,         // Use provided end date or null
      generatedPlan,
    });

    const savedStrategy = await newStrategy.save();

    res.status(201).json({ success: true, data: savedStrategy });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error: Could not generate strategy.' });
  }
};

const getStrategies = async (req, res) => {
  try {
    const strategies = await ContentStrategy.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: strategies.length, data: strategies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error: Could not fetch strategies.' });
  }
};

const getStrategyById = async (req, res) => {
  try {
    const strategy = await ContentStrategy.findById(req.params.id);

    if (!strategy) {
      return res.status(404).json({ success: false, error: 'Strategy not found.' });
    }

    res.status(200).json({ success: true, data: strategy });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error: Could not fetch strategy.' });
  }
};


module.exports = {
  generateStrategy,
  getStrategies,
  getStrategyById,
};