/**
 * Spinner.jsx  –  Loading state indicator
 * Covers (Unit 7): Loading States
 */

import React from 'react';

export default function Spinner({ text = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 border-4 border-zinc-700 border-t-brand rounded-full animate-spin" />
      <p className="text-zinc-500 text-sm">{text}</p>
    </div>
  );
}
