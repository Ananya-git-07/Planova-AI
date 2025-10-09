const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- UPDATED: Function now accepts trendingKeywords ---
const generateContentStrategy = async (targetAudience, topic, goals, trendingKeywords = []) => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash', // A fast and capable model
    generationConfig: {
      responseMimeType: 'application/json', // Enable JSON output mode
    },
  });

  // --- NEW: Conditionally add a section for trends to the prompt ---
  const trendsPromptSection = trendingKeywords.length > 0 
    ? `
    In addition, to make the strategy highly relevant, consider incorporating some of these currently trending topics and titles related to "${topic}":
    - ${trendingKeywords.join('\n- ')}
    It is not necessary to use all of them, but the plan should reflect these current interests where appropriate.
    `
    : '';

  // --- UPDATED: The prompt now includes the new trends section ---
  const prompt = `
    You are an expert content strategist AI. Your task is to generate a complete 30-day content strategy plan based on the user's requirements.

    User Requirements:
    - Target Audience: ${targetAudience}
    - Primary Topic/Industry: ${topic}
    - Core Goals: ${goals}
    ${trendsPromptSection}
    Generate a content strategy. The output MUST be a valid JSON object with the exact structure I provide below. Do not add any extra text or markdown formatting.

    The JSON structure:
    {
      "blogTitle": "A catchy, SEO-friendly blog title related to the topic.",
      "suggestedFormats": ["An array of 2-3 recommended content formats, like 'IG Reels', 'YouTube Shorts', 'Blog Post', 'Twitter Thread'."],
      "postFrequency": "A recommended weekly post frequency, like '3 posts/week'.",
      "calendar": [
        {
          "day": 1,
          "title": "A specific content title for Day 1.",
          "format": "The format for Day 1's content (must be one of the suggestedFormats).",
          "platform": "The best platform for this post (e.g., 'Instagram', 'YouTube', 'Blog').",
          "postTime": "The optimal post time (e.g., '9-11 AM EST')."
        }
      ]
    }

    Instructions for the calendar:
    - Create a plan for a full 30 days.
    - Vary the content titles and formats to keep the audience engaged.
    - Ensure the content ideas align with the target audience, goals, and provided trends.
    `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const strategyJson = JSON.parse(response.text());

    return strategyJson;
  } catch (error) {
    console.error('Error communicating with Google Gemini API:', error);
    throw new Error('Failed to generate AI content strategy.');
  }
};

const analyzeCompetitorTopics = async (postTitles) => {
  if (!postTitles || postTitles.length === 0) {
    return { themes: [], summary: 'Not enough data to analyze.' };
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const prompt = `
    You are an expert YouTube content analyst. Based on the following list of recent video titles from a single channel, please perform an analysis.

    Video Titles:
    - ${postTitles.join('\n- ')}

    Your Tasks:
    1. Identify the top 3 to 5 recurring content pillars or themes.
    2. Provide a concise, one-sentence summary of this channel's overall content strategy.

    The output MUST be a valid JSON object with the exact structure below. Do not add any other text.
    {
      "themes": ["Theme 1", "Theme 2", "Theme 3"],
      "summary": "This channel focuses on..."
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error('Error analyzing competitor topics with Gemini:', error);
    // Return a default object on error so the main process doesn't fail
    return { themes: [], summary: 'AI analysis failed.' };
  }
};

// --- UPDATED: Make sure to export the new function ---
module.exports = {
  generateContentStrategy,
  analyzeCompetitorTopics, // Add this export
};