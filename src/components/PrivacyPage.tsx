import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';

export function PrivacyPage() {
  return (
    <>
      <Head>
        <title>개인정보처리방침 | showmefee</title>
        <meta name="description" content="showmefee의 개인정보처리방침입니다. 수집하는 정보, 이용 목적, 보관 기간 등을 안내합니다." />
        <link rel="canonical" href="https://showmefee.com/privacy" />
      </Head>
      <div className="wrap">
        <div className="topbar">
          <Link className="icon-btn" to="/">← 계산기로 돌아가기</Link>
        </div>

        <header>
          <h1>개인정보처리방침</h1>
          <p>최종 업데이트: 2026년 1월 1일</p>
        </header>

        <section className="seo-content">
          <h2>1. 개요</h2>
          <p>
            showmefee(이하 "서비스")는 이용자의 개인정보를 중요하게 생각하며,
            「개인정보 보호법」 및 관련 법령을 준수합니다.
            본 개인정보처리방침은 서비스가 어떤 정보를 수집하고, 어떻게 이용하며,
            어떻게 보호하는지를 안내합니다.
          </p>
        </section>

        <section className="seo-content">
          <h2>2. 수집하는 정보</h2>
          <h3>자동 수집 정보</h3>
          <p>서비스 이용 과정에서 아래 정보가 자동으로 수집될 수 있습니다.</p>
          <ul>
            <li>브라우저 종류 및 버전</li>
            <li>운영체제 정보</li>
            <li>접속 IP 주소 (익명화 처리)</li>
            <li>페이지 방문 기록 및 체류 시간</li>
            <li>유입 경로(검색어, 참조 URL)</li>
          </ul>
          <h3>이용자가 입력하는 정보</h3>
          <p>
            수수료 계산을 위해 입력하는 월 매출, 채널 비중, 매출 등급 등은
            서버로 전송되지 않으며, 브라우저 내에서만 처리됩니다.
            해당 정보는 저장되거나 외부로 공유되지 않습니다.
          </p>
          <h3>피드백 제출 시</h3>
          <p>
            이용자가 피드백 양식을 통해 의견을 남기는 경우,
            입력한 내용(의견 텍스트)이 수집될 수 있습니다.
            이 경우 이메일 주소 등 별도 개인식별정보는 수집하지 않습니다.
          </p>
        </section>

        <section className="seo-content">
          <h2>3. 정보 이용 목적</h2>
          <p>수집된 정보는 다음 목적으로만 이용됩니다.</p>
          <ul>
            <li>서비스 품질 개선 및 오류 분석</li>
            <li>이용자 경험 개선을 위한 통계 분석</li>
            <li>피드백 검토 및 서비스 반영</li>
          </ul>
          <p>수집된 정보는 마케팅, 광고 타겟팅, 제3자 판매 등에 이용되지 않습니다.</p>
        </section>

        <section className="seo-content">
          <h2>4. 쿠키 및 유사 기술</h2>
          <p>
            서비스는 이용자 설정(다크/라이트 테마 등)을 저장하기 위해
            브라우저의 로컬스토리지를 사용합니다. 이 데이터는 이용자의 기기에만 저장되며
            서버로 전송되지 않습니다.
          </p>
          <p>
            서비스는 Google Analytics 등 분석 도구를 사용할 수 있으며,
            이를 통해 익명화된 방문 통계를 수집합니다.
            Google의 개인정보 처리 방침은{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              Google 개인정보처리방침
            </a>에서 확인하실 수 있습니다.
          </p>
          <h3>광고 (Google 애드센스)</h3>
          <p>
            서비스는 Google 애드센스를 통한 광고를 게재할 수 있습니다.
            Google은 광고 게재를 위해 쿠키를 사용할 수 있으며,
            이용자는 <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Google 광고 설정</a>에서
            맞춤 광고를 비활성화할 수 있습니다.
          </p>
        </section>

        <section className="seo-content">
          <h2>5. 정보 보관 및 파기</h2>
          <p>
            자동 수집되는 분석 데이터는 최대 26개월간 보관 후 자동 삭제됩니다.
            이용자가 직접 입력하는 계산 데이터는 서버에 저장되지 않으므로
            별도의 파기 절차가 필요하지 않습니다.
          </p>
        </section>

        <section className="seo-content">
          <h2>6. 제3자 제공</h2>
          <p>
            서비스는 수집된 개인정보를 원칙적으로 제3자에게 제공하지 않습니다.
            다만, 법령에 따른 수사기관의 요청 등 법적 의무가 있는 경우에는 예외가 적용될 수 있습니다.
          </p>
        </section>

        <section className="seo-content">
          <h2>7. 이용자 권리</h2>
          <p>이용자는 다음과 같은 권리를 가집니다.</p>
          <ul>
            <li>개인정보 처리 현황 열람 요청</li>
            <li>개인정보 정정·삭제 요청</li>
            <li>개인정보 처리 정지 요청</li>
          </ul>
          <p>
            관련 요청은 서비스 내 피드백 기능 또는 운영자에게 문의해 주세요.
          </p>
        </section>

        <section className="seo-content">
          <h2>8. 방침 변경 안내</h2>
          <p>
            본 개인정보처리방침은 법령 변경 또는 서비스 변경에 따라 업데이트될 수 있습니다.
            변경 시 서비스 내 공지 또는 본 페이지 상단의 날짜를 통해 안내드립니다.
          </p>
        </section>

        <section className="seo-content">
          <h2>9. 문의</h2>
          <p>
            개인정보 관련 문의는 서비스 내 피드백 버튼을 통해 연락해 주세요.
            운영자: DevForIn · 서비스: showmefee.com
          </p>
        </section>

        <footer style={{ textAlign: 'center', color: 'var(--gray)', fontSize: 12, marginTop: 30 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
            <Link to="/about" style={{ color: 'var(--gray)', textDecoration: 'none' }}>서비스 소개</Link>
            <Link to="/privacy" style={{ color: 'var(--gray)', textDecoration: 'none' }}>개인정보처리방침</Link>
            <Link to="/disclaimer" style={{ color: 'var(--gray)', textDecoration: 'none' }}>면책고지</Link>
          </div>
          © 2026 showmefee · 결제 수수료 계산기 · by DevForIn
        </footer>
      </div>
    </>
  );
}
