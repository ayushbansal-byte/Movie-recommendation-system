/**
 * ErrorMessage.jsx
 * Covers (Unit 7): Error States · Error Messages
 */

import React from 'react';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <span className="text-4xl">⚠️</span>
      <p className="text-red-400 font-semibold">{message || 'Something went wrong'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 border border-zinc-600 hover:border-zinc-400 text-zinc-300 px-4 py-1.5 rounded text-sm transition"
        >
          Try again
        </button>
      )}
    </div>
  );
}
