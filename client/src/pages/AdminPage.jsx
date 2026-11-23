/**
 * AdminPage.jsx  –  Admin dashboard (add movie, stats)
 *
 * Covers (Unit 6): Controlled Components · Forms · useState · useEffect
 * Covers (Unit 7): Role-Based UI · CRUD Full Stack · File Upload Full Stack · Progress Bars · Form Validation
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api             from '../api/axios';
import { useUpload }   from '../hooks/useUpload';
import Spinner         from '../components/Spinner';
import ErrorMessage    from '../components/ErrorMessage';

const GENRES = ['Action', 'Comedy', 'Romance', 'Thriller', 'Drama', 'Horror', 'Sci-Fi', 'Animation'];

const EMPTY_FORM = { title: '', genre: 'Action', year: new Date().getFullYear(), rating: 7, audio: 'Original Hindi', poster: '', description: '' };

export default function AdminPage() {
  const navigate          = useNavigate();
  const [form,  setForm]  = useState(EMPTY_FORM);
  const [stats, setStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formErr, setFormErr] = useState('');
  const [formOk,  setFormOk]  = useState('');

  const { upload, uploading, progress, error: uploadError } = useUpload();

  // Load genre stats (Aggregation result from MongoDB)
  useEffect(() => {
    api.get('/movies/stats')
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handlePosterUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await upload(file);
      setForm(f => ({ ...f, poster: url }));
    } catch {}
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormErr(''); setFormOk('');
    if (!form.title.trim()) return setFormErr('Title is required');

    setSubmitLoading(true);
    try {
      await api.post('/movies', {
        ...form,
        year:   Number(form.year),
        rating: Number(form.rating),
      });
      setFormOk(`"${form.title}" added successfully!`);
      setForm(EMPTY_FORM);
    } catch (err) {
      const e = err.response?.data;
      setFormErr(e?.fields ? e.fields.map(f => f.message).join(' · ') : e?.error || 'Failed to add movie');
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black">Admin Dashboard</h1>
        <button onClick={() => navigate('/movies')} className="text-zinc-400 hover:text-white text-sm">
          ← Back to movies
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* ── Add movie form (CRUD Full Stack – Unit 7) ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-5">Add New Movie</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {[
              { label: 'Title',       name: 'title',       type: 'text',   placeholder: 'Movie title' },
              { label: 'Audio',       name: 'audio',       type: 'text',   placeholder: 'e.g. Original Hindi' },
              { label: 'Poster URL',  name: 'poster',      type: 'url',    placeholder: 'https://...' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-xs text-zinc-400 mb-1">{f.label}</label>
                <input
                  type={f.type} name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  className="w-full bg-zinc-800 border border-zinc-700 focus:border-brand rounded-lg px-4 py-2 text-sm text-white outline-none transition"
                />
              </div>
            ))}

            {/* Genre select */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Genre</label>
              <select name="genre" value={form.genre} onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2 text-sm outline-none">
                {GENRES.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>

            {/* Year + Rating side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Year</label>
                <input type="number" name="year" value={form.year} onChange={handleChange} min="1900" max="2100"
                  className="w-full bg-zinc-800 border border-zinc-700 focus:border-brand rounded-lg px-4 py-2 text-sm text-white outline-none transition" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Rating (0–10)</label>
                <input type="number" name="rating" value={form.rating} onChange={handleChange} min="0" max="10" step="0.1"
                  className="w-full bg-zinc-800 border border-zinc-700 focus:border-brand rounded-lg px-4 py-2 text-sm text-white outline-none transition" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-brand rounded-lg px-4 py-2 text-sm text-white outline-none transition resize-none" />
            </div>

            {/* File upload – Progress Bar (Unit 7) */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Or upload poster image</label>
              <input type="file" accept="image/*" onChange={handlePosterUpload}
                className="text-xs text-zinc-400 file:bg-zinc-700 file:border-0 file:text-white file:px-3 file:py-1.5 file:rounded file:mr-3 file:cursor-pointer" />
              {uploading && (
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-zinc-700 rounded-full overflow-hidden">
                    <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">{progress}%</p>
                </div>
              )}
              {uploadError && <p className="text-red-400 text-xs mt-1">{uploadError}</p>}
              {form.poster && !uploading && (
                <p className="text-green-400 text-xs mt-1">✓ Poster set</p>
              )}
            </div>

            {formErr && <p className="text-red-400 text-sm bg-red-900/30 border border-red-800 px-3 py-2 rounded-lg">{formErr}</p>}
            {formOk  && <p className="text-green-400 text-sm bg-green-900/30 border border-green-800 px-3 py-2 rounded-lg">{formOk}</p>}

            <button type="submit" disabled={submitLoading || uploading}
              className="bg-brand hover:bg-brand-dark disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition">
              {submitLoading ? 'Adding…' : 'Add Movie'}
            </button>
          </form>
        </div>

        {/* ── Genre stats (MongoDB Aggregation result) ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-5">Genre Statistics</h2>
          {statsLoading ? <Spinner text="Loading stats…" /> : (
            <div className="flex flex-col gap-3">
              {stats.map(s => (
                <div key={s.genre} className="bg-zinc-800 rounded-xl px-4 py-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm">{s.genre}</span>
                    <span className="text-yellow-400 text-sm font-bold">⭐ {s.avgRating}</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>{s.count} movie{s.count !== 1 ? 's' : ''}</span>
                    <span>Range: {s.minRating}–{s.maxRating}</span>
                  </div>
                  {/* Mini bar */}
                  <div className="h-1 mt-2 w-full bg-zinc-700 rounded-full overflow-hidden">
                    <div className="h-full bg-brand rounded-full" style={{ width: `${(s.avgRating / 10) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
