import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { AxiosError } from 'axios';
import PixelButton from '../components/PixelButton';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate(): string | null {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '請輸入有效的 Email';
    if (password.length < 8) return '密碼至少需要 8 個字元';
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      localStorage.setItem('token', res.token);
      // TODO: check if user has a pet → /game, else /init
      navigate('/init');
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('登入失敗，請稍後再試');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-4">
      <div className="w-full max-w-md border-4 border-brown bg-cream-dark p-8">
        <h1 className="mb-8 text-center font-pixel text-xl text-brown">
          AI 電子雞
        </h1>
        <h2 className="mb-6 text-center font-pixel text-sm text-brown-light">
          登入
        </h2>

        {error && (
          <div className="mb-4 border-2 border-orange-dark bg-orange-light p-3 font-pixel text-xs text-brown-dark">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block font-pixel text-xs text-brown">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-brown bg-cream p-3 font-pixel text-xs text-brown-dark outline-none focus:border-orange"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block font-pixel text-xs text-brown">
              密碼
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-brown bg-cream p-3 font-pixel text-xs text-brown-dark outline-none focus:border-orange"
              placeholder="********"
            />
          </div>

          <label className="flex items-center gap-2 font-pixel text-xs text-brown">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 accent-orange"
            />
            記住我
          </label>

          <PixelButton type="submit" disabled={loading} className="w-full">
            {loading ? '登入中...' : '登入'}
          </PixelButton>
        </form>

        <p className="mt-6 text-center font-pixel text-xs text-brown-light">
          還沒有帳號？{' '}
          <Link to="/register" className="text-orange hover:text-orange-dark underline">
            註冊
          </Link>
        </p>
      </div>
    </div>
  );
}
