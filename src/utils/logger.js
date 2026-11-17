/**
 * logger.js  –  lightweight console logger
 *
 * Covers: Logging / Debugging Node apps (syllabus)
 * A thin wrapper so we can swap to Winston/Pino without touching other files.
 */

'use strict';

const levels = { info: '\x1b[36m[INFO]\x1b[0m', warn: '\x1b[33m[WARN]\x1b[0m', error: '\x1b[31m[ERROR]\x1b[0m' };

function log(level, msg, meta) {
  const prefix = levels[level] || '[LOG]';
  const ts = new Date().toISOString();
  if (meta) {
    console.log(`${ts} ${prefix} ${msg}`, meta);
  } else {
    console.log(`${ts} ${prefix} ${msg}`);
  }
}

module.exports = {
  info:  (msg, meta) => log('info',  msg, meta),
  warn:  (msg, meta) => log('warn',  msg, meta),
  error: (msg, meta) => log('error', msg, meta),
};
