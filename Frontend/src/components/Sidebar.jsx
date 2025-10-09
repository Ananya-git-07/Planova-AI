import React from 'react'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white shadow-md font-roboto">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
        <ul className="space-y-2">
          <li>
            <NavLink to="/" className={({isActive})=> `flex items-center space-x-2 p-2 rounded ${isActive? 'bg-green-100 text-green-700':'text-gray-700 hover:bg-gray-100'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
              </svg>
              {/* Changed from Overview */}
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/analytics" className={({isActive})=> `flex items-center space-x-2 p-2 rounded ${isActive? 'bg-green-100 text-green-700':'text-gray-700 hover:bg-gray-100'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>Trends</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/competitors" className={({isActive})=> `flex items-center space-x-2 p-2 rounded ${isActive? 'bg-green-100 text-green-700':'text-gray-700 hover:bg-gray-100'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Competitors</span>
            </NavLink>
          </li>
          {/* Removed the reports link that went to Settings */}
        </ul>
      </div>
    </aside>
  )
}

export default Sidebar