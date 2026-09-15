import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';

export function DisclaimerPage() {
  return (
    <>
      <Head>
        <title>면책고지 | showmefee</title>
        <meta name="description" content="showmefee 결제 수수료 계산기의 면책고지입니다. 계산 결과는 추정치이며 실제 수수료와 다를 수 있습니다." />
        <link rel="canonical" href="https://showmefee.com/disclaimer" />
      </Head>
      <div className="wrap">
        <div className="topbar">
          <Link className="icon-btn" to="/">← 계산기로 돌아가기</Link>
        </div>

        <header>
          <h1>면책고지</h1>
          <p>이용 전 반드시 확인해 주세요</p>
        </header>

        <section className="seo-content">
          <h2>1. 정보의 정확성</h2>
          <p>
            showmefee(이하 "서비스")에서 제공하는 모든 수수료율, 계산 결과, 관련 정보는
            금융위원회, 여신금융협회, 각 플랫폼의 공개 발표 자료를 바탕으로 한
            <b> 참고용 추정치</b>입니다.
          </p>
          <p>
            실제 결제 수수료는 다음 요인에 따라 계산 결과와 다를 수 있습니다.
          </p>
          <ul>
            <li>가맹점 등급 및 계약 조건</li>
            <li>결제수단(신용카드·체크카드·선불충전금 등) 구분</li>
            <li>플랫폼 프로모션 및 할인 적용 여부</li>
            <li>부가가치세(VAT) 적용 여부</li>
            <li>수수료율 정책 변경</li>
            <li>지역, 업종, 가맹점 규모 등 개별 조건</li>
          </ul>
        </section>

        <section className="seo-content">
          <h2>2. 전문 상담 권고</h2>
          <p>
            본 서비스의 계산 결과는 자영업자·소상공인이 결제 수수료를 대략적으로 파악하는 데 도움을 주기 위한
            참고 도구입니다. 실제 납부 수수료 확인, 계약 조건 검토, 수수료 절감 전략 수립 등
            중요한 의사결정을 위해서는 반드시 해당 카드사, 플랫폼의 공식 채널, 또는 전문가와 상담하시기 바랍니다.
          </p>
        </section>

        <section className="seo-content">
          <h2>3. 책임의 한계</h2>
          <p>
            서비스 운영자(DevForIn)는 본 서비스의 정보 이용으로 인해 발생하는
            직접적·간접적 손해에 대해 법적 책임을 지지 않습니다.
            서비스 이용자는 본 면책고지에 동의한 것으로 간주됩니다.
          </p>
          <p>
            서비스는 계산 결과의 정확성을 위해 지속적으로 자료를 업데이트하고 있으나,
            수수료율 정책 변경이 즉시 반영되지 않을 수 있습니다.
            최신 정보는 각 카드사·플랫폼의 공식 홈페이지에서 확인하시기 바랍니다.
          </p>
        </section>

        <section className="seo-content">
          <h2>4. 외부 링크</h2>
          <p>
            서비스 내 외부 링크(카드사, 플랫폼 공식 사이트 등)는 참고 목적으로 제공됩니다.
            외부 사이트의 내용 및 개인정보 처리에 대해서는 해당 사이트의 방침이 적용되며,
            서비스 운영자는 이에 대한 책임을 지지 않습니다.
          </p>
        </section>

        <section className="seo-content">
          <h2>5. 광고</h2>
          <p>
            서비스는 Google 애드센스를 통한 광고를 게재합니다.
            광고 내용은 Google의 알고리즘에 의해 자동으로 선정되며,
            서비스 운영자가 특정 광고주를 추천하거나 보증하는 것이 아닙니다.
            광고를 통해 구매·계약 시 발생하는 문제에 대해 서비스 운영자는 책임지지 않습니다.
          </p>
        </section>

        <section className="seo-content">
          <h2>6. 저작권</h2>
          <p>
            서비스에 포함된 계산 로직, 디자인, 텍스트 콘텐츠의 저작권은 DevForIn에 있습니다.
            서비스 내용의 무단 복제, 재배포, 상업적 이용을 금합니다.
            단, 개인적 참고 목적의 인용 및 공유는 출처 표기 시 허용됩니다.
          </p>
        </section>

        <section className="seo-content">
          <h2>7. 준거법</h2>
          <p>
            본 면책고지 및 서비스 이용과 관련된 분쟁은 대한민국 법률을 준거법으로 하며,
            관할 법원은 대한민국 법원으로 합니다.
          </p>
        </section>

        <section className="seo-content">
          <h2>공식 수수료 확인처</h2>
          <p>정확한 수수료는 아래 공식 채널에서 확인하세요.</p>
          <ul>
            <li><a href="https://www.fsc.go.kr" target="_blank" rel="noopener noreferrer">금융위원회 공식 사이트</a> — 카드 우대수수료율 고시</li>
            <li><a href="https://www.baemin.com" target="_blank" rel="noopener noreferrer">배달의민족 사장님 광장</a> — 배민 수수료 안내</li>
            <li><a href="https://www.coupangeats.com" target="_blank" rel="noopener noreferrer">쿠팡이츠 파트너</a> — 쿠팡이츠 수수료 안내</li>
            <li><a href="https://self.yogiyo.co.kr" target="_blank" rel="noopener noreferrer">요기요 사장님</a> — 요기요 수수료 안내</li>
            <li><a href="https://sell.smartstore.naver.com" target="_blank" rel="noopener noreferrer">네이버 스마트스토어센터</a> — 스마트스토어 수수료 안내</li>
          </ul>
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
