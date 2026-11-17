/**
 * users.js  –  In-memory user store
 *
 * Replaces a database for this demo project.
 * Covers: Modules (CommonJS require/export), data layer abstraction.
 *
 * Shape of a user object:
 *  { id, name, email, passwordHash, role, createdAt }
 */

'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {Array<{id:string, name:string, email:string, passwordHash:string, role:string, createdAt:string}>} */
const users = [];

function findByEmail(email) {
  return users.find(u => u.email === email.toLowerCase()) || null;
}

function findById(id) {
  return users.find(u => u.id === id) || null;
}

function create({ name, email, passwordHash, role = 'user' }) {
  const user = {
    id: uuidv4(),
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  return user;
}

function all() {
  return users.map(safeUser);
}

/** Strip passwordHash before returning to callers */
function safeUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

module.exports = { findByEmail, findById, create, all, safeUser };
