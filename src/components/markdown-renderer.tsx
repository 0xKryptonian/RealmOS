import { ReactNode } from 'react';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const parseMarkdown = (text: string): ReactNode[] => {
    const lines = text.split('\n');
    const elements: ReactNode[] = [];
    let listItems: ReactNode[] = [];
    let listType: 'ul' | 'ol' | null = null;
    let currentListKey = 0;

    const flushList = () => {
      if (listItems.length > 0) {
        if (listType === 'ol') {
          elements.push(
            <ol key={`list-${currentListKey++}`} className="list-decimal list-inside space-y-2 my-3 ml-4">
              {listItems}
            </ol>
          );
        } else if (listType === 'ul') {
          elements.push(
            <ul key={`list-${currentListKey++}`} className="list-disc list-inside space-y-2 my-3 ml-4">
              {listItems}
            </ul>
          );
        }
        listItems = [];
        listType = null;
      }
    };

    const parseInlineMarkdown = (text: string): ReactNode[] => {
      const parts: ReactNode[] = [];
      let remaining = text;
      let key = 0;

      while (remaining.length > 0) {
        // Bold text **text**
        const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
        if (boldMatch) {
          parts.push(
            <strong key={`bold-${key++}`} className="font-bold text-white">
              {boldMatch[1]}
            </strong>
          );
          remaining = remaining.slice(boldMatch[0].length);
          continue;
        }

        // Italic text *text*
        const italicMatch = remaining.match(/^\*(.+?)\*/);
        if (italicMatch) {
          parts.push(
            <em key={`italic-${key++}`} className="italic text-gray-300">
              {italicMatch[1]}
            </em>
          );
          remaining = remaining.slice(italicMatch[0].length);
          continue;
        }

        // Inline code `code`
        const codeMatch = remaining.match(/^`(.+?)`/);
        if (codeMatch) {
          parts.push(
            <code
              key={`code-${key++}`}
              className="bg-zinc-800 text-[#98ee2c] px-1.5 py-0.5 rounded text-sm font-mono"
            >
              {codeMatch[1]}
            </code>
          );
          remaining = remaining.slice(codeMatch[0].length);
          continue;
        }

        // Links [text](url)
        const linkMatch = remaining.match(/^\[(.+?)\]\((.+?)\)/);
        if (linkMatch) {
          parts.push(
            <a
              key={`link-${key++}`}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#98ee2c] hover:text-[#7bc922] underline"
            >
              {linkMatch[1]}
            </a>
          );
          remaining = remaining.slice(linkMatch[0].length);
          continue;
        }

        // Regular text
        const nextSpecial = remaining.search(/[\*`\[]/);
        if (nextSpecial === -1) {
          parts.push(<span key={`text-${key++}`}>{remaining}</span>);
          break;
        } else {
          parts.push(<span key={`text-${key++}`}>{remaining.slice(0, nextSpecial)}</span>);
          remaining = remaining.slice(nextSpecial);
        }
      }

      return parts;
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Empty line
      if (!trimmedLine) {
        flushList();
        elements.push(<div key={`space-${index}`} className="h-2" />);
        return;
      }

      // Headers
      if (trimmedLine.startsWith('####')) {
        flushList();
        const text = trimmedLine.replace(/^####\s*/, '');
        elements.push(
          <h4 key={`h4-${index}`} className="text-base font-bold text-white mt-4 mb-2">
            {parseInlineMarkdown(text)}
          </h4>
        );
        return;
      }

      if (trimmedLine.startsWith('###')) {
        flushList();
        const text = trimmedLine.replace(/^###\s*/, '');
        elements.push(
          <h3 key={`h3-${index}`} className="text-lg font-bold text-[#98ee2c] mt-4 mb-2">
            {parseInlineMarkdown(text)}
          </h3>
        );
        return;
      }

      if (trimmedLine.startsWith('##')) {
        flushList();
        const text = trimmedLine.replace(/^##\s*/, '');
        elements.push(
          <h2 key={`h2-${index}`} className="text-xl font-bold text-[#98ee2c] mt-5 mb-3">
            {parseInlineMarkdown(text)}
          </h2>
        );
        return;
      }

      if (trimmedLine.startsWith('#')) {
        flushList();
        const text = trimmedLine.replace(/^#\s*/, '');
        elements.push(
          <h1 key={`h1-${index}`} className="text-2xl font-bold text-white mt-6 mb-3">
            {parseInlineMarkdown(text)}
          </h1>
        );
        return;
      }

      // Ordered list
      const orderedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
      if (orderedMatch) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        listItems.push(
          <li key={`li-${index}`} className="text-gray-200">
            {parseInlineMarkdown(orderedMatch[2])}
          </li>
        );
        return;
      }

      // Unordered list
      const unorderedMatch = trimmedLine.match(/^[-*]\s+(.+)$/);
      if (unorderedMatch) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        listItems.push(
          <li key={`li-${index}`} className="text-gray-200">
            {parseInlineMarkdown(unorderedMatch[1])}
          </li>
        );
        return;
      }

      // Blockquote
      if (trimmedLine.startsWith('>')) {
        flushList();
        const text = trimmedLine.replace(/^>\s*/, '');
        elements.push(
          <blockquote
            key={`quote-${index}`}
            className="border-l-4 border-[#98ee2c] pl-4 py-2 my-3 bg-zinc-800/50 italic text-gray-300"
          >
            {parseInlineMarkdown(text)}
          </blockquote>
        );
        return;
      }

      // Horizontal rule
      if (trimmedLine.match(/^(---|\*\*\*|___)$/)) {
        flushList();
        elements.push(<hr key={`hr-${index}`} className="border-zinc-600 my-4" />);
        return;
      }

      // Code block (simple detection)
      if (trimmedLine.startsWith('```')) {
        flushList();
        // This is a simplified code block handler
        return;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={`p-${index}`} className="text-gray-200 leading-relaxed my-2">
          {parseInlineMarkdown(trimmedLine)}
        </p>
      );
    });

    flushList();
    return elements;
  };

  return <div className="markdown-content">{parseMarkdown(content)}</div>;
}
