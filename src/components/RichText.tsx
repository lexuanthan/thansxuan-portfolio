import type { ReactNode } from "react";

/**
 * Render text nhiều đoạn với hỗ trợ **in đậm**.
 * Cố tình KHÔNG dùng dangerouslySetInnerHTML để tránh XSS.
 */
export default function RichText({
  text,
  className = "",
  paragraphClassName = "",
}: {
  text: string;
  className?: string;
  paragraphClassName?: string;
}) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className={className}>
      {paragraphs.map((p, i) => (
        <p key={i} className={paragraphClassName}>
          {renderBold(p)}
        </p>
      ))}
    </div>
  );
}

function renderBold(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="font-semibold text-blue-600">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
