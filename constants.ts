
export const INITIAL_MARKDOWN = `# Root
## Subtopic 1
## Subtopic 2`;

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
}

export const COLOR_PALETTES: Record<string, ColorPalette> = {
  default: {
    id: 'default',
    name: 'Default',
    colors: [
      '#FF7F50', // Coral
      '#4ECDC4', // Medium Turquoise
      '#FF6B6B', // Pastel Red
      '#FFE66D', // Pastel Yellow
      '#1A535C', // Dark Cyan
      '#F7FFF7', // Mint Cream
      '#A8DADC', // Powder Blue
      '#457B9D', // Celadon Blue
      '#E63946', // Red Pigment
      '#2A9D8F', // Persian Green
    ]
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Breeze',
    colors: [
      '#00B4D8', // Sky Blue
      '#90E0EF', // Light Cyan
      '#0077B6', // Star Command Blue
      '#03045E', // Navy
      '#48CAE4', // Pacific Blue
      '#ADE8F4', // Powder Blue
      '#023E8A', // Royal Blue
      '#CAF0F8', // Light Blue
    ]
  },
  forest: {
    id: 'forest',
    name: 'Forest Walk',
    colors: [
      '#606C38', // Dark Olive
      '#283618', // Dark Green
      '#FEFAE0', // Cornsilk
      '#DDA15E', // Buff
      '#BC6C25', // Tiger's Eye
      '#2A9D8F', // Persian Green
      '#E9C46A', // Sandy Brown
    ]
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Blvd',
    colors: [
      '#F72585', // Fluorescent Pink
      '#7209B7', // Purple
      '#3A0CA3', // Dark Blue
      '#4361EE', // Blue
      '#4CC9F0', // Vivid Sky Blue
      '#F72585', // Pink
    ]
  },
  monochrome: {
    id: 'monochrome',
    name: 'Slate Mono',
    colors: [
      '#64748B', // Slate 500
      '#94A3B8', // Slate 400
      '#475569', // Slate 600
      '#CBD5E1', // Slate 300
      '#334155', // Slate 700
    ]
  }
};

export const DEFAULT_PALETTE = COLOR_PALETTES.default;
