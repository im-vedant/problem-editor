'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface ProblemContent {
  title: string;
  description: string;
  examples: string;
  constraint: string;
  requirement: string;
  theory: string;
}

interface ProblemPreviewProps {
  content: ProblemContent;
}

// Helper function to convert Plate editor content to markdown-compatible text
function plateToMarkdown(content: string): string {
  if (!content || content.trim() === '') {
    return '';
  }

  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed
        .map((node: any) => {
          if (node.type === 'h1') {
            return `# ${node.children?.map((c: any) => c.text).join('')}`;
          } else if (node.type === 'h2') {
            return `## ${node.children?.map((c: any) => c.text).join('')}`;
          } else if (node.type === 'h3') {
            return `### ${node.children?.map((c: any) => c.text).join('')}`;
          } else if (node.type === 'ul') {
            return node.children
              ?.map((item: any) => `* ${item.children?.map((c: any) => c.text).join('')}`)
              .join('\n');
          } else if (node.type === 'ol') {
            return node.children
              ?.map((item: any, idx: number) => `${idx + 1}. ${item.children?.map((c: any) => c.text).join('')}`)
              .join('\n');
          } else if (node.type === 'code_block') {
            const code = node.children?.map((c: any) => c.text).join('\n');
            const lang = node.lang || '';
            return `\`\`\`${lang}\n${code}\n\`\`\``;
          } else if (node.type === 'blockquote') {
            return `> ${node.children?.map((c: any) => c.text).join('')}`;
          } else if (node.type === 'p' || !node.type) {
            return node.children?.map((c: any) => {
              let text = c.text || '';
              if (c.bold) text = `**${text}**`;
              if (c.italic) text = `*${text}*`;
              if (c.code) text = `\`${text}\``;
              return text;
            }).join('') || '';
          }
          return '';
        })
        .filter((line: string) => line.trim())
        .join('\n\n');
    }
  } catch (error) {
    // If parsing fails, return the content as-is
    return content;
  }

  return content;
}

export default function ProblemPreview({ content }: ProblemPreviewProps) {
  const sections = [
    { key: 'title', label: 'Title', content: plateToMarkdown(content.title) },
    { key: 'description', label: 'Description', content: plateToMarkdown(content.description) },
    { key: 'examples', label: 'Examples', content: plateToMarkdown(content.examples) },
    { key: 'requirement', label: 'Requirements', content: plateToMarkdown(content.requirement) },
    { key: 'constraint', label: 'Constraints', content: plateToMarkdown(content.constraint) },
    { key: 'theory', label: 'Theory', content: plateToMarkdown(content.theory) },
  ];

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 p-8">
      <div className="max-w-4xl mx-auto">
        {sections.map((section) => (
          <div key={section.key} className="mb-12">
            {section.content && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {section.label}
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
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
                    {section.content}
                  </ReactMarkdown>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Empty state message */}
        {!sections.some((s) => s.content) && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No content to preview. Start editing the sections to see the preview here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
