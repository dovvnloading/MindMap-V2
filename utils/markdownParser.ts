import { MindMapNode } from '../types';

export const parseMarkdownToTree = (markdown: string): MindMapNode => {
  // Use regex to handle both \n and \r\n
  const lines = markdown.split(/\r?\n/);
  
  if (markdown.trim() === '') {
      return { id: 'root', lineIndex: 0, name: 'Start Typing...', children: [] };
  }

  // Helper to generate unique stable IDs based on path
  const usedIds = new Set<string>();
  const getId = (text: string, parentId: string) => {
    const slug = text.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'node';
    const base = parentId === 'virtual-root' ? slug : `${parentId}-${slug}`;
    let candidate = base;
    let count = 1;
    while(usedIds.has(candidate)) {
        candidate = `${base}-${count}`;
        count++;
    }
    usedIds.add(candidate);
    return candidate;
  };

  const virtualRoot: MindMapNode = { id: 'virtual-root', lineIndex: -1, name: 'Virtual Root', children: [] };
  
  const stack: { node: MindMapNode; level: number }[] = [];
  stack.push({ node: virtualRoot, level: 0 });

  lines.forEach((line, index) => {
    // We strictly track the line index for the ID, but skip empty lines for structure
    if (line.trim() === '') return;

    const match = line.match(/^(#+)\s*(.*)/);
    
    let level = 0;
    let text = line.trim();

    if (match) {
        level = match[1].length;
        text = match[2].trim() || 'Untitled';
    } else {
        // Text node (implicit level based on parent)
        level = stack.length > 1 ? stack[stack.length - 1].level + 1 : 1;
    }

    // Pop stack until we find the parent
    while (stack.length > 1 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].node;
    const stableId = getId(text, parent.id);

    const newNode: MindMapNode = {
      id: stableId,
      lineIndex: index,
      name: text,
      children: [],
    };

    parent.children = parent.children || [];
    parent.children.push(newNode);
    
    stack.push({ node: newNode, level });
  });

  if (virtualRoot.children && virtualRoot.children.length === 1) {
      return virtualRoot.children[0];
  }
  
  return virtualRoot.children && virtualRoot.children.length > 0 
      ? virtualRoot 
      : { id: 'root', lineIndex: 0, name: 'Empty', children: [] };
};