// 순수 SVG 도넛 차트 — 라이브러리 의존 없음, SSG 안전
import { won } from '../utils';

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface Props {
  slices: DonutSlice[];
  size?: number;
}

// 채널별 팔레트 — 서로 확실히 대비되는 색
export const CHANNEL_COLORS: Record<string, string> = {
  card: '#2563eb',    // 진한 파랑
  baemin: '#14b8a6',  // 청록(teal)
  coupang: '#f59e0b', // 주황(amber)
  yogiyo: '#ef4444',  // 빨강
  pay: '#a855f7',     // 보라
};

export function DonutChart({ slices, size = 180 }: Props) {
  const total = slices.reduce((a, b) => a + b.value, 0);
  const positive = slices.filter((s) => s.value > 0);
  if (total <= 0 || positive.length === 0) return null;

  const stroke = size * 0.18;
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  // 각 조각의 시작 오프셋(%)과 길이(%) — 부동소수점 이음새 방지를 위해 누적 비율로 계산
  let acc = 0;
  const arcs = positive.map((s) => {
    const frac = s.value / total;
    const dash = frac * circumference;
    const arc = {
      color: s.color,
      dash,
      offset: -acc * circumference,
    };
    acc += frac;
    return arc;
  });

  return (
    <div className="donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
           aria-label="채널별 수수료 비중 도넛 차트">
        {/* 배경 트랙 (틈이 보여도 자연스럽게) */}
        <circle cx={cx} cy={cy} r={radius} fill="none"
          stroke="var(--border, #eee)" strokeWidth={stroke} />
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          {arcs.map((a, i) => (
            <circle key={i} cx={cx} cy={cy} r={radius}
              fill="none" stroke={a.color} strokeWidth={stroke}
              strokeLinecap="butt"
              strokeDasharray={`${a.dash} ${circumference - a.dash}`}
              strokeDashoffset={a.offset} />
          ))}
          {/* 조각 경계 흰 구분선 (2개 이상일 때만) — 각 조각을 또렷하게 분리 */}
          {arcs.length > 1 && arcs.map((a, i) => (
            <circle key={`sep-${i}`} cx={cx} cy={cy} r={radius}
              fill="none" stroke="var(--card-bg, #fff)" strokeWidth={stroke}
              strokeLinecap="butt"
              strokeDasharray={`2.5 ${circumference - 2.5}`}
              strokeDashoffset={a.offset} />
          ))}
        </g>
        <text x={cx} y={cy - 6} textAnchor="middle" className="donut-center-label">월 수수료</text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="donut-center-value">{won(total)}</text>
      </svg>
      <ul className="donut-legend">
        {positive.map((s) => (
          <li key={s.label}>
            <span className="dot" style={{ background: s.color }} />
            <span className="lg-name">{s.label}</span>
            <span className="lg-pct">{Math.round((s.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
