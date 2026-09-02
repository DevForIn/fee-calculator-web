import type {
  FeeRequest, FeeResponse, RatesResponse,
  AuthResponse, SignupRequest, LoginRequest, Member,
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8091/api/v1';

const TOKEN_KEY = 'fee-token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    let message = `요청 실패 (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  // 204 등 바디 없는 경우 대비
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const api = {
  // 요율
  getRates: () => request<RatesResponse>('/fee/rates'),

  // 계산
  calculate: (body: FeeRequest) =>
    request<FeeResponse>('/fee/calculate', { method: 'POST', body: JSON.stringify(body) }),

  // 인증
  signup: (body: SignupRequest) =>
    request<AuthResponse>('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: LoginRequest) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  kakaoLogin: (code: string) =>
    request<AuthResponse>('/auth/kakao', { method: 'POST', body: JSON.stringify({ code }) }),
  naverLogin: (code: string, state: string) =>
    request<AuthResponse>('/auth/naver', { method: 'POST', body: JSON.stringify({ code, state }) }),
  googleLogin: (code: string) =>
    request<AuthResponse>('/auth/google', { method: 'POST', body: JSON.stringify({ code }) }),

  // 회원
  getMe: () => request<Member>('/member/me'),
  updateMe: (body: Partial<SignupRequest>) =>
    request<Member>('/member/me', { method: 'PUT', body: JSON.stringify(body) }),

  // 사업자번호 검증
  verifyBiz: (businessNumber: string) =>
    request<{ valid: boolean }>('/biz/verify', {
      method: 'POST', body: JSON.stringify({ businessNumber }),
    }),
};
