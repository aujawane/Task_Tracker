export type Category = 'work' | 'personal' | 'shopping' | 'health' | 'other';

export interface Task {
  id: string;
  title: string;
  category: Category;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
}

export const CATEGORIES: { value: Category; label: string; color: string }[] = [
  { value: 'work', label: 'Work', color: '#3b82f6' },
  { value: 'personal', label: 'Personal', color: '#8b5cf6' },
  { value: 'shopping', label: 'Shopping', color: '#ec4899' },
  { value: 'health', label: 'Health', color: '#22c55e' },
  { value: 'other', label: 'Other', color: '#6b7280' },
];

export function getCategoryColor(category: Category): string {
  const cat = CATEGORIES.find(c => c.value === category);
  return cat?.color || '#6b7280';
}