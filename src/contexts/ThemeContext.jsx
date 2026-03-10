import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState(() => {
        // Load from localStorage or check system preference
        const savedTheme = localStorage.getItem('nashark-theme')
        if (savedTheme) {
            return savedTheme
        }

        // System preference detection on first visit
        if (typeof window !== 'undefined' && window.matchMedia) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            return prefersDark ? 'dark' : 'light'
        }

        return 'dark' // Default fallback
    })

    useEffect(() => {
        // Apply theme to HTML element
        document.documentElement.setAttribute('data-theme', theme)

        // Save to localStorage
        localStorage.setItem('nashark-theme', theme)
    }, [theme])

    const setTheme = (newTheme) => {
        if (newTheme === 'light' || newTheme === 'dark') {
            setThemeState(newTheme)
        }
    }

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
