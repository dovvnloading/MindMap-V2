
import React, { useState, useCallback, useRef } from 'react';
import { Editor } from './components/Editor';
import { MindMap } from './components/MindMap';
import { InputModal } from './components/InputModal';
import { OrganizeMenu } from './components/OrganizeMenu';
import { ColorPaletteMenu } from './components/ColorPaletteMenu';
import { PinMenu } from './components/PinMenu';
import { InfoModal } from './components/InfoModal';
import { Theme, ViewMode, Pin } from './types';
import { INITIAL_MARKDOWN, COLOR_PALETTES } from './constants';
import { organizeMarkdown, OrganizeMode } from './utils/organizer';
import { 
  Download, 
  Moon, 
  Sun, 
  Layout, 
  Maximize2,
  Code2,
  Share2,
  ListTree,
  Palette,
  Info,
  MapPin
} from 'lucide-react';

const App: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(INITIAL_MARKDOWN);
  const [theme, setTheme] = useState<Theme>(Theme.DARK);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [organizeOpen, setOrganizeOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [pinMenuOpen, setPinMenuOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [activePaletteKey, setActivePaletteKey] = useState<string>('default');
  const [layoutResetTrigger, setLayoutResetTrigger] = useState(0);
  
  // Pin State
  const [pins, setPins] = useState<Pin[]>([]);
  const [focusTarget, setFocusTarget] = useState<{nodeId: string, trigger: number} | null>(null);
  
  const organizeBtnRef = useRef<HTMLButtonElement>(null);
  const paletteBtnRef = useRef<HTMLButtonElement>(null);
  const pinBtnRef = useRef<HTMLButtonElement>(null);

  // Modal State
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'rename' | 'add' | 'pin';
    lineIndex: number | null;
    nodeId: string | null;
    initialValue: string;
  }>({
    isOpen: false,
    type: 'rename',
    lineIndex: null,
    nodeId: null,
    initialValue: ''
  });

  const getLines = useCallback(() => markdown.split(/\r?\n/), [markdown]);
  
  const getLineLevel = (line: string) => {
    const match = line.match(/^(#+)/);
    return match ? match[1].length : 0;
  };

  const handleNodeEdit = useCallback((index: number, newName: string) => {
    const lines = getLines();
    if (lines.length === 1 && lines[0].trim() === '' && index === 0) {
         setMarkdown(`# ${newName}`);
         return;
    }
    if (index >= 0 && index < lines.length) {
        const line = lines[index];
        const level = getLineLevel(line);
        const prefix = level > 0 ? '#'.repeat(level) + ' ' : '';
        lines[index] = `${prefix}${newName}`;
        setMarkdown(lines.join('\n'));
    }
  }, [getLines]);

  const handleNodeAddChild = useCallback((index: number, childName: string) => {
    const lines = getLines();
    if (lines.length === 1 && lines[0].trim() === '' && index === 0) {
        setMarkdown(`# Root\n## ${childName}`);
        return;
    }
    if (index >= 0 && index < lines.length) {
        const parentLine = lines[index];
        const parentLevel = getLineLevel(parentLine);
        const childLevel = (parentLevel === 0 ? 1 : parentLevel + 1);
        const newLine = `${'#'.repeat(childLevel)} ${childName}`;
        let insertIndex = index + 1;
        while (insertIndex < lines.length) {
            const nextLine = lines[insertIndex];
            if (nextLine.trim() === '') {
                insertIndex++;
                continue;
            }
            const nextLevel = getLineLevel(nextLine);
            if (nextLevel > parentLevel || nextLevel === 0) {
                insertIndex++;
            } else {
                break;
            }
        }
        const newLines = [...lines];
        newLines.splice(insertIndex, 0, newLine);
        setMarkdown(newLines.join('\n'));
    }
  }, [getLines]);

  const handleNodeDelete = useCallback((index: number) => {
    const lines = getLines();
    if (index >= 0 && index < lines.length) {
        const targetLevel = getLineLevel(lines[index]);
        let endIndex = index + 1;
        while(endIndex < lines.length) {
            const nextLine = lines[endIndex];
            if (nextLine.trim() === '') {
                 endIndex++;
                 continue;
            }
            const level = getLineLevel(nextLine);
            if (level > targetLevel || level === 0) {
                endIndex++;
            } else {
                break;
            }
        }
        const newLines = [...lines];
        newLines.splice(index, endIndex - index);
        setMarkdown(newLines.join('\n'));
    }
  }, [getLines]);

  // --- PIN LOGIC ---
  const handleAddPinRequest = useCallback((nodeId: string) => {
      setModal({ 
          isOpen: true, 
          type: 'pin', 
          lineIndex: null, 
          nodeId: nodeId, 
          initialValue: '' 
      });
  }, []);

  const handleRemovePin = useCallback((nodeId: string) => {
      setPins(prev => prev.filter(p => p.nodeId !== nodeId));
  }, []);

  const handlePinSubmit = useCallback((label: string) => {
      if (modal.nodeId) {
          const newPin: Pin = {
              id: crypto.randomUUID(),
              nodeId: modal.nodeId,
              label: label
          };
          setPins(prev => [...prev, newPin]);
      }
  }, [modal.nodeId]);

  const handleNavigateToPin = (pin: Pin) => {
      setFocusTarget({ nodeId: pin.nodeId, trigger: Date.now() });
      setPinMenuOpen(false);
  };

  const requestNodeEdit = useCallback((index: number) => {
    const lines = getLines();
    let currentName = '';
    if (index >= 0 && index < lines.length) {
      const match = lines[index].match(/^(#+)?\s*(.*)/);
      if (match) currentName = match[2];
    }
    setModal({ isOpen: true, type: 'rename', lineIndex: index, nodeId: null, initialValue: currentName });
  }, [getLines]);

  const requestNodeAddChild = useCallback((index: number) => {
      setModal({ isOpen: true, type: 'add', lineIndex: index, nodeId: null, initialValue: '' });
  }, []);

  const handleModalSubmit = (value: string) => {
    if (modal.type === 'pin') {
        handlePinSubmit(value);
    } else if (modal.lineIndex !== null) {
      if (modal.type === 'rename') {
        handleNodeEdit(modal.lineIndex, value);
      } else {
        handleNodeAddChild(modal.lineIndex, value);
      }
    }
  };

  const handleExport = useCallback(() => {
    // Target specific MindMap SVG to avoid selecting icons
    const svg = document.getElementById('mindmap-svg') as unknown as SVGSVGElement;
    if (!svg) {
        console.error("MindMap SVG not found");
        return;
    }

    const g = svg.querySelector('g') as unknown as SVGGElement;
    if (!g) {
        console.error("No content group found in SVG");
        return;
    }

    // Get the bounding box of the content (untransformed coordinates relative to the group)
    const bbox = g.getBBox();
    
    // Safety check for empty maps
    if (bbox.width === 0 || bbox.height === 0) {
        console.warn("Map is empty, nothing to export");
        return;
    }

    // Add generous padding
    const padding = 60;
    const width = Math.ceil(bbox.width + (padding * 2));
    const height = Math.ceil(bbox.height + (padding * 2));

    // Clone the SVG node
    const clone = svg.cloneNode(true) as SVGSVGElement;
    
    // Configure the clone's attributes
    clone.setAttribute('width', width.toString());
    clone.setAttribute('height', height.toString());
    clone.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${width} ${height}`);
    
    // Reset transform on the group in the clone so it renders naturally within the viewBox
    const cloneG = clone.querySelector('g');
    if (cloneG) {
        cloneG.setAttribute('transform', '');
    }

    // Add Background Rectangle
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute('width', width.toString());
    bg.setAttribute('height', height.toString());
    bg.setAttribute('x', (bbox.x - padding).toString());
    bg.setAttribute('y', (bbox.y - padding).toString());
    bg.setAttribute('fill', theme === Theme.DARK ? '#292929' : '#E0E5EC');
    
    // Insert background as the first child
    clone.insertBefore(bg, clone.firstChild);

    // Embed Fonts to ensure text renders correctly in the Canvas
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
      text { font-family: 'Inter', sans-serif !important; }
    `;
    clone.prepend(style);

    // Serialize SVG to XML
    const serializer = new XMLSerializer();
    const svgData = serializer.serializeToString(clone);
    
    // Create Blob and URL
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // Draw to Canvas
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = theme === Theme.DARK ? '#292929' : '#E0E5EC';
            ctx.fillRect(0, 0, width, height); // Fallback background fill
            ctx.drawImage(img, 0, 0);
            
            try {
                const pngUrl = canvas.toDataURL('image/png', 1.0);
                const a = document.createElement('a');
                a.href = pngUrl;
                a.download = `mindmap-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } catch (err) {
                console.error("Canvas export failed", err);
            }
            URL.revokeObjectURL(url);
        }
    };
    img.onerror = (e) => {
        console.error("Error loading SVG image for export", e);
        URL.revokeObjectURL(url);
    };
    img.crossOrigin = "anonymous";
    img.src = url;

  }, [theme]);

  const handleOrganize = (mode: OrganizeMode) => {
      const newMarkdown = organizeMarkdown(markdown, mode);
      setMarkdown(newMarkdown);
      setOrganizeOpen(false);
  };
  
  const handleResetLayout = () => {
      setLayoutResetTrigger(prev => prev + 1);
      setOrganizeOpen(false);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
  };

  const currentColors = COLOR_PALETTES[activePaletteKey]?.colors || COLOR_PALETTES.default.colors;

  // Neumorphic/Soft UI Styles
  const isDark = theme === Theme.DARK;
  
  const bgClass = isDark ? 'bg-[#292929]' : 'bg-[#E0E5EC]';
  const textClass = isDark ? 'text-[#E0E0E0]' : 'text-[#4A5568]';
  
  // Soft raised effect
  const panelClass = isDark 
    ? 'shadow-[5px_5px_10px_#1f1f1f,-5px_-5px_10px_#333333]'
    : 'shadow-[6px_6px_16px_#b8b9be,-6px_-6px_16px_#ffffff]';

  // Soft button style
  const btnClass = `
    p-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-2
    ${isDark 
       ? 'bg-[#292929] text-gray-400 shadow-[4px_4px_8px_#1f1f1f,-4px_-4px_8px_#333333] hover:text-white hover:shadow-[2px_2px_4px_#1f1f1f,-2px_-2px_4px_#333333] active:shadow-[inset_2px_2px_4px_#1f1f1f,inset_-2px_-2px_4px_#333333]' 
       : 'bg-[#E0E5EC] text-gray-600 shadow-[5px_5px_10px_#b8b9be,-5px_-5px_10px_#ffffff] hover:text-gray-900 hover:shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] active:shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff]'
    }
  `;
  
  const activeBtnClass = isDark
    ? 'text-blue-400 shadow-[inset_2px_2px_4px_#1f1f1f,inset_-2px_-2px_4px_#333333]'
    : 'text-blue-600 shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff]';

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${bgClass} ${textClass} font-['Inter']`}>
      
      {/* App Header */}
      <header className={`h-16 flex items-center justify-between px-6 z-20 relative select-none ${bgClass}`}>
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'shadow-[4px_4px_8px_#1f1f1f,-4px_-4px_8px_#333333]' : 'shadow-[6px_6px_16px_#b8b9be,-6px_-6px_16px_#ffffff]'}`}>
            <Share2 className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div>
             <h1 className="font-bold text-lg tracking-tight leading-none opacity-90">MindMap</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
             
             {/* Pins Menu */}
             <div className="relative">
                 <button
                    ref={pinBtnRef}
                    onClick={() => setPinMenuOpen(!pinMenuOpen)}
                    className={`${btnClass} px-3 font-medium text-sm ${pinMenuOpen ? activeBtnClass : ''}`}
                    title="Navigation Pins"
                 >
                    <MapPin size={16} className={pins.length > 0 ? "fill-current" : ""} />
                    {pins.length > 0 && <span className="ml-1 text-[10px] opacity-70">({pins.length})</span>}
                 </button>

                 <PinMenu 
                    isOpen={pinMenuOpen}
                    onClose={() => setPinMenuOpen(false)}
                    pins={pins}
                    onSelectPin={handleNavigateToPin}
                    onRemovePin={handleRemovePin}
                    theme={theme}
                    buttonRef={pinBtnRef}
                 />
             </div>

             <div className={`h-8 w-px mx-2 ${isDark ? 'bg-[#1f1f1f] shadow-[1px_0_0_#333333]' : 'bg-[#d1d5db] shadow-[1px_0_0_#ffffff]'}`}></div>

             {/* Organize Button */}
             <div className="relative">
                 <button
                    ref={organizeBtnRef}
                    onClick={() => setOrganizeOpen(!organizeOpen)}
                    className={`${btnClass} px-4 font-medium text-sm ${organizeOpen ? activeBtnClass : ''}`}
                 >
                    <ListTree size={16} />
                    <span className="hidden sm:inline">Organize</span>
                 </button>

                 <OrganizeMenu 
                    isOpen={organizeOpen}
                    onClose={() => setOrganizeOpen(false)}
                    onSelect={handleOrganize}
                    onResetLayout={handleResetLayout}
                    theme={theme}
                    buttonRef={organizeBtnRef}
                 />
             </div>

             <div className={`h-8 w-px mx-2 ${isDark ? 'bg-[#1f1f1f] shadow-[1px_0_0_#333333]' : 'bg-[#d1d5db] shadow-[1px_0_0_#ffffff]'}`}></div>

             {/* View Toggle */}
             <div className={`flex items-center p-1 rounded-xl ${isDark ? 'bg-[#292929] shadow-[inset_2px_2px_5px_#1f1f1f,inset_-2px_-2px_5px_#333333]' : 'bg-[#E0E5EC] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff]'}`}>
                <button onClick={() => setViewMode('editor')} className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'editor' ? (isDark ? 'bg-[#333333] shadow-sm text-blue-400' : 'bg-[#f0f3f7] shadow-sm text-blue-600') : 'opacity-60 hover:opacity-100'}`}><Code2 size={16} /></button>
                <button onClick={() => setViewMode('split')} className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'split' ? (isDark ? 'bg-[#333333] shadow-sm text-blue-400' : 'bg-[#f0f3f7] shadow-sm text-blue-600') : 'opacity-60 hover:opacity-100'}`}><Layout size={16} /></button>
                <button onClick={() => setViewMode('map')} className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'map' ? (isDark ? 'bg-[#333333] shadow-sm text-blue-400' : 'bg-[#f0f3f7] shadow-sm text-blue-600') : 'opacity-60 hover:opacity-100'}`}><Maximize2 size={16} /></button>
             </div>

            <div className={`h-8 w-px mx-2 ${isDark ? 'bg-[#1f1f1f] shadow-[1px_0_0_#333333]' : 'bg-[#d1d5db] shadow-[1px_0_0_#ffffff]'}`}></div>

            {/* Actions */}
            <button onClick={handleExport} className={btnClass} title="Export PNG">
              <Download size={20} />
            </button>

            {/* Palette Button */}
            <div className="relative">
                <button 
                    ref={paletteBtnRef}
                    onClick={() => setPaletteOpen(!paletteOpen)} 
                    className={`${btnClass} ${paletteOpen ? activeBtnClass : ''}`}
                >
                    <Palette size={20} />
                </button>
                <ColorPaletteMenu 
                    isOpen={paletteOpen}
                    onClose={() => setPaletteOpen(false)}
                    onSelect={(key) => {
                        setActivePaletteKey(key);
                        setPaletteOpen(false);
                    }}
                    currentPaletteId={activePaletteKey}
                    theme={theme}
                    buttonRef={paletteBtnRef}
                />
            </div>

            <button onClick={toggleTheme} className={btnClass}>
              {theme === Theme.DARK ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Info Button */}
            <button 
                onClick={() => setInfoOpen(true)} 
                className={`${btnClass} ${infoOpen ? activeBtnClass : ''}`}
                title="Info & Credits"
            >
                <Info size={20} />
            </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden relative p-4 gap-4">
        {/* Editor Panel */}
        <div 
          className={`
            transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] relative rounded-3xl overflow-hidden
            ${viewMode === 'split' ? 'w-[450px]' : viewMode === 'editor' ? 'w-full' : 'w-0 opacity-0 pointer-events-none hidden'}
          `}
        >
          <div className="absolute inset-0 w-full h-full">
            <Editor 
                value={markdown} 
                onChange={setMarkdown} 
                theme={theme}
                colors={currentColors}
            />
          </div>
        </div>

        {/* Map Panel */}
        <div 
          className={`
            flex-1 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] relative rounded-3xl overflow-hidden
            ${isDark ? 'bg-[#292929] shadow-[inset_5px_5px_10px_#1f1f1f,inset_-5px_-5px_10px_#333333]' : 'bg-[#E0E5EC] shadow-[inset_6px_6px_16px_#b8b9be,inset_-6px_-6px_16px_#ffffff]'}
            ${viewMode === 'editor' ? 'w-0 opacity-0 pointer-events-none hidden' : 'w-full'}
          `}
        >
            <MindMap 
                markdown={markdown} 
                theme={theme}
                colors={currentColors}
                layoutResetTrigger={layoutResetTrigger}
                pins={pins}
                focusTarget={focusTarget}
                onEditNode={requestNodeEdit}
                onAddChildNode={requestNodeAddChild}
                onDeleteNode={handleNodeDelete}
                onAddPinNode={handleAddPinRequest}
                onRemovePinNode={handleRemovePin}
            />
            
            {/* Overlay hint if empty */}
            {!markdown.trim() && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center opacity-30">
                        <p className="text-xl font-medium">Map is empty</p>
                        <p className="text-sm">Type in the editor to start</p>
                    </div>
                </div>
            )}
        </div>
      </main>

      {/* Input Modal */}
      <InputModal
        isOpen={modal.isOpen}
        type={modal.type}
        initialValue={modal.initialValue}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        onSubmit={handleModalSubmit}
        theme={theme}
      />

      {/* Info Modal */}
      <InfoModal 
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
        theme={theme}
      />
    </div>
  );
};

export default App;
