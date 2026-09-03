import type { RouteRecord } from 'vite-react-ssg';
import App from './App';
import { AdminDashboard } from './components/AdminDashboard';
import { LandingPage } from './components/LandingPage';
import { LANDINGS } from './landings';

// 메인(/)은 종합 계산기, ?admin=1이면 관리자
function Home() {
  const isAdmin = typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('admin') === '1';
  return isAdmin ? <AdminDashboard /> : <App />;
}

export const routes: RouteRecord[] = [
  { path: '/', element: <Home />, entry: 'src/App.tsx' },
  // SEO 랜딩: config 기반으로 각 slug 라우트 생성
  ...LANDINGS.map((cfg) => ({
    path: `/${cfg.slug}`,
    element: <LandingPage config={cfg} />,
    entry: 'src/components/LandingPage.tsx',
  })),
];
