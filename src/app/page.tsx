"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth, Category } from "@/lib/auth";
import { Task, getCategoryColor } from "@/lib/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const STORAGE_KEY = "task-tracker-tasks";

interface SortableTaskItemProps {
  task: Task;
  categories: Category[];
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  togglePin: (id: string) => void;
}

function SortableTaskItem({ task, categories, toggleTask, deleteTask, togglePin }: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-[var(--surface)] rounded-2xl p-4 flex items-center gap-3 md:gap-4 shadow-sm border border-[var(--border)] transition-all duration-200 hover:border-[var(--primary)]/30 ${
        task.completed ? "opacity-60 grayscale-[0.5]" : ""
      } ${isDragging ? "shadow-2xl border-[var(--primary)] opacity-100 grayscale-0 cursor-grabbing" : ""} ${task.pinned ? "border-l-4 border-l-[var(--primary)]" : ""}`}
    >
      {/* Drag handle - Always visible on mobile, hover on desktop */}
      <div
        {...attributes}
        {...listeners}
        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-grab active:cursor-grabbing p-2 -ml-2 md:opacity-0 group-hover:opacity-100 transition-opacity touch-none"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8h16M4 12h16M4 16h16" />
        </svg>
      </div>

      {/* Checkbox */}
      <button
        onClick={() => toggleTask(task.id)}
        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 transition-all duration-200 flex items-center justify-center ${
          task.completed
            ? "bg-[var(--primary)] border-[var(--primary)]"
            : "border-[var(--border)] hover:border-[var(--primary)]"
        }`}
      >
        {task.completed && (
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className={`text-base font-medium truncate ${task.completed ? "line-through text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}`}>
          {task.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
          {task.pinned && (
            <span className="text-[10px] text-[var(--primary)] font-bold uppercase tracking-widest flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
              </svg>
              Pinned
            </span>
          )}
          <span
            className="text-[10px] md:text-xs px-2 py-0.5 rounded-md font-bold uppercase tracking-wider"
            style={{ backgroundColor: getCategoryColor(task.category as any) + "15", color: getCategoryColor(task.category as any) }}
          >
            {categories.find(c => c.value === task.category)?.label || task.category}
          </span>
          {task.dueDate && (
            <span className="text-[10px] md:text-xs text-[var(--text-secondary)] flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center">
        <button
          onClick={() => togglePin(task.id)}
          className={`p-2 rounded-xl transition-all duration-200 ${
            task.pinned 
              ? "text-[var(--primary)] bg-[var(--primary)]/10" 
              : "text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 md:opacity-0 group-hover:opacity-100"
          }`}
          title={task.pinned ? "Unpin task" : "Pin task"}
        >
          <svg className={`w-5 h-5 ${task.pinned ? "fill-current" : "stroke-current fill-none"}`} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
          </svg>
        </button>
        <button
          onClick={() => deleteTask(task.id)}
          className="md:opacity-0 group-hover:opacity-100 p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const { user, logout, addCategory } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed">("all");
  const [newTask, setNewTask] = useState({ title: "", category: "", dueDate: "" });
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#3b82f6");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150, // Added delay for mobile to distinguish between scroll and drag
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((t) => t.id === active.id);
        const newIndex = items.findIndex((t) => t.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const CATEGORY_COLORS = [
    "#3b82f6", "#8b5cf6", "#ec4899", "#22c55e", "#f97316",
    "#eab308", "#ef4444", "#06b6d4", "#84cc16", "#6b7280",
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  useEffect(() => {
    if (!user || !isClient) return;
    const userKey = `${STORAGE_KEY}-${user.id}`;
    const stored = localStorage.getItem(userKey);
    if (stored) {
      try {
        setTasks(JSON.parse(stored));
      } catch {
        localStorage.removeItem(userKey);
      }
    }
  }, [user, isClient]);

  useEffect(() => {
    if (!user || !isClient) return;
    const userKey = `${STORAGE_KEY}-${user.id}`;
    localStorage.setItem(userKey, JSON.stringify(tasks));
  }, [tasks, user, isClient]);

  useEffect(() => {
    if (user?.categories?.length && !newTask.category) {
      setNewTask(prev => ({ ...prev, category: user.categories[0].value }));
    }
  }, [user, newTask.category]);

  const addTask = () => {
    if (!newTask.title.trim()) {
      setError("Task title is required");
      return;
    }
    if (!newTask.category) {
      setError("Select a category");
      return;
    }
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title.trim(),
      category: newTask.category,
      dueDate: newTask.dueDate || null,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks([task, ...tasks]);
    setNewTask({ title: "", category: user?.categories[0]?.value || "", dueDate: "" });
    setError("");
    setShowModal(false);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const togglePin = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, pinned: !t.pinned } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const value = newCategoryName.trim().toLowerCase().replace(/\s+/g, "-");
    addCategory({ value, label: newCategoryName.trim(), color: newCategoryColor });
    setNewCategoryName("");
    setNewCategoryColor(CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)]);
    setShowAddCategory(false);
  };

  const filteredTasks = tasks
    .filter(task => {
      if (filterCategory !== "all" && task.category !== filterCategory) return false;
      if (filterStatus === "active" && task.completed) return false;
      if (filterStatus === "completed" && !task.completed) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0; // Maintain existing order within groups
    });

  const activeCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  if (!user) {
    return null;
  }

  const categories = user.categories || [];

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[var(--surface)]/80 backdrop-blur-md border-b border-[var(--border)] px-4 md:px-6 py-3 md:py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] leading-tight"><span className="text-[#FA7315]">Adi</span> Task</h1>
            <p className="hidden md:block text-xs text-[var(--text-secondary)]">Welcome, {user.name}</p>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:flex items-center gap-3 text-sm font-semibold">
              <span className="text-[var(--success)] bg-[var(--success)]/10 px-2 py-1 rounded-lg">
                {activeCount} Active
              </span>
              <span className="text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-1 rounded-lg">
                {completedCount} Done
              </span>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="hidden md:block bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
            >
              + Add Task
            </button>
            <button
              onClick={() => { logout(); router.push("/login"); }}
              className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto pt-20 md:pt-24 px-4 md:px-6">
        {/* Filters Container */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Categories - Horizontal Scroll on Mobile */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
            <button
              onClick={() => setFilterCategory("all")}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex-shrink-0 ${
                filterCategory === "all"
                  ? "bg-[var(--primary)]/10 text-[var(--primary)] ring-1 ring-[var(--primary)]/20"
                  : "bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              All Tasks
            </button>
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setFilterCategory(cat.value)}
                className="whitespace-nowrap px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex-shrink-0"
                style={{
                  backgroundColor: cat.color + (filterCategory === cat.value ? "25" : "10"),
                  color: cat.color,
                  boxShadow: filterCategory === cat.value ? `inset 0 0 0 1.5px ${cat.color}80` : "none",
                }}
              >
                {cat.label}
              </button>
            ))}
            <button
              onClick={() => setShowAddCategory(true)}
              className="whitespace-nowrap px-3.5 py-2 rounded-xl text-sm font-medium text-[var(--primary)] bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 transition-all duration-200 flex-shrink-0"
            >
              + Add
            </button>
          </div>

          {/* Status Filters */}
          <div className="flex gap-2 bg-[var(--surface)] p-1 rounded-2xl w-full sm:w-fit sm:ml-auto border border-[var(--border)]">
            <button
              onClick={() => setFilterStatus("all")}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                filterStatus === "all" ? "bg-[var(--background)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                filterStatus === "active" ? "bg-[var(--success)]/10 text-[var(--success)] shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--success)]"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus("completed")}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                filterStatus === "completed" ? "bg-[var(--primary)]/10 text-[var(--primary)] shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--primary)]"
              }`}
            >
              Done
            </button>
          </div>
        </div>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-20 bg-[var(--surface)] rounded-2xl border border-dashed border-[var(--border)]">
            <div className="text-5xl mb-4 opacity-30 grayscale">📝</div>
            <p className="text-[var(--text-secondary)] font-medium mb-1">No tasks found</p>
            <p className="text-[var(--text-secondary)]/60 text-sm">Time to relax or add something new!</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredTasks.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {filteredTasks.map(task => (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    categories={categories}
                    toggleTask={toggleTask}
                    deleteTask={deleteTask}
                    togglePin={togglePin}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Floating Action Button (FAB) - Mobile only */}
      <button
        onClick={() => setShowModal(true)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-[var(--primary)] text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)} />
          <div className="relative bg-[var(--surface)] rounded-t-3xl sm:rounded-2xl p-6 w-full max-w-md shadow-2xl border-t sm:border border-[var(--border)] transition-all duration-300">
            <div className="w-12 h-1.5 bg-[var(--border)] rounded-full mx-auto mb-6 sm:hidden" />
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Add New Task</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title..."
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  autoFocus
                />
                {error && <p className="text-[var(--danger)] text-sm mt-1">{error}</p>}
              </div>

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Category</label>
                <select
                  value={newTask.category}
                  onChange={e => setNewTask({ ...newTask, category: e.target.value })}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowModal(false); setError(""); setNewTask({ title: "", category: categories[0]?.value || "", dueDate: "" }); }}
                className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addTask}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold transition-colors"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowAddCategory(false)} />
          <div className="relative bg-[var(--surface)] rounded-t-3xl sm:rounded-2xl p-6 w-full max-w-sm shadow-2xl border-t sm:border border-[var(--border)] transition-all duration-300">
            <div className="w-12 h-1.5 bg-[var(--border)] rounded-full mx-auto mb-6 sm:hidden" />
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Add Category</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Name</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Home, Projects, Travel"
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORY_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewCategoryColor(color)}
                      className={`w-8 h-8 rounded-full transition-transform ${newCategoryColor === color ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-[var(--surface)]" : ""}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowAddCategory(false); setNewCategoryName(""); }}
                className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}