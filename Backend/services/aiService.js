const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyzes a list of video titles to identify content themes and strategy.
 * @param {string[]} postTitles - An array of video titles from a competitor.
 * @returns {Promise<object>} - An object with themes and a summary.
 */
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
    return { themes: [], summary: 'AI analysis failed.' };
  }
};


/**
 * Generates a content strategy using Google's Gemini model.
 * @param {string} targetAudience - The target audience for the content.
 * @param {string} topic - The primary topic or industry.
 * @param {string} goals - The main objectives.
 * @param {string[]} trendingKeywords - An array of current trending keywords.
 * @param {string | null} startDate - The optional start date for the plan.
 * @param {string | null} endDate - The optional end date for the plan.
 * @returns {Promise<object>} - The AI-generated strategy plan.
 */
const generateContentStrategy = async (targetAudience, topic, goals, trendingKeywords = [], startDate = null, endDate = null) => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  // --- NEW: Dynamic prompt section for duration ---
  let durationPromptSection = 'Generate a complete 30-day content strategy plan.';
  let planDuration = 30;

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Calculate the difference in time, convert to days, and add 1 to be inclusive
    const diffTime = Math.abs(end - start);
    planDuration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Cap the duration to a reasonable limit to avoid excessive API usage/cost
    if (planDuration > 0 && planDuration <= 90) { 
      durationPromptSection = `Generate a content strategy plan for the period from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}. The plan must cover all ${planDuration} days.`;
    } else if (planDuration > 90) {
      planDuration = 90; // Cap the plan duration
      durationPromptSection = `Generate a 90-day content strategy plan. The user requested a longer period, but we are capping it at 90 days.`;
    }
  }
  
  const trendsPromptSection = trendingKeywords.length > 0 
    ? `
    In addition, to make the strategy highly relevant, consider incorporating some of these currently trending topics and titles related to "${topic}":
    - ${trendingKeywords.join('\n- ')}
    It is not necessary to use all of them, but the plan should reflect these current interests where appropriate.
    `
    : '';

  const prompt = `
    You are an expert content strategist AI. Your task is to generate a content strategy based on the user's requirements.

    ${durationPromptSection}

    User Requirements:
    - Target Audience: ${targetAudience}
    - Primary Topic/Industry: ${topic}
    - Core Goals: ${goals}
    ${trendsPromptSection}
    
    The output MUST be a valid JSON object with the exact structure I provide below.

    The JSON structure:
    {
      "blogTitle": "A catchy, SEO-friendly blog title related to the topic.",
      "suggestedFormats": ["An array of 2-3 recommended content formats like 'IG Reel' or 'Blog Post'."],
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
    - Create a plan for the full duration requested (${planDuration} days).
    - Ensure the 'day' property in the calendar array goes from 1 to ${planDuration}.
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


module.exports = {
  generateContentStrategy,
  analyzeCompetitorTopics,
};