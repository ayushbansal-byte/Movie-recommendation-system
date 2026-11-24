# Movie Mania — Viva Preparation Guide

Every answer below is linked to actual code in this project.
When the examiner asks "show me", you know exactly which file to open.

---

# SECTION 1 — FRONTEND DEVELOPMENT BASICS

---

## 1. What is the Fetch API? How have you used it?

The Fetch API is a browser built-in for making HTTP requests. It returns a Promise.

**In this project — `script.js`:**
```js
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
```
Every movie load, login, and register call goes through this wrapper.

---

## 2. What is async/await? Why use it over .then()?

`async/await` is syntactic sugar over Promises. It makes asynchronous code read like synchronous code.

**In this project — `script.js`:**
```js
recForm.onsubmit = async function (e) {
  e.preventDefault();
  const data = await apiFetch(`/movies?${params}`);  // waits here
  movieList.replaceChildren(...data.movies.map(movieCard));
};
```
Without async/await you'd need `.then().catch()` chains, which are harder to read.

---

## 3. What is JSON? Where is it used?

JSON (JavaScript Object Notation) is a text format for exchanging data between client and server.

**In this project:**
- `JSON.stringify({ email, password })` — converts JS object → string for the request body
- `res.json()` — parses the server's JSON response → JS object
- `localStorage.setItem('movieManiaUser', JSON.stringify(user))` — stores user object as string

---

## 4. What are ES6 features? Name the ones used in this project.

| Feature | Example in project |
|---|---|
| `const` / `let` | Throughout `script.js` |
| Arrow functions | `movies.map(m => movieCard(m))` |
| Template literals | `` `${API}${path}` `` |
| Destructuring | `const { genre, year } = req.query` |
| Spread operator | `{ ...options, headers }` |
| Default parameters | `function apiFetch(path, options = {})` |
| `async/await` | Every API call |

---

## 5. What is a reusable UI component?

A piece of UI you write once and use many times with different data.

**In this project — `script.js`:**
```js
function movieCard(m) {
  const article = document.createElement('article');
  // ... builds card from movie data
  return article;
}
// Used in results AND swiper summary:
movieList.replaceChildren(...results.map(movieCard));
summaryList.replaceChildren(...liked.map(movieCard));
```

**In React — `client/src/components/MovieCard.jsx`:**
```jsx
<MovieCard key={m._id} movie={m} />  // used in grid and swiper summary
```

---

# SECTION 2 — NODE.JS PROJECT AND DEBUGGING

---

## 6. What is Node.js?

Node.js is a JavaScript runtime built on Chrome's V8 engine. It lets you run JavaScript on the server side, outside the browser.

**In this project:** The entire backend (`server.js`, `src/`) runs on Node.js.

---

## 7. What is ESLint? Why is it used?

ESLint is a static code analysis tool that finds and flags programming errors, style issues, and bad practices without running the code.

**In this project — `.eslintrc.json`:**
```json
{
  "rules": {
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "semi": ["error", "always"],
    "quotes": ["warn", "single"]
  }
}
```
Run with: `npm run lint`

---

## 8. What is logging? How is it implemented?

Logging records what happens inside the application at runtime — useful for debugging and monitoring.

**In this project — `src/utils/logger.js`:**
```js
// Custom logger with timestamps and colour-coded levels
logger.info('MongoDB connected: localhost');
logger.warn('MONGO_URI not set – using in-memory store');
logger.error('UNHANDLED ERROR:', err);
```
Also uses **Morgan** for HTTP request logging:
```js
app.use(morgan('dev'));  // logs: GET /api/movies 200 12ms
```

---

## 9. What is nodemon?

nodemon automatically restarts the Node server when you save a file — you don't have to manually stop and restart during development.

**In this project — `package.json`:**
```json
"dev": "nodemon server.js"
```

---

# SECTION 3 — EXPRESS.JS AND REST APIS

---

## 10. What is Express.js?

Express is a minimal Node.js web framework for building APIs and web servers. It handles routing, middleware, and HTTP.

