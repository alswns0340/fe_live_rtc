'use client';

import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function LoginPage() {
  const router = useRouter();

  // ✨ 1. e: React.FormEvent 대신 FormData를 직접 받습니다!
  const handleLogin = async (formData: FormData) => {
    // 2. 입력칸의 name 속성으로 값을 바로 꺼냅니다. (useState 불필요!)
    const userId = formData.get('userId');
    const password = formData.get('password');

    if (!userId || !password) {
      return alert('아이디와 비밀번호를 모두 입력해주세요.');
    }

    try {
      const response = await axios.post(
        'http://127.0.0.1:4000/auth/login', 
        { userId, password },
        { withCredentials: true }
      );

      alert(`${response.data.user.username}님 환영합니다!`);
      router.push('/');

    } catch (error) { // ✨ 1. : any를 아예 지워버립니다! (기본적으로 unknown 타입이 됩니다)
      console.error('로그인 통신 에러:', error);
      
      // ✨ 2. 이 에러가 Axios 통신을 하다가 발생한 에러인지 검사합니다. (Type Guard)
      if (axios.isAxiosError(error)) {
        // 이 중괄호 안에서는 TypeScript가 error를 'AxiosError' 타입으로 완벽하게 인식합니다!
        if (error.response?.status === 401) {
          alert('로그인 실패: 아이디나 비밀번호를 확인해주세요.');
        } else {
          alert('서버와 연결할 수 없습니다.');
        }
      } else {
        // ✨ 3. Axios 통신 에러가 아닌 다른 에러 (예: 문법 에러, 런타임 에러 등) 처리
        alert('알 수 없는 오류가 발생했습니다.');
      }}
  };
  const handlePingTest = async () => {
    try {
      // ✨ 단순히 GET으로 찔러보기만 합니다.
      const response = await axios.get('http://localhost:4000/ping');
      alert('🟢 통신 대성공! 서버 응답: ' + response.data.message);
    } catch (error) {
      console.error('🔴 핑 테스트 에러:', error);
      alert('통신 실패 (콘솔 확인)');
    }
  };

  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <button onClick={handlePingTest} type="button">
    초간단 통신 테스트 (Ping)
  </button>
      <h2>🔐 WebRTC 로그인 (최신 방식)</h2>
      
      {/* ✨ 3. onSubmit 대신 action 속성에 함수를 바로 넣습니다. 새로고침 방지(preventDefault)를 알아서 해줍니다! */}
      <form action={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <input 
          type="text" 
          name="userId" // ✨ 4. get('userId')로 찾을 수 있게 name을 꼭 달아줍니다.
          placeholder="아이디 (test를 입력하세요)" 
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <input 
          type="password" 
          name="password" // ✨ 5. get('password')로 찾을 수 있게 name을 달아줍니다.
          placeholder="비밀번호 (1234를 입력하세요)" 
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <button 
          type="submit" 
          style={{ padding: '12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px', borderRadius: '5px' }}
        >
          로그인
        </button>
      </form>
    </div>
  );
}