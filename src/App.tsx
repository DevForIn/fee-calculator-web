import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { toPng } from 'html-to-image';
import { buildSavingReport } from './savingReport';
import { FeedbackBar } from './components/FeedbackBar';
import { DonutChart, CHANNEL_COLORS } from './components/DonutChart';
import { LANDINGS } from './landings';
import type {
  CardTier, DeliveryTier, Industry, FeeResponse, FeeLine, RatesResponse,
} from './types';
import {
  won, toKorean, CARD_TIER_LABELS, DELIVERY_TIER_LABELS,
  DELIVERY_TIER_SHORT, CHANNEL_NAMES, DELIVERY_CHANNELS,
} from './utils';

type Percents = { card: number; baemin: number; coupang: number; yogiyo: number; pay: number };

const DEFAULT_PERCENTS: Percents = { card: 50, baemin: 20, coupang: 15, yogiyo: 5, pay: 10 };

// 폴백 요율 (백엔드 연결 실패 시)
const FALLBACK_RATES: RatesResponse = {
  cardTiers: { t1: 0.005, t2: 0.011, t3: 0.0125, t4: 0.015, t5: 0.02 },
  delivery: {
    baemin: { top: 0.078, mid: 0.068, bottom: 0.02 },
    coupang: { top: 0.078, mid: 0.068, bottom: 0.02 },
    yogiyo: { top: 0.097, mid: 0.097, bottom: 0.097 },
  },
  payRate: 0.02,
  deliveryPaymentRate: 0.03,
  deliveryFeePerOrder: { top: 2900, mid: 2600, bottom: 2400 },
  labels: CHANNEL_NAMES,
};

