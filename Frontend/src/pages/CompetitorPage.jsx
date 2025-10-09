import React, { useState, useEffect } from 'react';
import { getCompetitors, addCompetitor } from '../api/apiService';
import SkeletonLoader from '../components/SkeletonLoader';

const CompetitorSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white p-6 rounded-xl shadow-lg animate-pulse">
        <SkeletonLoader className="h-8 w-1/2 mb-4" />
        <SkeletonLoader className="h-6 w-1/4 mb-4" />
        <div className="space-y-3">
          <SkeletonLoader className="h-5 w-full" />
          <SkeletonLoader className="h-5 w-5/6" />
          <SkeletonLoader className="h-5 w-4/5" />
        </div>
      </div>
    ))}
  </div>
);

const CompetitorPage = () => {
  const [handle, setHandle] = useState('');
  const [competitors, setCompetitors] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isListLoading, setIsListLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompetitors = async () => {
    setIsListLoading(true);
    try {
      const response = await getCompetitors();
      setCompetitors(response.data.data);
    } catch (err) {
      setError('Could not fetch competitor list.');
      console.error(err);
    } finally {
      setIsListLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handle) return;

    setIsAdding(true);
    setError(null);

    try {
      await addCompetitor({ platform: 'YouTube', handle });
      setHandle('');
      fetchCompetitors();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add competitor. Check the handle and try again.');
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
          Competitor Tracker
        </h1>
        <p className="text-gray-600 text-lg">
          Track your competitors' latest YouTube content and stay ahead
        </p>
      </div>

      {/* Add Competitor Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="Enter YouTube handle (e.g., mkbhd)"
              className="flex-grow px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all shadow-sm text-base"
            />
            <button
              type="submit"
              disabled={isAdding}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-xl hover:from-red-700 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 whitespace-nowrap"
            >
              {isAdding ? 'Adding...' : 'Track Competitor'}
            </button>
          </div>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto">
          <div className="text-red-700 text-center bg-red-50 border border-red-200 p-4 rounded-xl shadow-sm">
            {error}
          </div>
        </div>
      )}

      {/* Competitors List */}
      {isListLoading ? (
        <CompetitorSkeleton />
      ) : (
        <div className="space-y-4">
          {competitors.map((competitor) => (
            <div
              key={competitor._id}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:border-red-200 transition-all duration-200 hover:shadow-xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-grow">
                  <h2 className="text-2xl font-bold text-gray-800 mb-1 break-words">
                    {competitor.name}
                  </h2>
                  <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-lg border border-red-200">
                    {competitor.platform}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                  Recent Posts
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {competitor.recentPosts.length}
                  </span>
                </h3>
                <ul className="space-y-2">
                  {competitor.recentPosts.map((post) => (
                    <li key={post.postId} className="group">
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors duration-200"
                      >
                        <span className="text-red-600 mt-1 group-hover:text-red-700 transition-colors flex-shrink-0">
                          ▶
                        </span>
                        <span className="text-gray-700 group-hover:text-red-700 transition-colors flex-grow break-words leading-relaxed">
                          {post.title}
                        </span>
                        <span className="text-gray-400 group-hover:text-red-500 transition-colors flex-shrink-0">
                          →
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          {competitors.length === 0 && !isListLoading && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <span className="text-4xl text-gray-400">📊</span>
              </div>
              <p className="text-gray-500 text-lg">
                You are not tracking any competitors yet.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Add a YouTube handle above to get started!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompetitorPage;