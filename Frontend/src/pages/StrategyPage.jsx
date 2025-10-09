import React, { useState } from 'react';
import { generateStrategy } from '../api/apiService';
import SkeletonLoader from '../components/SkeletonLoader';

const StrategySkeleton = () => (
  <div className="bg-white p-8 rounded-xl shadow-lg space-y-6 animate-pulse">
    <SkeletonLoader className="h-8 w-3/4" />
    <div className="border-b pb-4">
      <SkeletonLoader className="h-6 w-1/4 mb-2" />
      <SkeletonLoader className="h-5 w-full" />
    </div>
    <div className="border-b pb-4">
      <SkeletonLoader className="h-6 w-1/3 mb-2" />
      <SkeletonLoader className="h-5 w-2/3" />
    </div>
    <div>
      <SkeletonLoader className="h-6 w-1/2 mb-4" />
      <div className="space-y-3">
        <SkeletonLoader className="h-20 w-full" />
        <SkeletonLoader className="h-20 w-full" />
        <SkeletonLoader className="h-20 w-full" />
      </div>
    </div>
  </div>
);

const StrategyPage = () => {
  const [formData, setFormData] = useState({
    targetAudience: '',
    topic: '',
    goals: '',
  });
  const [strategy, setStrategy] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setStrategy(null);

    try {
      const response = await generateStrategy(formData);
      setStrategy(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate strategy. The AI might be busy. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent pb-1">
          Strategy Generator
        </h1>
        <p className="text-gray-600 text-lg">
          Define your goals and let the AI build a 30-day content plan for you
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="space-y-5 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div>
              <label htmlFor="targetAudience" className="block text-sm font-semibold text-gray-700 mb-2">
                Target Audience
              </label>
              <input
                type="text"
                name="targetAudience"
                id="targetAudience"
                value={formData.targetAudience}
                onChange={handleChange}
                placeholder="e.g., Gen Z gamers"
                required
                className="block w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="topic" className="block text-sm font-semibold text-gray-700 mb-2">
                Primary Topic
              </label>
              <input
                type="text"
                name="topic"
                id="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder="e.g., New indie game releases"
                required
                className="block w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="goals" className="block text-sm font-semibold text-gray-700 mb-2">
                Core Goals
              </label>
              <textarea
                name="goals"
                id="goals"
                value={formData.goals}
                onChange={handleChange}
                placeholder="e.g., Build a community and drive pre-orders"
                required
                rows="4"
                className="block w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all shadow-sm resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {isLoading ? 'Generating Plan...' : 'Generate 30-Day Plan'}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2">
          {isLoading && <StrategySkeleton />}
          
          {error && (
            <div className="text-red-700 text-center bg-red-50 border border-red-200 p-4 rounded-xl shadow-sm">
              {error}
            </div>
          )}
          
          {strategy && (
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-6">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 break-words">
                  Your 30-Day Content Strategy
                </h2>
                <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-semibold whitespace-nowrap">
                  AI Generated
                </span>
              </div>
              
              <div className="border-l-4 border-purple-500 bg-purple-50 p-5 rounded-lg">
                <h3 className="font-bold text-purple-900 mb-2">Blog Title Suggestion</h3>
                <p className="text-lg text-gray-800 break-words leading-relaxed">
                  {strategy.generatedPlan.blogTitle}
                </p>
              </div>

              <div className="border-l-4 border-pink-500 bg-pink-50 p-5 rounded-lg">
                <h3 className="font-bold text-pink-900 mb-2">Suggested Formats & Frequency</h3>
                <p className="text-gray-800 break-words leading-relaxed">
                  {strategy.generatedPlan.suggestedFormats.join(', ')} at a frequency of <span className="font-semibold">{strategy.generatedPlan.postFrequency}</span>.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 text-xl mb-4">Content Calendar</h3>
                <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {strategy.generatedPlan.calendar.map((item) => (
                    <div
                      key={item.day}
                      className="group p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border-2 border-gray-100 hover:border-purple-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex flex-wrap items-start gap-3 mb-2">
                        <p className="font-bold text-lg text-gray-800 group-hover:text-purple-700 transition-colors break-words leading-relaxed flex-grow min-w-0">
                          Day {item.day}: {item.title}
                        </p>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0">
                          {item.format}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1 break-words">
                          <span className="font-semibold text-gray-700 whitespace-nowrap">Platform:</span> {item.platform}
                        </span>
                        <span className="text-gray-300 flex-shrink-0">•</span>
                        <span className="flex items-center gap-1 break-words">
                          <span className="font-semibold text-gray-700 whitespace-nowrap">Best Time:</span> {item.postTime}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StrategyPage;