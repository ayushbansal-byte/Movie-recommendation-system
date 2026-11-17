// Movie data: title, genre, year, sample score, audio, poster.
const movies = [
  { title: 'Alpha',             genre: 'Action',   year: 2026, rating: 7.5, audio: 'Original Hindi',
    poster: 'https://www.yashrajfilms.com/images/default-source/news1/alpha-posterc18c4fca-3883-4f22-8abc-8b76b33bcb8a.jpg?sfvrsn=47c7dccc_1' },
  { title: 'Mardaani 3',        genre: 'Thriller', year: 2026, rating: 7.2, audio: 'Original Hindi',
    poster: 'https://images.filmibeat.com/ph-big/2026/03/mardaani-3-ott-release-when-and-where-to-watch-rani-mukerjis-crime-thriller-after-its-box-office-success1773202806_0.webp' },
  { title: 'Vadh 2',            genre: 'Thriller', year: 2026, rating: 7.4, audio: 'Original Hindi',
    poster: 'https://www.cinemaclock.com/images/posters/1000x1500/72/vadh-2-2025-orig-poster.jpg' },
  { title: 'Chhaava',           genre: 'Action',   year: 2025, rating: 7.3, audio: 'Original Hindi',
    poster: 'https://catalog.cinema-api.com/cf/images/ncg-images/ad892cd1d6ec40ed95a9cdff4dbb49f8.jpg?version=A1E8CDEA0D096B2B9211F114FA0D0854' },
  { title: 'Sky Force',         genre: 'Action',   year: 2025, rating: 6.8, audio: 'Original Hindi',
    poster: 'https://media.assettype.com/deccanherald%2F2025-01-15%2Fm7rv77ak%2FSky-Force.jpeg' },
  { title: 'Saiyaara',          genre: 'Romance',  year: 2025, rating: 7.0, audio: 'Original Hindi',
    poster: 'https://lsf.go.id/storage/app/resources/resize/600_900_0_0_crop/img_5c99fdbb130d5e78d685fbdeb6de60ea.jpg' },
  { title: 'Raid 2',            genre: 'Thriller', year: 2025, rating: 6.8, audio: 'Original Hindi',
    poster: 'https://image.tmdb.org/t/p/w500/1RzqTwmLtohVwsemfbMO6Iy0Xw3.jpg' },
  { title: 'Bhool Chuk Maaf',   genre: 'Comedy',   year: 2025, rating: 6.8, audio: 'Original Hindi',
    poster: 'https://m.media-amazon.com/images/M/MV5BMjIyMTZiMGEtNmIyYi00MGI1LWFmY2MtYTMyZjBlYzljMDFlXkEyXkFqcGc%40._V1_.jpg' },
  { title: 'War 2',             genre: 'Action',   year: 2025, rating: 6.0, audio: 'Original Hindi',
    poster: 'https://content.tupaki.com/en/feeds/2025/06/27/856537-war.jpg' },
  { title: 'Stree 2',           genre: 'Comedy',   year: 2024, rating: 7.0, audio: 'Original Hindi',
    poster: 'https://akm-img-a-in.tosshub.com/indiatoday/styles/medium_crop_simple/public/2025-01/mv5bmta1nmuxyzitzmvmny00ymqxltk4y2utzjvkmwuwmwq5n2ixxkeyxkfqcgc._v1_.jpg?size=750%3A%2A' },
  { title: 'Bhool Bhulaiyaa 3', genre: 'Comedy',   year: 2024, rating: 6.0, audio: 'Original Hindi',
    poster: 'https://img.republicworld.com/all_images/GavjMs9aAAI6BBL-1729870042701.webp' },
  { title: 'Laapataa Ladies',   genre: 'Comedy',   year: 2024, rating: 8.3, audio: 'Original Hindi',
    poster: 'https://cdn.teater.co/imgs/laapataa-ladies-2024_600_880.webp' },
  { title: 'Pushpa 2: The Rule',genre: 'Action',   year: 2024, rating: 7.5, audio: 'Hindi dubbed',
    poster: 'https://akm-img-a-in.tosshub.com/indiatoday/styles/medium_crop_simple/public/2024-01/pushpa.jpg?VersionId=R6fsfj.oKrdMD5whabbIenDO7z7pbtbZ&size=750%3A%2A' },
  { title: 'Devara: Part 1',    genre: 'Action',   year: 2024, rating: 6.5, audio: 'Hindi dubbed',
    poster: 'https://m.media-amazon.com/images/M/MV5BZWEwNmYwYTAtMmQxYS00ZTgwLWE0NmUtNGIwZDEyZmYwN2EwXkEyXkFqcGc%40._V1_FMjpg_UX1000_.jpg' },
  { title: 'Lucky Baskhar',     genre: 'Thriller', year: 2024, rating: 8.0, audio: 'Hindi dubbed',
    poster: 'https://image.tmdb.org/t/p/w500/pIUP6Se9datGkIT9NyEPTa1AU9W.jpg' }
];

