/* eslint-disable react-refresh/only-export-components */
import React from 'react'

export const ThemeContext = React.createContext()

export const ThemeProvider = ({ children }) => {
  return (
    <ThemeContext.Provider value={{}}>
      {children}
    </ThemeContext.Provider>
  )
}