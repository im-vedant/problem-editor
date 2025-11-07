'use client';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import React from 'react';

const content = `
## Equation

1. Equations allow you to express complex mathematical concepts in both inline and block formats.
2. Key features:

    * LaTeX syntax support
    * Inline and block equation formats
3. Inline equation example: $E=mc^2$ (Einstein's famous equation)
4. Block equation examples:

$$
\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

The quadratic formula for solving $ax^2 + bx + c = 0$.

$$
\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)
$$

The fundamental theorem of calculus.

1. Try these actions:

    * Click on any equation to edit it. Press Escape to close the menu without editing it.
    * You can navigate through the equation by using the arrow keys
    * Use the slash command (/equation) to insert a new equation
    * Use the slash command (/inline equation) for inline equations

Advanced usage: Combine equations with other elements like tables or code blocks for comprehensive scientific documentation. For example:

The Schrödinger equation, $i\\hbar\\frac{\\partial}{\\partial t}\\Psi = \\hat{H}\\Psi$, is fundamental in quantum mechanics.

Experiment with different equation types and formatting to create rich, mathematical content in your documents.

## Code examples

Here are some code snippets you can include alongside equations.

TypeScript / React example:

\`\`\`tsx

type Props = { value: number };

export function Double({ value }: Props) {
  return <div>Double: {value * 2}</div>;
}
\`\`\`

Utility function example:

\`\`\`ts
export function solveQuadratic(a: number, b: number, c: number) {
  const disc = b * b - 4 * a * c;
  if (disc < 0) return [];
  const sqrt = Math.sqrt(disc);
  return [(-b + sqrt) / (2 * a), (-b - sqrt) / (2 * a)];
}
\`\`\`

Shell example (installing dependencies):

\`\`\`bash
# install dependencies
npm install
# start dev server
npm run dev
\`\`\`

Combine these code blocks with equations and explanations to produce rich, runnable documentation.
`;
export default function ShowPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-950 rounded-lg shadow-md dark:shadow-lg p-8">
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            h2: ({ node, ...props }) => (
              <h2 className="text-3xl font-bold mt-8 mb-6 text-black dark:text-white" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal list-outside space-y-3 text-gray-700 dark:text-gray-300 ml-6" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="mb-3 leading-relaxed" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc list-outside space-y-2 ml-8 text-gray-700 dark:text-gray-300" {...props} />
            ),
            p: ({ node, ...props }) => (
              <p className="text-gray-700 dark:text-gray-300 leading-7 mb-4" {...props} />
            ),
            code: ({ node, className, ...props }: any) => (
              <code className={`bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded text-sm text-red-600 dark:text-red-400 font-mono ${className || ''}`} {...props} />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
