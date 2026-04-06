export interface Task {
  id: string;
  title: string;
  category: string;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
  pinned?: boolean;
}

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    work: '#3b82f6',
    personal: '#8b5cf6',
    shopping: '#ec4899',
    health: '#22c55e',
    other: '#6b7280',
  };
  return colors[category] ?? '#6b7280';
};