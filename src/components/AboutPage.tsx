import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';

export function AboutPage() {
  return (
    <>
      <Head>
        <title>서비스 소개 | showmefee - 결제 수수료 계산기</title>
        <meta name="description" content="showmefee는 자영업자·소상공인을 위한 무료 결제 수수료 계산기입니다. 카드·배달앱·간편결제 수수료를 한눈에 확인하세요." />
        <link rel="canonical" href="https://showmefee.com/about" />
      </Head>
      <div className="wrap">
        <div className="topbar">
          <Link className="icon-btn" to="/">← 계산기로 돌아가기</Link>
        </div>

        <header>
          <h1>showmefee 소개</h1>
          <p>자영업자·소상공인을 위한 무료 결제 수수료 계산기</p>
        </header>

        <section className="seo-content">
          <h2>showmefee는 어떤 서비스인가요?</h2>
          <p>
            <b>showmefee</b>는 "내가 내는 결제 수수료, 얼마일까?"라는 질문에서 시작한 서비스입니다.
            음식점, 카페, 소매점 등을 운영하는 자영업자·소상공인이 카드·배달앱·간편결제 등
            각종 결제 채널에서 실제로 얼마의 수수료를 내고 있는지 쉽고 빠르게 계산할 수 있도록 만들었습니다.
          </p>
          <p>
            복잡한 수수료 구조를 일일이 찾아볼 필요 없이, 월 매출과 채널 비중만 입력하면
            채널별 수수료를 자동으로 계산해 연간 부담 금액까지 보여줍니다.
            모든 기능은 <b>무료</b>이며, 회원가입 없이 바로 사용할 수 있습니다.
          </p>
        </section>

        <section className="seo-content">
          <h2>어떤 수수료를 계산할 수 있나요?</h2>
          <p>현재 showmefee에서 계산 가능한 결제 채널은 다음과 같습니다.</p>
          <ul>
            <li><b>카드 수수료</b> — 연매출 구간별 우대수수료율 (0.5%~2.0%) 적용</li>
            <li><b>배달의민족(배민)</b> — 중개이용료 + 결제수수료 + 건당 배달비 실비용</li>
            <li><b>쿠팡이츠</b> — 중개이용료 + 결제수수료 + 건당 배달비 실비용</li>
            <li><b>요기요</b> — 주문 규모별 차등 수수료 (4.7%~9.7%)</li>
            <li><b>네이버페이</b> — 매출등급별 결제 수수료 (0.9%~2.3%)</li>
            <li><b>카카오페이</b> — 매출등급별 결제 수수료 (0.2%~2.0%)</li>
            <li><b>스마트스토어</b> — 주문관리+결제 통합 수수료 + 쇼핑연동 2%</li>
          </ul>
          <p>
            앞으로도 자영업자에게 실질적으로 도움이 되는 기능을 지속적으로 추가할 예정입니다.
          </p>
        </section>

        <section className="seo-content">
          <h2>왜 만들었나요?</h2>
          <p>
            가게를 운영하다 보면 카드사, 배달앱, 간편결제사 등 수수료를 내는 곳이 여러 군데입니다.
            그런데 각각의 수수료율을 직접 찾아보고, 계산하고, 합산하는 일은 생각보다 번거롭습니다.
          </p>
          <p>
            특히 배달앱 수수료는 "중개이용료만 몇 %"라고 알려져 있지만,
            실제로는 결제수수료와 건당 배달비까지 합산하면 매출 대비 20~30%에 달하는 경우도 있습니다.
            이런 정보를 투명하게 보여주고, 수수료 절감 포인트를 찾을 수 있도록 돕기 위해 showmefee를 만들었습니다.
          </p>
        </section>

        <section className="seo-content">
          <h2>계산 결과는 얼마나 정확한가요?</h2>
          <p>
            showmefee의 계산 결과는 금융위원회, 여신금융협회, 각 플랫폼의 공개 자료를 바탕으로 한
            <b> 추정치</b>입니다. 실제 수수료는 가맹점 등급, 계약 조건, 프로모션,
            결제수단 등에 따라 달라질 수 있습니다.
          </p>
          <p>
            정확한 수수료는 각 카드사 또는 플랫폼의 가맹점 센터, 담당자를 통해 확인하시기 바랍니다.
            본 서비스는 참고용 계산 도구이며, 실제 계약·납부 금액과 차이가 있을 수 있습니다.
            자세한 내용은 <Link to="/disclaimer">면책고지</Link>를 참고해 주세요.
          </p>
        </section>

        <section className="seo-content">
          <h2>운영자 정보</h2>
          <p>
            showmefee는 <b>DevForIn</b>이 개발·운영하는 서비스입니다.
            서비스 관련 문의나 피드백은 사이트 내 피드백 버튼을 통해 보내주세요.
            수수료 정보 오류, 개선 제안 등 모든 의견을 환영합니다.
          </p>
          <p>
            본 서비스에서 제공하는 정보는 공익적 목적의 참고 자료이며,
            특정 플랫폼이나 카드사를 홍보하거나 비방하는 의도가 없음을 밝힙니다.
          </p>
        </section>

        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 14, marginBottom: 14 }}>결제 수수료, 지금 바로 계산해보세요.</p>
          <Link className="calc" to="/" style={{ display: 'block', textDecoration: 'none', textAlign: 'center' }}>
            수수료 계산하기 →
          </Link>
        </div>

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
