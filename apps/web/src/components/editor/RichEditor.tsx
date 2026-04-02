"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { useState, useEffect, useCallback, useRef } from "react";
import MediaLibraryModal from "./MediaLibraryModal";
import { api } from "@/lib/api";

interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function MenuBar({ editor, onOpenMedia }: { editor: any; onOpenMedia: () => void }) {
  if (!editor) return null;

  const uploadRef = useRef<HTMLInputElement>(null);

  const handleLocalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await api.upload<{ url: string }>("/api/media/upload", formData);
      editor.chain().focus().setImage({ src: result.url }).run();
    } catch (err: any) {
      alert(err.message || "上傳失敗");
    }
    if (uploadRef.current) uploadRef.current.value = "";
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("輸入連結 URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImageByUrl = () => {
    const url = window.prompt("輸入圖片 URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const btnClass = (active: boolean) =>
    `px-2 py-1.5 rounded text-xs font-medium transition ${
      active
        ? "bg-amber-700 text-white"
        : "bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600"
    }`;

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b dark:border-stone-600 bg-stone-50 dark:bg-stone-800 rounded-t-lg">
      {/* Text formatting */}
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive("bold"))} title="粗體">
        <strong>B</strong>
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive("italic"))} title="斜體">
        <em>I</em>
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive("underline"))} title="底線">
        <u>U</u>
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btnClass(editor.isActive("strike"))} title="刪除線">
        <s>S</s>
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHighlight().run()} className={btnClass(editor.isActive("highlight"))} title="螢光標記">
        🖍
      </button>

      <div className="w-px bg-stone-300 dark:bg-stone-600 mx-1" />

      {/* Headings */}
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive("heading", { level: 1 }))} title="標題 1">
        H1
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive("heading", { level: 2 }))} title="標題 2">
        H2
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor.isActive("heading", { level: 3 }))} title="標題 3">
        H3
      </button>

      <div className="w-px bg-stone-300 dark:bg-stone-600 mx-1" />

      {/* Lists */}
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive("bulletList"))} title="項目列表">
        &#8226; 列表
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive("orderedList"))} title="編號列表">
        1. 列表
      </button>

      <div className="w-px bg-stone-300 dark:bg-stone-600 mx-1" />

      {/* Alignment */}
      <button type="button" onClick={() => editor.chain().focus().setTextAlign("left").run()} className={btnClass(editor.isActive({ textAlign: "left" }))} title="靠左">
        ≡
      </button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign("center").run()} className={btnClass(editor.isActive({ textAlign: "center" }))} title="置中">
        ≡̈
      </button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign("right").run()} className={btnClass(editor.isActive({ textAlign: "right" }))} title="靠右">
        ≡̊
      </button>

      <div className="w-px bg-stone-300 dark:bg-stone-600 mx-1" />

      {/* Block elements */}
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive("blockquote"))} title="引用">
        &ldquo; 引用
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btnClass(editor.isActive("codeBlock"))} title="程式碼">
        &lt;/&gt;
      </button>
      <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btnClass(false)} title="分隔線">
        ─
      </button>

      <div className="w-px bg-stone-300 dark:bg-stone-600 mx-1" />

      {/* Link */}
      <button type="button" onClick={setLink} className={btnClass(editor.isActive("link"))} title="連結">
        🔗
      </button>

      {/* Table */}
      <button type="button" onClick={insertTable} className={btnClass(false)} title="插入表格">
        📊
      </button>

      <div className="w-px bg-stone-300 dark:bg-stone-600 mx-1" />

      {/* Images */}
      <button type="button" onClick={onOpenMedia} className={btnClass(false)} title="從媒體庫選取">
        🖼️ 媒體庫
      </button>
      <label className={`${btnClass(false)} cursor-pointer`} title="本地上傳圖片">
        📤 上傳
        <input ref={uploadRef} type="file" accept="image/*" onChange={handleLocalUpload} className="hidden" />
      </label>
      <button type="button" onClick={addImageByUrl} className={btnClass(false)} title="圖片URL">
        🌐 URL
      </button>

      <div className="w-px bg-stone-300 dark:bg-stone-600 mx-1" />

      {/* Undo/Redo */}
      <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={`${btnClass(false)} disabled:opacity-30`} title="復原">
        ↩
      </button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={`${btnClass(false)} disabled:opacity-30`} title="重做">
        ↪
      </button>
    </div>
  );
}

export default function RichEditor({ content, onChange, placeholder }: Props) {
  const [mediaOpen, setMediaOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: placeholder || "開始撰寫文章內容..." }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-stone dark:prose-invert max-w-none focus:outline-none min-h-64 px-4 py-3 text-sm leading-relaxed",
      },
    },
  });

  // Sync content from outside when content prop changes significantly
  const lastContentRef = useRef(content);
  useEffect(() => {
    if (editor && content !== lastContentRef.current) {
      const currentHtml = editor.getHTML();
      if (content !== currentHtml) {
        editor.commands.setContent(content || "");
      }
      lastContentRef.current = content;
    }
  }, [content, editor]);

  const handleMediaSelect = useCallback((url: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const wordCount = editor ? editor.getText().replace(/\s/g, "").length : 0;

  return (
    <div className="border rounded-lg dark:border-stone-600 overflow-hidden">
      <MenuBar editor={editor} onOpenMedia={() => setMediaOpen(true)} />
      <EditorContent editor={editor} />
      <div className="flex items-center justify-between px-3 py-1.5 bg-stone-50 dark:bg-stone-800 border-t dark:border-stone-600 text-xs text-stone-400">
        <span>{wordCount} 字</span>
        <span>富文本編輯器</span>
      </div>
      <MediaLibraryModal
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
