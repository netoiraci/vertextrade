import React from "react";

interface MarkdownTextProps {
  content: string;
  className?: string;
}

/**
 * Renders text with basic markdown support (bold with **)
 */
export const MarkdownText: React.FC<MarkdownTextProps> = ({ content, className = "" }) => {
  // Split by ** and alternate between regular and bold text
  const parts = content.split(/\*\*(.*?)\*\*/g);
  
  return (
    <div className={`whitespace-pre-wrap leading-relaxed ${className}`}>
      {parts.map((part, index) => {
        // Odd indices are the content that was between ** markers (should be bold)
        if (index % 2 === 1) {
          return (
            <strong key={index} className="font-semibold">
              {part}
            </strong>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </div>
  );
};
