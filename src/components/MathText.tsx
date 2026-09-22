/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface MathTextProps {
  children: string;
  className?: string;
}

/**
 * A highly tailored mathematical text formatter that handles inline LaTeX ($...$)
 * and displays mathematical symbols with crisp typography.
 */
export const MathText: React.FC<MathTextProps> = ({ children, className = '' }) => {
  if (!children) return null;

  // Split text by '$' to separate plain text and inline math
  const parts = children.split('$');

  const formatMath = (mathStr: string): React.ReactNode => {
    let text = mathStr.trim();

    // 1. Overline (e.g., \overline{abc} or \overline{54x})
    if (text.includes('\\overline{')) {
      const regex = /\\overline\{([^}]+)\}/g;
      const match = regex.exec(text);
      if (match) {
        const content = match[1];
        return (
          <span className="relative inline-block px-0.5">
            <span className="absolute left-0 right-0 top-0 border-t border-slate-800 dark:border-slate-200"></span>
            <span className="font-serif italic">{content}</span>
          </span>
        );
      }
    }

    // 2. Fractions (e.g., \frac{a}{b})
    if (text.includes('\\frac{')) {
      const regex = /\\frac\{([^}]+)\}\{([^}]+)\}/g;
      const match = regex.exec(text);
      if (match) {
        const num = match[1];
        const den = match[2];
        return (
          <span className="inline-flex flex-col items-center align-middle text-xs mx-0.5 font-serif">
            <span className="border-b border-slate-700 px-0.5 pb-0.5 text-center">{num}</span>
            <span className="pt-0.5 text-center">{den}</span>
          </span>
        );
      }
    }

    // 3. Simple character replacements
    text = text
      .replace(/\\triangle/g, '△')
      .replace(/\\vdots/g, '⋮')
      .replace(/\\le/g, '≤')
      .replace(/\\ge/g, '≥')
      .replace(/\\dots/g, '...')
      .replace(/\\cdot/g, '·')
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\gamma/g, 'γ')
      .replace(/\\pi/g, 'π')
      .replace(/\\sqrt/g, '√')
      .replace(/\\approx/g, '≈')
      .replace(/\\vdots/g, '⋮')
      .replace(/\\vdots/g, '⋮')
      .replace(/\\vdots/g, '⋮')
      .replace(/\\Rightarrow/g, '⇒')
      .replace(/\\Leftrightarrow/g, '⇔')
      .replace(/\\sum/g, '∑')
      .replace(/\\infty/g, '∞')
      .replace(/\\times/g, '×');

    // 4. Superscripts & subscripts (e.g., x^2 or u_n)
    // Handle exponents like x^2, x^{10}, a^2, b^2
    const expRegex = /([a-zA-Z0-9)\]]+)\^([a-zA-Z0-9\-+]+)/g;
    const subRegex = /([a-zA-Z0-9)\]]+)_([a-zA-Z0-9\-+]+)/g;

    // Check if it has simple superscripts/subscripts and split them
    if (text.match(/\^/) || text.match(/_/)) {
      const segments: React.ReactNode[] = [];
      let currentIdx = 0;

      // We'll parse simply for exponents/subscripts
      // To keep it light, let's render nicely with inline-block
      const expMatch = text.match(/([a-zA-Z0-9]+)\^([a-zA-Z0-9\-+]+)/);
      const subMatch = text.match(/([a-zA-Z0-9]+)_([a-zA-Z0-9\-+]+)/);

      if (expMatch) {
        const base = expMatch[1];
        const power = expMatch[2];
        return (
          <span className="font-serif italic">
            {base}
            <sup className="text-[10px] leading-none select-none font-normal ml-0.5">{power}</sup>
          </span>
        );
      }

      if (subMatch) {
        const base = subMatch[1];
        const sub = subMatch[2];
        return (
          <span className="font-serif italic">
            {base}
            <sub className="text-[10px] leading-none select-none font-normal ml-0.5">{sub}</sub>
          </span>
        );
      }
    }

    return <span className="font-serif italic font-medium text-slate-850 mx-0.5">{text}</span>;
  };

  return (
    <span className={`leading-relaxed text-slate-750 ${className}`} id={`math_text_${Math.random().toString(36).substr(2, 5)}`}>
      {parts.map((part, index) => {
        // Even indices are plain text, odd are math formulas
        if (index % 2 === 0) {
          // If the plain text contains newlines, replace them with <br/>
          const subParts = part.split('\n');
          return subParts.map((subPart, subIdx) => (
            <React.Fragment key={`txt-${index}-${subIdx}`}>
              {subPart}
              {subIdx < subParts.length - 1 && <br />}
            </React.Fragment>
          ));
        } else {
          return <React.Fragment key={`math-${index}`}>{formatMath(part)}</React.Fragment>;
        }
      })}
    </span>
  );
};
