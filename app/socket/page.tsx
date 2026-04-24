// app/page.tsx (Lobby)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/app/socket_context';

export default function LobbyPage() {
  const [roomName, setRoomName] = useState('');
  const router = useRouter();
  const { isConnected, socketId } = useSocket();

  const handleJoin = () => {
    if (!roomName) return alert('방 번호를 입력하세요!');
    // 방 페이지로 이동 (실제 join-room 이벤트는 방 페이지에서 보낼 겁니다)
    router.push(`/socket/${roomName}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>🎮 WebRTC 로비</h1>
      <p>상태: {isConnected ? '✅ 연결됨' : '❌ 연결 안 됨'}</p>
      <p>내 ID: {socketId}</p>

      <input 
        type="text" 
        placeholder="방 번호를 입력하세요" 
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        style={{ padding: '10px', marginRight: '10px' }}
      />
      <button onClick={handleJoin} style={{ padding: '10px 20px' }}>입장하기</button>
    </div>
  );
}