**In this project — `src/app.js`:**
```js
const app = express();
app.use(express.json());
app.use('/api/movies', movieRoutes);
```

---

## 11. What is Middleware? How does it work?

Middleware is a function that runs between the request arriving and the response being sent. It has access to `req`, `res`, and `next`.

**In this project:**
```js
// Global middleware (runs on every request)
app.use(morgan('dev'));           // logging
app.use(express.json());         // body parsing
app.use(requestLogger);          // custom logger

// Route-level middleware
router.post('/', authenticate, authorize('admin'), handler);
//                ↑ checks JWT    ↑ checks role
```

The chain: Request → morgan → json parser → requestLogger → route handler → error handler → Response

---

## 12. What is REST API design?

REST uses HTTP verbs to perform operations on resources:

| Verb | Endpoint | Action |
|---|---|---|
| GET | `/api/movies` | List movies |
| GET | `/api/movies/:id` | Get one movie |
| POST | `/api/movies` | Create movie |
| PUT | `/api/movies/:id` | Full replace |
| PATCH | `/api/movies/:id` | Partial update |
| DELETE | `/api/movies/:id` | Delete movie |

**In this project — `src/routes/movies.js`:** All 6 operations are implemented.

---

## 13. What are Route Params and Query Params?

**Route params** are part of the URL path, used to identify a specific resource:
```js
router.get('/:id', async (req, res) => {
  const movie = await Movie.findById(req.params.id);  // req.params.id
});
// GET /api/movies/abc123  →  req.params.id = "abc123"
```

**Query params** are appended after `?`, used for filtering/sorting:
```js
// GET /api/movies?genre=Action&minRating=7&page=2
const { genre, minRating, page } = req.query;
```

---

## 14. What is Body Parsing?

The request body contains data sent by the client (e.g. form data, JSON). Body parsing extracts it into `req.body`.

**In this project — `src/app.js`:**
```js
app.use(express.json());                      // parses JSON bodies
app.use(express.urlencoded({ extended: true })); // parses form data
// Now req.body.email, req.body.password are available
```

---

## 15. What are HTTP Status Codes?

| Code | Meaning | Used in project |
|---|---|---|
| 200 | OK | Successful GET |
| 201 | Created | New user/movie |
| 400 | Bad Request | Invalid ObjectId |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Wrong role |
| 404 | Not Found | Movie not found |
| 409 | Conflict | Email already exists |
| 422 | Unprocessable Entity | Validation failed |
| 500 | Server Error | Unexpected crashes |

---

## 16. What is JWT? How does authentication work?

JWT (JSON Web Token) is a compact, self-contained token for transmitting user identity.

**Flow in this project:**
1. User logs in → `POST /api/auth/login`
2. Server verifies password, creates token: `jwt.sign({ id, email, role }, SECRET)`
3. Token sent to client, stored in `localStorage`
4. Client sends token in every request: `Authorization: Bearer <token>`
5. `authenticate.js` middleware verifies token: `jwt.verify(token, SECRET)`
6. Decoded payload attached to `req.user`

**Files:** `src/utils/jwt.js`, `src/middleware/authenticate.js`, `src/routes/auth.js`

---

## 17. What is Password Hashing?

Passwords must never be stored as plain text. Hashing converts the password into a one-way scrambled string.

**In this project — `src/models/User.js`:**
```js
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);  // 12 = salt rounds
  next();
});
// Comparison:
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};
```

---

## 18. What is Role-Based Access Control?

Different users have different permissions based on their role.

**In this project — `src/middleware/authorize.js`:**
```js
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
// Usage:
router.post('/', authenticate, authorize('admin'), handler);
// Only admins can create/update/delete movies
```

---

## 19. What is Validation and Sanitization?

**Validation** checks that input meets rules (e.g. valid email, password length).  
**Sanitization** cleans input (e.g. trim spaces, normalise email case).

**In this project — `src/routes/auth.js`:**
```js
body('email').isEmail().normalizeEmail()   // validate + sanitize
body('password').isLength({ min: 8 })       // validate
body('name').trim().notEmpty()              // sanitize + validate
```
**`src/middleware/validate.js`** collects all errors and returns 422 if any fail.

