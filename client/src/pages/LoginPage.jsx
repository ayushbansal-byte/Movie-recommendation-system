/**
 * LoginPage.jsx  –  Sign in / Register
 *
 * Covers (Unit 6): Forms · Controlled Components · useState · Event Handling
 * Covers (Unit 7): Authentication Flow · Form Validation · Error Messages · UX Basics
 */

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PASSWORD_RULES = [
  { id: 'len',     label: 'At least 8 characters',      test: p => p.length >= 8 },
  { id: 'upper',   label: 'One uppercase letter',        test: p => /[A-Z]/.test(p) },
  { id: 'lower',   label: 'One lowercase letter',        test: p => /[a-z]/.test(p) },
  { id: 'num',     label: 'One number',                  test: p => /[0-9]/.test(p) },
  { id: 'special', label: 'One special character',       test: p => /[^A-Za-z0-9]/.test(p) },
];

export default function LoginPage() {
  const [mode,     setMode]     = useState('login');   // 'login' | 'register'
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [formErr,  setFormErr]  = useState('');

  const { login, register, loading } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/movies';

  const passStrength = PASSWORD_RULES.filter(r => r.test(password)).length;
  const strengthPct  = (passStrength / PASSWORD_RULES.length) * 100;
  const strengthColor =
    passStrength <= 1 ? 'bg-red-500' :
    passStrength <= 3 ? 'bg-yellow-500' :
    passStrength <= 4 ? 'bg-blue-500'  : 'bg-green-500';

  async function handleSubmit(e) {
    e.preventDefault();
    setFormErr('');

    // Client-side validation (Unit 7 – Form Validation)
    if (mode === 'register') {
      if (!name.trim())              return setFormErr('Name is required');
      if (passStrength < 5)          return setFormErr('Password does not meet all requirements');
    }

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setFormErr(err.message);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold mb-6">
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {/* Name field – only on register (Conditional Rendering – Unit 6) */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-brand rounded-lg px-4 py-2.5 text-sm text-white outline-none transition"
                required
              />
            </div>
          )}

          {/* Email – Controlled Component (Unit 6) */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-brand rounded-lg px-4 py-2.5 text-sm text-white outline-none transition"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-brand rounded-lg px-4 py-2.5 pr-12 text-sm text-white outline-none transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-lg"
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>

            {/* Strength bar + rules (register only) */}
            {mode === 'register' && password.length > 0 && (
              <div className="mt-2">
                <div className="h-1 w-full bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                    style={{ width: `${strengthPct}%` }}
                  />
                </div>
                <ul className="mt-2 flex flex-col gap-0.5">
                  {PASSWORD_RULES.map(r => (
                    <li
                      key={r.id}
                      className={`text-xs flex items-center gap-1.5 ${r.test(password) ? 'text-green-400' : 'text-zinc-500'}`}
                    >
                      {r.test(password) ? '✓' : '✕'} {r.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Error message (Unit 7 – Error Messages) */}
          {formErr && (
            <p className="text-red-400 text-sm bg-red-900/30 border border-red-800 px-3 py-2 rounded-lg">
              {formErr}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-brand hover:bg-brand-dark disabled:opacity-50 text-white font-bold py-3 rounded-xl transition mt-1"
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {/* Switch mode */}
        <p className="text-center text-zinc-500 text-sm mt-5">
          {mode === 'login' ? 'New here?' : 'Already registered?'}
          {' '}
          <button
            onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setFormErr(''); }}
            className="text-brand hover:underline font-semibold"
          >
            {mode === 'login' ? 'Create account' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
