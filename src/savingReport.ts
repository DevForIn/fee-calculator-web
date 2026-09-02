import type { FeeResponse, CardTier, DeliveryTier } from './types';
import { won } from './utils';

export interface SavingTip {
  level: 'danger' | 'warn' | 'good';  // 심각도 (색상)
  title: string;
  desc: string;
}

const DELIVERY = new Set(['baemin', 'coupang', 'yogiyo']);

/**
 * 계산 결과 기반 수수료 절감 제안 생성 (규칙 기반, 운영비 0)
 */
export function buildSavingReport(
  result: FeeResponse,
  ctx: { revenue: number; cardTier: CardTier; deliveryTier: DeliveryTier; cardRate: number },
): { headline: string; effectiveRate: number; tips: SavingTip[] } {
  const tips: SavingTip[] = [];
  const { revenue, deliveryTier, cardRate } = ctx;

  // 전체 실효율 (월수수료 / 월매출)
  const effectiveRate = revenue > 0 ? result.monthlyTotalFee / revenue : 0;
  const effPct = (effectiveRate * 100).toFixed(1);

  // 배달 채널 합계
  const deliveryLines = result.lines.filter((l) => DELIVERY.has(l.channel));
  const deliveryRevenue = deliveryLines.reduce((a, b) => a + b.channelRevenue, 0);
  const hasRealCost = deliveryLines.some((l) => l.deliveryFee > 0 || l.mediationFee > 0);

  // 헤드라인 진단
  let headline: string;
  if (effectiveRate >= 0.15)
    headline = `매출의 ${effPct}%가 수수료로 나가고 있어요. 절감 여지가 큽니다.`;
  else if (effectiveRate >= 0.08)
    headline = `매출의 ${effPct}%가 수수료입니다. 몇 가지만 조정하면 아낄 수 있어요.`;
  else
    headline = `매출의 ${effPct}% 수준으로, 수수료 부담이 낮은 편이에요.`;

  // ① 가장 비싼 채널 이동 제안
  const worst = [...result.lines].sort((a, b) => b.fee - a.fee)[0];
  if (worst && DELIVERY.has(worst.channel) && worst.channelRevenue > 0) {
    const moveRatio = 0.1;
    const saved = worst.channelRevenue * moveRatio * Math.max(0, worst.rate - cardRate) * 12;
    if (saved > 0) {
      tips.push({
        level: 'danger',
        title: `${worst.label} 비중을 10% 줄이면 연 ${won(saved)} 절감`,
        desc: `${worst.label}의 실효 수수료율이 ${(worst.rate * 100).toFixed(1)}%로 가장 높습니다. 매장 픽업·자체 주문(전화/자체앱)을 유도해 배달 비중을 낮추면 부담이 크게 줄어요.`,
      });
    }
  }

  // ② 배달앱 실비용 안내 (중개료만 계산했으면)
  if (deliveryRevenue > 0 && !hasRealCost) {
    tips.push({
      level: 'warn',
      title: '배달앱 실비용은 지금 계산보다 더 큽니다',
      desc: '지금은 중개이용료만 반영됐어요. 실제로는 결제수수료(약 3%)와 건당 배달비가 추가됩니다. "배달앱 실비용으로 계산"을 켜서 진짜 부담을 확인해보세요.',
    });
  }

  // ③ 배달 매출 구간별
  if (deliveryRevenue > 0) {
    if (deliveryTier === 'top') {
      tips.push({
        level: 'warn',
        title: '배달 매출 상위 구간 → 중개료 7.8% 적용 중',
        desc: '상생요금제에서 매출이 많을수록 중개이용료율이 높습니다. 배달앱을 여러 곳으로 분산하거나, 자체 채널(픽업·전화주문) 비중을 늘리면 유리합니다.',
      });
    } else if (deliveryTier === 'bottom') {
      tips.push({
        level: 'good',
        title: '배달 하위 구간 → 중개료 2.0% 우대 적용 중',
        desc: '상생요금제 최저 구간이라 배달 중개료 부담이 낮습니다. 현재 구조는 양호해요.',
      });
    }
  }

  // ④ 카드 우대구간 안내
  if (revenue > 0) {
    const annual = revenue * 12;
    if (annual > 280000000 && annual <= 300000000) {
      tips.push({
        level: 'warn',
        title: '연매출이 30억 경계에 가까워요',
        desc: '연 30억을 넘으면 카드 우대수수료(중소③ 1.5%) 대상에서 제외되어 일반 요율(약 2%)이 적용될 수 있습니다.',
      });
    }
  }

  // 팁이 없으면 기본
  if (tips.length === 0) {
    tips.push({
      level: 'good',
      title: '현재 채널 구성은 효율적입니다',
      desc: '수수료 부담이 낮은 편이에요. 매출·채널이 바뀌면 다시 계산해보세요.',
    });
  }

  return { headline, effectiveRate, tips };
}