---

## 20. What is File Upload with Multer?

Multer is a Node.js middleware for handling `multipart/form-data` (file uploads).

**In this project — `src/routes/upload.js`:**
```js
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/poster', authenticate, authorize('admin'), upload.single('poster'), handler);
```
Files are saved to `/uploads/`. In production you'd swap disk storage for Cloudinary/S3 — the route stays identical.

---

## 21. What is Error Handling Middleware?

A special Express middleware with 4 arguments `(err, req, res, next)` that catches all errors passed via `next(err)`.

**In this project — `src/middleware/errorHandler.js`:**
```js
function errorHandler(err, req, res, next) {
  if (err.name === 'CastError')      error = new AppError('Invalid ID', 400);
  if (err.code === 11000)            error = new AppError('Duplicate value', 409);
  if (err.name === 'ValidationError') error = new AppError(messages, 422);
  if (err.name === 'JsonWebTokenError') error = new AppError('Invalid token', 401);
  res.status(error.status).json({ error: error.message });
}
app.use(errorHandler);  // must be last in app.js
```

---

# SECTION 4 — MONGODB AND MONGOOSE

---

## 22. What is MongoDB? How is it different from SQL?

MongoDB is a NoSQL document database. Data is stored as JSON-like documents (BSON) in collections instead of tables and rows.

| SQL | MongoDB |
|---|---|
| Table | Collection |
| Row | Document |
| Column | Field |
| JOIN | `populate()` |
| Schema fixed | Schema flexible |

**In this project:** Movies and Users are stored as documents in the `movies` and `users` collections.

---

## 23. What is MongoDB Atlas?

Atlas is MongoDB's cloud-hosted database service. Free M0 tier available.

**In this project — `src/config/db.js`:**
```js
await mongoose.connect(process.env.MONGO_URI);
// MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/moviemania
```
When `MONGO_URI` is not set, the app falls back to in-memory arrays.

---

## 24. What is Mongoose? What is a Schema?

Mongoose is an ODM (Object Data Mapper) for MongoDB. A Schema defines the structure, types, and rules for a document.

**In this project — `src/models/Movie.js`:**
```js
const movieSchema = new mongoose.Schema({
  title:  { type: String, required: true, maxlength: 200 },
  genre:  { type: String, enum: ['Action','Comedy','Romance','Thriller','Drama'] },
  year:   { type: Number, min: 1900, max: 2100 },
  rating: { type: Number, min: 0, max: 10 },
  reviews: [reviewSchema],  // embedded sub-document array
});
```

---

## 25. What is Referencing vs Embedding?

**Embedding** — store related data inside the same document (better for data that is always read together).  
**Referencing** — store just the ObjectId and use `populate()` to fetch (better for large or shared data).

**In this project — `src/models/Movie.js`:**
```js
// EMBEDDING – reviews live inside the movie document
reviews: [reviewSchema]

// REFERENCING – addedBy stores just the User's ObjectId
addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
```

---

## 26. What is Populate?

`populate()` replaces an ObjectId reference with the actual document data from the referenced collection.

**In this project — `src/routes/movies.js`:**
```js
const movie = await Movie.findById(id)
  .populate('addedBy', 'name email')    // replaces ObjectId with { name, email }
  .populate('reviews.user', 'name');    // populates reviewer details
```

---

## 27. What is Aggregation?

Aggregation processes documents through a pipeline of stages to compute results.

**In this project — `src/models/Movie.js`:**
```js
movieSchema.statics.getGenreStats = function () {
  return this.aggregate([
    { $group: { _id: '$genre', count: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
    { $sort: { avgRating: -1 } },
    { $project: { genre: '$_id', count: 1, avgRating: { $round: ['$avgRating', 1] } } },
  ]);
};
```
Accessed at `GET /api/movies/stats`.

---

## 28. What are Indexes? What is a Compound Index?

An index speeds up queries by creating a lookup structure on a field.  
A **compound index** covers multiple fields together.

