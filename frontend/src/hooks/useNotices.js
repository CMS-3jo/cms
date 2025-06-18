// src/hooks/useNotices.js
import { useState, useCallback } from 'react';
import { noticeApi } from '../services/api';

export const useNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

 

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
      
      await noticeApi.createNotice(noticeData);
      await fetchNotices();
      
      setNotices(prev => [newNotice, ...prev]);
      
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
      await noticeApi.updateNotice(id, noticeData);
      setNotices((prev) =>
        prev.map((n) => (n.noticeId === id || n.id === Number(id) ? { ...n, ...noticeData } : n))
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