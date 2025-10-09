import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const Navbar = () => {
  const [open, setOpen] = useState(false)
  return (
    <header className="bg-white text-gray-800 shadow-md font-roboto">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500 rounded flex items-center justify-center font-bold text-white">AI</div>
          <div className="text-lg font-semibold">AI Content Strategy</div>
        </div>
        <nav className="hidden md:flex space-x-6 items-center">
          <NavLink to="/" className={({isActive})=> isActive? 'text-green-500 font-semibold':'text-gray-700 hover:text-green-500'}>Dashboard</NavLink>
          <NavLink to="/strategies" className={({isActive})=> isActive? 'text-green-500 font-semibold':'text-gray-700 hover:text-green-500'}>My Strategies</NavLink>
          <NavLink to="/analytics" className={({isActive})=> isActive? 'text-green-500 font-semibold':'text-gray-700 hover:text-green-500'}>Analytics</NavLink>
          <NavLink to="/calendar" className={({isActive})=> isActive? 'text-green-500 font-semibold':'text-gray-700 hover:text-green-500'}>Calendar</NavLink>
          <NavLink to="/competitors" className={({isActive})=> isActive? 'text-green-500 font-semibold':'text-gray-700 hover:text-green-500'}>Competitors</NavLink>
        </nav>
        <div className="flex items-center space-x-3">

        </div>
        <div className="md:hidden flex items-center space-x-2">
          <button className="p-2" onClick={()=>setOpen(v=>!v)} aria-label="Toggle menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden bg-gray-100">
          <div className="flex flex-col p-4 space-y-2">
            <Link to="/" onClick={()=>setOpen(false)}>Dashboard</Link>
            
            <Link to="/strategies" onClick={()=>setOpen(false)}>My Strategies</Link><Link to="/analytics" onClick={()=>setOpen(false)}>Analytics</Link>
            <Link to="/calendar" onClick={()=>setOpen(false)}>Calendar</Link>
            <Link to="/competitors" onClick={()=>setOpen(false)}>Competitors</Link>
          </div>
          
        </div>
      )}
    </header>
  )
}

export default Navbar;