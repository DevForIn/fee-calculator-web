// 순수 SVG 도넛 차트 — 라이브러리 의존 없음, SSG 안전
// path arc 방식: 각 조각을 정확한 시작/끝 각도로 그려 겹침·범람 없음
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

// 극좌표 → 직교좌표 (12시 방향 0도 기준, 시계방향)
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

// 도넛 조각(ring segment) path 생성
function ringSegment(cx: number, cy: number, rOuter: number, rInner: number, startDeg: number, endDeg: number) {
  // 360도(단일 조각)면 원 두 개로 그림 (path arc는 360도 못 그림)
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  const oStart = polar(cx, cy, rOuter, startDeg);
  const oEnd = polar(cx, cy, rOuter, endDeg);
  const iEnd = polar(cx, cy, rInner, endDeg);
  const iStart = polar(cx, cy, rInner, startDeg);
  return [
    `M ${oStart.x} ${oStart.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${oEnd.x} ${oEnd.y}`,
    `L ${iEnd.x} ${iEnd.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${iStart.x} ${iStart.y}`,
    'Z',
  ].join(' ');
}

export function DonutChart({ slices, size = 180 }: Props) {
  const total = slices.reduce((a, b) => a + b.value, 0);
  const positive = slices.filter((s) => s.value > 0);
  if (total <= 0 || positive.length === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size / 2;
  const rInner = size / 2 - size * 0.18;
  const gap = positive.length > 1 ? 2 : 0; // 조각 사이 각도 간격(도)

  // 시작 각도를 누적하며 각 조각의 정확한 start/end 계산
  let angle = 0;
  const segments = positive.map((s) => {
    const sweep = (s.value / total) * 360;
    const start = angle + gap / 2;
    const end = angle + sweep - gap / 2;
    angle += sweep;
    return { color: s.color, start: Math.min(start, end), end: Math.max(start, end) };
  });

  // 단일 조각(100%)은 도넛 링 자체로 표현
  const single = positive.length === 1;

  return (
    <div className="donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
           aria-label="채널별 수수료 비중 도넛 차트">
        {single ? (
          <>
            <circle cx={cx} cy={cy} r={(rOuter + rInner) / 2} fill="none"
              stroke={positive[0].color} strokeWidth={rOuter - rInner} />
          </>
        ) : (
          segments.map((seg, i) => (
            <path key={i} d={ringSegment(cx, cy, rOuter, rInner, seg.start, seg.end)}
              fill={seg.color} />
          ))
        )}
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
