// 백엔드(fee-calculator-api)의 DTO와 1:1로 맞춘 타입 정의

export type CardTier = 't1' | 't2' | 't3' | 't4' | 't5';
export type DeliveryTier = 'top' | 'mid' | 'bottom';
export type Industry = 'food' | 'cafe' | 'retail' | 'online' | 'service';
export type Channel = 'card' | 'baemin' | 'coupang' | 'yogiyo' | 'pay';

// POST /api/v1/fee/calculate 요청
export interface FeeRequest {
  industry: Industry;
  monthlyRevenue: number;
  cardPercent: number;
  baeminPercent: number;
  coupangPercent: number;
  yogiyoPercent: number;
  payPercent: number;
  cardTier: CardTier;
  deliveryTier: DeliveryTier;
  deliveryRealCost: boolean;   // 배달앱 실비용(중개+결제+배달비) 모드
  monthlyOrderCount: number;   // 월 배달 주문 건수
}

// 계산 결과 채널별 내역
export interface FeeLine {
  channel: Channel;
  label: string;
  rate: number;
  channelRevenue: number;
  fee: number;
  mediationFee: number;  // 중개이용료 (배달 실비용 모드)
  paymentFee: number;    // 결제수수료
  deliveryFee: number;   // 배달비 합계
}

// POST /api/v1/fee/calculate 응답
export interface FeeResponse {
  monthlyTotalFee: number;
  yearlyTotalFee: number;
  lines: FeeLine[];
}

// GET /api/v1/fee/rates 응답
export interface RatesResponse {
  cardTiers: Record<CardTier, number>;
  delivery: Record<'baemin' | 'coupang' | 'yogiyo', Record<DeliveryTier, number>>;
  payRate: number;
  deliveryPaymentRate: number;
  deliveryFeePerOrder: Record<DeliveryTier, number>;
  labels: Record<Channel, string>;
}

// 회원 정보 (GET /api/v1/member/me, 로그인/가입 응답의 member)
export interface Member {
  id: number;
  email: string;
  nickname: string;
  businessNumber: string | null;
  cardTier: CardTier;
  deliveryTier: DeliveryTier;
  cardPercent: number;
  baeminPercent: number;
  coupangPercent: number;
  yogiyoPercent: number;
  payPercent: number;
}

// 로그인/회원가입 응답
export interface AuthResponse {
  token: string;
  member: Member;
}

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
  businessNumber?: string;
  cardTier?: CardTier;
  deliveryTier?: DeliveryTier;
  cardPercent?: number;
  baeminPercent?: number;
  coupangPercent?: number;
  yogiyoPercent?: number;
  payPercent?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}
