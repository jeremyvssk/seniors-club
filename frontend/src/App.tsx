import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import TestPage from "./pages/TestPage";
import CreateUser from "./components/create-user/StepIndex";
import MainPage from "./pages/MainPage";
import { ChatProvider } from "./context/ChatContext";  
import { ChatWindow } from "./components/ChatWindow";
import { useWebSocketConnection } from "./hooks/useWebSocketConnection";

function AppContent() {
  useWebSocketConnection(); // Connect WebSocket based on auth/route
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/complete-profile" element={<CreateUser />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/explore" element={<MainPage />} />
      </Routes>
      
      <ChatWindow />
    </div>
  );
}

function App() {
  return (
    <ChatProvider>  
      <Router>
        <AppContent />
      </Router>
    </ChatProvider>  
  );
}

export default App;