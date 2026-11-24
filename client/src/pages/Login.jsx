/**
 * Login.jsx  –  Login / Register page
 *
 * Covers (syllabus):
 *   Functional Components · useState · useEffect · Forms · Controlled Components ·
 *   Event Handling · Form Validation · Error Messages · API Integration (Axios) ·
 *   JWT Storage · Authentication Flow · Login/Logout · Loading States
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// ── Password validation rules ──────────────────────────────────────────────
const RULES = [
  { id: 'len',     label: 'At least 8 characters',         test: p => p.length >= 8 },
  { id: 'upper',   label: 'One uppercase letter (A–Z)',     test: p => /[A-Z]/.test(p) },
  { id: 'lower',   label: 'One lowercase letter (a–z)',     test: p => /[a-z]/.test(p) },
  { id: 'num',     label: 'One number (0–9)',               test: p => /[0-9]/.test(p) },
  { id: 'special', label: 'One special character (!@#$…)',  test: p => /[^A-Za-z0-9]/.test(p) },
];

function getStrength(pass) {
  const passed = RULES.filter(r => r.test(pass)).length;
  if (passed <= 1) return 'weak';
  if (passed <= 3) return 'fair';
  if (passed <= 4) return 'good';
  return 'strong';
}

export default function Login() {
  // Controlled Components (syllabus) – all inputs controlled by state
  const [creating,  setCreating]  = useState(false);
  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);   // Loading States
  const [error,     setError]     = useState('');      // Error Messages
  const [strength,  setStrength]  = useState('');
  const [passPct,   setPassPct]   = useState(0);

  const { login, isAuth } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuth) navigate('/movies', { replace: true });
  }, [isAuth, navigate]);

  // Pre-fill email from landing page
  useEffect(() => {
    const saved = localStorage.getItem('movieManiaEmail');
    if (saved) setEmail(saved);
  }, []);

  // Update strength bar whenever password changes (useEffect – syllabus)
  useEffect(() => {
    if (!creating || !password) { setStrength(''); setPassPct(0); return; }
    const passed = RULES.filter(r => r.test(password)).length;
    setPassPct((passed / RULES.length) * 100);
    setStrength(getStrength(password));
  }, [password, creating]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Form Validation (syllabus) – client-side check before API call
    if (creating) {
      const failed = RULES.filter(r => !r.test(password));
      if (failed.length) {
        setError(failed.map(r => r.label).join(' · '));
        return;
      }
    }

    setLoading(true);
    try {
      // API Integration with Axios (syllabus)
      const endpoint = creating ? '/auth/register' : '/auth/login';
      const body = creating
        ? { name: name.trim(), email: email.trim().toLowerCase(), password }
        : { email: email.trim().toLowerCase(), password };

      const { data } = await api.post(endpoint, body);

      // JWT Storage via AuthContext (syllabus)
      login(data.token, data.user);
      navigate('/movies');
    } catch (err) {
      // Error Messages (syllabus)
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setCreating(c => !c);
    setError('');
    setPassword('');
    setName('');
  }

  return (
    <>
      <header className="topbar">
        <Link className="brand" to="/">MOVIE <span>MANIA</span></Link>
        <Link className="text-link" to="/">Back</Link>
      </header>

      <main className="login-wrap">
        {/* Forms + Controlled Components (syllabus) */}
        <form className="login-box" onSubmit={handleSubmit} noValidate>
          <h1>{creating ? 'Create account' : 'Sign in'}</h1>

          {/* Conditional Rendering (syllabus) */}
          {creating && (
            <div>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                required={creating}
              />
            </div>
          )}

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <div className="pass-wrap">
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="pass-toggle"
              aria-label="Toggle password visibility"
              onClick={() => setShowPass(s => !s)}
            >
              {showPass ? '🙈' : '👁'}
            </button>
          </div>

          {/* Conditional Rendering – strength bar only while creating */}
          {creating && password.length > 0 && (
            <>
              <div className="strength-bar">
                <div
                  className={`strength-fill ${strength}`}
                  style={{ width: `${passPct}%` }}
                />
              </div>

              {/* Lists + Keys (syllabus) */}
              <ul className="pass-rules">
                {RULES.map(rule => (
                  <li key={rule.id} className={rule.test(password) ? 'rule-ok' : ''}>
                    {rule.label}
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Error Messages (syllabus) */}
          {error && <p className="note" style={{ color: '#e50914' }}>{error}</p>}

          <button
            className="button red login-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Please wait…' : (creating ? 'Create account' : 'Sign in')}
          </button>

          <p className="note">Use a test password, not one you use elsewhere.</p>

          <p className="switch-text">
            <span>{creating ? 'Already registered?' : 'New here?'}</span>{' '}
            <button type="button" onClick={switchMode}>
              {creating ? 'Sign in' : 'Create account'}
            </button>
          </p>
        </form>
      </main>
    </>
  );
}
