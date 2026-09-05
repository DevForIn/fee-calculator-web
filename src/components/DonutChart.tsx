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

// 채널별 팔레트 (배달=붉은계열, 카드=파랑, 간편결제=보라 등 직관적으로)
export const CHANNEL_COLORS: Record<string, string> = {
  card: '#4a7cff',
  baemin: '#35c5f0',
  coupang: '#ff6b6b',
  yogiyo: '#ff5a5f',
  pay: '#9b7bff',
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

  let offset = 0;
  const arcs = positive.map((s) => {
    const frac = s.value / total;
    const dash = frac * circumference;
    const arc = {
      color: s.color,
      dashArray: `${dash} ${circumference - dash}`,
      dashOffset: -offset,
    };
    offset += dash;
    return arc;
  });

  return (
    <div className="donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
           aria-label="채널별 수수료 비중 도넛 차트">
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          {arcs.map((a, i) => (
            <circle key={i} cx={cx} cy={cy} r={radius}
              fill="none" stroke={a.color} strokeWidth={stroke}
              strokeDasharray={a.dashArray} strokeDashoffset={a.dashOffset} />
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
