import { useCallback, useEffect, useState } from 'react';
import { api, tokenStore } from './api';
import type { Member, LoginRequest, SignupRequest } from './types';

export function useAuth() {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  // 앱 시작 시 토큰 있으면 내 정보 복원
  useEffect(() => {
    const token = tokenStore.get();
    if (!token) {
      setLoading(false);
      return;
    }
    api.getMe()
      .then(setMember)
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (body: LoginRequest) => {
    const res = await api.login(body);
    tokenStore.set(res.token);
    setMember(res.member);
    return res.member;
  }, []);

  const signup = useCallback(async (body: SignupRequest) => {
    const res = await api.signup(body);
    tokenStore.set(res.token);
    setMember(res.member);
    return res.member;
  }, []);

  const kakaoLogin = useCallback(async (code: string) => {
    const res = await api.kakaoLogin(code);
    tokenStore.set(res.token);
    setMember(res.member);
    return res.member;
  }, []);

  const naverLogin = useCallback(async (code: string, state: string) => {
    const res = await api.naverLogin(code, state);
    tokenStore.set(res.token);
    setMember(res.member);
    return res.member;
  }, []);

  const googleLogin = useCallback(async (code: string) => {
    const res = await api.googleLogin(code);
    tokenStore.set(res.token);
    setMember(res.member);
    return res.member;
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setMember(null);
  }, []);

  return { member, loading, login, signup, kakaoLogin, naverLogin, googleLogin, logout, setMember };
}
