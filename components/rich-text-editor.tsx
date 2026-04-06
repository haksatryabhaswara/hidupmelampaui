"use client";

import { useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Link2,
  Eraser,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minRows?: number;
}

function ToolBtn({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault(); // Keep focus in editor
        onClick();
      }}
      className="p-1.5 rounded hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-4 bg-[var(--border)] mx-1 flex-shrink-0" />;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Tulis konten...",
  minRows = 10,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Set initial HTML content on mount only to avoid cursor jumping on re-render
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const exec = (command: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, val ?? undefined);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleLink = () => {
    const url = window.prompt("Masukkan URL tautan:");
    if (url) exec("createLink", url);
  };

  return (
    <div className="border border-[var(--border)] rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[var(--primary)]/30 focus-within:border-[var(--primary)]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-[var(--border)] bg-[var(--muted)]/50">
        <ToolBtn title="Bold (Ctrl+B)" onClick={() => exec("bold")}>
          <Bold className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Italic (Ctrl+I)" onClick={() => exec("italic")}>
          <Italic className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Underline (Ctrl+U)" onClick={() => exec("underline")}>
          <Underline className="w-3.5 h-3.5" />
        </ToolBtn>
        <Sep />
        <ToolBtn title="Heading 2" onClick={() => exec("formatBlock", "h2")}>
          <Heading2 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Heading 3" onClick={() => exec("formatBlock", "h3")}>
          <Heading3 className="w-3.5 h-3.5" />
        </ToolBtn>
        <Sep />
        <ToolBtn title="Bullet list" onClick={() => exec("insertUnorderedList")}>
          <List className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Numbered list" onClick={() => exec("insertOrderedList")}>
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Blockquote" onClick={() => exec("formatBlock", "blockquote")}>
          <Quote className="w-3.5 h-3.5" />
        </ToolBtn>
        <Sep />
        <ToolBtn title="Insert link" onClick={handleLink}>
          <Link2 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Remove formatting" onClick={() => exec("removeFormat")}>
          <Eraser className="w-3.5 h-3.5" />
        </ToolBtn>
      </div>

      {/* Placeholder style */}
      <style>{`.rte-editable:empty::before { content: attr(data-placeholder); color: var(--muted-foreground, #9ca3af); pointer-events: none; }`}</style>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={() => {
          if (editorRef.current) onChange(editorRef.current.innerHTML);
        }}
        style={{ minHeight: `${minRows * 1.6}rem` }}
        className={[
          "rte-editable px-3 py-2.5 text-sm text-[var(--foreground)] focus:outline-none",
          "[&_h2]:text-lg [&_h2]:font-bold [&_h2]:my-2",
          "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:my-1.5",
          "[&_ul]:list-disc [&_ul]:ml-5 [&_ul]:my-1",
          "[&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:my-1",
          "[&_li]:my-0.5",
          "[&_blockquote]:border-l-4 [&_blockquote]:border-[var(--primary)] [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-2 [&_blockquote]:text-[var(--muted-foreground)]",
          "[&_a]:text-[var(--primary)] [&_a]:underline",
          "[&_strong]:font-bold [&_em]:italic",
        ].join(" ")}
      />
    </div>
  );
}
