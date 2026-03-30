import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import InitPage from './pages/InitPage';
import GamePage from './pages/GamePage';

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
        <Route path="/feed" element={<PrivateRoute><Placeholder page="餵食動畫" /></PrivateRoute>} />
        <Route path="/death" element={<PrivateRoute><Placeholder page="死亡" /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

function Placeholder({ page }: { page: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-lg font-pixel text-brown">{page}</h1>
    </div>
  );
}

export default App;
