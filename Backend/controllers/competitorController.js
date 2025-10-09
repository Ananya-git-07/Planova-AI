const Competitor = require('../models/Competitor');
const { getChannelVideos } = require('../services/youtubeService');
// --- NEW: Import the analyzer function ---
const { analyzeCompetitorTopics } = require('../services/aiService');

const addCompetitor = async (req, res) => {
  const { platform, handle } = req.body;

  if (!platform || !handle) {
    return res.status(400).json({ success: false, error: 'Please provide platform and handle' });
  }
  if (platform !== 'YouTube') {
    return res.status(400).json({ success: false, error: 'Currently, only YouTube tracking is supported.' });
  }

  try {
    const { channelId, channelTitle, recentPosts } = await getChannelVideos(handle);

    let competitor = await Competitor.findOne({ handle: channelId });
    if (competitor) {
      return res.status(400).json({ success: false, error: 'This competitor is already being tracked.' });
    }

    // --- NEW: Analyze the topics before saving ---
    const postTitles = recentPosts.map(post => post.title);
    const analysis = await analyzeCompetitorTopics(postTitles);
    console.log(`AI Analysis for ${channelTitle}:`, analysis);

    competitor = new Competitor({
      name: channelTitle,
      platform,
      handle: channelId,
      recentPosts,
      topicAnalysis: analysis, // <-- Save the analysis results
      lastFetched: Date.now(),
    });

    await competitor.save();
    res.status(201).json({ success: true, data: competitor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getCompetitors = async (req, res) => {
  try {
    const competitors = await Competitor.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: competitors.length, data: competitors });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

module.exports = { addCompetitor, getCompetitors };