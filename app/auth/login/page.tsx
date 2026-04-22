'use client';

import React, { useEffect, useRef, useState } from 'react'
const Login = () => {
  // 마이크 설정 온 오프
  const [localstream, setLocalstream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    // 1. getUserMedia 정의 및 바인딩
    // navigator 객체가 존재하는지 확인 후 안전하게 바인딩합니다.
    const getUserMedia = navigator.mediaDevices?.getUserMedia?.bind(navigator.mediaDevices);
    
    const startCamera = async () => {
      if (!getUserMedia) {
        alert("이 브라우저는 마이크를 지원하지 않습니다.");
        return;
      }

      try {
        const mediaStream = await getUserMedia({ video: true, audio: true });
        // 마이크 상태저장
        setLocalstream(mediaStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }
        console.log("마이크 접근 성공", mediaStream);
      } catch (err) {
        console.error("마이크 접근 오류:", err);
      }
    };

    startCamera();

    // 정리(Cleanup) 함수: 컴포넌트 언마운트 시 트랙 종료
    return () => {
      localstream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  function checkMicStatus(stream: MediaStream | null) {
    if (!stream) {
      console.warn("스트림이 없습니다.");
      return;
    }
    // 마이크 접근방법
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      audioTrack.enabled ? console.log("마이크가 활성화되었습니다.") : console.log("마이크가 일시 정지되었습니다.");
    }
  }
  
  function checkCameraStatus(stream: MediaStream | null) {
    if (!stream) {
      console.warn("스트림이 없습니다.");
      return;
    }
    // 비디오 접근방법
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      videoTrack.enabled ? console.log("비디오가 활성화되었습니다.") : console.log("비디오가 일시 정지되었습니다.");
    }
  }
  return (
    <div>
      <h1>Login</h1>
        <video className="w-[500px] h-[300px] bg-black m-[10px]" ref={localVideoRef} autoPlay muted />
        <button onClick={() => checkCameraStatus(localstream)}>카메라 전환</button>
        <button onClick={() => checkMicStatus(localstream)}>마이크 전환</button>
      <form>
        <input></input>
        <input className=""></input>
        <button type='submit'>login</button>
      </form>
    </div>
  )
}

export default Login
