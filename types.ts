
import { HierarchyPointNode, HierarchyLink } from 'd3';

export interface MindMapNode {
  id: string;
  lineIndex: number;
  name: string;
  children?: MindMapNode[];
  _children?: MindMapNode[]; // For storing collapsed children
  color?: string;
  depth?: number;
}

// Extends d3.HierarchyPointNode directly.
// We explicitly override properties to ensure TypeScript recognizes them on the D3Node interface.
export interface D3Node extends HierarchyPointNode<MindMapNode> {
  data: MindMapNode;
  id?: string;
  depth: number;
  x: number;
  y: number;
  
  // Override recursive references
  parent: D3Node | null;
  children?: D3Node[] | undefined;
  
  // D3 methods overrides for strict typing
  descendants(): D3Node[];
  links(): D3Link[];

  // Custom properties
  x0?: number; // Previous x position for animation
  y0?: number; // Previous y position for animation
  _children?: D3Node[]; // D3's internal storage for collapsed nodes
}

export interface D3Link extends HierarchyLink<MindMapNode> {
  source: D3Node;
  target: D3Node;
}

export interface Pin {
  id: string;
  nodeId: string;
  label: string;
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export type ViewMode = 'split' | 'editor' | 'map';
