// src/hooks/useNotices.js
import { useState, useCallback } from 'react';
import { noticeApi } from '../services/api';
import { useAuth } from './useAuth';
export const useNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
 

  const fetchNotices = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const items = await noticeApi.getNotices(params);
      setNotices(Array.isArray(items) ? items : []);
    } catch (err) {
      setError(err);
      console.error('Fetch notices error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createNotice = useCallback(async (noticeData) => {
    try {
      setLoading(true);
           const payload = {
        title: noticeData.title,
        content: noticeData.content,
        regUserId: noticeData.regUserId || user?.userId,
      };

      if (noticeData.files && noticeData.files.length > 0) {
        const formData = new FormData();
        formData.append('notice', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
        noticeData.files.forEach((f) => formData.append('files', f));
        await noticeApi.createNoticeWithFiles(formData);
      } else {
        await noticeApi.createNotice(payload);
      }
      await fetchNotices();
      
      return { success: true };
    } catch (err) {
      setError(err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchNotices]);

  const getNoticeById = useCallback(
    async (id) => {
      const existing = notices.find((n) => n.noticeId === id || n.id === Number(id));
      if (existing) return existing;
      try {
        setLoading(true);
        const data = await noticeApi.getNoticeDetail(id);
        return data;
      } catch (err) {
        setError(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [notices]
  );

  const updateNotice = useCallback(async (id, noticeData) => {
    try {
      setLoading(true);
     
      const payload = {
        title: noticeData.title,
        content: noticeData.content,
        regUserId: noticeData.regUserId || user?.userId,
      };

      if (noticeData.files && noticeData.files.length > 0) {
        const formData = new FormData();
        formData.append('notice', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
        noticeData.files.forEach((f) => formData.append('files', f));
        await noticeApi.updateNoticeWithFiles(id, formData);
      } else {
        await noticeApi.updateNotice(id, payload);
      }

      setNotices((prev) =>
        prev.map((n) =>
          n.noticeId === id || n.id === Number(id) ? { ...n, ...payload } : n
        )
      );
      return { success: true };
    } catch (err) {
      setError(err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    notices,
    loading,
    error,
    fetchNotices,
    createNotice,
    updateNotice,
    getNoticeById
  };
};
