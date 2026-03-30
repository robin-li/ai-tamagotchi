import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import { AxiosError } from 'axios';
import PixelButton from '../components/PixelButton';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate(): string | null {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '請輸入有效的 Email';
    if (password.length < 8) return '密碼至少需要 8 個字元';
    if (password !== confirmPassword) return '兩次密碼輸入不一致';
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
      const res = await register(email, password);
      localStorage.setItem('token', res.token);
      navigate('/init');
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('註冊失敗，請稍後再試');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-4">
      <div className="w-full max-w-md border-4 border-brown bg-cream-dark p-4 sm:p-8">
        <h1 className="mb-6 sm:mb-8 text-center font-pixel text-base sm:text-xl text-brown">
          AI 電子雞
        </h1>
        <h2 className="mb-6 text-center font-pixel text-sm text-brown-light">
          註冊
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
              className="w-full border-2 border-brown bg-cream p-3 font-pixel text-xs text-brown-dark outline-none focus:border-orange min-h-[48px]"
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
              className="w-full border-2 border-brown bg-cream p-3 font-pixel text-xs text-brown-dark outline-none focus:border-orange min-h-[48px]"
              placeholder="********"
            />
          </div>

          <div>
            <label className="mb-2 block font-pixel text-xs text-brown">
              確認密碼
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border-2 border-brown bg-cream p-3 font-pixel text-xs text-brown-dark outline-none focus:border-orange min-h-[48px]"
              placeholder="********"
            />
          </div>

          <PixelButton type="submit" disabled={loading} className="w-full">
            {loading ? '註冊中...' : '註冊'}
          </PixelButton>
        </form>

        <p className="mt-6 text-center font-pixel text-xs text-brown-light">
          已有帳號？{' '}
          <Link to="/login" className="text-orange hover:text-orange-dark underline">
            登入
          </Link>
        </p>
      </div>
    </div>
  );
}
