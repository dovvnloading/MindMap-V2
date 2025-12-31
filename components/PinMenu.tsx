
import React, { useEffect, useRef } from 'react';
import { MapPin, X, Trash2, Crosshair } from 'lucide-react';
import { Theme, Pin } from '../types';

interface PinMenuProps {
  isOpen: boolean;
  onClose: () => void;
  pins: Pin[];
  onSelectPin: (pin: Pin) => void;
  onRemovePin: (nodeId: string) => void;
  theme: Theme;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

export const PinMenu: React.FC<PinMenuProps> = ({
  isOpen,
  onClose,
  pins,
  onSelectPin,
  onRemovePin,
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
  
  const itemClass = `
    w-full flex items-center gap-3 px-3 py-3 text-sm font-medium transition-all duration-200 rounded-xl mb-1 group
    ${isDark 
        ? 'text-gray-400 hover:bg-[#333333] hover:text-white hover:shadow-[2px_2px_5px_#1a1a1a,-2px_-2px_5px_#3a3a3a]' 
        : 'text-gray-600 hover:bg-[#eef1f6] hover:text-gray-900 hover:shadow-[3px_3px_6px_#c8c9ce,-3px_-3px_6px_#ffffff]'
    }
  `;

  const iconContainerClass = `p-2 rounded-lg ${
      isDark 
        ? 'shadow-[inset_2px_2px_4px_#1f1f1f,inset_-2px_-2px_4px_#333333] text-red-400' 
        : 'shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-red-500'
  }`;

  return (
    <div
      ref={menuRef}
      className={`
        absolute top-full right-0 mt-3 w-72 rounded-3xl border p-2 z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200
        ${menuClass}
      `}
    >
      <div className={`px-4 py-2 border-b mb-2 ${isDark ? 'border-[#333333]' : 'border-[#d1d5db]'}`}>
        <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Navigation Pins
        </p>
      </div>

      <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
          {pins.length === 0 ? (
              <div className={`text-center py-6 px-4 text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  No pins placed yet.<br/>Right-click a node to add one.
              </div>
          ) : (
              pins.map(pin => (
                  <div key={pin.id} className="flex items-center gap-1">
                      <button onClick={() => onSelectPin(pin)} className={`${itemClass} flex-1 text-left`}>
                          <div className={iconContainerClass}>
                            <MapPin size={14} />
                          </div>
                          <span className="truncate">{pin.label}</span>
                          <Crosshair size={14} className="ml-auto opacity-0 group-hover:opacity-50" />
                      </button>
                      <button 
                        onClick={() => onRemovePin(pin.nodeId)}
                        className={`p-2 rounded-xl transition-all ${
                             isDark 
                             ? 'text-gray-600 hover:text-red-400 hover:bg-[#333]' 
                             : 'text-gray-400 hover:text-red-500 hover:bg-[#eee]'
                        }`}
                        title="Remove Pin"
                      >
                          <Trash2 size={14} />
                      </button>
                  </div>
              ))
          )}
      </div>

    </div>
  );
};
