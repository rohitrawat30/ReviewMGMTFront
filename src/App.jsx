import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import FeedbackPage from './pages/FeedbackPage'
import TestPage from './pages/TestPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/test" replace />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="*" element={<Navigate to="/test" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
