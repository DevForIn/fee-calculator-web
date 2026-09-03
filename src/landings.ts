// SEO 랜딩 페이지 설정 — 각 페이지는 고유 콘텐츠/계산 대상을 가짐 (복제 아님)

export type LandingType = 'card' | 'delivery' | 'self-employed';
export type Platform = 'baemin' | 'coupang' | 'yogiyo' | null;

export interface FaqItem {
  q: string;
  a: string;
}

export interface LandingConfig {
  slug: string;
  type: LandingType;
  platform: Platform;
  title: string;          // H1 / 화면 제목
  metaTitle: string;      // <title>
  metaDescription: string;
  intro: string;          // 페이지 설명
  faqs: FaqItem[];
}

export const LANDINGS: LandingConfig[] = [
  {
    slug: 'card-fee-calculator',
    type: 'card',
    platform: null,
    title: '카드 수수료 계산기',
    metaTitle: '카드 수수료 계산기 - 연매출별 우대수수료 계산',
    metaDescription: '월 카드매출을 입력하면 연매출 구간별 우대수수료율로 카드 결제 수수료를 계산해드립니다. 영세·중소 가맹점 수수료 확인.',
    intro: '월 카드매출과 연매출 구간만 입력하면, 우리 가게 카드 결제 수수료를 계산해드려요.',
    faqs: [
      { q: '카드 수수료율은 어떻게 정해지나요?', a: '금융위원회가 영세·중소 가맹점을 보호하기 위해 연매출 구간별로 우대수수료율을 고시합니다. 연매출 3억 이하는 0.5%, 3~5억 1.1%, 5~10억 1.25%, 10~30억 1.5%, 30억 초과는 약 2.0%입니다.' },
      { q: '매출이 적으면 수수료가 더 싼가요?', a: '네. 카드 우대수수료는 매출이 적을수록 낮습니다. 배달앱 수수료가 매출 많을수록 높아지는 것과 반대입니다.' },
      { q: '체크카드도 같은 수수료인가요?', a: '체크카드는 신용카드보다 수수료율이 낮습니다(구간별 0.25~1.25%).' },
    ],
  },
  {
    slug: 'delivery-fee-calculator',
    type: 'delivery',
    platform: null,
    title: '배달앱 수수료 계산기',
    metaTitle: '배달앱 수수료 계산기 - 중개료+결제수수료+배달비 실비용',
    metaDescription: '배달의민족·쿠팡이츠·요기요 수수료를 실비용(중개료+결제수수료+배달비)으로 계산. 월 배달매출과 주문건수만 입력하세요.',
    intro: '배달앱은 중개이용료만이 아니라 결제수수료와 배달비까지 붙습니다. 실제 나가는 비용을 계산해보세요.',
    faqs: [
      { q: '배달앱 수수료는 무엇으로 구성되나요?', a: '① 중개이용료(매출의 2.0~7.8%, 매출 구간별) ② 결제수수료(약 3%) ③ 건당 배달비(약 1,900~3,400원)로 구성됩니다. 셋을 합친 게 실비용입니다.' },
      { q: '왜 매출이 많을수록 수수료율이 높나요?', a: '2025 상생요금제는 매출 적은 가게를 우대합니다. 하위 20%는 2.0%, 상위 35%는 7.8%가 적용됩니다.' },
      { q: '배달비는 어떻게 계산하나요?', a: '건당 배달비 × 월 배달 주문 건수입니다. 주문이 많을수록 배달비 부담이 커집니다.' },
    ],
  },
  {
    slug: 'baemin-fee-calculator',
    type: 'delivery',
    platform: 'baemin',
    title: '배민 수수료 계산기',
    metaTitle: '배민 수수료 계산기 - 배달의민족 예상 수수료 계산',
    metaDescription: '월 매출과 배달 비중을 입력하면 배달의민족 중개수수료·결제수수료·배달비 예상 비용을 계산해드립니다.',
    intro: '배달의민족을 사용하는 사장님을 위한 계산기. 월 매출 기준 예상 수수료를 확인하세요.',
    faqs: [
      { q: '배민 중개수수료율은 얼마인가요?', a: '2025 상생요금제 기준 매출 구간별로 2.0%(하위 20%)~7.8%(상위 35%)입니다.' },
      { q: '배민1플러스는 수수료가 다른가요?', a: '요금제·배달 방식에 따라 중개료와 배달비가 달라집니다. 정확한 요율은 배민 계약 조건을 확인하세요.' },
      { q: '배민 배달비는 누가 부담하나요?', a: '요금제에 따라 업주 부담 배달비가 건당 약 1,900~3,400원 발생합니다.' },
    ],
  },
  {
    slug: 'coupang-eats-fee-calculator',
    type: 'delivery',
    platform: 'coupang',
    title: '쿠팡이츠 수수료 계산기',
    metaTitle: '쿠팡이츠 수수료 계산기 - 예상 수수료·배달비 계산',
    metaDescription: '월 매출과 배달 비중을 입력하면 쿠팡이츠 중개수수료와 배달비 등 예상 비용을 계산해드립니다.',
    intro: '쿠팡이츠를 사용하는 사장님을 위한 계산기. 예상 수수료를 확인하세요.',
    faqs: [
      { q: '쿠팡이츠 수수료율은?', a: '2025 상생요금제 기준 매출 구간별 2.0~7.8%로 배민과 동일한 구조입니다.' },
      { q: '쿠팡이츠 요금제 구간은 어떻게 정해지나요?', a: '월 매출 규모에 따라 구간이 산정되며, 매달 실제 매출을 반영합니다.' },
      { q: '배달비도 포함되나요?', a: '중개료와 별도로 건당 배달비가 발생합니다. 실비용 계산 시 함께 반영하세요.' },
    ],
  },
  {
    slug: 'yogiyo-fee-calculator',
    type: 'delivery',
    platform: 'yogiyo',
    title: '요기요 수수료 계산기',
    metaTitle: '요기요 수수료 계산기 - 예상 수수료 계산',
    metaDescription: '월 매출과 배달 비중을 입력하면 요기요 예상 중개수수료와 비용을 계산해드립니다.',
    intro: '요기요를 사용하는 사장님을 위한 계산기.',
    faqs: [
      { q: '요기요 수수료율은?', a: '상생협의체 공통안 기준으로 계산하며(2.0~7.8%), 정확한 최신 요율은 요기요 공지를 확인하세요.' },
      { q: '요기요 포장 수수료는?', a: '포장 주문은 별도 정책이 적용될 수 있어 계약 조건 확인이 필요합니다.' },
    ],
  },
  {
    slug: 'self-employed-fee-calculator',
    type: 'self-employed',
    platform: null,
    title: '자영업자 결제 수수료 계산기',
    metaTitle: '자영업자 결제 수수료 계산기 - 카드·배달·간편결제 종합',
    metaDescription: '자영업자·소상공인이 내는 카드·배달앱·간편결제 수수료를 한 번에 계산. 우리 가게 결제 비용을 확인하세요.',
    intro: '카드, 배달앱, 간편결제까지 — 우리 가게에서 나가는 결제 수수료를 종합으로 계산해보세요.',
    faqs: [
      { q: '어떤 수수료를 계산할 수 있나요?', a: '카드 우대수수료, 배달앱 실비용(중개료+결제+배달비), 간편결제 수수료를 채널별로 계산합니다.' },
      { q: '어떤 채널이 가장 비싼가요?', a: '보통 배달앱이 실비용 기준 가장 높습니다. 카드는 매출 구간에 따라 0.5~2%로 낮은 편입니다.' },
    ],
  },
];

export function getLandingBySlug(slug: string): LandingConfig | undefined {
  return LANDINGS.find((l) => l.slug === slug);
}
