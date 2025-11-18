import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from "./pages/LandingPage";
import LogIn from "./pages/LogIn";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LogIn />} />
        </Routes>
      </div>
    </Router>
  )
}

function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-blue-600">
        Welcome to Match-Me! 🔥
      </h1>
    </div>
  )
}

export default App