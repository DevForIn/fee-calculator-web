// 사이트 하단 의견/버그 신고 버튼 (구글 폼 연결)
// 폼 URL은 .env의 VITE_FEEDBACK_URL 로 주입. 없으면 버튼 숨김.

export function FeedbackBar() {
  const url = import.meta.env.VITE_FEEDBACK_URL as string | undefined;
  if (!url) return null;
  return (
    <div className="feedback-bar">
      <span>개선 아이디어·버그·기능 요청이 있으신가요?</span>
      <a href={url} target="_blank" rel="noopener noreferrer" className="feedback-btn">
        의견 보내기
      </a>
    </div>
  );
}
