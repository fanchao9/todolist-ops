"use client";

import { FormEvent, useMemo, useState } from "react";

type TodoItem = {
  id: number;
  text: string;
  priority: number;
  isRemoving?: boolean;
};

export default function Home() {
  const [items, setItems] = useState<TodoItem[]>([]);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("");
  const [error, setError] = useState("");

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.priority - b.priority || a.id - b.id),
    [items]
  );

  const missingPriorities = useMemo(() => {
    if (items.length === 0) return [];

    const unique = Array.from(new Set(items.map((x) => x.priority))).sort((a, b) => a - b);
    const min = unique[0];
    const max = unique[unique.length - 1];

    const missing: number[] = [];
    for (let p = min; p <= max; p++) {
      if (!unique.includes(p)) missing.push(p);
    }

    return missing;
  }, [items]);

  const handleAdd = (event: FormEvent) => {
    event.preventDefault();
    const parsedPriority = Number(priority);

    if (!text.trim()) {
      setError("Task description is required.");
      return;
    }

    if (!Number.isInteger(parsedPriority) || parsedPriority <= 0) {
      setError("Priority must be a positive integer.");
      return;
    }

    setItems((prev) => [
      ...prev,
      { id: Date.now(), text: text.trim(), priority: parsedPriority },
    ]);

    setText("");
    setPriority("");
    setError("");
  };

  const handleDelete = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              isRemoving: true,
            }
          : item
      )
    );
  };

  const handleAnimationEnd = (itemId: number, isRemoving: boolean | undefined) => {
    if (!isRemoving) return;
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-4 text-slate-900 dark:bg-slate-950 dark:text-zinc-100">
      <main className="mx-auto w-full max-w-3xl rounded-2xl bg-white p-8 shadow-lg dark:bg-slate-900">
        <h1 className="mb-4 text-3xl font-bold">Priority To-Do List</h1>

        <form onSubmit={handleAdd} className="mb-6 grid gap-3 sm:grid-cols-[1fr_120px_120px]">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What needs to be done?"
            className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
          />
          <input
            type="number"
            min={1}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            placeholder="Priority"
            className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
          />
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Add
          </button>
        </form>

        {error && <p className="mb-4 text-red-600 dark:text-red-400">{error}</p>}

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold">Current tasks</h2>
          {sortedItems.length === 0 ? (
            <p className="text-slate-500">No tasks yet. Add your first task above.</p>
          ) : (
            <ul className="space-y-2">
              {sortedItems.map((item) => {
                const animationClass = item.isRemoving ? "animate-slide-out" : "animate-slide-in";

                return (
                  <li
                    key={item.id}
                    onAnimationEnd={() => handleAnimationEnd(item.id, item.isRemoving)}
                    className={`flex items-center justify-between rounded border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800 ${animationClass}`}
                  >
                    <div>
                      <strong className="mr-2">[{item.priority}]</strong>
                      <span>{item.text}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

          {items.length === 0 ? (
            <p className="text-slate-500">No tasks yet, so no missing priorities to show.</p>
          ) : missingPriorities.length === 0 ? (
            <p className="text-emerald-600">No missing priorities between min and max values.</p>
          ) : (
            <section>
            <h2 className="mb-2 text-l font-semibold text-rose-600">Missing priorities</h2>
            <p className="text-sm text-rose-500/90">{missingPriorities.join(", ")}</p>
            </section>
          )}
      </main>

      <style jsx global>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-out {
          from {
            opacity: 1;
            transform: translateX(0);
            height: auto;
            margin-bottom: 0.5rem;
          }
          to {
            opacity: 0;
            transform: translateX(20px);
            height: 0;
            margin-bottom: 0;
          }
        }

        .animate-slide-in {
          animation: slide-in 250ms ease-out;
        }

        .animate-slide-out {
          animation: slide-out 250ms ease-in;
        }
      `}</style>
    </div>
  );
}
