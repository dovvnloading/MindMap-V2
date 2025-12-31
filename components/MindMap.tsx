
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { parseMarkdownToTree } from '../utils/markdownParser';
import { MindMapNode, D3Node, D3Link, Theme, Pin } from '../types';
import { ZoomIn, ZoomOut, Move } from 'lucide-react';
import { ContextMenu } from './ContextMenu';

interface MindMapProps {
  markdown: string;
  theme: Theme;
  colors: string[];
  layoutResetTrigger?: number;
  pins: Pin[];
  focusTarget: { nodeId: string; trigger: number } | null;
  onEditNode?: (lineIndex: number) => void;
  onAddChildNode?: (lineIndex: number) => void;
  onDeleteNode?: (lineIndex: number) => void;
  onAddPinNode?: (nodeId: string) => void;
  onRemovePinNode?: (nodeId: string) => void;
}

export const MindMap: React.FC<MindMapProps> = ({ 
    markdown, 
    theme,
    colors,
    layoutResetTrigger = 0,
    pins,
    focusTarget,
    onEditNode,
    onAddChildNode,
    onDeleteNode,
    onAddPinNode,
    onRemovePinNode
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<MindMapNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [expansionTrigger, setExpansionTrigger] = useState(0);
  
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    lineIndex: number | null;
    nodeId: string | null;
    hasChildren: boolean;
    isCollapsed: boolean;
    hasPin: boolean;
  }>({ 
      visible: false, 
      x: 0, 
      y: 0, 
      lineIndex: null, 
      nodeId: null, 
      hasChildren: false, 
      isCollapsed: false,
      hasPin: false
  });

  const rootRef = useRef<D3Node | null>(null);
  const svgGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const nodePositions = useRef<Map<string, {x: number, y: number}>>(new Map());
  const prevResetTriggerRef = useRef(layoutResetTrigger);
  const collapsedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!wrapperRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    resizeObserver.observe(wrapperRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const treeData = parseMarkdownToTree(markdown);
    setData(treeData);
  }, [markdown]);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    const { width, height } = dimensions;

    const svg = d3.select(svgRef.current)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .on("click", () => {
             setContextMenu(prev => ({ ...prev, visible: false }));
        })
        .on("contextmenu", (event) => {
             event.preventDefault();
             setContextMenu({
                 visible: true,
                 x: event.pageX,
                 y: event.pageY,
                 lineIndex: null,
                 nodeId: null,
                 hasChildren: false,
                 isCollapsed: false,
                 hasPin: false
             });
        });

    if (!svgGroupRef.current) {
        svg.selectAll("*").remove();
        const g = svg.append("g");
        svgGroupRef.current = g;

        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
                setContextMenu(prev => ({ ...prev, visible: false }));
            });
        
        zoomBehaviorRef.current = zoom;
        svg.call(zoom);
        svg.call(zoom.transform, d3.zoomIdentity.translate(-width / 4, 0).scale(1));
    } else {
         svg.attr("viewBox", [-width / 2, -height / 2, width, height]);
    }

  }, [dimensions]);

  // Handle Focus Target / Zoom
  useEffect(() => {
      if (!focusTarget || !svgRef.current || !zoomBehaviorRef.current || !rootRef.current) return;

      const targetNode = rootRef.current.descendants().find(d => d.data.id === focusTarget.nodeId);
      
      if (targetNode) {
          // If the node is hidden inside a collapsed branch, we might want to expand it.
          // For now, we assume the user might need to expand, or we zoom to the collapsed parent.
          // If the exact node isn't visible because a parent is collapsed, find the visible ancestor.
          let visibleNode = targetNode;
          while (visibleNode.parent && collapsedIdsRef.current.has(visibleNode.parent.data.id)) {
              visibleNode = visibleNode.parent;
          }
          // If the node itself is in collapsed list, it is still visible (it is the parent of hidden things)
          
          const scale = 1.2;
          // transform is translate(tx, ty) scale(k)
          // To center on (node.y, node.x):
          // tx = width/2 - node.y * scale
          // ty = height/2 - node.x * scale
          // Note: In our layout, x is vertical, y is horizontal.
          // d3 tree orientation: node.x is vertical, node.y is horizontal.
          // our transforms translate(d.y, d.x)
          const x = -visibleNode.y * scale;
          const y = -visibleNode.x * scale;
          
          const transform = d3.zoomIdentity
            .translate(x, y)
            .scale(scale);

          d3.select(svgRef.current).transition().duration(1200).ease(d3.easeCubicOut)
            .call(zoomBehaviorRef.current.transform, transform);
      }

  }, [focusTarget]);

  useEffect(() => {
    if (!data || !svgGroupRef.current || dimensions.width === 0) return;

    if (layoutResetTrigger !== prevResetTriggerRef.current) {
        nodePositions.current.clear();
        prevResetTriggerRef.current = layoutResetTrigger;
        
        if (svgRef.current && zoomBehaviorRef.current) {
             const svg = d3.select(svgRef.current);
             svg.transition().duration(750).call(
                 zoomBehaviorRef.current.transform,
                 d3.zoomIdentity.translate(-dimensions.width / 4, 0).scale(1)
             );
        }
    }

    const g = svgGroupRef.current;
    const root = d3.hierarchy<MindMapNode>(data) as D3Node;
    const oldRoot = rootRef.current;
    const isReset = nodePositions.current.size === 0;

    // Apply collapsed state from persistent ref
    root.descendants().forEach(d => {
        if (collapsedIdsRef.current.has(d.data.id)) {
            if (d.children) {
                d._children = d.children;
                d.children = undefined;
            }
        }
    });

    if (oldRoot && !isReset) {
        const oldNodesMap = new Map<string, D3Node>();
        (oldRoot.descendants() as D3Node[]).forEach(d => {
            if (d.data.id) oldNodesMap.set(d.data.id, d);
        });

        const traverse = (node: D3Node) => {
            const match = oldNodesMap.get(node.data.id);
            if (match) {
                node.x0 = match.x;
                node.y0 = match.y;
            } else if (node.parent && oldNodesMap.has(node.parent.data.id)) {
                 const parentMatch = oldNodesMap.get(node.parent.data.id);
                 node.x0 = parentMatch?.x || 0;
                 node.y0 = parentMatch?.y || 0;
            } else {
                node.x0 = 0;
                node.y0 = 0;
            }
            if (node.children) node.children.forEach(traverse);
            if (node._children) node._children.forEach(traverse);
        };
        traverse(root);
    } else {
        root.x0 = 0;
        root.y0 = 0;
    }

    rootRef.current = root;
    let moved = false; 
    let totalDragDistance = 0; 

    update(root);

    function getBranchColor(d: D3Node): string {
        if (d.depth === 0) {
             return theme === Theme.DARK ? '#E0E0E0' : '#4A5568';
        }
        
        let ancestor = d;
        while (ancestor.depth > 1 && ancestor.parent) {
            ancestor = ancestor.parent as D3Node;
        }
        
        if (root.data.children) {
             const idx = root.data.children.findIndex(c => c.id === ancestor.data.id);
             if (idx !== -1) return colors[idx % colors.length];
        }
        
        return colors[0];
    }

    function update(source: D3Node) {
        if (!svgGroupRef.current) return;
        
        const treeLayout = d3.tree<MindMapNode>()
            .nodeSize([80, 260]) 
            .separation((a, b) => (a.parent === b.parent ? 1.1 : 1.3));

        treeLayout(root);

        root.descendants().forEach((d) => {
            const stored = nodePositions.current.get(d.data.id);
            if (stored) {
                d.x = stored.x;
                d.y = stored.y;
            }
        });

        const nodes = root.descendants() as D3Node[];
        const links = root.links() as D3Link[];

        // --- LINKS ---
        const link = g.selectAll<SVGPathElement, D3Link>(".link")
            .data(links, (d: any) => d.target.data.id);

        const linkEnter = link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", (d) => {
                const o = { x: source.x0 || 0, y: source.y0 || 0 };
                return diagonal(o, o);
            })
            .attr("fill", "none")
            .attr("stroke", (d) => getBranchColor(d.target))
            .attr("stroke-width", d => Math.max(1.5, 3.5 - d.target.depth)) 
            .attr("stroke-opacity", 0);

        linkEnter.merge(link).transition().duration(500)
            .attr("d", (d) => diagonal(d.source, d.target))
            .attr("stroke", (d) => getBranchColor(d.target))
            .attr("stroke-width", d => Math.max(1.5, 3.5 - d.target.depth))
            .attr("stroke-opacity", 0.3) 
            .attr("opacity", 1);

        link.exit().transition().duration(500)
            .attr("d", (d) => {
                const o = { x: source.x, y: source.y };
                return diagonal(o, o);
            })
            .style("opacity", 0) // Fade out links
            .remove();

        // --- NODES ---
        const node = g.selectAll<SVGGElement, D3Node>(".node")
            .data(nodes, (d: any) => d.data.id);

        const nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", (d) => `translate(${d.y0 || source.y0 || 0},${d.x0 || source.x0 || 0})`)
            .style("opacity", 0) // Start invisible (CSS opacity)
            .on("contextmenu", (event, d) => {
                event.preventDefault();
                event.stopPropagation();
                const nodeHasPin = pins.some(p => p.nodeId === d.data.id);
                setContextMenu({
                    visible: true,
                    x: event.pageX,
                    y: event.pageY,
                    lineIndex: d.data.lineIndex,
                    nodeId: d.data.id,
                    hasChildren: !!(d.data.children && d.data.children.length > 0),
                    isCollapsed: collapsedIdsRef.current.has(d.data.id),
                    hasPin: nodeHasPin
                });
            });

        const nodeUpdate = nodeEnter.merge(node);
        
        nodeUpdate.style("cursor", d => (d.children || d._children) ? "pointer" : "default");

        // Drag Behavior
        const drag = d3.drag<SVGGElement, D3Node>()
            .on("start", (event, d) => {
                // Prevent bubbling to parent SVG zoom behavior
                if (event.sourceEvent && event.sourceEvent.stopPropagation) {
                    event.sourceEvent.stopPropagation();
                }
                
                moved = false; 
                totalDragDistance = 0; 
                d3.select(event.sourceEvent.target).style("cursor", "grabbing");
            })
            .on("drag", (event, d) => {
                // Stop propagation here as well to be safe
                if (event.sourceEvent && event.sourceEvent.stopPropagation) {
                    event.sourceEvent.stopPropagation();
                }

                const deltaX = event.dy; 
                const deltaY = event.dx;
                totalDragDistance += Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                if (totalDragDistance > 4) moved = true; 

                if (moved) {
                    const moveNode = (n: D3Node) => {
                        n.x += deltaX;
                        n.y += deltaY;
                        nodePositions.current.set(n.data.id, { x: n.x, y: n.y });
                    };
                    const traverse = (n: D3Node) => {
                        moveNode(n);
                        if (n.children) n.children.forEach(traverse);
                        if (n._children) n._children.forEach(traverse);
                    };
                    traverse(d);
                    
                    const descendants = new Set<string>();
                    const collectIds = (n: D3Node) => {
                         descendants.add(n.data.id);
                         if (n.children) n.children.forEach(collectIds);
                    }
                    collectIds(d);

                    g.selectAll<SVGGElement, D3Node>(".node")
                       .filter(node => descendants.has(node.data.id))
                       .attr("transform", n => `translate(${n.y},${n.x})`);
                    g.selectAll<SVGPathElement, D3Link>(".link")
                       .filter(l => descendants.has(l.source.data.id) || descendants.has(l.target.data.id))
                       .attr("d", l => diagonal(l.source, l.target));
                }
            })
            .on("end", (event, d) => {
                 if (event.sourceEvent && event.sourceEvent.stopPropagation) {
                    event.sourceEvent.stopPropagation();
                }

                d3.select(event.sourceEvent.target).style("cursor", (d.children || d._children) ? "pointer" : "default");
                if (!moved) {
                     if (d.children || d._children) {
                         if (d.children) {
                             d._children = d.children;
                             d.children = undefined;
                             collapsedIdsRef.current.add(d.data.id);
                         } else {
                             d.children = d._children;
                             d._children = undefined;
                             collapsedIdsRef.current.delete(d.data.id);
                         }
                         update(d);
                         setContextMenu(prev => ({ ...prev, visible: false }));
                     }
                }
            });

        nodeUpdate.call(drag);

        // Invisible Hit Target (Larger area for easier grabbing)
        nodeEnter.append("circle")
            .attr("r", 20)
            .attr("fill", "transparent")
            .attr("stroke", "none");

        // Node Circle - Create (Initial)
        nodeEnter.append("circle")
            .attr("class", "node-circle")
            .attr("r", 1e-6)
            .attr("fill", d => getBranchColor(d)) 
            .attr("stroke", "none"); 

        // Pin Indicator - Icon
        // We use a group for pin to transform/scale it easily
        const pinIconPath = "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z";
        
        // This ensures existing nodes get the pin update logic
        const pinSelection = nodeUpdate.selectAll(".pin-group")
            .data(d => {
                const pin = pins.find(p => p.nodeId === d.data.id);
                return pin ? [pin] : [];
            });

        const pinEnter = pinSelection.enter().append("g")
            .attr("class", "pin-group")
            // Position above the node.
            // Node radius is ~12 max.
            .attr("transform", "translate(-6, -24) scale(0.5)"); 

        pinEnter.append("path")
            .attr("d", pinIconPath)
            .attr("fill", "#EF4444") // Red-500
            .attr("stroke", theme === Theme.DARK ? "#292929" : "#ffffff")
            .attr("stroke-width", 2);
            
        // Remove pins if they no longer exist in data
        pinSelection.exit().remove();
        
        // Update existing pins if needed (e.g. theme change stroke)
        pinSelection.select("path")
            .attr("stroke", theme === Theme.DARK ? "#292929" : "#ffffff");

        // Node Text - Create (Initial)
        const textColor = theme === Theme.DARK ? "#E0E0E0" : "#475569";
        nodeEnter.append("text")
            .attr("dy", "0.31em")
            .attr("x", d => (d.children || d._children) ? -14 : 14)
            .attr("text-anchor", d => (d.children || d._children) ? "end" : "start")
            .style("font-family", "'Inter', sans-serif")
            .style("fill", textColor) // Use style instead of attr for priority
            .style("opacity", 1); // Opacity is handled by the group transition

        // --- UPDATE TRANSITIONS ---

        // 1. Move Node Group & Fade In
        nodeUpdate.transition().duration(500)
            .attr("transform", d => `translate(${d.y},${d.x})`)
            .style("opacity", 1); // Fade in via CSS opacity on group

        // 2. Animate Circle Attributes
        nodeUpdate.select(".node-circle")
            .transition().duration(500)
            .attr("r", d => (d as unknown as D3Node).depth === 0 ? 12 : (d as unknown as D3Node).depth === 1 ? 8 : 6) 
            .attr("fill", (d: any) => {
                const node = d as D3Node;
                // Collapsed: Fill with background (Hollow)
                if (node._children) return theme === Theme.DARK ? "#292929" : "#E0E5EC";
                return getBranchColor(node);
            })
            .attr("stroke", (d: any) => {
                const node = d as D3Node;
                // Collapsed: Stroke with branch color
                if (node._children) return getBranchColor(node);
                // Expanded: Stroke with background (gap effect)
                return theme === Theme.DARK ? "#292929" : "#E0E5EC";
            })
            .attr("stroke-width", (d: any) => (d as D3Node)._children ? 3 : 2);
            
        // 3. Animate Text Attributes
        const textSel = nodeUpdate.select("text");
        
        textSel.transition().duration(500)
             .style("fill", textColor); // Ensure color is correct in update

        // 4. Update Text Content & Position
        textSel
             .attr("x", d => (d.children || d._children) ? -18 : 18) 
             .attr("text-anchor", d => (d.children || d._children) ? "end" : "start") 
             .style("font-size", d => d.depth === 0 ? "16px" : d.depth === 1 ? "14px" : "12px")
             .style("font-weight", d => d.depth === 0 ? "700" : "600")
             .style("text-shadow", theme === Theme.DARK ? "0 1px 2px rgba(0,0,0,0.5)" : "0 1px 1px rgba(255,255,255,0.8)")
             .each(function(d) {
                 const el = d3.select(this);
                 const text = d.data.name;
                 el.text(null);
                 
                 const MAX_TEXT_WIDTH = 140; 
                 const words = text.split(/\s+/);
                 if (words.length === 0) return;
                 const x = (d.children || d._children) ? -18 : 18;
                 
                 if (text.length < 20 && words.length < 4) {
                     el.append("tspan").attr("x", x).attr("dy", "0.32em").text(text);
                     return;
                 }
                 let line: string[] = [];
                 const lines: string[] = [];
                 const tspan = el.append("tspan").text(words[0]);
                 line.push(words[0]);
                 for (let i = 1; i < words.length; i++) {
                     const word = words[i];
                     line.push(word);
                     tspan.text(line.join(" "));
                     if (tspan.node()!.getComputedTextLength() > MAX_TEXT_WIDTH) {
                         line.pop();
                         lines.push(line.join(" "));
                         line = [word];
                         tspan.text(word);
                     }
                 }
                 lines.push(line.join(" "));
                 tspan.remove();
                 const lineHeight = 1.1; 
                 const startDy = 0.32 - ((lines.length - 1) * lineHeight / 2);
                 lines.forEach((l, i) => {
                     el.append("tspan")
                       .attr("x", x)
                       .attr("dy", i === 0 ? `${startDy}em` : `${lineHeight}em`)
                       .text(l);
                 });
             });

        // 5. Exit Transition
        const nodeExit = node.exit();
        
        // Fix: Explicitly enforce text color on exit so it doesn't default to black
        nodeExit.select("text")
            .style("fill", textColor)
            .style("opacity", 1); // Ensure it starts fully opaque

        nodeExit.transition().duration(500)
            .attr("transform", d => `translate(${source.y},${source.x})`)
            .style("opacity", 0) // Fade out entire group via CSS
            .remove();

        nodes.forEach(d => {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    function diagonal(s: {x: number, y: number}, d: {x: number, y: number}) {
        const sy = s.y ?? 0;
        const sx = s.x ?? 0;
        const dy = d.y ?? 0;
        const dx = d.x ?? 0;
        return `M ${sy} ${sx} C ${(sy + dy) / 2} ${sx}, ${(sy + dy) / 2} ${dx}, ${dy} ${dx}`;
    }

  }, [data, theme, dimensions, layoutResetTrigger, colors, expansionTrigger, pins]); 

  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().call(zoomBehaviorRef.current.scaleBy, 1.2);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().call(zoomBehaviorRef.current.scaleBy, 0.8);
    }
  };

  const handleCenter = () => {
     if (svgRef.current && zoomBehaviorRef.current) {
        d3.select(svgRef.current).transition().call(
            zoomBehaviorRef.current.transform, 
            d3.zoomIdentity.translate(-dimensions.width/4, 0).scale(1)
        );
     }
  }

  const handleToggleExpand = () => {
    if (!contextMenu.nodeId) return;
    
    const id = contextMenu.nodeId;
    if (collapsedIdsRef.current.has(id)) {
        collapsedIdsRef.current.delete(id);
    } else {
        collapsedIdsRef.current.add(id);
    }
    setExpansionTrigger(prev => prev + 1);
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleAddPinAction = () => {
      if (contextMenu.nodeId && onAddPinNode) {
          onAddPinNode(contextMenu.nodeId);
      }
      setContextMenu(prev => ({ ...prev, visible: false }));
  }

  const handleRemovePinAction = () => {
      if (contextMenu.nodeId && onRemovePinNode) {
          onRemovePinNode(contextMenu.nodeId);
      }
      setContextMenu(prev => ({ ...prev, visible: false }));
  }

  const isDark = theme === Theme.DARK;
  const btnClass = `p-3 rounded-xl transition-all flex items-center justify-center 
    ${isDark 
       ? 'bg-[#292929] text-gray-400 shadow-[4px_4px_8px_#1f1f1f,-4px_-4px_8px_#333333] hover:text-white hover:shadow-[2px_2px_4px_#1f1f1f,-2px_-2px_4px_#333333] active:shadow-[inset_2px_2px_4px_#1f1f1f,inset_-2px_-2px_4px_#333333]' 
       : 'bg-[#E0E5EC] text-gray-600 shadow-[5px_5px_10px_#b8b9be,-5px_-5px_10px_#ffffff] hover:text-gray-900 hover:shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] active:shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff]'
    }`;

  return (
    <div 
        ref={wrapperRef} 
        className={`w-full h-full relative overflow-hidden`}
    >
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.05]" 
        style={{
            backgroundImage: `linear-gradient(${theme === 'dark' ? '#fff' : '#000'} 1px, transparent 1px), linear-gradient(90deg, ${theme === 'dark' ? '#fff' : '#000'} 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
        }}
      ></div>

      <svg id="mindmap-svg" ref={svgRef} className="w-full h-full touch-none select-none" style={{ cursor: 'grab' }}></svg>

      {/* Floating Controls */}
      <div 
        className="absolute bottom-6 right-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()} 
      >
        <button onClick={handleZoomIn} className={btnClass} title="Zoom In">
             <ZoomIn size={20} />
        </button>
        <button onClick={handleZoomOut} className={btnClass} title="Zoom Out">
             <ZoomOut size={20} />
        </button>
        <button onClick={handleCenter} className={btnClass} title="Center Map">
             <Move size={20} />
        </button>
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <ContextMenu 
            x={contextMenu.x}
            y={contextMenu.y}
            theme={theme}
            isNodeSelected={contextMenu.lineIndex !== null}
            hasChildren={contextMenu.hasChildren}
            isCollapsed={contextMenu.isCollapsed}
            hasPin={contextMenu.hasPin}
            onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))}
            onEdit={() => {
                if (contextMenu.lineIndex !== null && onEditNode) onEditNode(contextMenu.lineIndex);
                setContextMenu(prev => ({ ...prev, visible: false }));
            }}
            onAddChild={() => {
                if (contextMenu.lineIndex !== null && onAddChildNode) onAddChildNode(contextMenu.lineIndex);
                setContextMenu(prev => ({ ...prev, visible: false }));
            }}
            onDelete={() => {
                if (contextMenu.lineIndex !== null && onDeleteNode) onDeleteNode(contextMenu.lineIndex);
                setContextMenu(prev => ({ ...prev, visible: false }));
            }}
            onZoomIn={() => {
                handleZoomIn();
                setContextMenu(prev => ({ ...prev, visible: false }));
            }}
            onZoomOut={() => {
                handleZoomOut();
                setContextMenu(prev => ({ ...prev, visible: false }));
            }}
            onCenter={() => {
                handleCenter();
                setContextMenu(prev => ({ ...prev, visible: false }));
            }}
            onToggleExpand={handleToggleExpand}
            onAddPin={handleAddPinAction}
            onRemovePin={handleRemovePinAction}
        />
      )}
    </div>
  );
};
