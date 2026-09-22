/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import katex from 'katex';

interface MathTextProps {
  children: string;
  className?: string;
}

/**
 * Preprocesses text to resolve various raw/non-delimited LaTeX scenarios,
 * transforming them into uniform LaTeX formatting ($...$ and $$...$$).
 */
const preprocessMathText = (text: string): string => {
  if (!text) return '';

  // 1. Convert block LaTeX delimiters to uniform $$
  let processed = text
    .replace(/\\\[/g, '$$$$')
    .replace(/\\\]/g, '$$$$');

  // 2. Convert inline LaTeX delimiters to uniform $
  processed = processed
    .replace(/\\\(/g, '$')
    .replace(/\\\)/g, '$');

  // 3. Auto-wrap raw LaTeX lines that start with a backslash and don't contain any $
  const lines = processed.split('\n');
  const processedLines = lines.map(line => {
    const trimmed = line.trim();
    
    // Check if the line starts with standard math symbols or commands and has no delimiter
    if (trimmed.startsWith('\\') && !trimmed.includes('$')) {
      return `$$${trimmed}$$`;
    }
    
    // Special check for standalone \boxed commands
    if (trimmed.includes('\\boxed{') && !trimmed.includes('$')) {
      return `$$${trimmed}$$`;
    }
    
    return line;
  });

  return processedLines.join('\n');
};

/**
 * A robust math and markdown parser that renders complex math expressions
 * using high-performance KaTeX, and outputs formatted Markdown elements (headings, lists).
 */
export const MathText: React.FC<MathTextProps> = ({ children, className = '' }) => {
  if (!children) return null;

  const processedText = preprocessMathText(children);

  // Parse lines and render blocks (paragraphs, lists, headings)
  const lines = processedText.split('\n');
  const blocks: React.ReactNode[] = [];

  let currentListItems: React.ReactNode[] = [];
  let isInsideList = false;

  const renderInlineMathAndText = (text: string): React.ReactNode[] => {
    // Split by $$ first for block math inside a paragraph
    const blockParts = text.split('$$');
    const result: React.ReactNode[] = [];

    blockParts.forEach((blockPart, blockIdx) => {
      if (blockIdx % 2 === 1) {
        // Block math
        try {
          const html = katex.renderToString(blockPart, {
            displayMode: true,
            throwOnError: false,
          });
          result.push(
            <div
              key={`block-math-${blockIdx}`}
              className="my-3 overflow-x-auto py-1.5 text-center text-sm md:text-base max-w-full"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch (e) {
          result.push(
            <div key={`block-math-err-${blockIdx}`} className="text-rose-500 font-mono text-xs my-2 overflow-x-auto">
              $${blockPart}$$
            </div>
          );
        }
      } else {
        // Inline math parsing: split by $
        const inlineParts = blockPart.split('$');
        inlineParts.forEach((inlinePart, inlineIdx) => {
          if (inlineIdx % 2 === 1) {
            // Inline math
            try {
              const html = katex.renderToString(inlinePart, {
                displayMode: false,
                throwOnError: false,
              });
              result.push(
                <span
                  key={`inline-math-${blockIdx}-${inlineIdx}`}
                  className="inline-block align-middle px-1 text-slate-900 dark:text-slate-100"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              );
            } catch (e) {
              result.push(
                <span key={`inline-math-err-${blockIdx}-${inlineIdx}`} className="text-rose-500 font-mono text-xs">
                  ${inlinePart}$
                </span>
              );
            }
          } else {
            // Plain text with bold formatting
            const boldParts = inlinePart.split('**');
            if (boldParts.length > 1) {
              boldParts.forEach((boldPart, boldIdx) => {
                if (boldIdx % 2 === 1) {
                  result.push(
                    <strong key={`bold-${blockIdx}-${inlineIdx}-${boldIdx}`} className="font-extrabold text-slate-900 dark:text-white">
                      {boldPart}
                    </strong>
                  );
                } else {
                  result.push(boldPart);
                }
              });
            } else {
              result.push(inlinePart);
            }
          }
        });
      }
    });

    return result;
  };

  const flushList = (key: string) => {
    if (isInsideList && currentListItems.length > 0) {
      blocks.push(
        <ul key={`list-${key}`} className="list-disc pl-5 my-2 space-y-1 text-sm md:text-base text-slate-700 dark:text-slate-300">
          {currentListItems}
        </ul>
      );
      currentListItems = [];
      isInsideList = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList(`empty-${index}`);
      return;
    }

    // Heading 1-6
    if (trimmed.startsWith('# ')) {
      flushList(`h1-${index}`);
      blocks.push(
        <h1 key={`h1-${index}`} className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mt-4 mb-2">
          {renderInlineMathAndText(trimmed.slice(2))}
        </h1>
      );
    } else if (trimmed.startsWith('## ')) {
      flushList(`h2-${index}`);
      blocks.push(
        <h2 key={`h2-${index}`} className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mt-3 mb-1.5">
          {renderInlineMathAndText(trimmed.slice(3))}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      flushList(`h3-${index}`);
      blocks.push(
        <h3 key={`h3-${index}`} className="text-base md:text-lg font-bold text-slate-900 dark:text-white mt-3 mb-1.5">
          {renderInlineMathAndText(trimmed.slice(4))}
        </h3>
      );
    } else if (trimmed.startsWith('#### ')) {
      flushList(`h4-${index}`);
      blocks.push(
        <h4 key={`h4-${index}`} className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-200 mt-2.5 mb-1">
          {renderInlineMathAndText(trimmed.slice(5))}
        </h4>
      );
    } else if (trimmed.startsWith('##### ')) {
      flushList(`h5-${index}`);
      blocks.push(
        <h5 key={`h5-${index}`} className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 mt-2 mb-1">
          {renderInlineMathAndText(trimmed.slice(6))}
        </h5>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      isInsideList = true;
      currentListItems.push(
        <li key={`li-${index}`} className="text-slate-700 dark:text-slate-300 text-sm md:text-base">
          {renderInlineMathAndText(trimmed.slice(2))}
        </li>
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      // Ordered list item
      flushList(`ol-${index}`);
      const match = trimmed.match(/^(\d+)\.\s(.*)/);
      if (match) {
        const num = match[1];
        const content = match[2];
        blocks.push(
          <div key={`ol-${index}`} className="flex items-start my-1.5 text-sm md:text-base">
            <span className="font-bold text-indigo-600 mr-2 min-w-[20px] text-right">{num}.</span>
            <div className="flex-1 text-slate-700 dark:text-slate-300">
              {renderInlineMathAndText(content)}
            </div>
          </div>
        );
      } else {
        blocks.push(
          <p key={`p-${index}`} className="my-1.5 text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base">
            {renderInlineMathAndText(line)}
          </p>
        );
      }
    } else {
      flushList(`p-${index}`);
      blocks.push(
        <p key={`p-${index}`} className="my-1.5 text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base">
          {renderInlineMathAndText(line)}
        </p>
      );
    }
  });

  flushList('final');

  return (
    <div className={`space-y-1 ${className}`}>
      {blocks}
    </div>
  );
};
