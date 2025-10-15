import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, Check, ChevronsUpDown, Search } from "lucide-react";

/**
 * MultiSelect
 * props:
 *  - options: [{ value: string, label: string }]
 *  - value: string[] (selected values)
 *  - onChange: (vals: string[]) => void
 *  - placeholder?: string
 *  - disabled?: boolean
 *  - maxTagCount?: number (how many tags to render before +N)
 *  - className?: string (extra classes for the trigger)
 */
export default function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = "Select...",
  disabled = false,
  maxTagCount = 3,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  const map = useMemo(() => {
    const m = new Map();
    for (const o of options) m.set(o.value, o.label);
    return m;
  }, [options]);

  const selected = useMemo(
    () => value.map(v => ({ value: v, label: map.get(v) ?? v })),
    [value, map]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(o => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  const toggle = (val) => {
    if (!onChange) return;
    const set = new Set(value);
    set.has(val) ? set.delete(val) : set.add(val);
    onChange(Array.from(set));
  };

  const removeOne = (val) => {
    if (!onChange) return;
    onChange(value.filter(v => v !== val));
  };

  const clearAll = () => onChange?.([]);

  const selectAllVisible = () => {
    const visibleVals = filtered.map(o => o.value);
    const set = new Set(value);
    visibleVals.forEach(v => set.add(v));
    onChange(Array.from(set));
  };

  return (
    <div className="relative" ref={rootRef}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={[
          "w-full bg-gray-800 text-gray-100 border border-gray-700 rounded-xl px-3 py-2",
          "flex items-center justify-between gap-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        ].join(" ")}
      >
        <div className="flex items-center gap-2 flex-wrap text-left">
          {selected.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            <>
              {selected.slice(0, maxTagCount).map(s => (
                <span
                  key={s.value}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-700 border border-gray-600"
                  onClick={e => e.stopPropagation()}
                >
                  {s.label}
                  <button
                    type="button"
                    className="opacity-70 hover:opacity-100"
                    onClick={(e) => { e.stopPropagation(); removeOne(s.value); }}
                    aria-label={`Remove ${s.label}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selected.length > maxTagCount && (
                <span className="text-xs text-gray-400">
                  +{selected.length - maxTagCount} more
                </span>
              )}
            </>
          )}
        </div>
        <ChevronsUpDown className="w-4 h-4 shrink-0 text-gray-400" />
      </button>

      {/* Dropdown */}
      {open && !disabled && (
        <div className="absolute z-50 mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-xl">
          <div className="p-2 border-b border-gray-800 flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search platforms…"
              className="w-full bg-transparent outline-none text-sm text-gray-100 placeholder-gray-500"
            />
          </div>

          <div className="max-h-60 overflow-auto py-1">
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-400">No results</div>
            )}
            {filtered.map(opt => {
              const checked = value.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(opt.value)}
                  className={[
                    "w-full px-3 py-2 text-left flex items-center justify-between",
                    "hover:bg-gray-800 focus:bg-gray-800",
                    checked ? "text-teal-300" : "text-gray-200",
                  ].join(" ")}
                  role="option"
                  aria-selected={checked}
                >
                  <span className="text-sm">{opt.label}</span>
                  {checked && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>

          <div className="p-2 border-t border-gray-800 flex items-center justify-between">
            <button
              type="button"
              onClick={selectAllVisible}
              className="text-xs text-teal-300 hover:text-teal-200"
            >
              Select all (visible)
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-gray-400 hover:text-gray-200"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs text-gray-200 hover:text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
