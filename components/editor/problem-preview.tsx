'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface Example {
  id: string;
  content: string;
}

interface Hint {
  id: string;
  content: string;
}

interface ProblemContent {
  title: string;
  description: string;
  examples: Example[];
  hints: Hint[];
  constraint: string;
  requirement: string;
  theory: string;
}

interface ProblemPreviewProps {
  content: ProblemContent;
}

// Content is already in markdown format, no conversion needed
// This function is a pass-through to handle the interface consistently
function plateToMarkdown(content: string): string {
  if (!content || content.trim() === '') {
    return '';
  }
  
  // Content is already markdown, return as-is
  return content;
}

const MarkdownRenderer = ({ content }: { content: string }) => (
  <ReactMarkdown
    remarkPlugins={[remarkMath]}
    rehypePlugins={[rehypeKatex]}
    components={{
      h1: ({ node, ...props }) => (
        <h1 className="text-4xl font-bold mt-8 mb-4 text-gray-900 dark:text-white" {...props} />
      ),
      h2: ({ node, ...props }) => (
        <h2 className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-white" {...props} />
      ),
      h3: ({ node, ...props }) => (
        <h3 className="text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-white" {...props} />
      ),
      h4: ({ node, ...props }) => (
        <h4 className="text-xl font-bold mt-4 mb-2 text-gray-900 dark:text-white" {...props} />
      ),
      ol: ({ node, ...props }) => (
        <ol className="list-decimal list-outside space-y-2 text-gray-700 dark:text-gray-300 ml-6" {...props} />
      ),
      ul: ({ node, ...props }) => (
        <ul className="list-disc list-outside space-y-2 text-gray-700 dark:text-gray-300 ml-6" {...props} />
      ),
      li: ({ node, ...props }) => (
        <li className="mb-2 leading-relaxed" {...props} />
      ),
      p: ({ node, ...props }) => (
        <p className="text-gray-700 dark:text-gray-300 leading-7 mb-4" {...props} />
      ),
      code: ({ node, className, children, ...props }: any) => {
        const inline = !className;
        return inline ? (
          <code className="bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded text-sm text-red-600 dark:text-red-400 font-mono" {...props}>
            {children}
          </code>
        ) : (
          <code className={`bg-gray-100 dark:bg-zinc-800 px-4 py-3 rounded block overflow-x-auto text-sm text-gray-800 dark:text-gray-200 font-mono ${className || ''}`} {...props}>
            {children}
          </code>
        );
      },
      pre: ({ node, ...props }) => (
        <pre className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-lg overflow-x-auto mb-4" {...props} />
      ),
      blockquote: ({ node, ...props }) => (
        <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4" {...props} />
      ),
      table: ({ node, ...props }) => (
        <table className="border-collapse border border-gray-300 dark:border-zinc-700 my-4 w-full" {...props} />
      ),
      thead: ({ node, ...props }) => (
        <thead className="bg-gray-100 dark:bg-zinc-800" {...props} />
      ),
      th: ({ node, ...props }) => (
        <th className="border border-gray-300 dark:border-zinc-700 px-4 py-2 text-left font-bold" {...props} />
      ),
      td: ({ node, ...props }) => (
        <td className="border border-gray-300 dark:border-zinc-700 px-4 py-2" {...props} />
      ),
      tr: ({ node, ...props }) => (
        <tr className="hover:bg-gray-50 dark:hover:bg-zinc-900" {...props} />
      ),
      strong: ({ node, ...props }) => (
        <strong className="font-bold text-gray-900 dark:text-white" {...props} />
      ),
      em: ({ node, ...props }) => (
        <em className="italic text-gray-700 dark:text-gray-300" {...props} />
      ),
      a: ({ node, ...props }) => (
        <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props} />
      ),
      hr: () => (
        <hr className="my-6 border-gray-300 dark:border-zinc-700" />
      ),
    }}
  >
    {content}
  </ReactMarkdown>
);

export default function ProblemPreview({ content }: ProblemPreviewProps) {
  return (
    <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Title */}
        {content.title && (
          <div>
            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
              <MarkdownRenderer content={plateToMarkdown(content.title)} />
            </div>
          </div>
        )}

        {/* Description */}
        {content.description && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
              <MarkdownRenderer content={plateToMarkdown(content.description)} />
            </div>
          </div>
        )}

        {/* Examples */}
        {content.examples.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Examples</h2>
            <div className="space-y-6">
              {content.examples.map((example) => (
                <div key={example.id} className="bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-4">
                  <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                    <MarkdownRenderer content={plateToMarkdown(example.content)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hints */}
        {content.hints.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Hints</h2>
            <div className="space-y-4">
              {content.hints.map((hint) => (
                <div key={hint.id} className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 rounded-lg p-4">
                  <div className="prose dark:prose-invert max-w-none text-blue-800 dark:text-blue-200">
                    <MarkdownRenderer content={plateToMarkdown(hint.content)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Constraints */}
        {content.constraint && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Constraints</h2>
            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
              <MarkdownRenderer content={plateToMarkdown(content.constraint)} />
            </div>
          </div>
        )}

        {/* Requirements */}
        {content.requirement && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Requirements</h2>
            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
              <MarkdownRenderer content={plateToMarkdown(content.requirement)} />
            </div>
          </div>
        )}

        {/* Theory */}
        {content.theory && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Theory</h2>
            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
              <MarkdownRenderer content={plateToMarkdown(content.theory)} />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!content.title && !content.description && content.examples.length === 0 && 
         content.hints.length === 0 && !content.constraint && !content.requirement && !content.theory && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No content to preview yet. Start adding content to your problem.</p>
          </div>
        )}
      </div>
    </div>
  );
}
