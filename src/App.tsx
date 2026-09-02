import { useEffect, useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { api } from './api';
import { useAuth } from './useAuth';
import { AuthModal } from './components/AuthModal';
import type {
  CardTier, DeliveryTier, Industry, FeeRequest, FeeResponse, FeeLine, RatesResponse, Member,
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
    yogiyo: { top: 0.078, mid: 0.068, bottom: 0.02 },
  },
  payRate: 0.02,
  deliveryPaymentRate: 0.03,
  deliveryFeePerOrder: { top: 2900, mid: 2600, bottom: 2400 },
  labels: CHANNEL_NAMES,
};

export default function App() {
  const auth = useAuth();
  const kakaoHandled = useRef(false);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const SITE_URL = import.meta.env.VITE_SITE_URL ?? window.location.origin;

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

  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('fee-theme') as 'light' | 'dark') ||
      (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  );
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fee-theme', theme);
  }, [theme]);

  const [rates, setRates] = useState<RatesResponse>(FALLBACK_RATES);
  const [backendOk, setBackendOk] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

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

  // 요율 로드
  useEffect(() => {
    api.getRates()
      .then((r) => { setRates(r); setBackendOk(true); })
      .catch(() => setBackendOk(false));
  }, []);

  // 로그인되면 내 설정으로 자동 세팅
  useEffect(() => {
    if (auth.member) applyMember(auth.member);
  }, [auth.member]);

  // 소셜 콜백 처리: /oauth/{provider}?code=... 로 돌아오면 로그인 실행
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const path = window.location.pathname;
    if (!code || kakaoHandled.current) return;

    let p: Promise<Member> | null = null;
    if (path.includes('/oauth/kakao')) p = auth.kakaoLogin(code);
    else if (path.includes('/oauth/naver')) p = auth.naverLogin(code, params.get('state') ?? '');
    else if (path.includes('/oauth/google')) p = auth.googleLogin(code);

    if (p) {
      kakaoHandled.current = true; // 1회용 인가코드 중복 사용 방지 (StrictMode 대응)
      p.then(() => { window.history.replaceState({}, '', import.meta.env.BASE_URL); })
       .catch((e) => {
         setErrorMsg(e instanceof Error ? e.message : '소셜 로그인 실패');
         window.history.replaceState({}, '', import.meta.env.BASE_URL);
       });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyMember(m: Member) {
    setCardTier(m.cardTier);
    setDeliveryTier(m.deliveryTier);
    const sum = m.cardPercent + m.baeminPercent + m.coupangPercent + m.yogiyoPercent + m.payPercent;
    if (sum > 0) {
      setPercents({
        card: m.cardPercent, baemin: m.baeminPercent, coupang: m.coupangPercent,
        yogiyo: m.yogiyoPercent, pay: m.payPercent,
      });
    }
  }

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

  async function calculate() {
    setErrorMsg('');
    if (total !== 100) { setErrorMsg(`결제 채널 비중 합계가 100%가 아닙니다. (현재 ${total}%)`); return; }
    if (revenue <= 0) { setErrorMsg('월 매출을 올바르게 입력해주세요.'); return; }
    if (deliveryRealCost && monthlyOrderCount < 0) { setErrorMsg('월 배달 주문 건수를 확인해주세요.'); return; }
    setBusy(true);
    try {
      const req: FeeRequest = {
        industry, monthlyRevenue: revenue,
        cardPercent: percents.card, baeminPercent: percents.baemin,
        coupangPercent: percents.coupang, yogiyoPercent: percents.yogiyo,
        payPercent: percents.pay, cardTier, deliveryTier,
        deliveryRealCost, monthlyOrderCount,
      };
      const res = backendOk ? await api.calculate(req) : calcLocal();
      setResult(res);
    } catch (e) {
      // 백엔드 오류 시 로컬 폴백 (조용히 대체)
      console.warn('백엔드 계산 실패, 로컬 폴백:', e);
      setResult(calcLocal());
    } finally {
      setBusy(false);
      setTimeout(() => document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }

  const channelRows: (keyof Percents)[] = ['card', 'baemin', 'coupang', 'yogiyo', 'pay'];

  return (
    <div className="wrap">
      <div className="topbar">
        {auth.member ? (
          <button className="icon-btn" onClick={auth.logout}>{auth.member.nickname} · 로그아웃</button>
        ) : (
          <button className="icon-btn" onClick={() => setShowAuth(true)}>로그인</button>
        )}
        <button className="icon-btn round" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <header>
        <h1>내가 내는 결제 수수료,<br />1년에 얼마일까?</h1>
        <p>카드·간편결제·배달앱까지, 우리 가게 결제 수수료를 한 번에.</p>
      </header>

      {!auth.member && (
        <div className="login-banner">
          <span><b>로그인</b>하면 매출 구간·채널 설정이 저장돼요.</span>
          <button onClick={() => setShowAuth(true)}>로그인 / 가입</button>
        </div>
      )}

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
                <label>월 배달 주문 건수</label>
                <input className="text-input" inputMode="numeric"
                  value={monthlyOrderCount ? monthlyOrderCount.toLocaleString('ko-KR') : ''}
                  onChange={(e) => setMonthlyOrderCount(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)}
                  placeholder="예: 800" />
                <div className="hint">건당 배달비 × 주문 건수로 배달비를 계산합니다.</div>
              </div>
            )}
          </div>
        )}

        {errorMsg && <div className="form-error">{errorMsg}</div>}

        <button className="calc" disabled={busy} onClick={calculate}>
          {busy ? '계산 중...' : '수수료 계산하기'}
        </button>
        <div className="api-badge">{backendOk ? '✓ 서버 연결됨 (최신 요율 적용)' : '· 오프라인 모드 (내장 요율 사용)'}</div>
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

          <div className="card" style={{ position: 'relative' }}>
            <ul className={`breakdown ${!auth.member ? 'locked' : ''}`}>
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
                          중개료 {won(r.mediationFee)} · 결제 {won(r.paymentFee)} · 배달비 {won(r.deliveryFee)}
                        </div>
                      )}
                    </div>
                    <div className="ch-amt">{won(r.fee)}<small>월 기준</small></div>
                  </li>
                );
              })}
            </ul>
            {!auth.member && (
              <div className="lock-overlay">
                <p>채널별 상세 수수료가 궁금하다면?</p>
                <button onClick={() => setShowAuth(true)}>로그인하고 전부 확인하기</button>
              </div>
            )}
          </div>

          {auth.member && <Tip result={result} cardRate={rates.cardTiers[cardTier]} />}

          <p className="disclaimer">
            ※ 본 계산은 공개 자료 기반 추정치이며, 실제 수수료는 가맹점 등급·계약·매출 구간에 따라 달라집니다.
            배달앱 중개이용료는 부가세·배달비 별도 기준입니다.
          </p>

          {auth.member && (
            <div className="share-actions">
              <button className="share-btn primary" onClick={shareLink}>
                {copied ? '✓ 링크 복사됨!' : '🔗 친구에게 공유하기'}
              </button>
              <button className="share-btn" onClick={shareResult} disabled={sharing}>
                {sharing ? '만드는 중...' : '📥 결과 이미지 저장'}
              </button>
            </div>
          )}

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
        <h2>결제 수수료 계산기</h2>
        <p>
          카드, 배달앱, 간편결제 등 가맹점이 사용하는 모든 결제 채널에는 수수료가 붙습니다.
          이 계산기는 업종과 월매출, 채널 비중만 입력하면 우리 가게가 <b>1년에 내는 결제 수수료</b>를
          채널별로 나눠서 계산해줍니다.
        </p>
        <h3>이런 걸 계산할 수 있어요</h3>
        <ul>
          <li>카드 우대수수료 (연매출 구간별 0.5~2.0%)</li>
          <li>간편결제 수수료</li>
          <li>배달앱 수수료 (배민·쿠팡이츠·요기요, 중개료+결제수수료+배달비 실비용)</li>
          <li>채널별 수수료 비교 — 어디서 가장 많이 나가는지</li>
        </ul>
        <p className="seo-note">
          ※ 수수료율은 공개 자료 기반 추정치이며, 실제 요율은 계약·가맹점 등급에 따라 달라질 수 있습니다.
        </p>
      </section>

      <footer>© 결제 수수료 계산기 · 참고용 추정치</footer>

      {showAuth && (
        <AuthModal auth={auth} onClose={() => setShowAuth(false)}
          onDone={(m) => { applyMember(m); setShowAuth(false); }} />
      )}
    </div>
  );
}

function Tip({ result, cardRate }: { result: FeeResponse; cardRate: number }) {
  const worst = result.lines[0];
  if (!worst) return null;
  const saveYear = worst.channelRevenue * 0.1 * Math.max(0, worst.rate - cardRate) * 12;
  return (
    <div className="tip">
      💡 <b>{worst.label}</b>의 수수료 부담이 가장 큽니다.{' '}
      {saveYear > 0
        ? <>이 채널 비중을 10%만 카드결제로 옮겨도 연간 <b>{won(saveYear)}</b> 이상 아낄 수 있어요.</>
        : '현재 채널 구성은 수수료 효율이 좋은 편입니다.'}
    </div>
  );
}