const page = document.body.dataset.page;

/* ── Landing page ── */
if (page === 'landing') {
  document.getElementById('startForm').onsubmit = function (e) {
    e.preventDefault();
    localStorage.setItem('movieManiaEmail', document.getElementById('startEmail').value.trim().toLowerCase());
    window.location.href = 'login.html';
  };
}

/* ── Login / Create account page ── */
if (page === 'login') {
  const form        = document.getElementById('accountForm');
  const nameField   = document.getElementById('nameField');
  const nameInput   = document.getElementById('name');
  const emailInput  = document.getElementById('email');
  const passInput   = document.getElementById('password');
  const message     = document.getElementById('loginMessage');
  const strengthBar = document.getElementById('strengthBar');
  const strengthFill= document.getElementById('strengthFill');
  const passRules   = document.getElementById('passRules');
  let   creating    = false;

  emailInput.value  = localStorage.getItem('movieManiaEmail') || '';

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
    rules.forEach(r => {
      document.getElementById(r.id).classList.toggle('rule-ok', r.test(pass));
    });
    // strength: 0–5
    const pct = (passed / rules.length) * 100;
    strengthFill.style.width = pct + '%';
    strengthFill.className = 'strength-fill ' + (
      passed <= 1 ? 'weak' :
      passed <= 3 ? 'fair' :
      passed <= 4 ? 'good' : 'strong'
    );
    return passed === rules.length;
  }

  // Show strength meter only while creating
  passInput.oninput = function () {
    if (!creating) return;
    const val = passInput.value;
    if (val.length > 0) {
      strengthBar.classList.remove('hidden');
      passRules.classList.remove('hidden');
    } else {
      strengthBar.classList.add('hidden');
      passRules.classList.add('hidden');
    }
    checkPassword(val);
  };

  // Show/hide password toggle
  document.getElementById('passToggle').onclick = function () {
    const isText = passInput.type === 'text';
    passInput.type = isText ? 'password' : 'text';
    this.textContent = isText ? '👁' : '🙈';
  };

  function setMode(isNew) {
    creating = isNew;
    nameField.classList.toggle('hidden', !creating);
    nameInput.required = creating;
    document.getElementById('formTitle').textContent    = creating ? 'Create account' : 'Sign in';
    document.getElementById('submitAccount').textContent = creating ? 'Create account' : 'Sign in';
    document.getElementById('switchPrompt').textContent  = creating ? 'Already registered?' : 'New here?';
    document.getElementById('switchForm').textContent    = creating ? 'Sign in' : 'Create account';
    message.textContent = '';
    // hide strength meter when switching back to sign-in
    if (!creating) {
      strengthBar.classList.add('hidden');
      passRules.classList.add('hidden');
      passInput.value = '';
    }
  }

  document.getElementById('switchForm').onclick = () => setMode(!creating);

  form.onsubmit = function (e) {
    e.preventDefault();
    const email = emailInput.value.trim().toLowerCase();
    const pass  = passInput.value;
    const users = JSON.parse(localStorage.getItem('movieManiaUsers') || '[]');

    if (creating) {
      if (users.some(u => u.email === email)) {
        message.textContent = 'That email is already registered. Please sign in.';
        return;
      }
      if (!checkPassword(pass)) {
        message.textContent = 'Password does not meet the requirements above.';
        return;
      }
      users.push({ name: nameInput.value.trim(), email, password: pass });
      localStorage.setItem('movieManiaUsers', JSON.stringify(users));
      passInput.value = '';
      emailInput.value = email;
      setMode(false);
      message.textContent = 'Account created. Sign in to continue.';
      return;
    }

    const user = users.find(u => u.email === email && u.password === pass);
    if (!user) {
      message.textContent = 'Email or password is incorrect. Create an account if you are new.';
      return;
    }

    localStorage.setItem('movieManiaEmail',    user.email);
    localStorage.setItem('movieManiaName',     user.name);
    localStorage.setItem('movieManiaSignedIn', 'yes');
    window.location.href = 'movies.html';
  };
}

