import type { RouteRecord } from 'vite-react-ssg';
import App from './App';
import { LandingPage } from './components/LandingPage';
import { ScrollToTop } from './components/ScrollToTop';
import { AboutPage } from './components/AboutPage';
import { PrivacyPage } from './components/PrivacyPage';
import { DisclaimerPage } from './components/DisclaimerPage';
import { LANDINGS } from './landings';

export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <ScrollToTop />,
    children: [
      { index: true, element: <App />, entry: 'src/App.tsx' },
      { path: 'about', element: <AboutPage />, entry: 'src/components/AboutPage.tsx' },
      { path: 'privacy', element: <PrivacyPage />, entry: 'src/components/PrivacyPage.tsx' },
      { path: 'disclaimer', element: <DisclaimerPage />, entry: 'src/components/DisclaimerPage.tsx' },
      // SEO 랜딩: config 기반으로 각 slug 라우트 생성
      ...LANDINGS.map((cfg) => ({
        path: cfg.slug,
        element: <LandingPage config={cfg} />,
        entry: 'src/components/LandingPage.tsx',
      })),
    ],
  },
];
