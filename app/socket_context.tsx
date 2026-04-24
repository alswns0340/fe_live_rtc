'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socketRef: React.MutableRefObject<Socket | null>;
  isConnected: boolean;
  socketId: string | null; // ✨ 화면에 그릴 ID용 State 추가!
}

const SocketContext = createContext<SocketContextType>({
  socketRef: { current: null },
  isConnected: false,
  socketId: null,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socketRef = useRef<Socket | null>(null);
  
  // UI 렌더링용 State들
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null); // ✨ ID 저장용

  useEffect(() => {
    socketRef.current = io('http://localhost:4000', {
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('🟢 소켓 연결 성공:', socketRef.current?.id);
      setIsConnected(true);
      // ✨ 연결 성공 시 ID를 State에 저장 (이때 화면이 한 번 리렌더링 됨)
      setSocketId(socketRef.current?.id || null); 
    });

    socketRef.current.on('disconnect', () => {
      console.log('🔴 소켓 연결 끊김');
      setIsConnected(false);
      setSocketId(null);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return (
    // ✨ socketId도 함께 넘겨줍니다.
    <SocketContext.Provider value={{ socketRef, isConnected, socketId }}>
      {children}
    </SocketContext.Provider>
  );
};