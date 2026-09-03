// 랜딩 페이지 계산용 요율 (백엔드 FeeRates / App FALLBACK_RATES와 동일값)
// SSG(정적 생성)에서도 동작하도록 API 의존 없이 상수로 계산

export const RATES = {
  cardTiers: { t1: 0.005, t2: 0.011, t3: 0.0125, t4: 0.015, t5: 0.02 } as Record<string, number>,
  delivery: { top: 0.078, mid: 0.068, bottom: 0.02 } as Record<string, number>,
  deliveryPaymentRate: 0.03,
  deliveryFeePerOrder: { top: 2900, mid: 2600, bottom: 2400 } as Record<string, number>,
  payRate: 0.02,
};

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
