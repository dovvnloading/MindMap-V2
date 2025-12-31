
import React, { useEffect, useRef } from 'react';
import { Palette } from 'lucide-react';
import { Theme } from '../types';
import { COLOR_PALETTES, ColorPalette } from '../constants';

interface ColorPaletteMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (paletteKey: string) => void;
  currentPaletteId: string;
  theme: Theme;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

export const ColorPaletteMenu: React.FC<ColorPaletteMenuProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentPaletteId,
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

  const isDark = theme === Theme.DARK;
  
  const menuClass = isDark
     ? 'bg-[#292929] border-[#333333] shadow-[5px_5px_15px_#1a1a1a]'
     : 'bg-[#E0E5EC] border-[#ffffff] shadow-[6px_6px_16px_#a3b1c6]';
  
  const itemClass = (isActive: boolean) => `
    w-full flex items-center justify-between px-3 py-3 text-sm font-medium transition-all duration-200 rounded-xl mb-2
    ${isActive 
        ? (isDark 
            ? 'bg-[#333333] shadow-[inset_2px_2px_4px_#1f1f1f,inset_-2px_-2px_4px_#3a3a3a] text-blue-400' 
            : 'bg-[#eef1f6] shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-blue-600')
        : (isDark
            ? 'text-gray-400 hover:bg-[#333333] hover:text-white'
            : 'text-gray-600 hover:bg-[#eef1f6] hover:text-gray-900')
    }
  `;

  return (
    <div
      ref={menuRef}
      className={`
        absolute top-full right-0 mt-3 w-64 rounded-3xl border p-3 z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200
        ${menuClass}
      `}
    >
      <div className={`px-2 pb-2 mb-2 border-b ${isDark ? 'border-[#333333]' : 'border-[#d1d5db]'}`}>
        <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Color Palette
        </p>
      </div>

      {Object.values(COLOR_PALETTES).map((palette: ColorPalette) => (
        <button 
            key={palette.id} 
            onClick={() => onSelect(palette.id)} 
            className={itemClass(currentPaletteId === palette.id)}
        >
            <span className="flex-1 text-left">{palette.name}</span>
            <div className="flex -space-x-1">
                {palette.colors.slice(0, 4).map((c, i) => (
                    <div 
                        key={i} 
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: c }}
                    />
                ))}
            </div>
        </button>
      ))}

    </div>
  );
};
