import type { CardTier, DeliveryTier, Channel } from './types';

export const won = (n: number) => Math.round(n).toLocaleString('ko-KR') + '원';

export function toKorean(num: number): string {
  if (!num || num <= 0) return '';
  const eok = Math.floor(num / 100000000);
  const man = Math.floor((num % 100000000) / 10000);
  const rest = num % 10000;
  const parts: string[] = [];
  if (eok > 0) parts.push(eok.toLocaleString('ko-KR') + '억');
  if (man > 0) parts.push(man.toLocaleString('ko-KR') + '만');
  if (rest > 0) parts.push(rest.toLocaleString('ko-KR'));
  return parts.join(' ') + '원';
}

export const CARD_TIER_LABELS: Record<CardTier, string> = {
  t1: '영세 · 연매출 3억 이하 — 0.5%',
  t2: '중소① · 3~5억 — 1.1%',
  t3: '중소② · 5~10억 — 1.25%',
  t4: '중소③ · 10~30억 — 1.5%',
  t5: '일반 · 30억 초과 — 약 2.0%',
};

export const DELIVERY_TIER_LABELS: Record<DeliveryTier, string> = {
  top: '상위 35% 이내 (배민·쿠팡 7.8%)',
  mid: '상위 35~80% (배민·쿠팡 6.8%)',
  bottom: '하위 20% (배민·쿠팡 2.0%)',
};

export const DELIVERY_TIER_SHORT: Record<DeliveryTier, string> = {
  top: '상위 35% 이내',
  mid: '상위 35~80%',
  bottom: '하위 20%',
};

export const CHANNEL_NAMES: Record<Channel, string> = {
  card: '카드결제',
  baemin: '배달의민족',
  coupang: '쿠팡이츠',
  yogiyo: '요기요',
  pay: '간편결제',
};

export const DELIVERY_CHANNELS: Channel[] = ['baemin', 'coupang', 'yogiyo'];
