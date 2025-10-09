import React, { useState } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { User, FileText, Target, Sparkles, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom' 
import api from '../api/axios'

const UserInputPanel = ({ onGenerate }) => {
  const navigate = useNavigate(); 
  const [audience, setAudience] = useState('')
  const [contentType, setContentType] = useState('')
  const [goal, setGoal] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const [controller, setController] = useState(null)

  const handleGenerate = async (opts = { maxRetries: 2, backoffMs: 2000 }) => {
    if (!audience || !contentType || !goal) return

    setIsGenerating(true)
    setResult(null)
    setError(null)
    setAttempt(0)

    const ac = new AbortController()
    setController(ac)

    const payload = {
      targetAudience: audience,
      topic: contentType,
      goals: goal,
    }

    let attemptCount = 0

    const doAttempt = async () => {
      attemptCount += 1
      setAttempt(attemptCount)

      try {
        const res = await api.post('/api/strategy/generate', payload, { signal: ac.signal })
        const strategyData = res.data.data || res.data;
        setResult(strategyData)
        
        if (onGenerate) onGenerate(strategyData)

        setError(null)
        setIsGenerating(false)
        setController(null)

        navigate('/calendar');

      } catch (err) {
        if (err?.name === 'CanceledError' || err?.message === 'canceled' || err?.code === 'ERR_CANCELED' || err?.name === 'AbortError') {
          setError('Request cancelled')
          setIsGenerating(false)
          setController(null)
          return
        }

        const normalized = err?.normalizedMessage || err?.response?.data?.error || err?.message || 'Failed to generate'
        if (attemptCount <= opts.maxRetries) {
          const wait = opts.backoffMs * Math.pow(2, attemptCount - 1)
          setError(`${normalized} — retrying (${attemptCount}/${opts.maxRetries})...`)
          await new Promise(r => setTimeout(r, wait))
          if (ac.signal.aborted) {
            setError('Request cancelled')
            setIsGenerating(false)
            setController(null)
            return
          }
          return doAttempt()
        }

        setError(normalized)
        setIsGenerating(false)
        setController(null)
      }
    }

    doAttempt()
  }

  const handleCancel = () => {
    if (controller) {
      try { controller.abort() } catch { /* ignore */ }
      setController(null)
      setIsGenerating(false)
      setError('Cancelled by user')
    }
  }

  // REMOVED: The hardcoded contentTypes and goals arrays are no longer needed.

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
        {/* Audience Input */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <label className="flex items-center text-white font-semibold">
            <User className="w-5 h-5 mr-2 text-blue-400" />
            Target Audience
          </label>
          <textarea
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="Describe your target audience (e.g., 'Tech-savvy millennials interested in AI and machine learning, aged 25-35, working in tech industry...')"
            className="w-full h-24 p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </motion.div>

        {/* Content Type Selection - CHANGED TO INPUT */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <label className="flex items-center text-white font-semibold">
            <FileText className="w-5 h-5 mr-2 text-green-400" />
            Content Topic / Type
          </label>
          <input
            type="text"
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            placeholder="e.g., 'AI in Healthcare', 'Educational Content', 'Product Reviews'"
            className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </motion.div>

        {/* Goal Selection - CHANGED TO INPUT */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          <label className="flex items-center text-white font-semibold">
            <Target className="w-5 h-5 mr-2 text-purple-400" />
            Primary Goal
          </label>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., 'Increase Brand Awareness', 'Generate Leads', 'Build a Community'"
            className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </motion.div>

        {/* Generate Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => handleGenerate({ maxRetries: 2, backoffMs: 2000 })}
          disabled={!audience || !contentType || !goal || isGenerating}
          className={`
            w-full py-4 px-6 rounded-xl font-bold text-white text-lg transition-all duration-300 flex items-center justify-center
            ${(!audience || !contentType || !goal || isGenerating)
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
            }
          `}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Generating Strategy... {attempt > 0 && <span className="text-xs text-gray-300 ml-2">(attempt {attempt})</span>}
            </>
          ) : (
            <>
              Generate Content Strategy
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </motion.button>
        {isGenerating && (
          <div className="mt-3 text-center">
            <button onClick={handleCancel} className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Cancel</button>
          </div>
        )}
      </div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 p-4 bg-gray-700 rounded-xl border border-gray-600"
      >
        <h3 className="text-white font-semibold mb-2 flex items-center">
          <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
          Pro Tips
        </h3>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• Be specific about your audience demographics and interests</li>
          <li>• The more detailed your topic and goals, the better the AI suggestions</li>
          <li>• Try goals like "Establish thought leadership" or "Drive website traffic"</li>
        </ul>
      </motion.div>

      {/* Result / Error Display */}
      {(error || result) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 p-4 bg-gray-800 rounded-xl border border-gray-600"
        >
          {error && (
            <div className="space-y-2">
              <div className="text-red-400">Error: {error}</div>
            </div>
          )}
          {result && (
            <div className="text-green-400">Success! Redirecting to your calendar...</div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

export default UserInputPanel