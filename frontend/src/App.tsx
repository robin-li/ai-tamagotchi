import { Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-cream text-brown-dark">
      <Routes>
        <Route path="/login" element={<Placeholder page="登入" />} />
        <Route path="/register" element={<Placeholder page="註冊" />} />
        <Route path="/init" element={<Placeholder page="電子雞初始化" />} />
        <Route path="/game" element={<Placeholder page="主遊戲" />} />
        <Route path="/feed" element={<Placeholder page="餵食動畫" />} />
        <Route path="/death" element={<Placeholder page="死亡" />} />
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
