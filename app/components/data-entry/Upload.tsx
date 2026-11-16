"use client";

import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import { Icon } from "../../icons/Icon";

export interface UploadPictureProps {
  /** "3:2" (132 × 96px) or "1:1" (96 × 96px) */
  ratio?: "3:2" | "1:1";
  /** Uploaded image URL (controlled) */
  value?: string;
  /** File name under the image */
  name?: string;
  /** Progress from 0 to 100: shows the "Uploading" state */
  progress?: number;
  /** `true` shows "Error Text", a string shows that string */
  error?: boolean | string;
  disabled?: boolean;
  /** Accepted file types */
  accept?: string;
  /** Called when a file is chosen (the upload itself is up to you) */
  onSelect?: (file: File) => void;
  onCancel?: () => void;
  onRemove?: () => void;
  onPreview?: (url: string) => void;
  className?: string;
}


// Figma: 96px high, 132px wide in 3:2, 96px in 1:1
const widths = { "3:2": "w-[132px]", "1:1": "w-24" };

/* ───────── Figma dashed border: 1px, 4px dashes, 2px gaps ───────── */

function DashedBorder({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={cn("pointer-events-none absolute inset-0 size-full", className)}>
      <rect
        x="0.5"
        y="0.5"
        rx="3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 2"
        style={{ width: "calc(100% - 1px)", height: "calc(100% - 1px)" }}
      />
    </svg>
  );
}

export function UploadPicture({
  ratio = "3:2",
  value,
  name,
  progress,
  error = false,
  disabled = false,
  accept = "image/*",
  onSelect,
  onCancel,
  onRemove,
  onPreview,
  className,
}: UploadPictureProps) {
  const [inner, setInner] = useState<{ url: string; name: string } | null>(null);
  const url = value ?? inner?.url;

  // Free the preview URL when the image changes or the component unmounts
  useEffect(() => {
    const preview = inner?.url;
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [inner?.url]);
  const fileName = name ?? inner?.name ?? "IMG.png";

  const uploading = progress !== undefined;
  const uploaded = !!url && !uploading;

  const pick = (file?: File) => {
    if (!file) return;
    if (value === undefined) setInner({ url: URL.createObjectURL(file), name: file.name });
    onSelect?.(file);
  };

  const box = cn("relative h-24 shrink-0 overflow-hidden rounded border", widths[ratio]);

  /* ─── Uploading: "30%  Cancel" and a progress bar ─── */
  const progressCard = uploading && (
    <div className={cn(box, "flex flex-col justify-center gap-1.5 border-neutral-200 bg-white px-4")}>
      <div className="flex items-center gap-1 text-caption">
        <span className="font-medium text-neutral-600">{progress}%</span>
        <button
          type="button"
          onClick={onCancel}
          className="text-neutral-500 transition-colors hover:cursor-pointer hover:text-brand-hover active:cursor-default active:text-brand-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Cancel
        </button>
      </div>
      <div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} className="h-1 w-full overflow-hidden rounded-full bg-neutral-200">
        <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );

  /* ─── Uploaded: the image, with eye and trash on hover ─── */
  const pictureCard = uploaded && (
    <div className="group relative">
      {/* Error tooltip above the image */}
      {error && !disabled && (
        <span
          role="alert"
          className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-neutral-700 px-2.5 py-1.5 text-body text-white group-hover:block"
        >
          Couldn&apos;t upload
          <span aria-hidden="true" className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-neutral-700" />
        </span>
      )}

      <div className={cn(box, "bg-white", error && !disabled ? "border-danger-600" : "border-neutral-200", disabled && "opacity-40")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={fileName} className="size-full object-cover" />

        {/* Dark overlay with actions, on hover (or always on error) */}
        {!disabled && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center gap-3 bg-black/60 text-white transition-opacity",
              error ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
          >
            {!error && (
              <button
                type="button"
                aria-label="Preview"
                onClick={() => onPreview?.(url!)}
                className="flex hover:cursor-pointer active:cursor-default focus-visible:outline-2 focus-visible:outline-brand"
              >
                <Icon name="show" size={16} />
              </button>
            )}
            <button
              type="button"
              aria-label="Delete"
              onClick={() => {
                if (value === undefined) setInner(null);
                onRemove?.();
              }}
              className="flex hover:cursor-pointer active:cursor-default focus-visible:outline-2 focus-visible:outline-brand"
            >
              <Icon name="delete" size={16} />
            </button>
          </div>
        )}
      </div>

      {/* File name, 4px under the image (Regular/Caption) */}
      <span className={cn("mt-1 block truncate text-center text-caption", widths[ratio], error && !disabled ? "text-danger-600" : "text-neutral-500")}>
        {fileName}
      </span>
    </div>
  );

  /* ─── Default: "+ Upload". Hover and Error: 4/2 dashed border ─── */
  const emptyCard = !uploading && !uploaded && (
    <label
      className={cn(
        box,
        "group flex flex-col items-center justify-center gap-1 bg-white text-body transition-colors",
        "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand",
        disabled
          ? "cursor-default border-neutral-200 text-neutral-400"
          : cn(
              "text-neutral-500 hover:cursor-pointer active:cursor-default",
              // Error: red dashed border | otherwise gray, teal dashed on hover
              error ? "border-transparent" : "border-neutral-200 hover:border-transparent"
            )
      )}
    >
      <input type="file" accept={accept} disabled={disabled} onChange={(e) => pick(e.target.files?.[0])} className="sr-only" />
      <Icon name="plus" size={20} />
      Upload

      {!disabled && (
        <DashedBorder
          className={
            error
              ? "text-danger-600"
              : "text-brand-hover opacity-0 transition-opacity group-hover:opacity-100 group-active:text-brand-pressed"
          }
        />
      )}
    </label>
  );

  return (
    <div className={cn("inline-flex flex-col", className)}>
      {progressCard || pictureCard || emptyCard}

      {/* Error text, 4px under the empty field (Regular/Body) */}
      {error && !disabled && !uploaded && (
        <span role="alert" className="mt-1 text-body text-danger-600">
          {error === true ? "Error Text" : error}
        </span>
      )}
    </div>
  );
}

/* ───────── Variants ───────── */

/** 3:2 format (132 × 96px) */
export const UploadPicture32 = (props: Omit<UploadPictureProps, "ratio">) => <UploadPicture ratio="3:2" {...props} />;

/** 1:1 format (96 × 96px) */
export const UploadPicture11 = (props: Omit<UploadPictureProps, "ratio">) => <UploadPicture ratio="1:1" {...props} />;