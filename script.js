/**
 * script.js  –  Movie Mania Frontend
 *
 * Covers (syllabus):
 *   DOM · Events · Fetch API · Promises · async/await · JSON
 *   ES6 Basics (const, let, arrow functions, template literals,
 *               destructuring, spread, modules-lite)
 *
 * Auth: JWT stored in localStorage.  All movie data fetched from
 *       the Express REST API at /api/*  (Fetch API + async/await).
 */

'use strict';

// ── API base URL (same origin when served by Express) ────────────────────────
const API = '/api';

// ── Token helpers ─────────────────────────────────────────────────────────────
const getToken  = ()        => localStorage.getItem('movieManiaToken');
const setToken  = token     => localStorage.setItem('movieManiaToken', token);
const clearAuth = ()        => {
  ['movieManiaToken','movieManiaEmail','movieManiaName','movieManiaSignedIn']
    .forEach(k => localStorage.removeItem(k));
};

/** Thin fetch wrapper – attaches Bearer token and parses JSON */
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status, data });
  return data;
}

// ═════════════════════════════════════════════════════════════════════════════
//  LANDING PAGE  (index.html)
// ═════════════════════════════════════════════════════════════════════════════
const page = document.body.dataset.page;

if (page === 'landing') {
  document.getElementById('startForm').onsubmit = function (e) {
    e.preventDefault();
    localStorage.setItem('movieManiaEmail', document.getElementById('startEmail').value.trim().toLowerCase());
    window.location.href = 'login.html';
  };
}

// ═════════════════════════════════════════════════════════════════════════════
//  LOGIN / REGISTER PAGE  (login.html)
// ═════════════════════════════════════════════════════════════════════════════
if (page === 'login') {
  const form         = document.getElementById('accountForm');
  const nameField    = document.getElementById('nameField');
  const nameInput    = document.getElementById('name');
  const emailInput   = document.getElementById('email');
  const passInput    = document.getElementById('password');
  const message      = document.getElementById('loginMessage');
  const strengthBar  = document.getElementById('strengthBar');
  const strengthFill = document.getElementById('strengthFill');
  const passRules    = document.getElementById('passRules');
  let creating       = false;

  emailInput.value = localStorage.getItem('movieManiaEmail') || '';

  // ── Password rules ──
  const rules = [
    { id: 'rule-len',     test: p => p.length >= 8 },
    { id: 'rule-upper',   test: p => /[A-Z]/.test(p) },
    { id: 'rule-lower',   test: p => /[a-z]/.test(p) },
    { id: 'rule-num',     test: p => /[0-9]/.test(p) },
    { id: 'rule-special', test: p => /[^A-Za-z0-9]/.test(p) },
  ];

  function checkPassword(pass) {
    const passed = rules.filter(r => r.test(pass)).length;
    rules.forEach(r => document.getElementById(r.id).classList.toggle('rule-ok', r.test(pass)));
    const pct = (passed / rules.length) * 100;
    strengthFill.style.width = pct + '%';
    strengthFill.className = 'strength-fill ' + (
      passed <= 1 ? 'weak' : passed <= 3 ? 'fair' : passed <= 4 ? 'good' : 'strong'
    );
    return passed === rules.length;
  }

  passInput.oninput = function () {
    if (!creating) return;
    const val = passInput.value;
    strengthBar.classList.toggle('hidden', val.length === 0);
    passRules.classList.toggle('hidden', val.length === 0);
    if (val.length) checkPassword(val);
  };

  document.getElementById('passToggle').onclick = function () {
    const isText = passInput.type === 'text';
    passInput.type = isText ? 'password' : 'text';
    this.textContent = isText ? '👁' : '🙈';
  };

  function setMode(isNew) {
    creating = isNew;
    nameField.classList.toggle('hidden', !creating);
    nameInput.required = creating;
    document.getElementById('formTitle').textContent     = creating ? 'Create account' : 'Sign in';
    document.getElementById('submitAccount').textContent = creating ? 'Create account' : 'Sign in';
    document.getElementById('switchPrompt').textContent  = creating ? 'Already registered?' : 'New here?';
    document.getElementById('switchForm').textContent    = creating ? 'Sign in' : 'Create account';
    message.textContent = '';
    if (!creating) {
      strengthBar.classList.add('hidden');
      passRules.classList.add('hidden');
      passInput.value = '';
    }
  }

  document.getElementById('switchForm').onclick = () => setMode(!creating);

  // ── Form submit – calls real API ──
  form.onsubmit = async function (e) {
    e.preventDefault();
    const submitBtn = document.getElementById('submitAccount');
    submitBtn.disabled = true;
    message.textContent = '';

    const email    = emailInput.value.trim().toLowerCase();
    const password = passInput.value;

    try {
      if (creating) {
        // ── Register via POST /api/auth/register ──
        const data = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name: nameInput.value.trim(), email, password }),
        });
        setToken(data.token);
        localStorage.setItem('movieManiaEmail',    data.user.email);
        localStorage.setItem('movieManiaName',     data.user.name);
        localStorage.setItem('movieManiaSignedIn', 'yes');
        window.location.href = 'movies.html';
      } else {
        // ── Login via POST /api/auth/login ──
        const data = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        setToken(data.token);
        localStorage.setItem('movieManiaEmail',    data.user.email);
        localStorage.setItem('movieManiaName',     data.user.name);
        localStorage.setItem('movieManiaSignedIn', 'yes');
        window.location.href = 'movies.html';
      }
    } catch (err) {
      // Surface field-level validation errors from express-validator
      if (err.data && err.data.fields) {
        message.textContent = err.data.fields.map(f => f.message).join(' · ');
      } else {
        message.textContent = err.message || 'Something went wrong. Try again.';
      }
    } finally {
      submitBtn.disabled = false;
    }
  };
}

