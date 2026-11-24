/**
 * Landing.jsx  –  Landing / home page
 *
 * Covers (syllabus):
 *   Functional Components · useState · Forms · Controlled Components ·
 *   Event Handling · React Router (useNavigate) · JSX
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';

export default function Landing() {
  // Controlled Component (syllabus) – email is controlled by React state
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();     // Event Handling (syllabus)
    localStorage.setItem('movieManiaEmail', email.trim().toLowerCase());
    navigate('/login');     // React Router – programmatic navigation
  }

  return (
    <>
      <Topbar />
      <main className="hero">
        <h1>Unlimited movies,<br />shows, and more</h1>
        <p className="ready">Ready to browse? Enter your email to get started.</p>

        {/* Forms + Controlled Components (syllabus) */}
        <form className="email-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            aria-label="Email address"
            value={email}                          /* controlled value */
            onChange={e => setEmail(e.target.value)} /* controlled handler */
            required
          />
          <button className="button red" type="submit">Get Started ›</button>
        </form>
      </main>
    </>
  );
}
