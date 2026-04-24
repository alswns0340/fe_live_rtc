// app/room/[roomId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSocket } from '@/app/socket_context';

export default function RoomPage() {
  const { roomId } = useParams();
  const { socketRef, isConnected, socketId } = useSocket();
  const [messages, setMessages] = useState<{senderId: string, message: string}[]>([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (!isConnected || !socketRef.current) return;

    const socket = socketRef.current;

    // 1. 방 입장 이벤트 보내기
    socket.emit('join-room', roomId);

    // 2. 메시지 리스너 등록
    const handleMessage = (data: {senderId: string, message: string}) => {
      setMessages((prev) => [...prev, data]);
    };
    socket.on('message', handleMessage);

    // 3. 나갈 때 리스너 제거 (소켓 자체는 유지됨!)
    return () => {
      socket.off('message', handleMessage);
      // 필요하다면 서버에 'leave-room'을 만들어서 보낼 수도 있습니다.
    };
  }, [isConnected, socketRef, roomId]);

const sendMessage = () => {
    if (socketRef.current && inputText && socketId) { // socketId가 있는지 확인
      
      // ✨ 1. 서버로 보낼 때 내 ID(senderId)도 같이 묶어서 보냅니다!
      socketRef.current.emit('message', { 
        roomId: roomId, 
        message: inputText,
        senderId: socketId // <-- 이 부분을 추가해 주세요!
      });
      
      // 2. 내 화면에 띄우기
      setMessages((prev) => [...prev, { senderId: socketId, message: inputText }]);

      // 3. 입력창 비우기
      setInputText('');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>🏠 방 번호: {roomId}</h2>
      <div style={{ border: '1px solid #ccc', height: '300px', overflowY: 'scroll', marginBottom: '10px', padding: '10px' }}>
        {messages.map((m, i) => (
          <div key={i}>
            <strong>{m.senderId}:</strong> {m.message}
          </div>
        ))}
      </div>
      <input 
        value={inputText} 
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={sendMessage}>전송</button>
    </div>
  );
}