**In this project — `src/models/Movie.js`:**
```js
movieSchema.index({ title: 'text', description: 'text' }); // full-text search
movieSchema.index({ genre: 1, year: -1 });                 // compound: filter by genre+year
movieSchema.index({ rating: -1 });                         // sort by rating
```

---

## 29. What is Mongoose Middleware?

Mongoose middleware (hooks) run automatically before or after certain operations.

**In this project:**
```js
// pre-save – hash password before saving User
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// pre-findOneAndUpdate – enforce validators on update
movieSchema.pre('findOneAndUpdate', function (next) {
  this.setOptions({ runValidators: true, context: 'query' });
  next();
});

// pre-find – timing hook
movieSchema.pre(/^find/, function (next) {
  this._startTime = Date.now();
  next();
});
```

---

## 30. What are Virtuals and Static Methods?

**Virtual** — a computed property on a document that is not stored in the database.

```js
// src/models/Movie.js
movieSchema.virtual('avgReviewRating').get(function () {
  const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / this.reviews.length) * 10) / 10;
});
// movie.avgReviewRating  ← calculated on the fly, not in DB
```

**Static method** — a method on the Model class itself (not an instance).

```js
movieSchema.statics.getTopRated = function (limit = 5) {
  return this.aggregate([{ $sort: { rating: -1 } }, { $limit: limit }]);
};
// Usage:
const top = await Movie.getTopRated(5);
```

---

## 31. What is .lean() and why does it help performance?

By default, Mongoose converts every MongoDB document into a full Mongoose Document object (hydration). `.lean()` skips this and returns plain JavaScript objects — much faster for read-only endpoints.

**In this project — `src/routes/movies.js`:**
```js
Movie.find(filter)
  .sort(sortObj).skip(skip).limit(limit)
  .populate('addedBy', 'name email')
  .lean()   // ← plain JS objects, no Mongoose overhead
```

---

## 32. What is a Custom Error class?

**In this project — `src/utils/AppError.js`:**
```js
class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.isOperational = true;  // distinguishes from programmer bugs
  }
}
// Usage anywhere:
throw new AppError('Movie not found', 404);
next(new AppError('Email already registered', 409));
```
The global error handler in `errorHandler.js` reads `isOperational` to decide whether to show the message to the client or log it internally.

---

# SECTION 5 — REACT FUNDAMENTALS

---

## 33. What is React? What is JSX?

React is a JavaScript library for building UIs using components.  
JSX is a syntax extension that looks like HTML inside JavaScript — Babel compiles it to `React.createElement()`.

**In this project — `client/src/pages/Landing.jsx`:**
```jsx
return (
  <main className="hero">
    <h1>Unlimited movies,<br />shows, and more</h1>
    <button className="button red" type="submit">Get Started ›</button>
  </main>
);
```

---

## 34. What is a Component? What are Props?

A **component** is a reusable, self-contained piece of UI (a function that returns JSX).  
**Props** are inputs passed to a component from its parent — like function arguments.

**In this project — `client/src/components/MovieCard.jsx`:**
```jsx
// Props: movie object passed from parent
export default function MovieCard({ movie }) {
  return (
    <article className="movie-card">
      <h2>{movie.title}</h2>
      <p>{movie.genre} · {movie.year}</p>
    </article>
  );
}
// Parent passes props:
<MovieCard key={m._id} movie={m} />
```

---

## 35. What is State? What is useState?

State is data that belongs to a component and can change over time. When state changes, React re-renders the component.

**In this project — `client/src/pages/Login.jsx`:**
```jsx
const [email,    setEmail]    = useState('');
const [password, setPassword] = useState('');
const [loading,  setLoading]  = useState(false);
const [error,    setError]    = useState('');
```

---

## 36. What is useEffect?

`useEffect` runs side effects (API calls, subscriptions, timers) after a component renders.

**In this project — `client/src/pages/Login.jsx`:**
```jsx
// Runs once on mount – pre-fill email from landing page
useEffect(() => {
  const saved = localStorage.getItem('movieManiaEmail');
  if (saved) setEmail(saved);
}, []);   // empty array = run once

// Runs whenever password or creating changes
useEffect(() => {
  const passed = RULES.filter(r => r.test(password)).length;
  setPassPct((passed / RULES.length) * 100);
  setStrength(getStrength(password));
}, [password, creating]);
```

