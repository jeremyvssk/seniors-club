import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import TestPage from "./pages/TestPage";
import CreateUser from "./components/create-user/StepIndex";
import MainPage from "./pages/MainPage";
import { ChatProvider } from "./context/ChatContext";  
import { ChatWindow } from "./components/ChatWindow";

// Wrapper for authenticated routes
function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <div className="min-h-screen bg-gray-100">
        {children}
        <ChatWindow />
      </div>
    </ChatProvider>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes - no ChatProvider */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Authenticated routes - wrapped in ChatProvider */}
        <Route path="/complete-profile" element={
          <AuthenticatedLayout>
            <CreateUser />
          </AuthenticatedLayout>
        } />
        
        <Route path="/test" element={
          <AuthenticatedLayout>
            <TestPage />
          </AuthenticatedLayout>
        } />
        
        <Route path="/explore" element={
          <AuthenticatedLayout>
            <MainPage />
          </AuthenticatedLayout>
        } />
      </Routes>
    </Router>
  );
}

export default App;