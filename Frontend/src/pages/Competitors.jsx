import React, { useEffect, useState } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Users, TrendingUp, Target, Hash, Award, BarChart3, PlusCircle } from 'lucide-react'
import AddCompetitorModal from '../components/AddCompetitorModal' // Import the modal

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement)

import api from '../api/axios'

const Competitors = () => {
  const [competitors, setCompetitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false) // State for modal

  const fetchCompetitors = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/competitors')
      setCompetitors(res.data.data || [])
    } catch (err) {
      console.error('Failed to load competitors', err)
      setError(err?.response?.data?.error || err.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompetitors()
  }, [])

  // Function to handle adding a new competitor
  const handleAddCompetitor = async (competitorData) => {
    try {
      const res = await api.post('/api/competitors', competitorData)
      // Add new competitor to the top of the list
      setCompetitors(prev => [res.data.data, ...prev])
    } catch (err) {
      console.error('Failed to add competitor', err)
      // Rethrow to be caught by the modal form
      throw new Error(err?.response?.data?.error || 'An error occurred.')
    }
  }

  // Mock comparison chart data
  const buildComparisonData = (numWeeks = 6) => {
    const now = new Date()
    const msPerWeek = 7 * 24 * 60 * 60 * 1000
    const labels = []
    for (let i = numWeeks - 1; i >= 0; i--) {
      const start = new Date(now.getTime() - i * msPerWeek)
      labels.push(start.toLocaleDateString())
    }

    const datasets = (competitors || []).slice(0, 4).map((c, idx) => {
      const counts = new Array(numWeeks).fill(0);
      (c.recentPosts || []).forEach((p) => {
        const published = p.publishedAt ? new Date(p.publishedAt) : null
        if (!published) return
        const diff = now.getTime() - published.getTime()
        const weekIndex = Math.floor(diff / msPerWeek)
        if (weekIndex >= 0 && weekIndex < numWeeks) {
          const arrIndex = numWeeks - 1 - weekIndex
          counts[arrIndex] += 1
        }
      })

      const palette = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b']
      return {
        label: c.name || c.handle,
        data: counts,
        borderColor: palette[idx % palette.length],
        backgroundColor: palette[idx % palette.length] + '33',
        tension: 0.4
      }
    })

    return { labels, datasets }
  }

  const comparisonData = buildComparisonData(6)

  return (
    <>
      <AddCompetitorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddCompetitor}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gray-900 text-white p-6"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header with Add Button */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-between items-center mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Competitor Benchmarking
              </h1>
              <p className="text-gray-400 mt-2">Compare your performance against industry leaders</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Add Competitor
            </button>
          </motion.div>

          {/* Competitor Cards */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {loading && (
              <div className="col-span-full text-center text-gray-400">Loading competitors...</div>
            )}

            {error && (
              <div className="col-span-full text-center text-red-400">Error: {error}</div>
            )}

            {!loading && !error && competitors.length === 0 && (
              <div className="col-span-full text-center text-gray-400">No competitors found. Add one to get started!</div>
            )}

            {!loading && !error && competitors.map((competitor) => {
              const initials = (competitor.name || competitor.handle || '').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()
              const recentCount = Array.isArray(competitor.recentPosts) ? competitor.recentPosts.length : 0
              return (
                <motion.div
                  key={competitor._id || competitor.handle || initials}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 shadow-xl border border-gray-700 hover:border-gray-600 transition-all duration-300"
                >
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-center font-bold text-white mr-3`}>
                      {initials || 'C'}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{competitor.name || competitor.handle}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300">{competitor.platform || 'Unknown'}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {competitor.recentPosts && competitor.recentPosts[0] && (
                      <div className="text-sm text-gray-300 truncate">Latest: <a href={competitor.recentPosts[0].link} target="_blank" rel="noreferrer" className="text-blue-300 underline">{competitor.recentPosts[0].title}</a></div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs flex items-center">
                        <Target className="w-3 h-3 mr-1" />
                        Recent Posts
                      </span>
                      <span className="text-white font-semibold text-sm">{recentCount}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Last Fetched
                      </span>
                      <span className="text-white font-semibold text-sm">{competitor.lastFetched ? new Date(competitor.lastFetched).toLocaleDateString() : '—'}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs flex items-center">
                        <Hash className="w-3 h-3 mr-1" />
                        Handle
                      </span>
                      <a className="text-blue-300 text-sm underline" href={`https://www.youtube.com/channel/${competitor.handle}`} target="_blank" rel="noreferrer">
                        View Channel
                      </a>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Performance Comparison Chart */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 shadow-xl border border-gray-700"
          >
            <div className="flex items-center mb-6">
              <BarChart3 className="w-6 h-6 text-blue-400 mr-3" />
              <h2 className="text-xl font-bold">Performance Comparison</h2>
            </div>
            <div className="h-80">
              <Line
                data={comparisonData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: { color: '#9ca3af' }
                    }
                  },
                  scales: {
                    x: {
                      grid: { color: '#374151' },
                      ticks: { color: '#9ca3af' }
                    },
                    y: {
                      grid: { color: '#374151' },
                      ticks: { color: '#9ca3af' }
                    }
                  }
                }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  )
}

export default Competitors