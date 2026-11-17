# Movie Mania — BEE Project

A full-stack movie recommendation app built for the **Backend Engineering Essentials** course.

---

## Syllabus coverage map

| Syllabus topic | Where it lives |
|---|---|
| Node.js Setup · REPL · Global Objects | `server.js` (http.createServer) |
| CommonJS Modules / require / exports | Every `src/` file |
| File System, Path | `src/routes/upload.js` (fs.mkdirSync, path) |
| HTTP Module · Creating Server | `server.js` |
| Event Loop · EventEmitter | `server.js` (process.on SIGTERM) |
| NPM · package.json · scripts · dependencies | `package.json` |
| Express Setup | `src/app.js` |
| Middleware | `src/app.js`, `src/middleware/` |
| Routing · Route Params · Query Params | `src/routes/movies.js` |
| Body Parsing | `src/app.js` (express.json / urlencoded) |
| REST API Design · CRUD Endpoints | `src/routes/movies.js` |
| Status Codes | All routes |
| Error Handling Middleware | `src/middleware/errorHandler.js` |
| Custom Middleware | `src/middleware/requestLogger.js` |
| Validation · Sanitization · Validation Libraries | `src/middleware/validate.js` + express-validator chains in routes |
| JWT | `src/utils/jwt.js` |
| Password Hashing | `src/routes/auth.js` (bcryptjs) |
| Auth Middleware · Protected Routes | `src/middleware/authenticate.js` |
| Role-Based Access | `src/middleware/authorize.js` |
| File Upload · Multer · Cloud Storage intro | `src/routes/upload.js` |
| Logging · Debugging Node apps | `src/utils/logger.js`, Morgan in `src/app.js` |
| ESLint | `.eslintrc.json` |
| Fetch API · async/await · Promises · JSON | `script.js` (frontend) |

---

## Project structure

```
BEE(Project)/
├── index.html          ← Landing page
├── login.html          ← Sign in / Register
├── movies.html         ← Recommendations + Swiper
├── script.js           ← Frontend JS (Fetch API → Express)
├── style.css           ← All styles
├── server.js           ← Node HTTP + Express boot
├── package.json
├── .eslintrc.json
├── uploads/            ← Poster uploads (created at runtime)
└── src/
    ├── app.js          ← Express app factory
    ├── data/
    │   ├── movies.js   ← In-memory movies store (CRUD)
    │   └── users.js    ← In-memory users store
    ├── middleware/
    │   ├── authenticate.js   ← JWT auth guard
    │   ├── authorize.js      ← Role-based access
    │   ├── errorHandler.js   ← Global error handler
    │   ├── notFound.js       ← 404 handler
    │   ├── requestLogger.js  ← Custom logger middleware
    │   └── validate.js       ← express-validator runner
    ├── routes/
    │   ├── auth.js     ← POST /api/auth/register|login, GET /api/auth/me
    │   ├── movies.js   ← GET|POST|PUT|PATCH|DELETE /api/movies
    │   ├── users.js    ← GET /api/users (admin), GET /api/users/:id
    │   └── upload.js   ← POST /api/upload/poster (Multer)
    └── utils/
        ├── jwt.js      ← signToken / verifyToken
        └── logger.js   ← Colour console logger
```

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Start the server  (dev mode with auto-restart)
npm run dev

# 3. Open in browser
#    http://localhost:3000
```

The Express server **also serves the HTML/CSS/JS frontend**, so you only need one terminal.

---

## API reference

### Auth
| Method | URL | Body / Notes |
|--------|-----|---|
| POST | `/api/auth/register` | `{ name, email, password }` → returns JWT |
| POST | `/api/auth/login`    | `{ email, password }` → returns JWT |
| GET  | `/api/auth/me`       | Bearer token required |

### Movies
| Method | URL | Auth |
|--------|-----|------|
| GET    | `/api/movies?genre=&year=&minRating=&search=` | public |
| GET    | `/api/movies/:id` | public |
| POST   | `/api/movies` | admin JWT |
| PUT    | `/api/movies/:id` | admin JWT |
| PATCH  | `/api/movies/:id` | admin JWT |
| DELETE | `/api/movies/:id` | admin JWT |

### Upload
| Method | URL | Notes |
|--------|-----|-------|
| POST | `/api/upload/poster` | multipart/form-data, field `poster`, admin JWT |

### Health
```
GET /api/health  →  { status: "ok", timestamp: "..." }
```

---

## Testing with Postman / Insomnia

1. Register: `POST /api/auth/register` → copy the `token`
2. Set header `Authorization: Bearer <token>`
3. Try `GET /api/movies?genre=Action&minRating=7`
4. Admin routes: register with `"role": "admin"` to test POST/DELETE

---

## Notes

- Data is **in-memory** — it resets on server restart.  
  For persistence, swap `src/data/*.js` with Mongoose/Sequelize models.
- `JWT_SECRET` and `JWT_EXPIRES_IN` can be overridden via environment variables (`.env`).
