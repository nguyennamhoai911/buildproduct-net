// Seed data for catalogs - Design categories with parent-child relationships

export const catalogSeedData = [
  // UI/UX Design
  { id: 1, name: 'UI/UX Design', parentId: null },
  { id: 2, name: 'Web Design', parentId: 1 },
  { id: 3, name: 'Mobile Design', parentId: 1 },
  { id: 4, name: 'Dashboard Design', parentId: 1 },
  { id: 5, name: 'Landing Pages', parentId: 1 },
  { id: 6, name: 'E-commerce', parentId: 1 },
  
  // Graphic Design
  { id: 10, name: 'Graphic Design', parentId: null },
  { id: 11, name: 'Logos & Branding', parentId: 10 },
  { id: 12, name: 'Illustrations', parentId: 10 },
  { id: 13, name: 'Icons', parentId: 10 },
  { id: 14, name: 'Typography', parentId: 10 },
  { id: 15, name: 'Posters & Flyers', parentId: 10 },
  
  // Components
  { id: 20, name: 'Components', parentId: null },
  { id: 21, name: 'Buttons', parentId: 20 },
  { id: 22, name: 'Forms', parentId: 20 },
  { id: 23, name: 'Cards', parentId: 20 },
  { id: 24, name: 'Navigation', parentId: 20 },
  { id: 25, name: 'Modals', parentId: 20 },
  { id: 26, name: 'Tables', parentId: 20 },
  
  // Patterns
  { id: 30, name: 'Patterns & Layouts', parentId: null },
  { id: 31, name: 'Grid Systems', parentId: 30 },
  { id: 32, name: 'Hero Sections', parentId: 30 },
  { id: 33, name: 'Footers', parentId: 30 },
  { id: 34, name: 'Pricing Tables', parentId: 30 },
  { id: 35, name: 'Testimonials', parentId: 30 },
  
  // Colors & Styles
  { id: 40, name: 'Colors & Styles', parentId: null },
  { id: 41, name: 'Color Palettes', parentId: 40 },
  { id: 42, name: 'Gradients', parentId: 40 },
  { id: 43, name: 'Shadows', parentId: 40 },
  { id: 44, name: 'Animations', parentId: 40 },
  
  // 3D & Motion
  { id: 50, name: '3D & Motion', parentId: null },
  { id: 51, name: '3D Objects', parentId: 50 },
  { id: 52, name: 'Animations', parentId: 50 },
  { id: 53, name: 'Transitions', parentId: 50 },
  
  // Photography
  { id: 60, name: 'Photography', parentId: null },
  { id: 61, name: 'Product Photos', parentId: 60 },
  { id: 62, name: 'Portraits', parentId: 60 },
  { id: 63, name: 'Landscapes', parentId: 60 },
  { id: 64, name: 'Abstract', parentId: 60 },
];
