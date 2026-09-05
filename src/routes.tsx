import type { RouteRecord } from 'vite-react-ssg';
import App from './App';
import { LandingPage } from './components/LandingPage';
import { LANDINGS } from './landings';

export const routes: RouteRecord[] = [
  { path: '/', element: <App />, entry: 'src/App.tsx' },
  // SEO 랜딩: config 기반으로 각 slug 라우트 생성
  ...LANDINGS.map((cfg) => ({
    path: `/${cfg.slug}`,
    element: <LandingPage config={cfg} />,
    entry: 'src/components/LandingPage.tsx',
  })),
];