---

## 37. What is a Controlled Component?

A form input whose value is controlled by React state (not the DOM).

**In this project — `client/src/pages/Movies.jsx`:**
```jsx
<input
  type="search"
  value={search}                           // controlled value
  onChange={e => setSearch(e.target.value)} // controlled handler
/>
```
React is the single source of truth for the input's value.

---

## 38. What is Conditional Rendering?

Showing or hiding UI based on a condition.

**In this project — `client/src/components/Topbar.jsx`:**
```jsx
{isAuth ? (
  <div className="account">
    <span>{user?.name}</span>
    <button onClick={handleLogout}>Log out</button>
  </div>
) : (
  <Link className="button red" to="/login">Sign in</Link>
)}
```

---

## 39. What are Lists and Keys?

When rendering arrays in React, each item needs a unique `key` prop so React can efficiently update the DOM.

**In this project — `client/src/pages/Movies.jsx`:**
```jsx
{movies.map(m => (
  <MovieCard key={m._id || m.id} movie={m} />  // key must be unique
))}
```
Without keys, React re-renders the entire list on every change.

---

## 40. What is useContext and Context API?

Context lets you share state across the component tree without passing props through every level (avoids prop drilling).

**In this project — `client/src/context/AuthContext.jsx`:**
```jsx
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // state + dispatch
  return <AuthContext.Provider value={{ ...state, login, logout }}>
    {children}
  </AuthContext.Provider>;
}

// Any component can access auth state:
const { isAuth, user, login, logout } = useAuth();
```

---

## 41. What is useReducer?

`useReducer` is an alternative to `useState` for complex state logic with multiple sub-values or transitions.

**In this project — `client/src/context/AuthContext.jsx`:**
```jsx
function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':  return { token: action.payload.token, user: action.payload.user, isAuth: true };
    case 'LOGOUT': return { token: null, user: null, isAuth: false };
    default:       return state;
  }
}
const [state, dispatch] = useReducer(authReducer, initialState);
```

---

## 42. What is a Custom Hook?

A function that starts with `use` and uses other hooks inside it — lets you extract and reuse stateful logic.

**In this project:**

`useAuth()` — `client/src/context/AuthContext.jsx`
```jsx
export function useAuth() {
  return useContext(AuthContext);  // reusable shortcut to auth state
}
```

`useMovies()` — `client/src/hooks/useMovies.js`
```jsx
export function useMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // fetchMovies function...
  return { movies, loading, error, fetchMovies };
}
```

---

## 43. What is React Router?

React Router handles navigation between pages in a Single Page Application — no full page reloads.

**In this project — `client/src/App.jsx`:**
```jsx
<Routes>
  <Route path="/"       element={<Landing />} />
  <Route path="/login"  element={<Login />} />
  <Route path="/movies" element={<ProtectedRoute><Movies /></ProtectedRoute>} />
  <Route path="*"       element={<Navigate to="/" replace />} />
</Routes>
```

**Key hooks used:**
- `useNavigate()` — programmatic navigation: `navigate('/movies')`
- `<Link>` — declarative navigation without page reload

---

## 44. What is a Protected Route?

A route that redirects unauthenticated users to login.

**In this project — `client/src/components/ProtectedRoute.jsx`:**
```jsx
export default function ProtectedRoute({ children }) {
  const { isAuth } = useAuth();
  return isAuth ? children : <Navigate to="/login" replace />;
}
```
Wraps the `/movies` route — if you're not logged in, you're redirected to `/login`.

---

# SECTION 6 — FULL STACK INTEGRATION

---

## 45. How does React connect to Express?

**In this project:** Via a Vite proxy. In `client/vite.config.js`:
```js
proxy: {
  '/api': { target: 'http://localhost:5000', changeOrigin: true }
}
```
React runs on port 3000. Any request to `/api/*` is forwarded to Express on port 5000. This avoids CORS issues in development.

