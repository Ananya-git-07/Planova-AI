import React, { useEffect, useState } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, ArcElement, Filler } from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'
import { TrendingUp, Users, MessageCircle, Target, Zap, BarChart3, PieChart, Calendar } from 'lucide-react'
import UserInputPanel from '../components/UserInputPanel'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, ArcElement, Filler)

// Accept onStrategyGenerated as a prop
const Dashboard = ({ onStrategyGenerated }) => {
  const [competitors, setCompetitors] = useState([])
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const api = (await import('../api/axios')).default
        const [compRes, trendsRes] = await Promise.all([
          api.get('/api/competitors'),
          api.get('/api/trends', { params: { topic: 'AI' } }),
        ])
        setCompetitors(compRes.data.data || [])
        setTrends(trendsRes.data.data || [])
      } catch (err) {
        console.error('Dashboard fetch error', err)
        setError(err?.response?.data?.error || err?.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [])

  // Derived KPIs from backend data with safe fallbacks
  const totalCompetitors = competitors.length
  const totalPosts = competitors.reduce((sum, c) => sum + (Array.isArray(c.recentPosts) ? c.recentPosts.length : 0), 0)
  const avgPostsPerCompetitor = totalCompetitors > 0 ? Math.round(totalPosts / totalCompetitors) : 0
  const positiveTrends = trends.filter(t => t.sentiment === 'Positive').length
  const positiveTrendPercent = trends.length > 0 ? Math.round((positiveTrends / trends.length) * 100) : 0

  const kpiCards = [
    { title: 'Competitors Tracked', value: `${totalCompetitors}`, change: '', icon: Users, color: 'from-blue-500 to-blue-600' },
    { title: 'Positive Trend Share', value: `${positiveTrendPercent}%`, change: '', icon: TrendingUp, color: 'from-green-500 to-green-600' },
    { title: 'Total Recent Posts', value: `${totalPosts}`, change: '', icon: MessageCircle, color: 'from-purple-500 to-purple-600' },
    { title: 'Avg Posts / Competitor', value: `${avgPostsPerCompetitor}`, change: '', icon: Target, color: 'from-orange-500 to-orange-600' },
  ]

  // Build time-series data for the last N weeks based on recentPosts publishedAt
  const buildWeeklySeries = (numWeeks = 7) => {
    const now = new Date()
    const msPerWeek = 7 * 24 * 60 * 60 * 1000
    const labels = []
    const weekStarts = []
    for (let i = numWeeks - 1; i >= 0; i--) {
      const start = new Date(now.getTime() - i * msPerWeek)
      weekStarts.push(start)
      labels.push(start.toLocaleDateString())
    }

    // postsPerWeek: total posts across all competitors per week
    const postsPerWeek = new Array(numWeeks).fill(0)
    competitors.forEach((c) => {
      (c.recentPosts || []).forEach((p) => {
        const published = p.publishedAt ? new Date(p.publishedAt) : null
        if (!published) return
        const diff = now.getTime() - published.getTime()
        const weekIndex = Math.floor(diff / msPerWeek)
        if (weekIndex >= 0 && weekIndex < numWeeks) {
          // map weekIndex to array index: weekIndex 0 => latest week => index numWeeks-1
          const arrIndex = numWeeks - 1 - weekIndex
          postsPerWeek[arrIndex] += 1
        }
      })
    })

    // trends discovered per week
    const trendsPerWeek = new Array(numWeeks).fill(0)
    trends.forEach((t) => {
      const discovered = t.discoveredAt ? new Date(t.discoveredAt) : null
      if (!discovered) return
      const diff = now.getTime() - discovered.getTime()
      const weekIndex = Math.floor(diff / msPerWeek)
      if (weekIndex >= 0 && weekIndex < numWeeks) {
        const arrIndex = numWeeks - 1 - weekIndex
        trendsPerWeek[arrIndex] += 1
      }
    })

    return { labels, postsPerWeek, trendsPerWeek }
  }

  const { labels: perfLabels, postsPerWeek, trendsPerWeek } = buildWeeklySeries(7)

  const performanceData = {
    labels: perfLabels,
    datasets: [
      {
        label: 'Posts (all competitors)',
        data: postsPerWeek,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Trends Discovered',
        data: trendsPerWeek,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  const aiRecommendations = [
    { type: 'Content Strategy', title: 'Short-Form Video Series', impact: 'High', description: 'Create a 7-part series on AI automation tips.' },
    { type: 'Posting Time', title: 'Evening Optimization', impact: 'Medium', description: 'Shift posts to 7-9 PM for higher reach.' },
    { type: 'Hashtag Strategy', title: 'Niche Communities', impact: 'High', description: 'Target industry-specific hashtags for better leads.' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-900 text-white p-6"
    >
      {loading && <div className="max-w-7xl mx-auto text-gray-400 mb-4">Loading dashboard data...</div>}
      {error && <div className="max-w-7xl mx-auto text-red-400 mb-4">Error: {error}</div>}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            AI Content Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Real-time insights and AI-powered recommendations</p>
        </motion.div>

        {/* User Input Panel - pass the handler */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <UserInputPanel onGenerate={onStrategyGenerated} />
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {kpiCards.map((card, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 shadow-xl border border-gray-700 hover:border-gray-600 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color}`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-400 text-sm font-semibold">{card.change}</span>
              </div>
              <h3 className="text-gray-400 text-sm mb-1">{card.title}</h3>
              <p className="text-2xl font-bold">{card.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Performance Charts */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 shadow-xl border border-gray-700 mb-8"
        >
          <div className="flex items-center mb-6">
            <BarChart3 className="w-6 h-6 text-blue-400 mr-3" />
            <h2 className="text-xl font-bold">Performance Trends</h2>
          </div>
          <div className="h-80">
            <Line
              data={performanceData}
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

        {/* AI Recommendations */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {aiRecommendations.map((rec, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 shadow-xl border border-gray-700 hover:border-purple-500 transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <Zap className="w-5 h-5 text-purple-400 mr-2" />
                <span className="text-sm text-purple-400 font-semibold">{rec.type}</span>
                <span className={`ml-auto px-2 py-1 rounded-full text-xs font-bold ${
                  rec.impact === 'High' ? 'bg-red-500/20 text-red-400' :
                  rec.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {rec.impact} Impact
                </span>
              </div>
              <h3 className="text-lg font-bold mb-2">{rec.title}</h3>
              <p className="text-gray-400 text-sm">{rec.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Dashboard