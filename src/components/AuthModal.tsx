import { useEffect, useState } from 'react';
import type { Member } from '../types';
import { useAuth } from '../useAuth';

interface Props {
  auth: ReturnType<typeof useAuth>;
  onClose: () => void;
  onDone: (member: Member) => void;
}

export function AuthModal({ auth, onClose, onDone }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  // 모달 열려있는 동안 배경 스크롤 잠금
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  async function submit() {
    setErr('');
    setBusy(true);
    try {
      const member =
        mode === 'login'
          ? await auth.login({ email, password })
          : await auth.signup({ email, password, nickname, businessNumber: businessNumber || undefined });
      onDone(member);
    } catch (e) {
      setErr(e instanceof Error ? e.message : '오류가 발생했습니다.');
    } finally {
      setBusy(false);
    }
  }

  function kakaoStart() {
    const key = import.meta.env.VITE_KAKAO_REST_KEY;
    const redirect = import.meta.env.VITE_KAKAO_REDIRECT_URI;
    if (!key || !redirect) { alert('카카오 설정이 없습니다.'); return; }
    const url = `https://kauth.kakao.com/oauth/authorize?client_id=${key}&redirect_uri=${encodeURIComponent(redirect)}&response_type=code`;
    window.location.href = url;
  }

  function naverStart() {
    const id = import.meta.env.VITE_NAVER_CLIENT_ID;
    const redirect = import.meta.env.VITE_NAVER_REDIRECT_URI;
    if (!id) { alert('네이버 로그인은 곧 지원 예정입니다. (앱 등록 후 활성화)'); return; }
    const state = Math.random().toString(36).slice(2);
    sessionStorage.setItem('naver_state', state);
    const url = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${id}&redirect_uri=${encodeURIComponent(redirect)}&state=${state}`;
    window.location.href = url;
  }

  function googleStart() {
    const id = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirect = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
    if (!id) { alert('구글 로그인은 곧 지원 예정입니다. (앱 등록 후 활성화)'); return; }
    const scope = encodeURIComponent('email profile');
    const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${id}&redirect_uri=${encodeURIComponent(redirect)}&scope=${scope}`;
    window.location.href = url;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>×</button>
        <h2>{mode === 'login' ? '로그인' : '회원가입'}</h2>
        <p className="sub">
          {mode === 'login'
            ? '로그인하면 내 설정으로 자동 세팅돼요.'
            : '가입 시 설정한 값이 다음부터 자동 적용돼요.'}
        </p>

        <div className="field">
          <input className="text-input" type="email" placeholder="이메일"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <input className="text-input" type="password" placeholder="비밀번호 (6자 이상)"
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {mode === 'signup' && (
          <>
            <div className="field">
              <input className="text-input" type="text" placeholder="닉네임 / 상호명"
                value={nickname} onChange={(e) => setNickname(e.target.value)} />
            </div>
            <div className="field">
              <input className="text-input" type="text" placeholder="사업자번호 (선택)"
                value={businessNumber} onChange={(e) => setBusinessNumber(e.target.value)} />
            </div>
          </>
        )}

        {err && <div className="err">{err}</div>}

        <button className="calc" style={{ marginTop: 14 }} disabled={busy} onClick={submit}>
          {busy ? '처리 중...' : mode === 'login' ? '로그인' : '가입하기'}
        </button>

        <div className="divider">또는 간편 로그인</div>
        <div className="social">
          <button className="google" onClick={googleStart}>구글로 시작하기</button>
          <button className="naver" onClick={naverStart}>네이버로 시작하기</button>
          <button className="kakao" onClick={kakaoStart}>카카오로 시작하기</button>
        </div>

        <div className="switch">
          {mode === 'login' ? (
            <>계정이 없으신가요? <button onClick={() => { setMode('signup'); setErr(''); }}>회원가입</button></>
          ) : (
            <>이미 계정이 있으신가요? <button onClick={() => { setMode('login'); setErr(''); }}>로그인</button></>
          )}
        </div>
      </div>
    </div>
  );
}
