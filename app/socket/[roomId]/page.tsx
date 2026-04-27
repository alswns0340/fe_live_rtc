'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSocket } from '@/app/socket_context';

export default function RoomPage() {
  const { roomId } = useParams();
  const { socketRef, isConnected, socketId } = useSocket();
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null); 
  const pcRef = useRef<RTCPeerConnection | null>(null); 

  // ✨ 1. 카메라와 마이크 상태를 기억할 State 추가
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);

  useEffect(() => {
    if (!isConnected || !socketRef.current) return;
    const socket = socketRef.current;

    const initWebRTC = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        pcRef.current = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        stream.getTracks().forEach((track) => {
          pcRef.current?.addTrack(track, stream);
        });

        pcRef.current.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        pcRef.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('ice-candidate', { roomId, candidate: event.candidate });
          }
        };

        // 시그널링 이벤트 리스너들 (이전과 동일)
        socket.on('user-joined', async () => {
          if (!pcRef.current) return;
          const offer = await pcRef.current.createOffer();
          await pcRef.current.setLocalDescription(offer);
          socket.emit('offer', { roomId, offer });
        });

        socket.on('offer', async (data) => {
          if (!pcRef.current) return;
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          socket.emit('answer', { roomId, answer });
        });

        socket.on('answer', async (data) => {
          if (!pcRef.current) return;
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        });

        socket.on('ice-candidate', async (data) => {
          if (!pcRef.current) return;
          await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        });

        socket.emit('join-room', roomId);

      } catch (error) {
        console.error('WebRTC 초기화 에러:', error);
      }
    };

    initWebRTC();

    return () => {
      socket.off('user-joined');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      
      if (pcRef.current) pcRef.current.close();
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isConnected, socketRef, roomId]);

  // ✨ 2. 비디오 켜고 끄기 함수
  const toggleVideo = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      // 스트림에서 비디오 트랙(영상 가닥)만 쏙 뽑아옵니다.
      const videoTrack = stream.getVideoTracks()[0];
      
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  // ✨ 3. 오디오(마이크) 켜고 끄기 함수
  const toggleAudio = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      // 스트림에서 오디오 트랙(음성 가닥)만 쏙 뽑아옵니다.
      const audioTrack = stream.getAudioTracks()[0];
      
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>🏠 방 번호: {roomId}</h2>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#000', width: '300px', borderRadius: '10px', overflow: 'hidden' }}>
          <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', display: 'block' }} />
          <div style={{ textAlign: 'center', color: 'white', padding: '5px' }}>나 ({socketId})</div>
          
          {/* ✨ 4. 화면 하단에 컨트롤 버튼 추가 */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', padding: '10px', backgroundColor: '#222' }}>
            <button 
              onClick={toggleVideo} 
              style={{ padding: '5px 15px', cursor: 'pointer', backgroundColor: isVideoOn ? '#4CAF50' : '#f44336', color: 'white', border: 'none', borderRadius: '5px' }}
            >
              {isVideoOn ? '📷 카메라 끄기' : '📷 카메라 켜기'}
            </button>
            <button 
              onClick={toggleAudio} 
              style={{ padding: '5px 15px', cursor: 'pointer', backgroundColor: isAudioOn ? '#4CAF50' : '#f44336', color: 'white', border: 'none', borderRadius: '5px' }}
            >
              {isAudioOn ? '🎤 마이크 끄기' : '🎤 마이크 켜기'}
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: '#333', width: '300px', borderRadius: '10px', overflow: 'hidden' }}>
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', display: 'block' }} />
          <div style={{ textAlign: 'center', color: 'white', padding: '5px' }}>상대방</div>
        </div>
      </div>
    </div>
  );
}