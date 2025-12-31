
import React, { useEffect, useRef, useState } from 'react';
import { Theme } from '../types';

interface InputModalProps {
  isOpen: boolean;
  type: 'rename' | 'add' | 'pin';
  initialValue?: string;
  onClose: () => void;
  onSubmit: (value: string) => void;
  theme: Theme;
}

export const InputModal: React.FC<InputModalProps> = ({
  isOpen,
  type,
  initialValue = '',
  onClose,
  onSubmit,
  theme,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      onClose();
    }
  };

  const isDark = theme === Theme.DARK;
  
  // Modal Container Style
  const modalClass = isDark
     ? 'bg-[#292929] text-[#E0E0E0] shadow-[10px_10px_30px_#1f1f1f,-10px_-10px_30px_#333333]'
     : 'bg-[#E0E5EC] text-[#4A5568] shadow-[10px_10px_30px_#b8b9be,-10px_-10px_30px_#ffffff]';
     
  // Input Inset Style
  const inputClass = isDark
     ? 'bg-[#252525] shadow-[inset_3px_3px_6px_#1a1a1a,inset_-3px_-3px_6px_#3a3a3a] text-gray-200 placeholder-gray-600'
     : 'bg-[#eef0f4] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] text-gray-700 placeholder-gray-400';

  // Button Style
  const btnClass = `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform active:scale-95
    ${isDark 
       ? 'bg-[#292929] text-gray-400 shadow-[4px_4px_8px_#1f1f1f,-4px_-4px_8px_#333333] hover:text-white hover:shadow-[2px_2px_4px_#1f1f1f,-2px_-2px_4px_#333333]' 
       : 'bg-[#E0E5EC] text-gray-600 shadow-[5px_5px_10px_#b8b9be,-5px_-5px_10px_#ffffff] hover:text-gray-900 hover:shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff]'
    }
  `;
  
  const primaryBtnClass = isDark
     ? 'text-blue-400 shadow-[inset_2px_2px_4px_#1f1f1f,inset_-2px_-2px_4px_#333333]'
     : 'text-blue-600 shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff]';

  const getTitle = () => {
      switch(type) {
          case 'rename': return 'Rename Node';
          case 'add': return 'Add New Topic';
          case 'pin': return 'Name Navigation Pin';
          default: return '';
      }
  };

  const getPlaceholder = () => {
      switch(type) {
          case 'rename': return 'Enter node name...';
          case 'add': return 'Enter topic name...';
          case 'pin': return 'Enter pin label (e.g. "Draft Section")';
          default: return '';
      }
  };

  const getButtonText = () => {
       switch(type) {
          case 'rename': return 'Save';
          case 'add': return 'Add';
          case 'pin': return 'Place Pin';
          default: return 'Submit';
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-md p-8 rounded-3xl transform transition-all scale-100 border-none ${modalClass}`}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-6 tracking-tight opacity-90">
          {getTitle()}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={`w-full px-5 py-4 rounded-xl outline-none transition-all ${inputClass}`}
            placeholder={getPlaceholder()}
            autoFocus
          />
          
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className={btnClass}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              className={`${btnClass} ${!value.trim() ? 'opacity-50 cursor-not-allowed' : primaryBtnClass}`}
            >
              {getButtonText()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
