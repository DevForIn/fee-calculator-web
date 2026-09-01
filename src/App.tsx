import { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import { useAuth } from './useAuth';
import { AuthModal } from './components/AuthModal';
import type {
  CardTier, DeliveryTier, Industry, FeeResponse, FeeLine, RatesResponse, Member,
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
  labels: CHANNEL_NAMES,
};

export default function App() {
  const auth = useAuth();

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
  const [result, setResult] = useState<FeeResponse | null>(null);
  const [busy, setBusy] = useState(false);

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
    const push = (ch: keyof Percents, rate: number) => {
      if (percents[ch] <= 0) return;
      const channelRevenue = Math.round((revenue * percents[ch]) / 100);
      const fee = Math.round(channelRevenue * rate);
      lines.push({ channel: ch, label: rates.labels[ch], rate, channelRevenue, fee });
    };
    push('card', cardRate);
    push('baemin', rates.delivery.baemin[deliveryTier]);
    push('coupang', rates.delivery.coupang[deliveryTier]);
    push('yogiyo', rates.delivery.yogiyo[deliveryTier]);
    push('pay', rates.payRate);
    const monthlyTotalFee = lines.reduce((a, b) => a + b.fee, 0);
    lines.sort((a, b) => b.fee - a.fee);
    return { monthlyTotalFee, yearlyTotalFee: monthlyTotalFee * 12, lines };
  }

  async function calculate() {
    if (total !== 100) { alert('결제 채널 비중 합계를 100%로 맞춰주세요.'); return; }
    if (revenue <= 0) { alert('월 매출을 입력해주세요.'); return; }
    setBusy(true);
    try {
      const req = {
        industry, monthlyRevenue: revenue,
        cardPercent: percents.card, baeminPercent: percents.baemin,
        coupangPercent: percents.coupang, yogiyoPercent: percents.yogiyo,
        payPercent: percents.pay, cardTier, deliveryTier,
      };
      const res = backendOk ? await api.calculate(req) : calcLocal();
      setResult(res);
    } catch {
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
        <p>카드·배달앱 3사·간편결제까지 한 번에 계산해드려요.</p>
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

        <button className="calc" disabled={busy} onClick={calculate}>
          {busy ? '계산 중...' : '수수료 계산하기'}
        </button>
        <div className="api-badge">{backendOk ? '✓ 서버 연결됨 (최신 요율 적용)' : '· 오프라인 모드 (내장 요율 사용)'}</div>
      </div>

      {result && (
        <div id="result">
          <div className="headline">
            <div className="small">이 매출 기준, 당신이 1년에 내는 수수료는</div>
            <div className="big"><span>{won(result.yearlyTotalFee)}</span></div>
            <div className="small">월 {won(result.monthlyTotalFee)}</div>
          </div>

          <div className="card" style={{ position: 'relative' }}>
            <ul className={`breakdown ${!auth.member ? 'locked' : ''}`}>
              {result.lines.map((r, i) => {
                let sub: string;
                if (DELIVERY_CHANNELS.includes(r.channel))
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
        </div>
      )}

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
