import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeDatabase } from './lib/database'
import { seedInterviewQuestions } from './lib/csvImporter'
import { getOrCreateSampleProject } from './services/SampleDataService'

// Initialize database and seed data on app startup
async function initializeApp() {
  try {
    await initializeDatabase()
    await seedInterviewQuestions()
    await getOrCreateSampleProject()
    console.log('✅ App initialization complete')
  } catch (error) {
    console.error('❌ App initialization failed:', error)
  }
}

// Start initialization (non-blocking)
initializeApp()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
