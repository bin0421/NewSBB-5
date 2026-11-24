/** 입력값 길이 규칙. 백엔드 요청 본문의 @Size 제약과 같게 둔다. */
export type LengthRule = {
  label: string;
  min: number;
  max: number;
};

export const POST_TITLE: LengthRule = { label: "제목", min: 2, max: 100 };
export const POST_CONTENT: LengthRule = { label: "내용", min: 2, max: 5000 };
export const COMMENT_CONTENT: LengthRule = { label: "댓글 내용", min: 2, max: 100 };

/**
 * 공백을 뺀 값이 규칙에 맞는지 검사한다.
 * 맞지 않으면 사용자에게 보여줄 안내 문구를, 맞으면 null 을 돌려준다.
 * 최대 길이는 입력 칸의 maxLength 로 막으므로 여기서는 보지 않는다.
 */
export function checkLength(value: string, rule: LengthRule): string | null {
  if (value.length === 0) return `${rule.label}을 입력해주세요.`;
  if (value.length < rule.min)
    return `${rule.label}을 ${rule.min}자 이상 입력해주세요.`;

  return null;
}

/**
 * 입력 칸의 앞뒤 공백을 지우고 규칙을 검사한다.
 * 맞지 않으면 경고를 띄우고 그 칸에 포커스를 준 뒤 false 를 돌려준다.
 */
export function validateField(
  field: HTMLInputElement | HTMLTextAreaElement,
  rule: LengthRule,
): boolean {
  field.value = field.value.trim();

  const message = checkLength(field.value, rule);
  if (message == null) return true;

  alert(message);
  field.focus();

  return false;
}
