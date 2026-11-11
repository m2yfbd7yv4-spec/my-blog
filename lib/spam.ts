// 垃圾内容检测：含链接或广告关键词就判为垃圾
const URL_RE = /https?:\/\/|www\./i;
const SPAM_KEYWORDS = [
  "代购",
  "兼职",
  "赚钱",
  "加微信",
  "加我微信",
  "推广",
  "代刷",
  "办证",
  "贷款",
  "澳门",
  "彩票",
  "私聊",
  "威信",
  "优惠券",
  "免费领取",
];

export function isSpam(content: string): boolean {
  return URL_RE.test(content) || SPAM_KEYWORDS.some((k) => content.includes(k));
}
