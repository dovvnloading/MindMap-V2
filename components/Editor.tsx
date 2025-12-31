
import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { Copy, Check, FileText } from 'lucide-react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  theme: 'light' | 'dark';
  colors: string[];
}

const MINIMAP_WIDTH = 100;
const MINIMAP_SCALE = 0.15;

export const Editor: React.FC<EditorProps> = ({ value, onChange, theme, colors }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);
  
  const [copied, setCopied] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [scrollHeight, setScrollHeight] = useState(0);
  const [isDraggingMinimap, setIsDraggingMinimap] = useState(false);

  const isDark = theme === 'dark';

  // --- Synchronization Logic ---
  const updateMetrics = useCallback(() => {
    if (textareaRef.current) {
        setScrollTop(textareaRef.current.scrollTop);
        setViewportHeight(textareaRef.current.clientHeight);
        setScrollHeight(textareaRef.current.scrollHeight);
    }
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
    setScrollTop(scrollTop);
    setViewportHeight(clientHeight);
    setScrollHeight(scrollHeight);
  };

  useEffect(() => {
    updateMetrics();
    window.addEventListener('resize', updateMetrics);
    return () => window.removeEventListener('resize', updateMetrics);
  }, [updateMetrics, value]);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMinimapInteraction = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!minimapRef.current || !textareaRef.current) return;
    const minimapRect = minimapRef.current.getBoundingClientRect();
    const clickY = e.clientY - minimapRect.top;
    
    const realContentHeight = textareaRef.current.scrollHeight;
    const realViewportHeight = textareaRef.current.clientHeight;
    const scaledViewportHeight = realViewportHeight * MINIMAP_SCALE;
    
    const mapHeight = minimapRef.current.clientHeight;
    const sliderHeight = Math.min(mapHeight, scaledViewportHeight);
    const targetSliderTop = clickY - (sliderHeight / 2);
    const trackLength = mapHeight - sliderHeight;
    const ratio = trackLength > 0 ? Math.max(0, Math.min(1, targetSliderTop / trackLength)) : 0;
    
    const maxScrollTop = realContentHeight - realViewportHeight;
    const targetScrollTop = ratio * maxScrollTop;

    textareaRef.current.scrollTop = targetScrollTop;
  }, []);

  const highlightedContent = useMemo(() => {
    const lines = value ? value.split('\n') : [''];
    let branchIndex = -1;
    let currentBranchColor = isDark ? '#A1A1AA' : '#64748B'; 

    return lines.map((line, i) => {
      const lineNumber = (
        <span 
            className={`absolute -left-12 w-8 text-right select-none text-xs font-mono opacity-40 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
            style={{ top: '0' }}
        >
            {i + 1}
        </span>
      );

      const wrapperClass = "relative whitespace-pre-wrap break-words";

      if (line.length === 0) {
          return (
            <div key={i} className={wrapperClass}>
                {lineNumber}
                <br/>
            </div>
          );
      }

      const headerMatch = line.match(/^(\s*)(#+)(\s*)(.*)/);
      const isHeader = !!headerMatch;
      const level = isHeader ? headerMatch![2].length : 0;
      
      if (isHeader) {
          if (level === 1) {
              branchIndex = -1; 
              currentBranchColor = isDark ? '#E5E7EB' : '#475569';
          } else if (level === 2) {
              branchIndex++; 
              currentBranchColor = colors[branchIndex % colors.length];
          }
      }

      let style: React.CSSProperties = {};
      let className = `${wrapperClass} `;

      if (isHeader) {
          if (level === 1) {
             className += isDark ? "text-gray-200 font-bold" : "text-gray-700 font-bold";
          } else {
             style.color = currentBranchColor;
             className += "font-semibold";
          }
      } else {
          if (branchIndex !== -1) {
             style.color = currentBranchColor;
             style.opacity = 0.8;
          } else {
             className += isDark ? "text-gray-400" : "text-gray-500";
          }
      }

      const renderLineContent = () => {
        if (headerMatch) {
            const [_, indent, hashes, space, content] = headerMatch;
            return (
                <>
                   {indent}
                   <span style={{ opacity: 0.3 }}>{hashes}</span>
                   {space}
                   <span>{content}</span>
                </>
            );
        }
        const listMatch = line.match(/^(\s*)([-*+])(\s+)(.*)/);
        if (listMatch) {
            const [_, indent, bullet, space, content] = listMatch;
            return (
                <>
                   {indent}
                   <span style={{ opacity: 0.3 }}>{bullet}</span>
                   {space}
                   <span>{content}</span>
                </>
            );
        }
        return line;
      };

      return (
        <div key={i} className={className} style={style}>
          {lineNumber}
          {renderLineContent()}
        </div>
      );
    });
  }, [value, isDark, colors]);

  const lineCount = value.split('\n').length;
  const charCount = value.length;

  const getMinimapStyles = () => {
      const scaledTotalHeight = scrollHeight * MINIMAP_SCALE;
      const scaledViewportHeight = viewportHeight * MINIMAP_SCALE;
      const minimapContainerHeight = minimapRef.current?.clientHeight || viewportHeight;
      const maxScrollTop = scrollHeight - viewportHeight;
      const scrollRatio = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0;
      const sliderHeight = Math.max(20, Math.min(minimapContainerHeight, scaledViewportHeight));
      const availableTrack = minimapContainerHeight - sliderHeight;
      const sliderTop = scrollRatio * availableTrack;

      let contentOffset = 0;
      if (scaledTotalHeight > minimapContainerHeight) {
          const maxContentScroll = scaledTotalHeight - minimapContainerHeight;
          contentOffset = scrollRatio * maxContentScroll;
      }
      const absoluteSliderTop = (scrollTop * MINIMAP_SCALE) - contentOffset;
      return { contentOffset, sliderHeight, sliderTop: absoluteSliderTop };
  };

  const { contentOffset, sliderHeight, sliderTop } = getMinimapStyles();

  // Styles
  const containerClass = isDark 
     ? 'bg-[#292929] shadow-[inset_5px_5px_10px_#1f1f1f,inset_-5px_-5px_10px_#333333]' 
     : 'bg-[#E0E5EC] shadow-[inset_6px_6px_10px_#b8b9be,inset_-6px_-6px_10px_#ffffff]';

  const headerClass = isDark
    ? 'border-[#333333] text-gray-500'
    : 'border-[#d1d5db] text-gray-500';

  return (
    <div className={`h-full w-full flex flex-col font-mono relative group rounded-3xl overflow-hidden ${containerClass}`}>
      
      {/* 1. IDE Header */}
      <div className={`
        flex items-center justify-between px-6 py-4 border-b text-xs font-medium tracking-wide select-none z-20 flex-shrink-0
        ${headerClass}
      `}>
        <div className="flex items-center gap-2">
            <FileText size={14} className="opacity-50" />
            <span className="uppercase tracking-widest text-[10px] font-bold opacity-70">source.md</span>
        </div>
        
        <div className="flex items-center gap-4">
            <span className="opacity-40 font-mono hidden sm:inline-block">{lineCount} lines : {charCount} chars</span>
            <button 
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all ${
                    copied 
                        ? 'text-green-500 bg-green-500/10' 
                        : isDark ? 'hover:text-gray-200' : 'hover:text-gray-700'
                }`}
            >
                {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
        </div>
      </div>
      
      {/* 2. Main Editor Area */}
      <div className="flex-1 relative overflow-hidden flex flex-row">
        
        {/* Editor Stack */}
        <div className="relative flex-1 h-full overflow-hidden">
            
            {/* Layer 1: Syntax Highlighting */}
            <pre
                ref={preRef}
                className={`
                    absolute inset-0 m-0 p-8 pt-8 pl-16 overflow-hidden pointer-events-none whitespace-pre-wrap break-words
                    text-sm leading-relaxed no-scrollbar
                `}
                style={{ 
                    fontFamily: '"JetBrains Mono", monospace',
                    tabSize: 2,
                    paddingRight: `${MINIMAP_WIDTH + 24}px`
                }}
                aria-hidden="true"
            >
                {highlightedContent}
            </pre>

            {/* Layer 2: Input */}
            <textarea
                ref={textareaRef}
                className={`
                    absolute inset-0 w-full h-full p-8 pt-8 pl-16 resize-none outline-none text-sm leading-relaxed
                    bg-transparent border-none custom-scrollbar whitespace-pre-wrap break-words overflow-y-auto
                    ${isDark ? 'text-transparent caret-white' : 'text-transparent caret-gray-700'}
                `}
                style={{ 
                    fontFamily: '"JetBrains Mono", monospace',
                    tabSize: 2,
                    color: 'transparent',
                    paddingRight: `${MINIMAP_WIDTH + 24}px` 
                }}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onScroll={handleScroll}
                placeholder="# Start typing..."
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
            />
        </div>

        {/* 3. Minimap Sidebar */}
        <div 
            ref={minimapRef}
            className={`
                hidden sm:block absolute right-0 top-0 bottom-0 z-10 overflow-hidden border-l
                ${isDark ? 'border-[#333333] bg-[#292929]/50' : 'border-[#d1d5db] bg-[#E0E5EC]/50'}
            `}
            style={{ width: MINIMAP_WIDTH }}
            onMouseDown={(e) => {
                setIsDraggingMinimap(true);
                handleMinimapInteraction(e);
            }}
            onMouseMove={(e) => {
                if (e.buttons === 1 || isDraggingMinimap) handleMinimapInteraction(e);
            }}
            onMouseUp={() => setIsDraggingMinimap(false)}
            onMouseLeave={() => setIsDraggingMinimap(false)}
        >
            <div 
                className="w-full origin-top-left absolute left-0 top-0 pointer-events-none select-none [&_.select-none]:hidden opacity-60"
                style={{ 
                    transform: `translateY(${-contentOffset}px) scale(${MINIMAP_SCALE})`,
                    width: `calc(100% / ${MINIMAP_SCALE})`,
                    fontFamily: '"JetBrains Mono", monospace',
                }}
            >
                {highlightedContent}
            </div>

            <div 
                className={`absolute left-0 w-full pointer-events-none transition-opacity duration-200 ${isDark ? 'bg-white/10' : 'bg-black/5'}`}
                style={{
                    top: sliderTop,
                    height: sliderHeight,
                }}
            />
        </div>
      </div>
    </div>
  );
};
