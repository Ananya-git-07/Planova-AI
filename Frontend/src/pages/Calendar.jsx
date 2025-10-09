import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom'; // <-- Import useParams hook
import api from '../api/axios';
import { Calendar, Download, Info, Share } from 'lucide-react';
import Papa from 'papaparse';

const CalendarPage = () => {
  // Get the strategy ID from the URL
  const { strategyId } = useParams();

  // State for this component
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!strategyId) return;

    const fetchStrategy = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/strategy/${strategyId}`);
        const fetchedStrategy = res.data.data;
        setStrategy(fetchedStrategy);
        // Default the calendar view to the month the strategy was created
        const startDate = new Date(fetchedStrategy.createdAt);
        setSelectedMonth(startDate.getMonth());
        setSelectedYear(startDate.getFullYear());
      } catch (err) {
        setError(err?.response?.data?.error || err.message || 'Failed to load strategy');
      } finally {
        setLoading(false);
      }
    };
    fetchStrategy();
  }, [strategyId]);

  const startDate = useMemo(() => strategy ? new Date(strategy.createdAt) : null, [strategy]);
  const plan = useMemo(() => strategy?.generatedPlan || null, [strategy]);

  const handleExportCSV = () => {
    if (!plan || !plan.calendar || !startDate) {
      alert("No data available to export.");
      return;
    }

    // First, map the calendar data into a flat structure suitable for CSV
    const csvData = plan.calendar.map(item => {
      const contentDate = new Date(startDate);
      contentDate.setDate(startDate.getDate() + item.day - 1);
      
      return {
        'Date': contentDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        'Day': item.day,
        'Title': item.title,
        'Format': item.format,
        'Platform': item.platform,
        'Post_Time': item.postTime,
      };
    });

    // Use Papaparse to convert JSON to CSV string
    const csvString = Papa.unparse(csvData);

    // Create a Blob from the CSV string
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    // Create a link element to trigger the download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    // Sanitize the topic name to be used in the filename
    const safeFilename = (strategy.topic || 'content-plan').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute('download', `${safeFilename}_strategy.csv`);
    
    // Append the link to the body, click it, and then remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const scheduledContent = useMemo(() => {
    if (!plan?.calendar || !startDate) return {};
    return (plan.calendar || []).reduce((acc, item) => {
      const contentDate = new Date(startDate);
      contentDate.setDate(startDate.getDate() + item.day - 1);
      const dateKey = contentDate.toDateString();
      acc[dateKey] = item;
      return acc;
    }, {});
  }, [plan, startDate]);

  const generateCalendarDays = () => {
    // ... (This function remains exactly the same as before)
    const days = []
    const firstDay = new Date(selectedYear, selectedMonth, 1)
    const startCalDate = new Date(firstDay)
    startCalDate.setDate(startCalDate.getDate() - firstDay.getDay())

    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startCalDate)
      currentDate.setDate(startCalDate.getDate() + i)

      const isCurrentMonth = currentDate.getMonth() === selectedMonth
      const isToday = currentDate.toDateString() === new Date().toDateString()
      const content = scheduledContent[currentDate.toDateString()];

      days.push({
        date: currentDate,
        isCurrentMonth,
        isToday,
        hasContent: !!content,
        content: content,
        day: currentDate.getDate()
      })
    }
    return days
  };

  const calendarDays = generateCalendarDays();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Handle loading and error states
  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white p-6 text-center">Loading Strategy...</div>;
  }
  if (error) {
    return <div className="min-h-screen bg-gray-900 text-white p-6 text-center text-red-400">Error: {error}</div>;
  }
  if (!strategy || !plan) {
    return <div className="min-h-screen bg-gray-900 text-white p-6 text-center">Strategy not found.</div>;
  }

   return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-900 text-white p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* --- 3. Add the Export Button to the Header --- */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              AI-Generated Content Plan
            </h1>
            <p className="text-gray-400 mt-2">A 30-day plan starting from {startDate.toLocaleDateString()}.</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl text-white font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300"
          >
            <Share className="w-4 h-4 mr-2" />
            Export to CSV
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel */}
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 shadow-xl border border-gray-700">
              <div className="flex items-center mb-6">
                <Info className="w-6 h-6 text-blue-400 mr-3" />
                <h2 className="text-xl font-bold">Strategy Overview</h2>
              </div>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="font-semibold text-white">Blog Title Suggestion</h3>
                  <p>{plan.blogTitle}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Suggested Formats</h3>
                  <p>{Array.isArray(plan.suggestedFormats) ? plan.suggestedFormats.join(', ') : 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Recommended Frequency</h3>
                  <p>{plan.postFrequency}</p>
                </div>
                <hr className="border-gray-700" />
                <div>
                  <h3 className="font-semibold text-white">Target Audience</h3>
                  <p>{strategy.targetAudience}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Primary Goal</h3>
                  <p>{strategy.goals}</p>
                </div>
              </div>
            </div>
          </motion.div>

                    {/* Right Panel */}
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 shadow-xl border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Calendar className="w-6 h-6 text-green-400 mr-3" />
                  <h2 className="text-xl font-bold">Content Calendar</h2>
                </div>
                <div className="flex space-x-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="bg-gray-700 text-white rounded-lg px-3 py-1 text-sm"
                  >
                    {monthNames.map((month, index) => (
                      <option key={index} value={index}>{month}</option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="bg-gray-700 text-white rounded-lg px-3 py-1 text-sm"
                  >
                    {[...Array(3)].map((_, i) => (
                        <option key={i} value={new Date().getFullYear() - 1 + i}>
                            {new Date().getFullYear() - 1 + i}
                        </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-gray-400 text-sm font-semibold py-2">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className={`
                      aspect-square flex items-center justify-center text-sm font-medium rounded-lg cursor-pointer transition-all duration-200 relative group
                      ${day.isCurrentMonth ? 'text-white' : 'text-gray-500'}
                      ${day.isToday ? 'bg-blue-500 text-white' : ''}
                      ${day.hasContent ? 'bg-green-500 text-white' : 'hover:bg-gray-700'}
                    `}
                  >
                    {day.day}
                    {day.hasContent && (
                      <div className="absolute bottom-full mb-2 w-64 p-3 bg-gray-800 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                        <h4 className="font-bold text-sm">{day.content.title}</h4>
                        <p className="text-xs text-gray-300 mt-1">{day.content.format} on {day.content.platform}</p>
                        <p className="text-xs text-gray-400 mt-1">Time: {day.content.postTime}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-center space-x-6 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-gray-400">Today</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-gray-400">Scheduled</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CalendarPage;