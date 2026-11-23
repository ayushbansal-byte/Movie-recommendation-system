/**
 * hooks/useUpload.js  –  Custom hook for file uploads with progress
 *
 * Covers (Unit 7): File Upload Full Stack · Progress Bars
 */

import { useState } from 'react';
import axios from 'axios';

export function useUpload() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function upload(file) {
    setUploading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('poster', file);

    try {
      const token = localStorage.getItem('mm_token');
      const { data } = await axios.post('/api/upload/poster', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: e => {
          setProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      return data.url;
    } catch (err) {
      const msg = err.response?.data?.error || 'Upload failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setUploading(false);
    }
  }

  return { upload, uploading, progress, error };
}