export default function App() {
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const SITE_URL = import.meta.env.VITE_SITE_URL ??
    (typeof window !== 'undefined' ? window.location.origin : 'https://showmefee.com');

  // 링크 공유 (심리테스트 방식): 모바일=공유창, PC=링크 복사
  async function shareLink() {
    const shareData = {
      title: '결제 수수료 계산기 | showmefee',
      text: '우리 가게 결제 수수료 1년에 얼마 내는지 알아? 나도 계산해봤어 👇',
      url: SITE_URL,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${SITE_URL}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (e) {
      // 공유 취소는 무시
      if (e instanceof Error && e.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(`${shareData.text}\n${SITE_URL}`);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch { /* ignore */ }
      }
    }
  }

  async function shareResult() {
    if (!shareCardRef.current || !result) return;
    setSharing(true);
    const el = shareCardRef.current;
    try {
      // 캡처 순간만 화면 안으로 (평소엔 -10000px라 레이아웃 영향 없음, opacity:0이면 흰 이미지 나옴)
      el.style.left = '0';
      el.style.opacity = '1';
      await new Promise((r) => setTimeout(r, 50)); // 렌더 안정화
      const dataUrl = await toPng(el, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#1b2a4a',
        width: 500,
        height: el.offsetHeight,
      });
      el.style.left = '-10000px';
      el.style.opacity = '1';

      // 무조건 다운로드 (테스트/확인 편의)
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'showmefee-result.png';
      a.click();
    } catch (e) {
      console.warn('공유 실패:', e);
      el.style.left = '-10000px';
      setErrorMsg('이미지 생성에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSharing(false);
    }
  }

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  // 브라우저 마운트 후 저장된 테마 복원 (SSR 안전)
  useEffect(() => {
    const saved = (localStorage.getItem('fee-theme') as 'light' | 'dark' | null)
      || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(saved);
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fee-theme', theme);
  }, [theme]);

  const rates = FALLBACK_RATES;
  const [industry, setIndustry] = useState<Industry>('food');
  const [revenue, setRevenue] = useState<number>(20000000);
  const [percents, setPercents] = useState<Percents>(DEFAULT_PERCENTS);
  const [cardTier, setCardTier] = useState<CardTier>('t4');
  const [deliveryTier, setDeliveryTier] = useState<DeliveryTier>('top');
  const [deliveryRealCost, setDeliveryRealCost] = useState<boolean>(false);
  const [monthlyOrderCount, setMonthlyOrderCount] = useState<number>(500);
  const [result, setResult] = useState<FeeResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const total = useMemo(
    () => percents.card + percents.baemin + percents.coupang + percents.yogiyo + percents.pay,
    [percents],
  );
  const anyDelivery = percents.baemin > 0 || percents.coupang > 0 || percents.yogiyo > 0;

  function setPct(ch: keyof Percents, v: number) {
    setPercents((p) => ({ ...p, [ch]: Math.max(0, Math.min(100, v || 0)) }));
  }

  function calcLocal(): FeeResponse {
    const cardRate = rates.cardTiers[cardTier];
    const lines: FeeLine[] = [];
    const deliveryPctSum = percents.baemin + percents.coupang + percents.yogiyo;
    const perOrder = rates.deliveryFeePerOrder[deliveryTier];
    const totalDeliveryFee = deliveryRealCost ? Math.max(0, monthlyOrderCount) * perOrder : 0;

    const pushSimple = (ch: keyof Percents, rate: number) => {
      if (percents[ch] <= 0) return;
      const channelRevenue = Math.round((revenue * percents[ch]) / 100);
      const fee = Math.round(channelRevenue * rate);
      lines.push({ channel: ch, label: rates.labels[ch], rate, channelRevenue, fee,
        mediationFee: 0, paymentFee: 0, deliveryFee: 0 });
    };
    const pushDelivery = (ch: 'baemin' | 'coupang' | 'yogiyo') => {
      if (percents[ch] <= 0) return;
      const channelRevenue = Math.round((revenue * percents[ch]) / 100);
      const medRate = rates.delivery[ch][deliveryTier];
      const mediationFee = Math.round(channelRevenue * medRate);
      if (!deliveryRealCost) {
        lines.push({ channel: ch, label: rates.labels[ch], rate: medRate, channelRevenue,
          fee: mediationFee, mediationFee: 0, paymentFee: 0, deliveryFee: 0 });
        return;
      }
      const paymentFee = Math.round(channelRevenue * rates.deliveryPaymentRate);
      const deliveryFee = deliveryPctSum > 0
        ? Math.round(totalDeliveryFee * (percents[ch] / deliveryPctSum)) : 0;
      const fee = mediationFee + paymentFee + deliveryFee;
      const effRate = channelRevenue > 0 ? fee / channelRevenue : medRate;
      lines.push({ channel: ch, label: rates.labels[ch], rate: effRate, channelRevenue, fee,
        mediationFee, paymentFee, deliveryFee });
    };

    pushSimple('card', cardRate);
    pushDelivery('baemin');
    pushDelivery('coupang');
    pushDelivery('yogiyo');
    pushSimple('pay', rates.payRate);
    const monthlyTotalFee = lines.reduce((a, b) => a + b.fee, 0);
    lines.sort((a, b) => b.fee - a.fee);
    return { monthlyTotalFee, yearlyTotalFee: monthlyTotalFee * 12, lines };
  }

  function calculate() {
    setErrorMsg('');
    if (total !== 100) { setErrorMsg(`결제 채널 비중 합계가 100%가 아닙니다. (현재 ${total}%)`); return; }
    if (revenue <= 0) { setErrorMsg('월 매출을 올바르게 입력해주세요.'); return; }
    if (deliveryRealCost && monthlyOrderCount < 0) { setErrorMsg('월 배달 주문 건수를 확인해주세요.'); return; }
    setBusy(true);
    setResult(calcLocal());
    setBusy(false);
    setTimeout(() => document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  const channelRows: (keyof Percents)[] = ['card', 'baemin', 'coupang', 'yogiyo', 'pay'];

  return (
    <div className="wrap">
      <Head>
        <title>결제 수수료 계산기 | 우리 가게 수수료 한눈에</title>
        <meta name="description" content="카드·배달앱·간편결제 등 모든 결제 채널의 수수료를 한 번에. 업종과 월매출만 넣으면 우리 가게가 내는 결제 수수료를 계산해드립니다." />
      </Head>
      <div className="topbar">
        <button className="icon-btn round" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <header>
        <h1>내가 내는 결제 수수료,<br />1년에 얼마일까?</h1>
        <p>카드·간편결제·배달앱까지, 우리 가게 결제 수수료를 한 번에.</p>
      </header>


      <div className="card">
        <div className="field">
          <label>업종</label>
          <select value={industry} onChange={(e) => setIndustry(e.target.value as Industry)}>
            <option value="food">음식점</option>
            <option value="cafe">카페 / 제과</option>
            <option value="retail">소매 / 편의점</option>
            <option value="online">온라인 쇼핑몰</option>
            <option value="service">서비스업 / 기타</option>
          </select>
        </div>

        <div className="field">
          <label>월 매출 (원)</label>
          <input className="text-input" inputMode="numeric" value={revenue ? revenue.toLocaleString('ko-KR') : ''}
            onChange={(e) => setRevenue(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)} placeholder="예: 20,000,000" />
          <div className="hint">{revenue ? `= ${toKorean(revenue)} · 부가세 포함 카드/결제 매출 기준` : '부가세 포함 카드/결제 매출 기준'}</div>
        </div>

        <div className="field">
          <label>결제 채널 비중 (합계 100%)</label>
          <div className="channels">
            {channelRows.map((ch) => (
              <div className="chan-row" key={ch}>
                <span className="name">{CHANNEL_NAMES[ch]}</span>
                <input type="range" min={0} max={100} value={percents[ch]}
                  onChange={(e) => setPct(ch, Number(e.target.value))} />
                <span className="pct-wrap">
                  <input className="pct-input" inputMode="numeric" value={percents[ch]}
                    onChange={(e) => setPct(ch, Number(e.target.value.replace(/[^0-9]/g, '')))} />%
                </span>
              </div>
            ))}
          </div>
          <div className={`total-note ${total === 100 ? 'ok' : 'bad'}`}>
            {total === 100 ? '합계 100%' : `합계 ${total}% (100%로 맞춰주세요)`}
          </div>
        </div>

        {percents.card > 0 && (
          <div className="field">
            <label>연매출 구간 (카드 우대수수료 기준)</label>
            <select value={cardTier} onChange={(e) => setCardTier(e.target.value as CardTier)}>
              {(Object.keys(CARD_TIER_LABELS) as CardTier[]).map((t) => (
                <option key={t} value={t}>{CARD_TIER_LABELS[t]}</option>
              ))}
            </select>
          </div>
        )}

        {anyDelivery && (
          <div className="field">
            <label>배달 매출 구간 (상생요금제 기준, 3사 공통)</label>
            <select value={deliveryTier} onChange={(e) => setDeliveryTier(e.target.value as DeliveryTier)}>
              {(Object.keys(DELIVERY_TIER_LABELS) as DeliveryTier[]).map((t) => (
                <option key={t} value={t}>{DELIVERY_TIER_LABELS[t]}</option>
              ))}
            </select>
          </div>
        )}

        {anyDelivery && (
          <div className="field realcost-box">
            <label className="toggle-row">
              <input type="checkbox" checked={deliveryRealCost}
                onChange={(e) => setDeliveryRealCost(e.target.checked)} />
              <span>배달앱 <b>실비용</b>으로 계산 (중개료 + 결제수수료 + 배달비)</span>
            </label>
            <div className="hint">중개이용료만이 아니라, 실제 나가는 결제수수료·배달비까지 합산해요.</div>
            {deliveryRealCost && (
              <div style={{ marginTop: 12 }}>
                <label>한 달 배달 주문 건수</label>
                <input className="text-input" inputMode="numeric"
                  value={monthlyOrderCount ? monthlyOrderCount.toLocaleString('ko-KR') : ''}
                  onChange={(e) => setMonthlyOrderCount(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)}
                  placeholder="예: 500" />
                <div className="hint">
                  배달앱으로 <b>한 달에 받는 주문 수</b>예요. (하루 평균 주문 × 영업일)<br/>
                  배달비는 <b>1건당 약 2,900원</b>씩 부담하므로, 주문이 많을수록 배달비가 커집니다.
                  {monthlyOrderCount > 0 && (
                    <><br/>→ 예상 월 배달비: 약 {won(monthlyOrderCount * 2900)}</>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {errorMsg && <div className="form-error">{errorMsg}</div>}

        <button className="calc" disabled={busy} onClick={calculate}>
          {busy ? '계산 중...' : '수수료 계산하기'}
        </button>
      </div>

      {result && (
        <div id="result">
          <div className="headline">
            <div className="small">내가 내는 결제 수수료</div>
            <div className="fee-duo">
              <div className="fee-col">
                <div className="fee-label">월 수수료</div>
                <div className="fee-val">{won(result.monthlyTotalFee)}</div>
              </div>
              <div className="fee-divider"></div>
              <div className="fee-col">
                <div className="fee-label">연 수수료</div>
                <div className="fee-val accent">{won(result.yearlyTotalFee)}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <DonutChart slices={result.lines
              .filter((r) => r.fee > 0)
              .map((r) => ({ label: r.label, value: r.fee, color: CHANNEL_COLORS[r.channel] || '#888' }))} />
            <ul className="breakdown">
              {result.lines.map((r, i) => {
                const isDelivery = DELIVERY_CHANNELS.includes(r.channel);
                const isRealCost = isDelivery && (r.mediationFee > 0 || r.deliveryFee > 0);
                let sub: string;
                if (isRealCost)
                  sub = `실효율 ${(r.rate * 100).toFixed(1)}% · ${DELIVERY_TIER_SHORT[deliveryTier]} (실비용)`;
                else if (isDelivery)
                  sub = `${(r.rate * 100).toFixed(1)}% · ${DELIVERY_TIER_SHORT[deliveryTier]} (중개이용료, 배달비 별도)`;
                else if (r.channel === 'card')
                  sub = `${(r.rate * 100).toFixed(2)}% · ${CARD_TIER_LABELS[cardTier].split('—')[0].trim()}`;
                else sub = `${(r.rate * 100).toFixed(1)}% · 간편결제사 평균`;
                return (
                  <li key={r.channel}>
                    <div>
                      <span className="ch-name">{r.label}</span>
                      {i === 0 && <span className="tag">가장 비쌈</span>}
                      <div className="ch-sub">{sub}</div>
                      {isRealCost && (
                        <div className="ch-breakdown">
                          <span>중개료 {won(r.mediationFee)}</span>
                          <span>결제 {won(r.paymentFee)}</span>
                          <span>배달비 {won(r.deliveryFee)}</span>
                        </div>
                      )}
                    </div>
                    <div className="ch-amt">{won(r.fee)}<small>월 기준</small></div>
                  </li>
                );
              })}
            </ul>
          </div>

          <SavingReport result={result}
            ctx={{ revenue, cardTier, deliveryTier, cardRate: rates.cardTiers[cardTier] }} />

          <p className="disclaimer">
            ※ 본 계산은 공개 자료 기반 추정치이며, 실제 수수료는 가맹점 등급·계약·매출 구간에 따라 달라집니다.
            배달앱 중개이용료는 부가세·배달비 별도 기준입니다.
          </p>

          <div className="share-actions">
              <button className="share-btn primary" onClick={shareLink}>
                {copied ? '✓ 링크 복사됨!' : '🔗 친구에게 공유하기'}
              </button>
              <button className="share-btn" onClick={shareResult} disabled={sharing}>
                {sharing ? '만드는 중...' : '📥 결과 이미지 저장'}
              </button>
            </div>

          {/* 공유용 카드 (화면 밖, 이미지 캡처 전용) */}
          <div className="share-capture" ref={shareCardRef} aria-hidden>
            <div className="sc-brand">💰 showmefee.com</div>
            <div className="sc-title">우리 가게가 1년에 내는<br/>결제 수수료는?</div>
            <div className="sc-amount">{won(result.yearlyTotalFee)}</div>
            <div className="sc-sub">월 {won(result.monthlyTotalFee)}</div>
            <div className="sc-lines">
              {result.lines.slice(0, 3).map((r) => (
                <div key={r.channel} className="sc-line">
                  <span>{r.label}</span><span>{won(r.fee)}</span>
                </div>
              ))}
            </div>
            <div className="sc-cta">나도 계산해보기 → showmefee.com</div>
          </div>
        </div>
      )}

      {/* SEO / 안내 콘텐츠 (검색 노출용) */}
      <section className="seo-content">
        <h2>결제 수수료 계산기 — 카드·배달앱·간편결제 한 번에</h2>
        <p>
          가게를 운영하면 카드, 배달앱, 간편결제 등 여러 채널에서 수수료가 발생합니다.
          showmefee는 업종과 월 매출, 채널 비중만 입력하면 우리 가게가 <b>1년에 내는 결제 수수료</b>를
          채널별로 나눠서 한눈에 계산해주는 무료 계산기입니다.
          회원가입 없이 바로 사용할 수 있습니다.
        </p>
        <h3>이런 걸 계산할 수 있어요</h3>
        <ul>
          <li>카드 우대수수료 (연매출 구간별 0.5%~2.0%)</li>
          <li>배달앱 실비용 (배민·쿠팡이츠·요기요 중개료 + 결제수수료 + 배달비)</li>
          <li>간편결제 수수료 (네이버페이·카카오페이 매출등급별)</li>
          <li>스마트스토어 판매 수수료 + 쇼핑연동 수수료</li>
          <li>채널별 수수료 비교 — 어디서 가장 많이 나가는지</li>
          <li>수수료 절감 리포트 — 맞춤 절감 팁 제공</li>
        </ul>
      </section>

      {/* 개별 계산기 허브 (내부링크 + 유입) */}
      <section className="seo-content">
        <h2>결제 수단별 전용 계산기</h2>
        <p>
          특정 결제 수단의 수수료만 자세히 계산하고 싶다면 아래 전용 계산기를 이용하세요.
          각 페이지에는 해당 수수료의 구조 설명, 절감 방법, 자주 묻는 질문이 정리되어 있습니다.
        </p>
        <div className="hub-links">
          {LANDINGS.map((l) => (
            <Link key={l.slug} to={`/${l.slug}`} className="hub-link">{l.title}</Link>
          ))}
        </div>
      </section>

      {/* 수수료 종합 가이드 */}
      <section className="seo-content">
        <h2>자영업자·소상공인 결제 수수료 완전 가이드 (2026년)</h2>
        <p>
          우리 가게에서 발생하는 결제 수수료, 정확히 파악하고 계신가요?
          많은 사장님이 카드 수수료는 알아도 배달앱이나 간편결제의 실제 부담은 잘 모르는 경우가 많습니다.
          아래에 채널별 수수료 구조와 절감 방법을 상세히 정리했습니다.
        </p>

        <h3>1. 카드 결제 수수료 (0.5%~2.0%)</h3>
        <p>
          카드 결제 수수료는 금융위원회가 고시하는 <b>우대수수료율</b>을 따릅니다.
          영세·중소 가맹점을 보호하기 위해 연매출이 적을수록 낮은 요율이 적용되는 구조입니다.
          즉, 매출이 적은 가게일수록 카드 수수료 부담이 가볍습니다.
        </p>
        <ul>
          <li><b>영세 가맹점</b> (연매출 3억 이하): 신용카드 0.5%, 체크카드 0.25%</li>
          <li><b>중소 가맹점①</b> (연매출 3~5억): 신용카드 1.1%, 체크카드 0.85%</li>
          <li><b>중소 가맹점②</b> (연매출 5~10억): 신용카드 1.25%, 체크카드 1.0%</li>
          <li><b>중소 가맹점③</b> (연매출 10~30억): 신용카드 1.5%, 체크카드 1.25%</li>
          <li><b>일반 가맹점</b> (연매출 30억 초과): 신용카드 약 2.0% (카드사 협상)</li>
        </ul>
        <p>
          카드 수수료는 매달 자동 적용되므로, 자신의 연매출 구간을 확인하고
          올바른 우대 등급이 적용되고 있는지 주기적으로 점검하는 것이 좋습니다.
          우대 자격이 되는데 일반 요율을 내고 있다면 카드사에 즉시 요청하세요.
        </p>

        <h3>2. 배달앱 수수료 — 실비용은 매출의 15~30%</h3>
        <p>
          배달앱 수수료는 "중개이용료 몇 %"만으로 알려져 있지만,
          실제로 사장님이 부담하는 비용은 훨씬 더 큽니다.
          <b>중개이용료 + 결제수수료(약 3%) + 건당 배달비</b> 세 가지를 모두 더해야 진짜 부담입니다.
        </p>
        <p>
          2025년 배달플랫폼 상생요금제 기준으로 배달의민족·쿠팡이츠의 중개이용료는
          매출 하위 20% 가게는 2.0%, 상위 35% 가게는 7.8%가 적용됩니다.
          여기에 결제수수료 약 3%와 건당 배달비(약 1,900~3,400원)를 더하면
          배달매출 대비 실부담은 15~30%에 이르는 경우도 많습니다.
        </p>
        <p>
          요기요는 주문 규모에 따라 4.7~9.7%의 중개이용료가 부과됩니다.
          주문이 적은 가게는 9.7%로 시작해, 주문이 늘수록 최저 4.7%까지 낮아지는 구조입니다.
          배민·쿠팡이츠보다 시작 요율이 높으므로, 주문 수가 적은 가게라면 요기요 비중을 조정하는 것도 고려해볼 수 있습니다.
        </p>

        <h3>3. 간편결제 수수료 — 네이버페이·카카오페이</h3>
        <p>
          간편결제 수수료도 국세청 연매출 등급에 따라 우대수수료율이 차등 적용됩니다.
          카드 수수료와 마찬가지로 매출이 적을수록 낮은 요율이 적용됩니다.
        </p>
        <p>
          <b>네이버페이(결제형)</b>는 외부 가맹점에서 네이버페이로 결제받을 때 적용되며,
          영세 가맹점 약 0.9%에서 일반 가맹점 약 2.3% 수준입니다.
          <b>카카오페이</b>는 신용카드 결제 기준 영세 약 0.2%에서 일반 약 2.0%로,
          영세 구간의 경우 여신전문금융업법상 법정 우대 요율이 적용되어 매우 낮습니다.
        </p>

        <h3>4. 스마트스토어 수수료 — 판매 수수료 + 쇼핑연동 수수료</h3>
        <p>
          네이버 스마트스토어는 주문관리 수수료와 결제 수수료가 통합된 형태로 부과되며,
          연매출 등급별로 약 1.8%(영세)~3.6%(일반)입니다.
          여기에 네이버쇼핑 검색을 통해 유입된 주문은 별도로 <b>2% 주문연동 수수료</b>가 추가됩니다.
        </p>
        <p>
          블로그, 인스타그램, 자체 마케팅 URL 등 직접 유입 고객에게는 이 2%가 부과되지 않습니다.
          재구매 고객이나 직접 유입 채널을 늘리면 수수료를 절감할 수 있습니다.
        </p>

        <h3>결제 수수료 절감 실전 팁</h3>
        <ul>
          <li><b>카드 우대 등급 확인</b> — 우대 자격이 되는데 일반 요율을 내고 있진 않은지 카드사에 확인</li>
          <li><b>포장·픽업 유도</b> — 배달 비중을 줄이면 배달비·중개료 부담이 크게 감소</li>
          <li><b>배달 3사 분산 운영</b> — 특정 앱 의존도를 낮춰 협상력 확보</li>
          <li><b>객단가 높이기</b> — 주문 건수 대비 객단가를 높이면 건당 배달비 비중이 줄어듦</li>
          <li><b>직접 유입 고객 육성</b> — SNS·블로그·단골 프로그램으로 쇼핑연동 수수료 절감</li>
          <li><b>체크카드 유도</b> — 체크카드는 신용카드보다 수수료율이 낮음 (구간별 약 0.25~1.25%)</li>
        </ul>

        <p className="seo-note">
          ※ 수수료율은 공개 자료 기반 2026년 추정치이며, 실제 요율은 계약·가맹점 등급·결제수단에 따라 달라질 수 있습니다.
          정확한 수수료는 각 카드사·플랫폼 공식 채널에서 확인하세요. 자세한 내용은{' '}
          <Link to="/disclaimer">면책고지</Link>를 참고하세요.
        </p>
      </section>

      {/* 자주 묻는 질문 */}
      <section className="seo-content">
        <h2>결제 수수료 자주 묻는 질문</h2>

        <h3>Q. 카드 수수료와 배달앱 수수료 중 어느 게 더 비싼가요?</h3>
        <p>
          카드 수수료는 연매출 구간에 따라 0.5~2.0%로 상대적으로 낮습니다.
          반면 배달앱은 중개이용료 외에 결제수수료와 배달비가 더해지면 매출 대비 15~30%에 달할 수 있습니다.
          배달 비중이 높은 가게라면 배달앱이 가장 큰 수수료 항목이 됩니다.
        </p>

        <h3>Q. 수수료는 부가세(VAT) 포함인가요?</h3>
        <p>
          플랫폼·카드사에서 고시하는 수수료율은 대부분 부가세 별도 기준입니다.
          실제 청구 금액은 수수료에 부가세(10%)가 추가될 수 있으므로, 계약서나 청구서를 확인하세요.
        </p>

        <h3>Q. 배달앱 중개이용료와 배달비는 별도인가요?</h3>
        <p>
          네. 중개이용료(매출 대비 %)와 건당 배달비(주문 1건당 고정 금액)는 별도로 부과됩니다.
          showmefee의 "실비용 계산" 옵션을 켜면 두 항목을 모두 합산한 실제 부담을 확인할 수 있습니다.
        </p>

        <h3>Q. 이 계산기는 무료인가요?</h3>
        <p>
          네, showmefee는 완전 무료입니다. 회원가입이나 로그인 없이 바로 사용할 수 있습니다.
        </p>

        <h3>Q. 계산 결과를 저장하거나 공유할 수 있나요?</h3>
        <p>
          계산 결과 이미지 저장과 링크 공유 기능을 제공합니다.
          지인에게 공유하거나, 이미지를 저장해 기록으로 남길 수 있습니다.
        </p>
      </section>

      <FeedbackBar />
      <footer style={{ textAlign: 'center', color: 'var(--gray)', fontSize: 12, marginTop: 30 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
          <Link to="/about" style={{ color: 'var(--gray)', textDecoration: 'none' }}>서비스 소개</Link>
          <Link to="/privacy" style={{ color: 'var(--gray)', textDecoration: 'none' }}>개인정보처리방침</Link>
          <Link to="/disclaimer" style={{ color: 'var(--gray)', textDecoration: 'none' }}>면책고지</Link>
        </div>
        © 2026 showmefee · 결제 수수료 계산기 · by DevForIn
      </footer>
    </div>
  );
}

function SavingReport({ result, ctx }: {
  result: FeeResponse;
  ctx: { revenue: number; cardTier: CardTier; deliveryTier: DeliveryTier; cardRate: number };
}) {
  const report = buildSavingReport(result, ctx);
  return (
    <div className="saving-report">
      <div className="sr-head">💡 수수료 절감 리포트</div>
      <p className="sr-headline">{report.headline}</p>
      <ul className="sr-tips">
        {report.tips.map((t, i) => (
          <li key={i} className={`sr-tip ${t.level}`}>
            <div className="sr-tip-title">{t.title}</div>
            <div className="sr-tip-desc">{t.desc}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
