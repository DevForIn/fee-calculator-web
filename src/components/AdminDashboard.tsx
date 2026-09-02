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

  useEffect(() => {
    api.getStats().then(setStats).catch((e) =>
      setErr(e instanceof Error ? e.message : '통계 로드 실패'));
  }, []);

  if (err) return <div className="wrap"><p className="form-error">{err}</p></div>;
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
