export type OrganizeMode = 'smart' | 'az' | 'za';

interface OrgNode {
  originalContent: string;
  children: OrgNode[];
}

export const organizeMarkdown = (markdown: string, mode: OrganizeMode): string => {
  const lines = markdown.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return markdown;

  // 1. Build Tree
  const root: OrgNode = { originalContent: 'root', children: [] };
  // Stack tracks the current path.
  // level 0 = virtual root
  const stack: { node: OrgNode, level: number }[] = [{ node: root, level: 0 }];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    let level = 0;
    let content = trimmed;

    const headerMatch = trimmed.match(/^(#+)\s*(.*)/);
    
    // Strategy: We strictly respect Headers (#) for level.
    // Text without headers is treated as a child of the current context, 
    // effectively nesting it one level deeper than the current tip of stack.
    if (headerMatch) {
        level = headerMatch[1].length;
        content = headerMatch[2].trim();
    } else {
        // Non-header line.
        // In this app's parser logic, text nodes are children.
        // We will treat them as implicit children.
        // If the current Tip is Level N, this becomes Level N+1.
        level = stack[stack.length - 1].level + 1;
        
        // Remove bullet points if present for normalization
        content = content.replace(/^[-*+]\s+/, '').trim();
    }
    
    // Find parent: The nearest node in stack with level < current level
    // This handles skipped levels (e.g. # -> ###) by attaching ### to #.
    // When we serialize back, it will naturally become ## (fixing the skip).
    while (stack.length > 1 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    const newNode: OrgNode = { originalContent: content, children: [] };
    const parent = stack[stack.length - 1].node;
    parent.children.push(newNode);
    
    stack.push({ node: newNode, level });
  });

  // 2. Transform (Sort)
  const processNode = (node: OrgNode) => {
    if (mode === 'az') {
      node.children.sort((a, b) => a.originalContent.localeCompare(b.originalContent));
    } else if (mode === 'za') {
      node.children.sort((a, b) => b.originalContent.localeCompare(a.originalContent));
    }
    // 'smart' assumes structural cleanup (already done by tree-building) 
    // and just standardizes format. No sorting.

    node.children.forEach(processNode);
  };

  processNode(root);

  // 3. Serialize
  const outputLines: string[] = [];
  
  const serialize = (node: OrgNode, level: number) => {
     if (level > 0) {
         // Force standardized format: # Name
         const prefix = '#'.repeat(level);
         outputLines.push(`${prefix} ${node.originalContent}`);
     }
     
     node.children.forEach(child => serialize(child, level + 1));
  };
  
  // Start serialization from root's children. 
  // Root children start at level 1 (e.g. # Root).
  root.children.forEach(child => serialize(child, 1)); 

  return outputLines.join('\n');
};