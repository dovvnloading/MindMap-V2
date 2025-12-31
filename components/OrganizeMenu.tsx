
import React, { useEffect, useRef } from 'react';
import { AlignLeft, ArrowDownAZ, ArrowUpAZ, RefreshCcw } from 'lucide-react';
import { Theme } from '../types';

interface OrganizeMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mode: 'smart' | 'az' | 'za') => void;
  onResetLayout: () => void;
  theme: Theme;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

export const OrganizeMenu: React.FC<OrganizeMenuProps> = ({
  isOpen,
  onClose,
  onSelect,
  onResetLayout,
  theme,
  buttonRef
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [isOpen, onClose, buttonRef]);

  if (!isOpen) return null;

  const isDark = theme === 'dark';
  
  const menuClass = isDark
     ? 'bg-[#292929] border-[#333333] shadow-[5px_5px_15px_#1a1a1a]'
     : 'bg-[#E0E5EC] border-[#ffffff] shadow-[6px_6px_16px_#a3b1c6]';
  
  const itemClass = `
    w-full flex items-center gap-3 px-3 py-3 text-sm font-medium transition-all duration-200 rounded-xl mb-1
    ${isDark 
        ? 'text-gray-400 hover:bg-[#333333] hover:text-white hover:shadow-[2px_2px_5px_#1a1a1a,-2px_-2px_5px_#3a3a3a]' 
        : 'text-gray-600 hover:bg-[#eef1f6] hover:text-gray-900 hover:shadow-[3px_3px_6px_#c8c9ce,-3px_-3px_6px_#ffffff]'
    }
  `;

  const iconContainerClass = `p-2 rounded-lg ${
      isDark 
        ? 'shadow-[inset_2px_2px_4px_#1f1f1f,inset_-2px_-2px_4px_#333333] text-gray-400' 
        : 'shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-gray-500'
  }`;

  return (
    <div
      ref={menuRef}
      className={`
        absolute top-full right-0 mt-3 w-64 rounded-3xl border p-2 z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200
        ${menuClass}
      `}
    >
      <div className={`px-4 py-2 border-b mb-2 ${isDark ? 'border-[#333333]' : 'border-[#d1d5db]'}`}>
        <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Content Organize
        </p>
      </div>

      <button onClick={() => onSelect('smart')} className={itemClass}>
          <div className={iconContainerClass}>
            <AlignLeft size={16} />
          </div>
          <div className="flex flex-col items-start">
            <span>Smart Clean</span>
            <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Fix hierarchy & indent</span>
          </div>
      </button>

      <button onClick={() => onSelect('az')} className={itemClass}>
          <div className={iconContainerClass}>
            <ArrowDownAZ size={16} />
          </div>
          <div className="flex flex-col items-start">
            <span>Sort A to Z</span>
            <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Alphabetize branches</span>
          </div>
      </button>

      <button onClick={() => onSelect('za')} className={itemClass}>
          <div className={iconContainerClass}>
            <ArrowUpAZ size={16} />
          </div>
          <div className="flex flex-col items-start">
            <span>Sort Z to A</span>
            <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Reverse order</span>
          </div>
      </button>

      
      <div className={`px-4 py-2 border-t border-b my-2 ${isDark ? 'border-[#333333]' : 'border-[#d1d5db]'}`}>
        <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Visual Layout
        </p>
      </div>
      
      <button onClick={onResetLayout} className={itemClass}>
          <div className={iconContainerClass}>
            <RefreshCcw size={16} />
          </div>
          <div className="flex flex-col items-start">
            <span>Reset Graph</span>
            <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Restore default view</span>
          </div>
      </button>

    </div>
  );
};
