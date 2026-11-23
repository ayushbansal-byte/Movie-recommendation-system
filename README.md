# Movie Mania — BEE Project

A full-stack movie recommendation app built for the **Backend Engineering Essentials** course. It pairs an HTML, CSS, and JavaScript frontend with a Node.js and Express API.

## Syllabus coverage

| Topic | Where it appears |
|---|---|
| Node.js setup, REPL, and global objects | `server.js` |
| CommonJS modules, `require`, and `exports` | Files in `src/` |
| File system and paths | `src/routes/upload.js` |
| HTTP module and server creation | `server.js` |
| Event loop and EventEmitter | `server.js` (`process.on('SIGTERM')`) |
| NPM, `package.json`, scripts, and dependencies | `package.json` |
| Express setup | `src/app.js` |
| Middleware | `src/app.js` and `src/middleware/` |
| Routing, route parameters, and query parameters | `src/routes/movies.js` |
| Body parsing | `src/app.js` (`express.json` and `urlencoded`) |
| REST API design and CRUD endpoints | `src/routes/movies.js` |
| HTTP status codes | API routes |
| Error-handling middleware | `src/middleware/errorHandler.js` |
| Custom middleware | `src/middleware/requestLogger.js` |
| Validation and sanitization | `src/middleware/validate.js` and route validators |
| JWT authentication | `src/utils/jwt.js` |
| Password hashing | `src/routes/auth.js` (`bcryptjs`) |
| Protected routes | `src/middleware/authenticate.js` |
| Role-based access control | `src/middleware/authorize.js` |
| File uploads with Multer | `src/routes/upload.js` |
| Logging and debugging | `src/utils/logger.js` and Morgan in `src/app.js` |
| ESLint | `.eslintrc.json` |
| Fetch API, async/await, Promises, and JSON | Frontend `script.js` |

## Project structure
BEE(Project)/
├── index.html          # Landing page
├── login.html          # Sign in and registration
├── movies.html         # Movie recommendations and Swiper
├── script.js           # Frontend JavaScript; calls the Express API
├── style.css           # Frontend styles
├── server.js           # Node.js and Express server startup
├── package.json
├── .eslintrc.json
├── uploads/            # Poster uploads; created at runtime
└── src/
    ├── app.js           # Express app configuration
    ├── data/
    │   ├── movies.js    # In-memory movie store
    │   └── users.js     # In-memory user store
    ├── middleware/
    │   ├── authenticate.js  # JWT authentication
    │   ├── authorize.js     # Role-based access control
    │   ├── errorHandler.js  # Global error handler
    │   ├── notFound.js      # 404 handler
    │   ├── requestLogger.js # Request logging
    │   └── validate.js      # express-validator runner
    ├── routes/
    │   ├── auth.js      # Registration, login, and current-user routes
    │   ├── movies.js    # Movie CRUD routes
    │   ├── users.js     # User routes
    │   └── upload.js   # Movie poster upload route
    └── utils/
        ├── jwt.js       # Token signing and verification
        └── logger.js    # Colored console logger
