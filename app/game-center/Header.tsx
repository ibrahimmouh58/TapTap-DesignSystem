"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "../lib/utils";
import { Icon } from "../icons/Icon";
import { BadgeDot } from "../components/data-display/Badge";

const iconButton =
  "relative flex size-8 items-center justify-center rounded-full text-white transition-colors hover:cursor-pointer hover:bg-white/15 active:bg-white/25 focus-visible:outline-2 focus-visible:outline-white";

export function Header() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  // White field as soon as there is text (or while typing)
  const filled = query.length > 0;

  const search = () => {
    const q = query.trim();
    if (q) router.push(`/game-center/search?q=${encodeURIComponent(q)}`);
  };

  // ✕ empties the field and puts the cursor back in it
  const clear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <header className="relative flex h-[60px] w-full shrink-0 items-center bg-brand px-4 text-white">
      {/* Logo | section name */}
      <div className="flex items-center gap-3">
        <span className="text-h3 font-bold italic">TapTap</span>
        <span aria-hidden="true" className="h-4 w-px bg-white/70" />
        <span className="text-body">Game Center</span>
      </div>

      {/* Search: translucent when empty, white with dark text when focused or filled */}
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          search();
        }}
        className="absolute left-1/2 w-[35%] min-w-60 -translate-x-1/2"
      >
        <label
          className={cn(
            "flex h-8 items-center gap-2 rounded px-3 transition-colors focus-within:bg-white focus-within:text-neutral-400",
            filled ? "bg-white text-neutral-400" : "bg-white/40 text-white hover:bg-white/50"
          )}
        >
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search"
            className="peer min-w-0 flex-1 bg-transparent text-caption text-neutral-700 outline-none placeholder:text-white focus:placeholder:text-neutral-400"
          />

          {/* ✕ before the research, only when there is text */}
          {filled && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={clear}
              className="flex text-neutral-300 transition-colors hover:cursor-pointer hover:text-neutral-400"
            >
              <Icon name="error" variant="filled" size={14} />
            </button>
          )}

          <button type="submit" aria-label="Search" className="flex hover:cursor-pointer hover:text-brand">
            <Icon name="search" size={14} />
          </button>
        </label>
      </form>

      <div className="ml-auto flex items-center gap-3">
        <button type="button" aria-label="Language" className={iconButton}>
          <Icon name="earth" size={18} />
        </button>
        <button type="button" aria-label="Notifications" className={iconButton}>
          <Icon name="info" size={18} />
          <BadgeDot className="absolute right-1.5 top-1.5 ring-1 ring-brand" />
        </button>
        <button
          type="button"
          aria-label="Account"
          className="flex size-8 items-center justify-center rounded-full bg-white text-brand hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <Icon name="user" size={18} />
        </button>
      </div>
    </header>
  );
}