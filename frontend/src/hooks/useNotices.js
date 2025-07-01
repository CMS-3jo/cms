// src/hooks/useNotices.js
import { useState, useCallback } from 'react';
import { noticeApi } from '../services/api';
import { useAuth } from './useAuth';
export const useNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
 const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 1,
    currentPage: 0,
    size: 10,
    hasNext: false,
    hasPrevious: false,
    isFirst: true,
    isLast: true,
  });

  const fetchNotices = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const data = await noticeApi.getNotices(params);
      if (Array.isArray(data)) {
        setNotices(data);
        setPagination((prev) => ({
          ...prev,
          totalElements: data.length,
          totalPages: 1,
          currentPage: 0,
          size: data.length,
          hasNext: false,
          hasPrevious: false,
          isFirst: true,
          isLast: true,
        }));
      } else {
        setNotices(Array.isArray(data.notices) ? data.notices : []);
        setPagination((prev) => ({
          ...prev,
          totalElements: data.totalElements,
          totalPages: data.totalPages,
          currentPage: data.currentPage,
          size: data.size,
          hasNext: data.hasNext,
          hasPrevious: data.hasPrevious,
          isFirst: data.isFirst,
          isLast: data.isLast,
        }));
      }
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
const deleteNotice = useCallback(async (id) => {
    try {
      setLoading(true);
      await noticeApi.deleteNotice(id);
      setNotices((prev) => prev.filter((n) => n.noticeId !== id && n.id !== Number(id)));
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
     deleteNotice, 
     pagination,
    getNoticeById
  };
};
