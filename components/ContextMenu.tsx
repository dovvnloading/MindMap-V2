
import React, { useEffect, useRef } from 'react';
import { Edit2, Plus, Trash2, ZoomIn, ZoomOut, Move, MinusSquare, PlusSquare, MapPin, MapPinOff } from 'lucide-react';
import { Theme } from '../types';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onEdit: () => void;
  onAddChild: () => void;
  onDelete: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenter: () => void;
  onToggleExpand: () => void;
  onAddPin: () => void;
  onRemovePin: () => void;
  theme: Theme;
  isNodeSelected: boolean;
  hasChildren: boolean;
  isCollapsed: boolean;
  hasPin: boolean;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  onEdit,
  onAddChild,
  onDelete,
  onZoomIn,
  onZoomOut,
  onCenter,
  onToggleExpand,
  onAddPin,
  onRemovePin,
  theme,
  isNodeSelected,
  hasChildren,
  isCollapsed,
  hasPin,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [onClose]);

  const style = {
    top: y,
    left: x,
  };

  const isDark = theme === Theme.DARK;
  
  const menuClass = isDark
     ? 'bg-[#292929] border-[#333333] shadow-[5px_5px_15px_#1a1a1a]'
     : 'bg-[#E0E5EC] border-[#ffffff] shadow-[6px_6px_16px_#a3b1c6]';

  const itemClass = `
    flex items-center w-full px-4 py-3 text-sm gap-3 transition-all cursor-pointer font-medium
    ${isDark ? 'text-gray-400 hover:text-blue-400 hover:bg-[#333333]' : 'text-gray-600 hover:text-blue-600 hover:bg-[#dce1e8]'}
  `;

  const headerClass = `px-4 py-2 text-[10px] font-bold tracking-wider opacity-50 uppercase border-b ${isDark ? 'border-[#333333]' : 'border-[#d1d5db]'}`;

  return (
    <div
      ref={menuRef}
      className={`fixed z-50 min-w-[220px] rounded-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${menuClass}`}
      style={style}
      onContextMenu={(e) => e.preventDefault()}
    >
      {isNodeSelected && (
        <>
          <div className={headerClass}>
            Node Actions
          </div>
          
          <button onClick={onEdit} className={itemClass}>
            <Edit2 size={16} className="opacity-70" />
            <span>Rename Node</span>
          </button>
          
          <button onClick={onAddChild} className={itemClass}>
            <Plus size={16} className="opacity-70" />
            <span>Add Subtopic</span>
          </button>

          {hasChildren && (
            <button onClick={onToggleExpand} className={itemClass}>
              {isCollapsed ? <PlusSquare size={16} className="opacity-70" /> : <MinusSquare size={16} className="opacity-70" />}
              <span>{isCollapsed ? 'Expand Branch' : 'Collapse Branch'}</span>
            </button>
          )}

          {hasPin ? (
             <button onClick={onRemovePin} className={itemClass}>
                <MapPinOff size={16} className="opacity-70" />
                <span>Remove Pin</span>
             </button>
          ) : (
             <button onClick={onAddPin} className={itemClass}>
                <MapPin size={16} className="opacity-70" />
                <span>Add Navigation Pin</span>
             </button>
          )}
          
          <button onClick={onDelete} className={`${itemClass} ${isDark ? 'hover:text-red-400' : 'hover:text-red-500'}`}>
            <Trash2 size={16} className="opacity-70" />
            <span>Delete Node</span>
          </button>

          <div className={`h-px mx-0 my-0 ${isDark ? 'bg-[#333333]' : 'bg-[#d1d5db]'}`} />
        </>
      )}

      <div className={headerClass}>
        View Controls
      </div>

      <button onClick={onZoomIn} className={itemClass}>
        <ZoomIn size={16} className="opacity-70" />
        <span>Zoom In</span>
      </button>

      <button onClick={onZoomOut} className={itemClass}>
        <ZoomOut size={16} className="opacity-70" />
        <span>Zoom Out</span>
      </button>

      <button onClick={onCenter} className={itemClass}>
        <Move size={16} className="opacity-70" />
        <span>Reset View</span>
      </button>
    </div>
  );
};