---

## 46. What is CORS?

CORS (Cross-Origin Resource Sharing) is a browser security policy that blocks requests from one origin (domain/port) to another.

**In this project — `src/app.js`:**
```js
app.use(cors({ origin: '*' }));
```
In production, `origin` should be set to the specific frontend domain.

---

## 47. What are Environment Variables?

Variables stored outside the code (in `.env`) to keep secrets and configuration separate from source code.

**In this project — `.env`:**
```
PORT=5000
JWT_SECRET=movie_mania_dev_secret
MONGO_URI=mongodb+srv://...
```
Accessed via `process.env.PORT`, `process.env.JWT_SECRET`.

**In React — `client/src/api/axios.js`:**
```js
baseURL: import.meta.env.VITE_API_URL || '/api'
```

---

## 48. What is Loading State and Error State?

**Loading state** — shows a spinner/message while data is being fetched.  
**Error state** — shows an error message when a request fails.

**In this project — `client/src/hooks/useMovies.js`:**
```js
const [loading, setLoading] = useState(false);
const [error,   setError]   = useState(null);

setLoading(true);
try {
  const { data } = await api.get('/movies');
  setMovies(data.movies);
} catch (err) {
  setError(err.message);     // error state
} finally {
  setLoading(false);         // loading state off
}
```
**In Movies.jsx:**
```jsx
{loading && <p className="loading-state">Loading movies…</p>}
{error   && <p className="error-state">{error}</p>}
```

---

## 49. What is Pagination?

Splitting large data sets into pages so you don't load everything at once.

**In this project — `src/routes/movies.js`:**
```js
const page  = parseInt(req.query.page)  || 1;
const limit = parseInt(req.query.limit) || 10;
const skip  = (page - 1) * limit;
Movie.find(filter).skip(skip).limit(limit)
// Response includes: { page, totalPages, total, movies }
```

---

## 50. What is Axios? How is it different from Fetch?

Axios is an HTTP client library with more features than the native Fetch API.

| Feature | Fetch | Axios |
|---|---|---|
| Automatic JSON parse | Manual (`res.json()`) | Automatic |
| Request interceptors | No | Yes |
| Response interceptors | No | Yes |
| Error on 4xx/5xx | No (must check `res.ok`) | Yes (throws automatically) |

**In this project — `client/src/api/axios.js`:**
```js
const api = axios.create({ baseURL: '/api' });
// Interceptor auto-attaches JWT token
api.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

# QUICK REFERENCE — WHERE IS WHAT

| Topic | File |
|---|---|
| Express setup | `src/app.js` |
| JWT sign/verify | `src/utils/jwt.js` |
| Auth routes | `src/routes/auth.js` |
| Movie CRUD routes | `src/routes/movies.js` |
| File upload | `src/routes/upload.js` |
| Auth middleware | `src/middleware/authenticate.js` |
| Role-based access | `src/middleware/authorize.js` |
| Validation | `src/middleware/validate.js` |
| Error handler | `src/middleware/errorHandler.js` |
| Custom logger | `src/utils/logger.js`, `src/middleware/requestLogger.js` |
| Custom error class | `src/utils/AppError.js` |
| Mongoose Movie model | `src/models/Movie.js` |
| Mongoose User model | `src/models/User.js` |
| DB connection | `src/config/db.js` |
| React entry point | `client/src/main.jsx` |
| Router setup | `client/src/App.jsx` |
| Auth context | `client/src/context/AuthContext.jsx` |
| Axios instance | `client/src/api/axios.js` |
| Custom hook | `client/src/hooks/useMovies.js` |
| Protected route | `client/src/components/ProtectedRoute.jsx` |
| Landing page | `client/src/pages/Landing.jsx` |
| Login page | `client/src/pages/Login.jsx` |
| Movies page | `client/src/pages/Movies.jsx` |
| Vite proxy config | `client/vite.config.js` |

---

*Total topics covered: 50 questions across Frontend, Node.js, Express, MongoDB/Mongoose, React, and Full Stack Integration.*