// ═════════════════════════════════════════════════════════════════════════════
//  MOVIES / RECOMMENDATION PAGE  (movies.html)
// ═════════════════════════════════════════════════════════════════════════════
if (page === 'movies') {
  if (localStorage.getItem('movieManiaSignedIn') !== 'yes') {
    window.location.href = 'login.html';
  }

  document.getElementById('userEmail').textContent = localStorage.getItem('movieManiaEmail') || '';

  // ── Chip group helper ──
  function initChips(groupId, hiddenId) {
    const group  = document.getElementById(groupId);
    const hidden = document.getElementById(hiddenId);
    group.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      hidden.value = chip.dataset.value;
    });
  }
  initChips('genreChips', 'genre');
  initChips('eraChips',   'era');

  // ── Rating slider label ──
  const slider      = document.getElementById('minRating');
  const ratingLabel = document.getElementById('ratingLabel');
  slider.oninput = () => { ratingLabel.textContent = parseFloat(slider.value).toFixed(1); };

  // ── Build a movie card DOM node ──
  function movieCard(m) {
    const article = document.createElement('article');
    article.className = 'movie-card';

    const poster   = document.createElement('div');
    poster.className = 'poster';

    const fallback = document.createElement('span');
    fallback.className = 'poster-fallback';
    fallback.innerHTML = `${m.title}<small>Poster unavailable</small>`;

    const img = document.createElement('img');
    img.src   = m.poster || '';
    img.alt   = `${m.title} poster`;
    img.onerror = function () {
      this.remove();
      poster.classList.add('no-poster');
    };

    poster.append(fallback, img);
    article.innerHTML = `<h2>${m.title}</h2>
      <p>${m.genre} · ${m.year} · ${m.audio}</p>
      <p>⭐ ${m.rating}/10</p>`;
    article.prepend(poster);
    return article;
  }

  // ── Recommendation form ──
  const recForm        = document.getElementById('recForm');
  const recBanner      = document.querySelector('.rec-banner');
  const recWrap        = document.querySelector('.rec-wrap');
  const resultsSection = document.getElementById('resultsSection');
  const movieList      = document.getElementById('movieList');
  const message        = document.getElementById('message');
  const resultsTitle   = document.getElementById('resultsTitle');
  const submitBtn      = recForm.querySelector('.rec-submit-btn');

  // ── Fetch movies from real API using Fetch API + async/await ──
  recForm.onsubmit = async function (e) {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Loading…';

    const genre     = document.getElementById('genre').value;
    const era       = document.getElementById('era').value;
    const minRating = slider.value;
    const search    = document.getElementById('recSearch').value.trim();

    // Build query string (covers "Query Params" syllabus item)
    const params = new URLSearchParams();
    if (genre)     params.set('genre',     genre);
    if (era)       params.set('year',      era);
    if (minRating) params.set('minRating', minRating);
    if (search)    params.set('search',    search);

    try {
      // GET /api/movies?genre=...&year=...  –  Fetch API
      const data = await apiFetch(`/movies?${params}`);
      const results = data.movies;

      const parts = [];
      if (genre) parts.push(genre);
      if (era)   parts.push(era);
      resultsTitle.textContent = parts.length ? `Best ${parts.join(' · ')} picks` : 'Top picks for you';

      movieList.replaceChildren(...results.map(movieCard));
      if (!results.length) {
        movieList.innerHTML = '<p class="note">No movies match your filters. Try loosening them.</p>';
      }

      message.textContent = results.length
        ? `${results.length} recommendation${results.length > 1 ? 's' : ''} · sorted by rating`
        : '';

      recBanner.classList.add('hidden');
      recWrap.classList.add('hidden');
      resultsSection.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      message.textContent = err.message || 'Failed to load movies.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Get Recommendations →';
    }
  };

  // ── Reset ──
  document.getElementById('resetBtn').onclick = function () {
    resultsSection.classList.add('hidden');
    recBanner.classList.remove('hidden');
    recWrap.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Logout ──
  document.getElementById('logout').onclick = function () {
    clearAuth();
    window.location.href = 'index.html';
  };

  // ═══════════════════════════════════════════════════
  //  SMART CARD SWIPER  –  fetches from API too
  // ═══════════════════════════════════════════════════
  const swiperDeck    = document.getElementById('swiperDeck');
  const swiperSummary = document.getElementById('swiperSummary');
  const swiperIntro   = document.querySelector('.swiper-intro');
  const swiperCard    = document.getElementById('swiperCard');
  const swiperImg     = document.getElementById('swiperImg');
  const swiperFallback= document.getElementById('swiperFallback');
  const swiperPoster  = document.getElementById('swiperPoster');
  const swiperTitle   = document.getElementById('swiperTitle');
  const swiperMeta    = document.getElementById('swiperMeta');
  const swiperRating  = document.getElementById('swiperRating');
  const swiperProgress= document.getElementById('swiperProgress');
  const swiperGenre   = document.getElementById('swiperGenre');
  const summaryList   = document.getElementById('summaryList');
  const summaryNote   = document.getElementById('summaryNote');

  let deck   = [];
  let cursor = 0;
  let liked  = [];

  function loadCard(index) {
    const m = deck[index];
    swiperCard.style.animation = 'none';
    swiperCard.offsetHeight;         // reflow to restart animation
    swiperCard.style.animation = '';

    swiperTitle.textContent    = m.title;
    swiperMeta.textContent     = `${m.year} · ${m.audio}`;
    swiperRating.textContent   = `⭐ ${m.rating}/10`;
    swiperGenre.textContent    = m.genre;
    swiperProgress.textContent = `${index + 1} of ${deck.length}`;

    swiperPoster.classList.remove('no-poster');
    swiperFallback.innerHTML = `${m.title}<small style="display:block;margin-top:8px;font-size:13px;font-weight:normal;color:rgba(255,255,255,0.55)">Poster unavailable</small>`;
    swiperImg.src  = m.poster || '';
    swiperImg.alt  = `${m.title} poster`;
    swiperImg.style.display = '';
    swiperImg.onerror = function () {
      swiperImg.style.display = 'none';
      swiperPoster.classList.add('no-poster');
    };
  }

  function advance(isLike) {
    if (isLike) liked.push(deck[cursor]);
    cursor++;
    if (cursor < deck.length) {
      loadCard(cursor);
    } else {
      swiperDeck.classList.add('hidden');
      summaryList.replaceChildren(...liked.map(movieCard));
      summaryNote.textContent = liked.length
        ? `You liked ${liked.length} movie${liked.length > 1 ? 's' : ''}.`
        : 'You skipped everything. Try again with fresh eyes!';
      if (!liked.length) summaryList.innerHTML = '';
      swiperSummary.classList.remove('hidden');
    }
  }

  document.getElementById('startSwiper').onclick = async function () {
    try {
      const data = await apiFetch('/movies');
      deck   = data.movies.sort(() => Math.random() - 0.5); // shuffle
      cursor = 0;
      liked  = [];
      swiperIntro.classList.add('hidden');
      swiperSummary.classList.add('hidden');
      swiperDeck.classList.remove('hidden');
      loadCard(0);
    } catch (err) {
      alert('Could not load movies: ' + err.message);
    }
  };

  document.getElementById('likeBtn').onclick = () => advance(true);
  document.getElementById('skipBtn').onclick  = () => advance(false);

  document.getElementById('restartSwiper').onclick = function () {
    swiperSummary.classList.add('hidden');
    swiperIntro.classList.remove('hidden');
  };
}
