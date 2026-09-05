import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import type { LandingConfig } from '../landings';
import { LANDINGS } from '../landings';
import { RATES, CARD_TIER_OPTIONS, DELIVERY_TIER_OPTIONS, YOGIYO_TIER_OPTIONS, NAVERPAY_TIER_OPTIONS, SMARTSTORE_TIER_OPTIONS, KAKAOPAY_TIER_OPTIONS, getDeliveryRate } from '../landingRates';
import { won, toKorean } from '../utils';
import { FeedbackBar } from './FeedbackBar';

interface Props {
  config: LandingConfig;
}

interface Result {
  monthly: number;
  yearly: number;
  lines: { label: string; amount: number }[];
  effRate: number;
}

export function LandingPage({ config }: Props) {
  const [revenue, setRevenue] = useState(30000000);
  const [share, setShare] = useState(50); // 해당 채널 매출 비중 %
  const [cardTier, setCardTier] = useState('t4');
  const [deliveryTier, setDeliveryTier] = useState('top');
  const [orderCount, setOrderCount] = useState(500);
  const [result, setResult] = useState<Result | null>(null);

  const isCard = config.type === 'card';
  const isDelivery = config.type === 'delivery';
  const isSelf = config.type === 'self-employed';
  const isYogiyo = config.platform === 'yogiyo';
  const isNaverpay = config.type === 'naverpay';
  const isKakaopay = config.type === 'kakaopay';
  const isSmartstore = config.type === 'smartstore';
  const isPayLike = isNaverpay || isKakaopay || isSmartstore;

  // 간편결제/스토어 매출등급 (n1~n5 / k1~k5 / s1~s5), 기본 영세
  const payTierInit = isNaverpay ? 'n1' : isKakaopay ? 'k1' : 's1';
  const [payTier, setPayTier] = useState(payTierInit);
  const [shoppingInflow, setShoppingInflow] = useState(false); // 스마트스토어 쇼핑 유입 여부

  // 요기요는 주문건수 구간(y1~y4), 그 외 배달앱은 매출 구간(top/mid/bottom)
  const [deliveryTier2, setDeliveryTier2] = useState(isYogiyo ? 'y1' : 'top');
  const dTier = isYogiyo ? deliveryTier2 : deliveryTier;
  // 배달비 구간 키: 요기요 tier(y*)는 배달비 표에 없으므로 대표값(top) 사용
  const feeKey = isYogiyo ? 'top' : deliveryTier;

  function calculate() {
    if (revenue <= 0) return;
    const lines: { label: string; amount: number }[] = [];
    let monthly = 0;
    const channelRevenue = Math.round((revenue * share) / 100);

    if (isCard) {
      const rate = RATES.cardTiers[cardTier];
      const fee = Math.round(channelRevenue * rate);
      lines.push({ label: `카드 수수료 (${(rate * 100).toFixed(2)}%)`, amount: fee });
      monthly = fee;
    } else if (isDelivery) {
      const rate = getDeliveryRate(config.platform, dTier);
      const mediation = Math.round(channelRevenue * rate);
      const payment = Math.round(channelRevenue * RATES.deliveryPaymentRate);
      const delivery = Math.max(0, orderCount) * RATES.deliveryFeePerOrder[feeKey];
      lines.push({ label: `중개이용료 (${(rate * 100).toFixed(1)}%)`, amount: mediation });
      lines.push({ label: '결제수수료 (약 3%)', amount: payment });
      lines.push({ label: `배달비 (${orderCount.toLocaleString('ko-KR')}건)`, amount: delivery });
      monthly = mediation + payment + delivery;
    } else if (isPayLike) {
      if (isNaverpay) {
        const rate = RATES.naverPayTiers[payTier];
        const fee = Math.round(channelRevenue * rate);
        lines.push({ label: `네이버페이 결제 수수료 (${(rate * 100).toFixed(2)}%)`, amount: fee });
        monthly = fee;
      } else if (isKakaopay) {
        const rate = RATES.kakaoPayTiers[payTier];
        const fee = Math.round(channelRevenue * rate);
        lines.push({ label: `카카오페이 결제 수수료 (${(rate * 100).toFixed(2)}%)`, amount: fee });
        monthly = fee;
      } else {
        // 스마트스토어: 통합 수수료 (+ 쇼핑연동 2% 옵션)
        const rate = RATES.smartstoreTiers[payTier];
        const base = Math.round(channelRevenue * rate);
        lines.push({ label: `주문관리·결제 수수료 (${(rate * 100).toFixed(1)}%)`, amount: base });
        monthly = base;
        if (shoppingInflow) {
          const shopping = Math.round(channelRevenue * RATES.smartstoreShoppingRate);
          lines.push({ label: '네이버쇼핑 연동 수수료 (2%)', amount: shopping });
          monthly += shopping;
        }
      }
    } else {
      // self-employed: 종합 간이 (카드+배달+간편 대략)
      const cardFee = Math.round(revenue * 0.5 * RATES.cardTiers[cardTier]);
      const delivRev = revenue * 0.3;
      const delivFee = Math.round(delivRev * (RATES.delivery[deliveryTier] + RATES.deliveryPaymentRate));
      const payFee = Math.round(revenue * 0.2 * RATES.payRate);
      lines.push({ label: '카드 수수료 (매출 50% 가정)', amount: cardFee });
      lines.push({ label: '배달앱 수수료 (매출 30% 가정)', amount: delivFee });
      lines.push({ label: '간편결제 수수료 (매출 20% 가정)', amount: payFee });
      monthly = cardFee + delivFee + payFee;
    }

    setResult({
      monthly,
      yearly: monthly * 12,
      lines,
      effRate: revenue > 0 ? monthly / revenue : 0,
    });
  }

  const related = LANDINGS.filter((l) => l.slug !== config.slug).slice(0, 4);

  return (
    <>
      <Head>
        <title>{config.metaTitle}</title>
        <meta name="description" content={config.metaDescription} />
        <link rel="canonical" href={`https://showmefee.com/${config.slug}`} />
        <meta property="og:title" content={config.metaTitle} />
        <meta property="og:description" content={config.metaDescription} />
        <meta property="og:url" content={`https://showmefee.com/${config.slug}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: config.faqs.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: config.metaTitle,
            url: `https://showmefee.com/${config.slug}`,
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
            inLanguage: 'ko-KR',
          })}
        </script>
      </Head>
      <div className="wrap">
      <div className="topbar">
        <Link className="icon-btn" to="/">전체 계산기</Link>
      </div>

      <header>
        <h1>{config.title}</h1>
        <p>{config.intro}</p>
      </header>

      <div className="card">
        <div className="field">
          <label>월 매출 (원)</label>
          <input className="text-input" inputMode="numeric"
            value={revenue ? revenue.toLocaleString('ko-KR') : ''}
            onChange={(e) => setRevenue(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)}
            placeholder="예: 30,000,000" />
          <div className="hint">{revenue ? `= ${toKorean(revenue)}` : ' '}</div>
        </div>

        {!isSelf && (
          <div className="field">
            <label>{isCard ? '카드 매출 비중' : isPayLike ? (isSmartstore ? '스토어 매출 비중' : '해당 결제 비중') : '배달 매출 비중'} (%)</label>
            <input className="text-input" inputMode="numeric" value={share}
              onChange={(e) => setShare(Math.min(100, Number(e.target.value.replace(/[^0-9]/g, '')) || 0))} />
          </div>
        )}

        {isCard && (
          <div className="field">
            <label>연매출 구간</label>
            <select value={cardTier} onChange={(e) => setCardTier(e.target.value)}>
              {CARD_TIER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        )}

        {isPayLike && (
          <div className="field">
            <label>연매출 등급</label>
            <select value={payTier} onChange={(e) => setPayTier(e.target.value)}>
              {(isNaverpay ? NAVERPAY_TIER_OPTIONS : isKakaopay ? KAKAOPAY_TIER_OPTIONS : SMARTSTORE_TIER_OPTIONS)
                .map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        )}

        {isSmartstore && (
          <div className="field">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={shoppingInflow}
                onChange={(e) => setShoppingInflow(e.target.checked)}
                style={{ width: 'auto', margin: 0 }} />
              네이버쇼핑 검색으로 유입 (연동 수수료 2% 추가)
            </label>
            <div className="hint">블로그·SNS 등 직접 링크 유입이면 체크 해제</div>
          </div>
        )}

        {isDelivery && (
          <>
            <div className="field">
              <label>{isYogiyo ? '요기요 주문 구간' : '배달 매출 구간'}</label>
              {isYogiyo ? (
                <select value={deliveryTier2} onChange={(e) => setDeliveryTier2(e.target.value)}>
                  {YOGIYO_TIER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <select value={deliveryTier} onChange={(e) => setDeliveryTier(e.target.value)}>
                  {DELIVERY_TIER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              )}
            </div>
            <div className="field">
              <label>한 달 배달 주문 건수</label>
              <input className="text-input" inputMode="numeric"
                value={orderCount ? orderCount.toLocaleString('ko-KR') : ''}
                onChange={(e) => setOrderCount(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)} />
              <div className="hint">1건당 약 {won(RATES.deliveryFeePerOrder[feeKey])} 배달비</div>
            </div>
          </>
        )}

        <button className="calc" onClick={calculate}>계산하기</button>
      </div>

      {result && (
        <>
          <div className="headline">
            <div className="small">{config.title} 예상 결과</div>
            <div className="fee-duo">
              <div className="fee-col"><div className="fee-label">월 수수료</div><div className="fee-val">{won(result.monthly)}</div></div>
              <div className="fee-divider" />
              <div className="fee-col"><div className="fee-label">연 수수료</div><div className="fee-val accent">{won(result.yearly)}</div></div>
            </div>
            <div className="small" style={{ marginTop: 10 }}>매출 대비 {(result.effRate * 100).toFixed(1)}%</div>
          </div>

          <div className="card">
            <ul className="breakdown">
              {result.lines.map((l, i) => (
                <li key={i}>
                  <div><span className="ch-name">{l.label}</span></div>
                  <div className="ch-amt">{won(l.amount)}<small>월 기준</small></div>
                </li>
              ))}
            </ul>
          </div>

          <div className="cta-box">
            <p>내 가게에서 발생하는 <b>전체 결제 수수료</b>를 계산해보세요.<br/>카드·배달·간편결제를 한 번에 계산할 수 있습니다.</p>
            <Link className="calc" to="/" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              전체 결제 수수료 계산하기 →
            </Link>
          </div>
        </>
      )}

      {/* 본문 콘텐츠 (SEO + 애드센스) */}
      {config.sections.map((sec, i) => (
        <section key={i} className="seo-content">
          <h2>{sec.heading}</h2>
          {sec.paragraphs.map((p, j) => <p key={j}>{p}</p>)}
          {sec.bullets && (
            <ul>{sec.bullets.map((b, k) => <li key={k}>{b}</li>)}</ul>
          )}
        </section>
      ))}

      {/* FAQ */}
      <section className="seo-content">
        <h2>{config.title} 자주 묻는 질문</h2>
        {config.faqs.map((f, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <h3>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}
        <p className="seo-note">※ 수수료율은 공개 자료 기반 추정치이며, 실제 요율은 계약·가맹점 등급에 따라 달라질 수 있습니다.</p>
      </section>

      {/* 관련 계산기 내부링크 */}
      <div className="card">
        <label>관련 계산기</label>
        <div className="related-links">
          {related.map((l) => (
            <Link key={l.slug} to={`/${l.slug}`} className="related-link">{l.title}</Link>
          ))}
          <Link to="/" className="related-link primary">전체 결제 수수료 계산기</Link>
        </div>
      </div>

      <FeedbackBar />
      <footer>© 2026 showmefee · 결제 수수료 계산기 · by DevForIn</footer>
    </div>
    </>
  );
}
