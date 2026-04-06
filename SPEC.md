# Task Tracker App Specification

## 1. Project Overview

- **Project Name**: Task Tracker
- **Type**: Web Application (Next.js)
- **Core Functionality**: A clean, intuitive task management app for creating, organizing, and tracking tasks with categories, due dates, and completion status
- **Target Users**: Individuals and teams managing daily tasks and projects

## 2. UI/UX Specification

### Layout Structure

- **Header**: Fixed top bar with app logo/title and add task button
- **Main Content**: Task list with filtering and sorting controls
- **Sidebar** (desktop): Category filter panel
- **Responsive Breakpoints**:
  - Mobile: < 768px (single column, collapsible sidebar)
  - Desktop: >= 768px (sidebar visible)

### Visual Design

**Color Palette**:
- Background: `#0f0f0f` (deep black)
- Surface: `#1a1a1a` (card background)
- Surface Hover: `#252525`
- Primary Accent: `#f97316` (vibrant orange)
- Primary Hover: `#ea580c`
- Text Primary: `#fafafa`
- Text Secondary: `#a1a1a1`
- Border: `#2a2a2a`
- Success: `#22c55e`
- Warning: `#eab308`
- Danger: `#ef4444`

**Category Colors**:
- Work: `#3b82f6` (blue)
- Personal: `#8b5cf6` (purple)
- Shopping: `#ec4899` (pink)
- Health: `#22c55e` (green)
- Other: `#6b7280` (gray)

**Typography**:
- Font Family: `"Outfit", sans-serif` (Google Fonts)
- Headings: 700 weight
- Body: 400 weight
- Font Sizes:
  - App Title: 24px
  - Task Title: 16px
  - Body/Meta: 14px
  - Small: 12px

**Spacing System**:
- Base unit: 4px
- Card padding: 16px
- Section gaps: 24px
- Element gaps: 12px

**Visual Effects**:
- Card shadows: `0 4px 20px rgba(0,0,0,0.3)`
- Border radius: 12px (cards), 8px (buttons/inputs)
- Transitions: 200ms ease-out for all interactive elements

### Components

**Task Card**:
- Checkbox (circular, orange when complete)
- Task title (strikethrough when complete)
- Category badge (colored pill)
- Due date display
- Delete button (appears on hover)
- States: default, hover, completed

**Add Task Modal**:
- Title input field
- Category dropdown
- Due date picker
- Save/Cancel buttons

**Filter Panel**:
- "All Tasks" option
- Category filter buttons
- "Active Only" / "Completed Only" toggle

**Empty State**:
- Illustrated message when no tasks exist
- Prompt to add first task

## 3. Functionality Specification

### Core Features

1. **Create Task**
   - Input title (required)
   - Select category (default: "Other")
   - Set due date (optional)
   - Tasks persist in localStorage

2. **Complete/Uncomplete Task**
   - Click checkbox to toggle completion
   - Visual feedback (strikethrough, muted colors)

3. **Delete Task**
   - Hover to reveal delete button
   - Click to remove task

4. **Filter Tasks**
   - Filter by category
   - Filter by status (All/Active/Completed)

5. **Task Count**
   - Display total active/completed counts in header

### Data Structure

```typescript
interface Task {
  id: string;
  title: string;
  category: 'work' | 'personal' | 'shopping' | 'health' | 'other';
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
}
```

### Edge Cases
- Empty task title: Show validation error
- No tasks: Show empty state
- Long task titles: Truncate with ellipsis (max 2 lines)

## 4. Acceptance Criteria

- [ ] App loads without errors
- [ ] Can create a new task with title, category, and due date
- [ ] Tasks persist after page refresh (localStorage)
- [ ] Can mark tasks as complete/incomplete
- [ ] Can delete tasks
- [ ] Category filter works correctly
- [ ] Status filter (All/Active/Completed) works correctly
- [ ] Task counts update correctly
- [ ] Responsive layout works on mobile and desktop
- [ ] Empty state displays when no tasks exist
- [ ] All animations and transitions are smooth