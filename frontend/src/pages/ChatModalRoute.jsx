import { useSearchParams } from 'react-router-dom';
import ChatModal from '../components/common/ChatModal';

const ChatModalRoute = () => {
  const [params] = useSearchParams();
  const roomId = params.get('roomId');

  if (!roomId) return <div>roomId 없음</div>;

  return <ChatModal roomId={roomId} onClose={() => window.close()} />;
};

export default ChatModalRoute;
