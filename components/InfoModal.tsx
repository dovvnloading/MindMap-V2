
import React, { useEffect, useState } from 'react';
import { Theme } from '../types';
import { X as CloseIcon, Github, Globe, Twitter, Keyboard, MousePointer2, Command, Heart, ShieldAlert } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  const isDark = theme === Theme.DARK;

  // Modal Container Style
  const modalClass = isDark
     ? 'bg-[#292929] text-[#E0E0E0] shadow-[10px_10px_30px_#1f1f1f,-10px_-10px_30px_#333333]'
     : 'bg-[#E0E5EC] text-[#4A5568] shadow-[10px_10px_30px_#b8b9be,-10px_-10px_30px_#ffffff]';

  // Section Container (Inset)
  const insetClass = isDark
     ? 'bg-[#252525] shadow-[inset_3px_3px_6px_#1a1a1a,inset_-3px_-3px_6px_#3a3a3a] border border-[#333]'
     : 'bg-[#eef0f4] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] border border-white';

  // Button Style
  const btnClass = `p-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-2
    ${isDark 
       ? 'bg-[#292929] text-gray-400 shadow-[4px_4px_8px_#1f1f1f,-4px_-4px_8px_#333333] hover:text-white hover:shadow-[2px_2px_4px_#1f1f1f,-2px_-2px_4px_#333333] active:shadow-[inset_2px_2px_4px_#1f1f1f,inset_-2px_-2px_4px_#333333]' 
       : 'bg-[#E0E5EC] text-gray-600 shadow-[5px_5px_10px_#b8b9be,-5px_-5px_10px_#ffffff] hover:text-gray-900 hover:shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] active:shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff]'
    }
  `;

  // Pill Link Style
  const linkClass = `
    flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all
    ${isDark
        ? 'bg-[#292929] text-gray-400 shadow-[3px_3px_6px_#1f1f1f,-3px_-3px_6px_#333333] hover:text-blue-400 hover:shadow-[1px_1px_2px_#1f1f1f,-1px_-1px_2px_#333333] active:shadow-[inset_2px_2px_4px_#1f1f1f,inset_-2px_-2px_4px_#333333]'
        : 'bg-[#E0E5EC] text-gray-600 shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] hover:text-blue-600 hover:shadow-[2px_2px_4px_#b8b9be,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff]'
    }
  `;

  return (
    <div 
        className={`
            fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm 
            transition-opacity duration-300
            ${isOpen ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={onClose}
    >
      <div 
        className={`
            w-full max-w-2xl max-h-[85vh] rounded-3xl transform transition-all duration-300 overflow-hidden flex flex-col
            ${modalClass}
            ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 pb-4 border-b ${isDark ? 'border-[#333]' : 'border-gray-200'}`}>
            <h2 className="text-xl font-bold tracking-tight">Information</h2>
            <button onClick={onClose} className={btnClass}>
                <CloseIcon size={18} />
            </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
            
            {/* Documentation Section */}
            <section>
                <div className="flex items-center gap-2 mb-4 opacity-70">
                    <Keyboard size={18} />
                    <h3 className="text-sm font-bold uppercase tracking-widest">How to Use</h3>
                </div>
                
                <div className={`p-6 rounded-2xl ${insetClass} grid md:grid-cols-2 gap-6`}>
                    <div>
                        <h4 className={`text-sm font-bold mb-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Markdown Syntax</h4>
                        <ul className="space-y-2 text-sm opacity-80 font-mono">
                            <li><span className="opacity-50"># </span> Root Topic</li>
                            <li><span className="opacity-50">## </span> Child Node</li>
                            <li><span className="opacity-50">### </span> Grandchild Node</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className={`text-sm font-bold mb-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Controls</h4>
                        <ul className="space-y-2 text-sm opacity-80">
                            <li className="flex items-center gap-2"><MousePointer2 size={12} /> Drag canvas to pan</li>
                            <li className="flex items-center gap-2"><Command size={12} /> Scroll to zoom</li>
                            <li className="flex items-center gap-2"><MousePointer2 size={12} /> Right-click node to edit</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Developer Credits Section */}
            <section>
                <div className="flex items-center gap-2 mb-4 opacity-70">
                    <Heart size={18} />
                    <h3 className="text-sm font-bold uppercase tracking-widest">Credits</h3>
                </div>

                <div className={`p-8 rounded-2xl flex flex-col items-center text-center ${insetClass}`}>
                    <div className={`w-20 h-20 rounded-full mb-4 flex items-center justify-center text-3xl font-bold ${
                        isDark 
                        ? 'bg-[#292929] shadow-[5px_5px_10px_#1a1a1a,-5px_-5px_10px_#3a3a3a] text-blue-400' 
                        : 'bg-[#E0E5EC] shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] text-blue-600'
                    }`}>
                        MW
                    </div>
                    
                    <h4 className="text-xl font-bold mb-1">Matthew Robert Wesney</h4>
                    <p className="text-sm opacity-60 mb-6 max-w-sm">
                        Designed and developed with a passion for clean, functional, and aesthetic user interfaces.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        <a 
                            href="https://matt-wesney.github.io/website/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={linkClass}
                        >
                            <Globe size={14} />
                            <span>Website</span>
                        </a>
                        <a 
                            href="https://github.com/dovvnloading" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={linkClass}
                        >
                            <Github size={14} />
                            <span>Github</span>
                        </a>
                        <a 
                            href="https://x.com/D3VAUX" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={linkClass}
                        >
                            <Twitter size={14} />
                            <span>D3VAUX</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* Legal / Disclaimer Section */}
            <section>
                <div className="flex items-center gap-2 mb-4 opacity-70">
                    <ShieldAlert size={18} />
                    <h3 className="text-sm font-bold uppercase tracking-widest">License & Disclaimer</h3>
                </div>

                <div className={`p-6 rounded-2xl ${insetClass}`}>
                    <p className="text-sm font-medium mb-3 opacity-90">
                        Proprietary Software Notice
                    </p>
                    <p className="text-sm opacity-70 leading-relaxed mb-4">
                        This application is the intellectual property of the developer and is provided solely for educational and practical use within this web application. It represents dedicated hard work and original design.
                    </p>
                    
                    <div className={`p-4 rounded-xl text-xs leading-relaxed mb-4 ${
                        isDark ? 'bg-red-900/20 text-red-200 border border-red-900/30' : 'bg-red-50 text-red-900 border border-red-100'
                    }`}>
                        <strong className="block mb-2 font-bold uppercase tracking-wide opacity-90">Strictly Prohibited Actions:</strong>
                        <ul className="space-y-1.5 list-disc list-inside opacity-80">
                            <li>Cloning, copying, or extracting source code or UI components.</li>
                            <li>Redistribution, mirroring, or hosting duplicate versions.</li>
                            <li>Any form of monetization, commercial use, or financial gain.</li>
                            <li>Repurposing the design or architecture for other projects.</li>
                            <li>Modifying source files or removing developer credits.</li>
                        </ul>
                    </div>

                    <p className="text-[11px] uppercase tracking-wide font-bold opacity-50">
                        By using this app, you agree to respect these terms and the developer's work.
                    </p>
                </div>
            </section>

        </div>
      </div>
    </div>
  );
};
    
