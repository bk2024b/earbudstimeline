'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { useEffect, useRef } from 'react';
import { uploadEditorImage } from '@/app/admin/(dashboard)/articles/actions';
import { optimizeImageFile } from '@/lib/clientImageOptimization';

function ToolbarButton({ onClick, active, disabled, children, title }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
        active ? 'bg-accent text-ink border-accent' : 'bg-panel2 text-dim border-line hover:text-white'
      } disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ name, defaultValue = '', value, onChange }) {
  const fileInputRef = useRef(null);
  const hiddenInputRef = useRef(null);

  const initialContent = value !== undefined ? value : defaultValue;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Image.configure({ HTMLAttributes: { class: 'rounded-lg' } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-accent underline' } }),
      Placeholder.configure({ placeholder: "Écris le contenu de l'article ici…" }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-line w-full my-4 text-sm',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-line bg-panel2 font-semibold p-2.5 text-left text-white',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-line p-2.5 text-dim',
        },
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose max-w-none min-h-[320px] px-4 py-3 outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (hiddenInputRef.current) hiddenInputRef.current.value = html;
      if (onChange) onChange(html);
    },
  });

  // Synchroniser quand la prop value change de l'extérieur (ex: import Markdown)
  useEffect(() => {
    if (editor && value !== undefined) {
      const currentHtml = editor.getHTML();
      if (value !== currentHtml) {
        editor.commands.setContent(value, false);
        if (hiddenInputRef.current) hiddenInputRef.current.value = value;
      }
    }
  }, [editor, value]);

  useEffect(() => {
    if (editor && hiddenInputRef.current) {
      hiddenInputRef.current.value = editor.getHTML();
    }
  }, [editor]);

  async function handleImagePick(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !editor) return;
    const optimized = await optimizeImageFile(file).catch(() => file);
    const fd = new FormData();
    fd.append('image', optimized);
    const res = await uploadEditorImage(fd);
    if (res.url) {
      editor.chain().focus().setImage({ src: res.url }).run();
    } else {
      alert(`Échec de l'upload de l'image : ${res.error || 'erreur inconnue'}`);
    }
  }

  function setLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL du lien', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  if (!editor) return null;

  const isTableActive = editor.isActive('table');

  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <span className="text-dim text-xs">Contenu</span>
      <div className="border border-line rounded-lg overflow-hidden bg-panel2">
        <div className="flex flex-wrap gap-1.5 border-b border-line p-2">
          <ToolbarButton title="Gras" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
            Gras
          </ToolbarButton>
          <ToolbarButton title="Italique" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
            Italique
          </ToolbarButton>
          <ToolbarButton title="Titre 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            H2
          </ToolbarButton>
          <ToolbarButton title="Titre 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
            H3
          </ToolbarButton>
          <ToolbarButton title="Liste à puces" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
            Liste
          </ToolbarButton>
          <ToolbarButton title="Liste numérotée" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            1. 2. 3.
          </ToolbarButton>
          <ToolbarButton title="Citation" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            Citation
          </ToolbarButton>
          <ToolbarButton title="Lien" active={editor.isActive('link')} onClick={setLink}>
            Lien
          </ToolbarButton>
          <ToolbarButton title="Image" onClick={() => fileInputRef.current?.click()}>
            Image
          </ToolbarButton>

          {/* Contrôles de tableau */}
          <ToolbarButton
            title="Insérer un tableau (3x3)"
            active={isTableActive}
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          >
            📊 Tableau
          </ToolbarButton>

          {isTableActive && (
            <>
              <ToolbarButton
                title="Ajouter une ligne après"
                onClick={() => editor.chain().focus().addRowAfter().run()}
              >
                + Ligne
              </ToolbarButton>
              <ToolbarButton
                title="Supprimer la ligne"
                onClick={() => editor.chain().focus().deleteRow().run()}
              >
                - Ligne
              </ToolbarButton>
              <ToolbarButton
                title="Ajouter une colonne après"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
              >
                + Col
              </ToolbarButton>
              <ToolbarButton
                title="Supprimer la colonne"
                onClick={() => editor.chain().focus().deleteColumn().run()}
              >
                - Col
              </ToolbarButton>
              <ToolbarButton
                title="Supprimer le tableau entier"
                onClick={() => editor.chain().focus().deleteTable().run()}
              >
                🗑️ Suppr. Tab
              </ToolbarButton>
            </>
          )}

          <ToolbarButton title="Annuler" onClick={() => editor.chain().focus().undo().run()}>
            ↺
          </ToolbarButton>
          <ToolbarButton title="Rétablir" onClick={() => editor.chain().focus().redo().run()}>
            ↻
          </ToolbarButton>
        </div>
        <EditorContent editor={editor} />
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
      <input ref={hiddenInputRef} type="hidden" name={name} />
    </div>
  );
}
