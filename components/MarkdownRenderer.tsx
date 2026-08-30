import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

// 普通作者不熟悉 Markdown 的「空行才分段」规则，往往只用一个回车换行，
// 结果整篇文字被挤进同一个段落。这里把「两个普通文本行之间的单个换行」
// 自动转成空行（= 分段），但保留列表、引用、标题、代码块、表格、分隔线
// 等块级结构原有的换行，避免破坏这些 Markdown 语义。
function autoParagraph(md: string): string {
  const lines = md.split(/\r?\n/);
  const isBlock = (line: string) =>
    /^(\s*(?:[-*+]\s|\d+[.)、]\s|>\s?|#{1,6}\s|```|~~~|\|))/.test(line) ||
    /^\s*([-*_])\1{2,}\s*$/.test(line); // --- / *** / ___
  let out = "";
  for (let i = 0; i < lines.length; i++) {
    out += lines[i];
    if (i === lines.length - 1) continue;
    const cur = lines[i];
    const nxt = lines[i + 1];
    const blank = cur.trim() === "" || nxt.trim() === "";
    const block = isBlock(cur) || isBlock(nxt);
    out += blank || block ? "\n" : "\n\n";
  }
  return out;
}

// 安全渲染 Markdown：禁用原始 HTML，防止 XSS 脚本注入
export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
      >
        {autoParagraph(content)}
      </ReactMarkdown>
    </div>
  );
}
