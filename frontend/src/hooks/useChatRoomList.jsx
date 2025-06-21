import { useEffect, useState } from 'react';
import { chatApi } from '../services/api';

export default function useChatRoomList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    try {
      const res = await chatApi.getAllRooms();
      setRooms(res.data);
    } catch (err) {
      console.error('채팅방 리스트 불러오기 실패', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return { rooms, loading, refresh: fetchRooms };
}
