import { useEffect, useState } from 'react';
import { api, type StatsSummary } from '../api';
import { won, CHANNEL_NAMES } from '../utils';

const INDUSTRY_LABEL: Record<string, string> = {
  food: '음식점', cafe: '카페/제과', retail: '소매/편의점',
  online: '온라인 쇼핑몰', service: '서비스업/기타', unknown: '미지정',
};

export function AdminDashboard() {
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [err, setErr] = useState('');
  const [pw, setPw] = useState('');
  const [authed, setAuthed] = useState(false);

  async function login() {
    setErr('');
    try {
      const s = await api.getStats(pw);
      setStats(s);
      setAuthed(true);
      sessionStorage.setItem('admin-pw', pw);
    } catch (e) {
      setErr(e instanceof Error ? e.message : '인증 실패');
    }
  }

  // 세션에 저장된 비번으로 자동 로그인 시도
  useEffect(() => {
    const saved = sessionStorage.getItem('admin-pw');
    if (saved) {
      api.getStats(saved).then((s) => { setStats(s); setAuthed(true); }).catch(() => {});
    }
  }, []);

  // 로그인 게이트
  if (!authed) {
    return (
      <div className="wrap">
        <header><h1 style={{ fontSize: 22 }}>🔒 관리자</h1><p>통계를 보려면 비밀번호를 입력하세요.</p></header>
        <div className="card">
          <div className="field">
            <input className="text-input" type="password" placeholder="관리자 비밀번호"
              value={pw} onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && login()} />
          </div>
          {err && <div className="form-error">{err}</div>}
          <button className="calc" onClick={login}>확인</button>
        </div>
      </div>
    );
  }

  if (!stats) return <div className="wrap"><p style={{ padding: 40, textAlign: 'center' }}>불러오는 중...</p></div>;

  const maxIndustry = Math.max(1, ...stats.byIndustry.map((i) => Number(i.count)));

  return (
    <div className="wrap">
      <header>
        <h1 style={{ fontSize: 22 }}>📊 관리자 통계</h1>
        <p>showmefee 이용 현황</p>
      </header>

      <div className="stat-grid">
        <div className="stat-box">
          <div className="stat-label">총 계산 횟수</div>
          <div className="stat-value">{stats.totalCalculations.toLocaleString('ko-KR')}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">가입 회원</div>
          <div className="stat-value">{stats.totalMembers.toLocaleString('ko-KR')}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">평균 월매출</div>
          <div className="stat-value sm">{won(stats.avgMonthlyRevenue ?? 0)}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">평균 월수수료</div>
          <div className="stat-value sm">{won(stats.avgMonthlyFee ?? 0)}</div>
        </div>
      </div>

      <div className="card">
        <label>업종별 계산 횟수</label>
        <div className="bar-list">
          {stats.byIndustry.map((i) => (
            <div className="bar-row" key={i.industry}>
              <span className="bar-name">{INDUSTRY_LABEL[i.industry] ?? i.industry}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(Number(i.count) / maxIndustry) * 100}%` }} />
              </div>
              <span className="bar-count">{i.count}</span>
            </div>
          ))}
        </div>
      </div>

      {stats.avgChannelMix && (
        <div className="card">
          <label>평균 결제 채널 비중</label>
          <div className="bar-list">
            {(Object.keys(stats.avgChannelMix) as (keyof typeof stats.avgChannelMix)[]).map((ch) => (
              <div className="bar-row" key={ch}>
                <span className="bar-name">{CHANNEL_NAMES[ch]}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${stats.avgChannelMix![ch]}%` }} />
                </div>
                <span className="bar-count">{stats.avgChannelMix![ch]}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <footer>© showmefee 관리자</footer>
    </div>
  );
}
