import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, FileText, Target, Sparkles, ArrowRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const UserInputPanel = ({ onGenerate }) => {
  const navigate = useNavigate();
  const [audience, setAudience] = useState('');
  const [contentType, setContentType] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [controller, setController] = useState(null);

  const handleGenerate = async (opts = { maxRetries: 2, backoffMs: 2000 }) => {
    if (!audience || !contentType || !goal) return;
    
    // Validation: if start date is set, end date must also be set
    if (startDate && !endDate) {
      setError('Please provide an end date if you specify a start date.');
      return;
    }

    setIsGenerating(true);
    setResult(null);
    setError(null);
    setAttempt(0);

    const ac = new AbortController();
    setController(ac);

    const payload = {
      targetAudience: audience,
      topic: contentType,
      goals: goal,
      startDate: startDate || null,
      endDate: endDate || null,
    };

    let attemptCount = 0;

    const doAttempt = async () => {
      attemptCount += 1;
      setAttempt(attemptCount);

      try {
        const res = await api.post('/api/strategy/generate', payload, { signal: ac.signal });
        const strategyData = res.data.data || res.data;
        setResult(strategyData);
        
        if (onGenerate) onGenerate(strategyData);

        setError(null);
        setIsGenerating(false);
        setController(null);

      } catch (err) {
        if (err?.name === 'CanceledError' || err?.message === 'canceled' || err?.code === 'ERR_CANCELED' || err?.name === 'AbortError') {
          setError('Request cancelled');
          setIsGenerating(false);
          setController(null);
          return;
        }

        const normalized = err?.normalizedMessage || err?.response?.data?.error || err?.message || 'Failed to generate';
        if (attemptCount <= opts.maxRetries) {
          const wait = opts.backoffMs * Math.pow(2, attemptCount - 1);
          setError(`${normalized} — retrying (${attemptCount}/${opts.maxRetries})...`);
          await new Promise(r => setTimeout(r, wait));
          if (ac.signal.aborted) {
            setError('Request cancelled');
            setIsGenerating(false);
            setController(null);
            return;
          }
          return doAttempt();
        }

        setError(normalized);
        setIsGenerating(false);
        setController(null);
      }
    };

    doAttempt();
  };

  const handleCancel = () => {
    if (controller) {
      try { controller.abort() } catch { /* ignore */ }
      setController(null);
      setIsGenerating(false);
      setError('Cancelled by user');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-xl border border-gray-700 max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4"
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">AI Content Generator</h2>
        <p className="text-gray-400">Tell us about your audience and goals to generate personalized content strategies</p>
      </div>

      <div className="space-y-6">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-2">
          <label className="flex items-center text-white font-semibold">
            <User className="w-5 h-5 mr-2 text-blue-400" />
            Target Audience
          </label>
          <textarea
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g., 'Tech-savvy millennials interested in AI...'"
            className="w-full h-24 p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </motion.div>

        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-2">
          <label className="flex items-center text-white font-semibold">
            <FileText className="w-5 h-5 mr-2 text-green-400" />
            Content Topic / Type
          </label>
          <input
            type="text"
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            placeholder="e.g., 'AI in Healthcare', 'Educational Content'"
            className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </motion.div>

        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="space-y-2">
          <label className="flex items-center text-white font-semibold">
            <Target className="w-5 h-5 mr-2 text-purple-400" />
            Primary Goal
          </label>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., 'Increase Brand Awareness', 'Generate Leads'"
            className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </motion.div>

        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center text-white font-semibold">
              <Calendar className="w-5 h-5 mr-2 text-blue-400" />
              Start Date (Optional)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center text-white font-semibold">
              <Calendar className="w-5 h-5 mr-2 text-green-400" />
              End Date (Optional)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={!startDate}
              min={startDate}
              className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
            />
          </div>
        </motion.div>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={() => handleGenerate({ maxRetries: 2, backoffMs: 2000 })}
          disabled={!audience || !contentType || !goal || isGenerating}
          className={`w-full py-4 px-6 rounded-xl font-bold text-white text-lg transition-all duration-300 flex items-center justify-center ${(!audience || !contentType || !goal || isGenerating) ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'}`}
        >
          {isGenerating ? (
            <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>Generating... {attempt > 0 && <span className="text-xs text-gray-300 ml-2">(attempt {attempt})</span>}</>
          ) : (
            <><Sparkles className="w-5 h-5 mr-2" /> Generate Content Strategy</>
          )}
        </motion.button>
        {isGenerating && (
          <div className="mt-3 text-center"><button onClick={handleCancel} className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Cancel</button></div>
        )}
      </div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-xl text-red-300">
          Error: {error}
        </motion.div>
      )}
    </motion.div>
  );
};

export default UserInputPanel;