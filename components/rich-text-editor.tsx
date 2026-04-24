"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  ListIndentDecrease,
  ListIndentIncrease,
  Link2,
  Link2Off,
  RemoveFormatting,
  Superscript,
  Subscript,
  Highlighter,
  Baseline,
  Minus,
  Code,
  TextAlignStart,
  TextAlignCenter,
  TextAlignEnd,
  TextAlignJustify,
  Undo2,
  Redo2,
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
        e.preventDefault();
        onClick();
      }}
      className="p-1.5 rounded text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-4 bg-[var(--border)] mx-0.5 flex-shrink-0 self-center" />;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Tulis konten...",
  minRows = 10,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const highlightInputRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  }, []);

  const exec = useCallback(
    (command: string, val?: string) => {
      editorRef.current?.focus();
      document.execCommand(command, false, val ?? undefined);
      if (editorRef.current) onChange(editorRef.current.innerHTML);
    },
    [onChange]
  );

  const handleLink = () => {
    saveSelection();
    const url = window.prompt("Masukkan URL tautan:");
    if (url) {
      restoreSelection();
      exec("createLink", url);
    }
  };

  const handleInlineCode = () => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const text = sel.toString();
      exec("insertHTML", `<code>${text}</code>`);
    }
  };

  /** Tab key: indent list items; insert 4 spaces elsewhere. Shift+Tab outdents. */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          exec("outdent");
        } else {
          // Check if we're inside a list
          const sel = window.getSelection();
          const node = sel?.anchorNode;
          const inList = !!(node && (node.parentElement?.closest("ul, ol")));
          if (inList) {
            exec("indent");
          } else {
            exec("insertHTML", "&nbsp;&nbsp;&nbsp;&nbsp;");
          }
        }
      }
    },
    [exec]
  );

  const sz = "w-3.5 h-3.5";

  return (
    <div className="border border-[var(--border)] rounded-lg focus-within:ring-2 focus-within:ring-[var(--primary)]/30 focus-within:border-[var(--primary)] flex flex-col">
      {/* Toolbar — always pinned, no CSS sticky needed */}
      <div className="flex-shrink-0 flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-[var(--border)] bg-[var(--background)] rounded-t-lg">

        {/* Undo / Redo */}
        <ToolBtn title="Undo (Ctrl+Z)" onClick={() => exec("undo")}><Undo2 className={sz} /></ToolBtn>
        <ToolBtn title="Redo (Ctrl+Y)" onClick={() => exec("redo")}><Redo2 className={sz} /></ToolBtn>
        <Sep />

        {/* Format block */}
        <select
          defaultValue=""
          onMouseDown={saveSelection}
          onChange={(e) => {
            restoreSelection();
            document.execCommand("formatBlock", false, e.target.value);
            if (editorRef.current) onChange(editorRef.current.innerHTML);
            e.target.value = "";
          }}
          className="h-7 px-1.5 text-xs rounded border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/30 cursor-pointer"
        >
          <option value="" disabled>Format</option>
          <option value="p">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="pre">Code Block</option>
          <option value="blockquote">Blockquote</option>
        </select>
        <Sep />

        {/* Inline formatting */}
        <ToolBtn title="Bold (Ctrl+B)" onClick={() => exec("bold")}><Bold className={sz} /></ToolBtn>
        <ToolBtn title="Italic (Ctrl+I)" onClick={() => exec("italic")}><Italic className={sz} /></ToolBtn>
        <ToolBtn title="Underline (Ctrl+U)" onClick={() => exec("underline")}><Underline className={sz} /></ToolBtn>
        <ToolBtn title="Strikethrough" onClick={() => exec("strikeThrough")}><Strikethrough className={sz} /></ToolBtn>
        <Sep />

        {/* Script */}
        <ToolBtn title="Superscript" onClick={() => exec("superscript")}><Superscript className={sz} /></ToolBtn>
        <ToolBtn title="Subscript" onClick={() => exec("subscript")}><Subscript className={sz} /></ToolBtn>
        <Sep />

        {/* Colors */}
        <input
          ref={colorInputRef}
          type="color"
          className="sr-only"
          onInput={(e) => {
            restoreSelection();
            exec("foreColor", (e.target as HTMLInputElement).value);
          }}
        />
        <ToolBtn title="Warna Teks" onClick={() => { saveSelection(); colorInputRef.current?.click(); }}>
          <Baseline className={sz} />
        </ToolBtn>
        <input
          ref={highlightInputRef}
          type="color"
          className="sr-only"
          onInput={(e) => {
            restoreSelection();
            exec("hiliteColor", (e.target as HTMLInputElement).value);
          }}
        />
        <ToolBtn title="Sorot Teks" onClick={() => { saveSelection(); highlightInputRef.current?.click(); }}>
          <Highlighter className={sz} />
        </ToolBtn>
        <Sep />

        {/* Alignment */}
        <ToolBtn title="Rata Kiri" onClick={() => exec("justifyLeft")}><TextAlignStart className={sz} /></ToolBtn>
        <ToolBtn title="Rata Tengah" onClick={() => exec("justifyCenter")}><TextAlignCenter className={sz} /></ToolBtn>
        <ToolBtn title="Rata Kanan" onClick={() => exec("justifyRight")}><TextAlignEnd className={sz} /></ToolBtn>
        <ToolBtn title="Rata Penuh" onClick={() => exec("justifyFull")}><TextAlignJustify className={sz} /></ToolBtn>
        <Sep />

        {/* Lists & Indent */}
        <ToolBtn title="Bullet list" onClick={() => exec("insertUnorderedList")}><List className={sz} /></ToolBtn>
        <ToolBtn title="Numbered list" onClick={() => exec("insertOrderedList")}><ListOrdered className={sz} /></ToolBtn>
        <ToolBtn title="Outdent (Shift+Tab)" onClick={() => exec("outdent")}><ListIndentDecrease className={sz} /></ToolBtn>
        <ToolBtn title="Indent (Tab)" onClick={() => exec("indent")}><ListIndentIncrease className={sz} /></ToolBtn>
        <Sep />

        {/* Code & HR */}
        <ToolBtn title="Kode Inline" onClick={handleInlineCode}><Code className={sz} /></ToolBtn>
        <ToolBtn title="Garis Pemisah" onClick={() => exec("insertHorizontalRule")}><Minus className={sz} /></ToolBtn>
        <Sep />

        {/* Links */}
        <ToolBtn title="Sisipkan Tautan" onClick={handleLink}><Link2 className={sz} /></ToolBtn>
        <ToolBtn title="Hapus Tautan" onClick={() => exec("unlink")}><Link2Off className={sz} /></ToolBtn>
        <Sep />

        {/* Clear */}
        <ToolBtn title="Hapus Formatting" onClick={() => exec("removeFormat")}><RemoveFormatting className={sz} /></ToolBtn>
      </div>

      {/* Scrollable content area — toolbar stays pinned above this */}
      <div className="overflow-y-auto rounded-b-lg" style={{ maxHeight: `${Math.max(minRows, 10) * 1.6 * 2}rem` }}>

      {/* Placeholder style + rich content styles */}
      <style>{`
        .rte-editable:empty::before {
          content: attr(data-placeholder);
          color: var(--muted-foreground, #9ca3af);
          pointer-events: none;
        }
        .rte-editable h1 {
          font-size: 1.875rem; font-weight: 800; line-height: 1.2;
          margin: 1.25rem 0 0.5rem;
          color: var(--foreground);
          padding-bottom: 0.4rem;
          border-bottom: 2px solid var(--primary);
        }
        .rte-editable h2 {
          font-size: 1.375rem; font-weight: 700; line-height: 1.3;
          margin: 1rem 0 0.4rem;
          color: var(--foreground);
          padding-left: 0.75rem;
          border-left: 4px solid var(--primary);
        }
        .rte-editable h3 {
          font-size: 1.125rem; font-weight: 600; line-height: 1.4;
          margin: 0.875rem 0 0.35rem;
          color: var(--primary);
        }
        .rte-editable h4 {
          font-size: 1rem; font-weight: 600; line-height: 1.4;
          margin: 0.75rem 0 0.3rem;
          color: var(--foreground);
          text-decoration: underline;
          text-decoration-color: var(--muted-foreground);
          text-underline-offset: 3px;
        }
        .rte-editable p { margin: 0.375rem 0; }
        .rte-editable ul { list-style: disc; margin-left: 1.5rem; margin: 0.5rem 0 0.5rem 1.5rem; }
        .rte-editable ol { list-style: decimal; margin: 0.5rem 0 0.5rem 1.5rem; }
        .rte-editable li { margin: 0.2rem 0; }
        .rte-editable blockquote {
          border-left: 4px solid var(--primary);
          margin: 0.75rem 0;
          padding: 0.5rem 0.875rem;
          background: color-mix(in srgb, var(--primary) 6%, transparent);
          border-radius: 0 6px 6px 0;
          font-style: italic;
          color: var(--muted-foreground);
        }
        .rte-editable pre {
          background: var(--muted);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 0.875rem 1rem;
          font-size: 0.8rem;
          font-family: var(--font-mono, monospace);
          overflow-x: auto;
          margin: 0.75rem 0;
          line-height: 1.6;
        }
        .rte-editable code {
          background: var(--muted);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 0.125rem 0.375rem;
          font-size: 0.8rem;
          font-family: var(--font-mono, monospace);
        }
        .rte-editable a { color: var(--primary); text-decoration: underline; text-underline-offset: 2px; }
        .rte-editable strong { font-weight: 700; }
        .rte-editable em { font-style: italic; }
        .rte-editable hr { border: none; border-top: 2px solid var(--border); margin: 1rem 0; }
        .rte-editable img { max-width: 100%; border-radius: 8px; margin: 0.5rem 0; }
        .rte-editable sup, .rte-editable sub { font-size: 0.7em; }
      `}</style>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={() => {
          if (editorRef.current) onChange(editorRef.current.innerHTML);
        }}
        onKeyDown={handleKeyDown}
        style={{ minHeight: `${minRows * 1.6}rem` }}
        className="rte-editable px-4 py-3 text-sm text-[var(--foreground)] focus:outline-none leading-relaxed"
      />
      </div>
    </div>
  );
}
