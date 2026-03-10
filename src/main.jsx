import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import App from './App'
import './lib/i18n'
import './index.css'

import { ThemeProvider, useTheme } from './contexts/ThemeContext'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
})

function ThemedToaster() {
    const { theme } = useTheme()

    const toastStyles = theme === 'light'
        ? {
            background: '#FFFFFF',
            color: '#1F2937',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            fontSize: '14px',
        }
        : {
            background: '#262626',
            color: '#EDEDED',
            border: '1px solid #333333',
            borderRadius: '12px',
            fontSize: '14px',
        }

    return (
        <Toaster
            position="top-center"
            toastOptions={{
                duration: 4000,
                style: toastStyles,
                success: {
                    iconTheme: {
                        primary: '#3ECF8E',
                        secondary: theme === 'light' ? '#FFFFFF' : '#EDEDED',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#F97066',
                        secondary: theme === 'light' ? '#FFFFFF' : '#EDEDED',
                    },
                },
            }}
        />
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ThemeProvider>
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                        <App />
                        <ThemedToaster />
                    </AuthProvider>
                </QueryClientProvider>
            </BrowserRouter>
        </ThemeProvider>
    </React.StrictMode>
)
