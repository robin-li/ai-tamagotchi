import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import InitPage from './pages/InitPage';
import GamePage from './pages/GamePage';
import FeedPage from './pages/FeedPage';
import DeathPage from './pages/DeathPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <div className="min-h-screen bg-cream text-brown-dark">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/init" element={<PrivateRoute><InitPage /></PrivateRoute>} />
        <Route path="/game" element={<PrivateRoute><GamePage /></PrivateRoute>} />
        <Route path="/feed" element={<PrivateRoute><FeedPage /></PrivateRoute>} />
        <Route path="/death" element={<PrivateRoute><DeathPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}
export default App;