/* ── Movies / Recommendation page ── */
if (page === 'movies') {
  if (localStorage.getItem('movieManiaSignedIn') !== 'yes') {
    window.location.href = 'login.html';
  }

  document.getElementById('userEmail').textContent = localStorage.getItem('movieManiaEmail') || '';

  // ── Chip group helper ──
  function initChips(groupId, hiddenId) {
    const group  = document.getElementById(groupId);
    const hidden = document.getElementById(hiddenId);
    group.addEventListener('click', function (e) {
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
    const article  = document.createElement('article');
    article.className = 'movie-card';

    const poster   = document.createElement('div');
    poster.className = 'poster';

    const fallback = document.createElement('span');
    fallback.className = 'poster-fallback';
    fallback.innerHTML = `${m.title}<small>Poster unavailable</small>`;

    const img = document.createElement('img');
    img.src   = m.poster;
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

  // ── Form submit → show results ──
  const recForm        = document.getElementById('recForm');
  const recBanner      = document.querySelector('.rec-banner');
  const recWrap        = document.querySelector('.rec-wrap');
  const resultsSection = document.getElementById('resultsSection');
  const movieList      = document.getElementById('movieList');
  const message        = document.getElementById('message');
  const resultsTitle   = document.getElementById('resultsTitle');

  recForm.onsubmit = function (e) {
    e.preventDefault();

    const genre     = document.getElementById('genre').value;
    const era       = document.getElementById('era').value;
    const minRating = parseFloat(slider.value);
    const word      = document.getElementById('recSearch').value.trim().toLowerCase();

    let results = movies.filter(m =>
      (!genre      || m.genre === genre) &&
      (!era        || m.year  === parseInt(era)) &&
      m.rating    >= minRating &&
      (!word       || m.title.toLowerCase().includes(word))
    );

    results.sort((a, b) => b.rating - a.rating);

    const parts = [];
    if (genre) parts.push(genre);
    if (era)   parts.push(era);
    resultsTitle.textContent = parts.length
      ? `Best ${parts.join(' · ')} picks`
      : 'Top picks for you';

    movieList.replaceChildren(...results.map(movieCard));
    if (!results.length) movieList.innerHTML = '<p class="note">No movies match your filters. Try loosening them.</p>';

    message.textContent = results.length
      ? `${results.length} recommendation${results.length > 1 ? 's' : ''} · sorted by rating`
      : '';

    recBanner.classList.add('hidden');
    recWrap.classList.add('hidden');
    resultsSection.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Reset → show form again ──
  document.getElementById('resetBtn').onclick = function () {
    resultsSection.classList.add('hidden');
    recBanner.classList.remove('hidden');
    recWrap.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Logout ──
  document.getElementById('logout').onclick = function () {
    localStorage.removeItem('movieManiaSignedIn');
    localStorage.removeItem('movieManiaName');
    window.location.href = 'index.html';
  };

  // ── Smart Card Swiper ──
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

    // Re-trigger card animation
    swiperCard.style.animation = 'none';
    swiperCard.offsetHeight;
    swiperCard.style.animation = '';

    swiperTitle.textContent   = m.title;
    swiperMeta.textContent    = `${m.year} · ${m.audio}`;
    swiperRating.textContent  = `⭐ ${m.rating}/10`;
    swiperGenre.textContent   = m.genre;
    swiperProgress.textContent = `${index + 1} of ${deck.length}`;

    // Reset poster
    swiperPoster.classList.remove('no-poster');
    swiperFallback.innerHTML  = `${m.title}<small style="display:block;margin-top:8px;font-size:13px;font-weight:normal;color:rgba(255,255,255,0.55)">Poster unavailable</small>`;
    swiperImg.src  = m.poster;
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
      // Show summary
      swiperDeck.classList.add('hidden');
      summaryList.replaceChildren(...liked.map(movieCard));
      if (!liked.length) {
        summaryNote.textContent = 'You skipped everything. Try again with fresh eyes!';
        summaryList.innerHTML   = '';
      } else {
        summaryNote.textContent = `You liked ${liked.length} movie${liked.length > 1 ? 's' : ''}.`;
      }
      swiperSummary.classList.remove('hidden');
    }
  }

  document.getElementById('startSwiper').onclick = function () {
    deck   = [...movies].sort(() => Math.random() - 0.5); // shuffle
    cursor = 0;
    liked  = [];
    swiperIntro.classList.add('hidden');
    swiperSummary.classList.add('hidden');
    swiperDeck.classList.remove('hidden');
    loadCard(0);
  };

  document.getElementById('likeBtn').onclick = () => advance(true);
  document.getElementById('skipBtn').onclick  = () => advance(false);

  document.getElementById('restartSwiper').onclick = function () {
    swiperSummary.classList.add('hidden');
    swiperIntro.classList.remove('hidden');
  };
}
