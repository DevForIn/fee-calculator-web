// 랜딩 페이지 계산용 요율 (2026년 기준)
// SSG(정적 생성)에서도 동작하도록 API 의존 없이 상수로 계산

export const RATES = {
  cardTiers: { t1: 0.005, t2: 0.011, t3: 0.0125, t4: 0.015, t5: 0.02 } as Record<string, number>,
  // 배민·쿠팡이츠: 매출 거래액 구간별 (2.0~7.8%)
  delivery: { top: 0.078, mid: 0.068, bottom: 0.02 } as Record<string, number>,
  // 요기요(요기요 라이트): 주문 건수 구간별 4단계 (9.7→8.7→7.7→4.7%), 2026년 기준
  yogiyoTiers: { y1: 0.097, y2: 0.087, y3: 0.077, y4: 0.047 } as Record<string, number>,
  deliveryPaymentRate: 0.03,
  deliveryFeePerOrder: { top: 2900, mid: 2600, bottom: 2400 } as Record<string, number>,
  // 네이버페이 결제형(외부 가맹점) 매출등급별, 2026년 기준 (VAT 별도)
  naverPayTiers: { n1: 0.009, n2: 0.011, n3: 0.013, n4: 0.015, n5: 0.023 } as Record<string, number>,
  // 스마트스토어 주문관리 통합 수수료(주문관리+결제) 매출등급별, 2026년 기준
  smartstoreTiers: { s1: 0.018, s2: 0.023, s3: 0.026, s4: 0.029, s5: 0.036 } as Record<string, number>,
  // 스마트스토어 네이버쇼핑 검색 유입 시 추가 주문연동 수수료
  smartstoreShoppingRate: 0.02,
  // 카카오페이 신용카드 결제 매출등급별, 2026년 기준
  kakaoPayTiers: { k1: 0.002, k2: 0.008, k3: 0.012, k4: 0.0167, k5: 0.02 } as Record<string, number>,
  payRate: 0.02,
};

// 플랫폼별 배달 중개요율 반환 (요기요는 주문건수 구간별 별도 체계)
export function getDeliveryRate(platform: string | null, tier: string): number {
  if (platform === 'yogiyo') return RATES.yogiyoTiers[tier] ?? RATES.yogiyoTiers.y1;
  return RATES.delivery[tier] ?? 0.078;
}

// 요기요 주문건수 구간 옵션
export const YOGIYO_TIER_OPTIONS = [
  { value: 'y1', label: '주문 적음 (9.7%)' },
  { value: 'y2', label: '주문 보통 (8.7%)' },
  { value: 'y3', label: '주문 많음 (7.7%)' },
  { value: 'y4', label: '주문 매우 많음 (4.7%)' },
];

// 네이버페이 결제형(외부 가맹점) 매출등급 옵션
export const NAVERPAY_TIER_OPTIONS = [
  { value: 'n1', label: '영세 · 3억 이하 (0.9%)' },
  { value: 'n2', label: '중소1 · 3~5억 (1.1%)' },
  { value: 'n3', label: '중소2 · 5~10억 (1.3%)' },
  { value: 'n4', label: '중소3 · 10~30억 (1.5%)' },
  { value: 'n5', label: '일반 · 30억 초과 (2.3%)' },
];

// 스마트스토어 매출등급 옵션 (주문관리+결제 통합)
export const SMARTSTORE_TIER_OPTIONS = [
  { value: 's1', label: '영세 · 3억 이하 (1.8%)' },
  { value: 's2', label: '중소1 · 3~5억 (2.3%)' },
  { value: 's3', label: '중소2 · 5~10억 (2.6%)' },
  { value: 's4', label: '중소3 · 10~30억 (2.9%)' },
  { value: 's5', label: '일반 · 30억 초과 (3.6%)' },
];

// 카카오페이 신용카드 결제 매출등급 옵션
export const KAKAOPAY_TIER_OPTIONS = [
  { value: 'k1', label: '영세 · 3억 이하 (0.2%)' },
  { value: 'k2', label: '중소1 · 3~5억 (0.8%)' },
  { value: 'k3', label: '중소2 · 5~10억 (1.2%)' },
  { value: 'k4', label: '중소3 · 10~30억 (1.67%)' },
  { value: 'k5', label: '일반 · 30억 초과 (2.0%)' },
];

export const CARD_TIER_OPTIONS = [
  { value: 't1', label: '영세 · 연매출 3억 이하 (0.5%)' },
  { value: 't2', label: '중소① · 3~5억 (1.1%)' },
  { value: 't3', label: '중소② · 5~10억 (1.25%)' },
  { value: 't4', label: '중소③ · 10~30억 (1.5%)' },
  { value: 't5', label: '일반 · 30억 초과 (약 2.0%)' },
];

export const DELIVERY_TIER_OPTIONS = [
  { value: 'top', label: '상위 35% 이내 (중개료 7.8%)' },
  { value: 'mid', label: '상위 35~80% (6.8%)' },
  { value: 'bottom', label: '하위 20% (2.0%)' },
];
