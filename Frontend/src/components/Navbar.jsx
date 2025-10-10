import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const Navbar = () => {
  const [open, setOpen] = useState(false)

  const navLinkClasses = ({ isActive }) =>
    isActive
      ? 'text-green-400 font-semibold'
      : 'text-gray-300 hover:text-green-400'

  const toggleMenu = () => setOpen(prev => !prev)
  const closeMenu = () => setOpen(false)

  return (
    <header className="bg-[#1f2937] text-white shadow-lg font-roboto">
      <div className="container mx-auto flex items-center justify-between p-4">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500 rounded flex items-center justify-center font-bold text-white">
            AI
          </div>
          <div className="text-lg font-semibold">AI Content Strategy</div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 items-center">
          <NavLink to="/" className={navLinkClasses}>
            Dashboard
          </NavLink>
          <NavLink to="/strategies" className={navLinkClasses}>
            My Strategies
          </NavLink>
          <NavLink to="/analytics" className={navLinkClasses}>
            Analytics
          </NavLink>
          <NavLink to="/competitors" className={navLinkClasses}>
            Competitors
          </NavLink>
        </nav>

        {/* Right Section - Placeholder */}
        <div className="hidden md:flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {/* Add profile, notifications, etc. here */}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {open && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="flex flex-col p-4 space-y-2">
            <Link
              to="/"
              onClick={closeMenu}
              className="py-2 px-3 text-gray-300 hover:bg-gray-700 hover:text-green-400 rounded transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/strategies"
              onClick={closeMenu}
              className="py-2 px-3 text-gray-300 hover:bg-gray-700 hover:text-green-400 rounded transition-colors"
            >
              My Strategies
            </Link>
            <Link
              to="/analytics"
              onClick={closeMenu}
              className="py-2 px-3 text-gray-300 hover:bg-gray-700 hover:text-green-400 rounded transition-colors"
            >
              Analytics
            </Link>
            <Link
              to="/competitors"
              onClick={closeMenu}
              className="py-2 px-3 text-gray-300 hover:bg-gray-700 hover:text-green-400 rounded transition-colors"
            >
              Competitors
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar