import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import CreateUser from "./components/create-user/StepIndex";
import MainPage from "./pages/MainPage";
import MessagesPage from "./pages/MessagesPage";
import MatchesSection from "./components/sidebar/sections/MatchesSection";
import RequestsSection from "./components/sidebar/sections/RequestsSection";
import ProfileSection from "./components/sidebar/sections/ProfileSection";
import AppShell from "./components/app/AppShell";
import { ChatProvider } from "./context/ChatContext";
import { getToken } from "./lib/session";

// Wrapper for authenticated routes: sends logged-out visitors to the login page
function AuthenticatedLayout() {
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }
  return (
    <ChatProvider>
      <Outlet />
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

        {/* Authenticated routes - one ChatProvider, so the socket stays connected across tabs */}
        <Route element={<AuthenticatedLayout />}>
          <Route path="/complete-profile" element={<CreateUser />} />
          <Route element={<AppShell />}>
            <Route path="/explore" element={<MainPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/matches" element={<MatchesSection />} />
            <Route path="/requests" element={<RequestsSection />} />
            <Route path="/profile" element={<ProfileSection />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
