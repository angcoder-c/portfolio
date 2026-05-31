import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const assistantMarkdownComponents: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-bold text-primary">{children}</strong>,
  em: ({ children }) => <em className="text-primary-soft italic">{children}</em>,
  ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-4">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-4">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-secondary underline transition-colors hover:text-primary"
    >
      {children}
    </a>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = Boolean(className);

    if (isBlock) {
      return (
        <code
          className="my-2 block overflow-x-auto border border-border/60 bg-bg/80 p-2 text-xs text-primary"
          {...props}
        >
          {children}
        </code>
      );
    }

    return (
      <code className="border border-border/40 bg-bg/60 px-1 text-primary" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto border border-border/60 bg-bg/80 p-2 text-xs">{children}</pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-secondary/50 pl-3 text-text-muted">{children}</blockquote>
  ),
};

interface Props {
  content: string;
}

export default function ChatMessageContent({ content }: Props) {
  return (
    <div className="chat-markdown [&_.katex]:text-text [&_.katex-display]:my-2 [&_.katex-display]:overflow-x-auto">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={assistantMarkdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
