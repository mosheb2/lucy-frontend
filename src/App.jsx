import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/AuthContext"
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    // Check if we have a session in localStorage and set a flag
    try {
      const sessionStr = localStorage.getItem('supabase.auth.token');
      if (sessionStr) {
        const sessionData = JSON.parse(sessionStr);
        if (sessionData && sessionData.access_token) {
          console.log('App: Found session in localStorage, setting user_authenticated flag');
          localStorage.setItem('user_authenticated', 'true');
        }
      }
    } catch (e) {
      console.error('Error checking session in localStorage:', e);
    }
  }, []);

  return (
    <AuthProvider>
      <Pages />
      <Toaster />
    </AuthProvider>
  )
}

export default App 