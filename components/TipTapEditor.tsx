'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Node } from '@tiptap/core';
import { useState } from 'react';

// Custom Video extension
const Video = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      controls: { default: true },
      class: { default: 'max-w-full' },
      width: { default: null },
      height: { default: null },
      autoplay: { default: null },
      loop: { default: null },
      muted: { default: null },
      poster: { default: null },
    };
  },
  parseHTML() {
    return [{
      tag: 'video',
      getAttrs: (element) => {
        if (!(element instanceof HTMLElement)) return false;
        return {
          src: element.getAttribute('src'),
          controls: element.hasAttribute('controls'),
          width: element.getAttribute('width'),
          height: element.getAttribute('height'),
          autoplay: element.hasAttribute('autoplay'),
          loop: element.hasAttribute('loop'),
          muted: element.hasAttribute('muted'),
          poster: element.getAttribute('poster'),
          class: element.getAttribute('class') || 'max-w-full',
        };
      }
    }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['video', { ...HTMLAttributes, controls: true, class: 'max-w-full' }];
  },
});

// Custom Iframe extension for YouTube embeds
const Iframe = Node.create({
  name: 'iframe',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      width: { default: '560' },
      height: { default: '315' },
      frameborder: { default: '0' },
      allow: { default: null },
      allowfullscreen: { default: true },
      class: { default: 'max-w-full' },
    };
  },
  parseHTML() {
    return [{
      tag: 'iframe',
      getAttrs: (element) => {
        if (!(element instanceof HTMLElement)) return false;
        return {
          src: element.getAttribute('src'),
          width: element.getAttribute('width') || '560',
          height: element.getAttribute('height') || '315',
          frameborder: element.getAttribute('frameborder') || '0',
          allow: element.getAttribute('allow'),
          allowfullscreen: element.hasAttribute('allowfullscreen'),
          class: element.getAttribute('class') || 'max-w-full',
        };
      }
    }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['iframe', { ...HTMLAttributes, class: 'max-w-full' }];
  },
});

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Video,
      Iframe,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (res.ok) {
          const { url } = await res.json();
          editor.chain().focus().setImage({ src: url }).run();
        }
      } catch (error) {
        console.error('Failed to upload image:', error);
      }
    };

    input.click();
  };

  const handleVideoUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/mp4,video/webm';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (res.ok) {
          const { url } = await res.json();
          editor.chain().focus().insertContent({
            type: 'video',
            attrs: { src: url, controls: true, class: 'max-w-full' }
          }).run();
        }
      } catch (error) {
        console.error('Failed to upload video:', error);
      }
    };

    input.click();
  };

  const handleYoutubeEmbed = () => {
    if (!youtubeUrl) return;
    
    const videoId = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1];
    if (videoId) {
      editor.chain().focus().insertContent({
        type: 'iframe',
        attrs: {
          src: `https://www.youtube.com/embed/${videoId}`,
          width: '560',
          height: '315',
          frameborder: '0',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          allowfullscreen: true,
          class: 'max-w-full'
        }
      }).run();
      setYoutubeUrl('');
      setShowYoutubeInput(false);
    }
  };

  const ToolbarButton = ({
    onClick,
    active = false,
    disabled = false,
    children
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded hover:bg-gray-200 ${active ? 'bg-gray-200' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-gray-300 rounded-md">
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-300 bg-gray-50">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
        >
          1. List
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
          disabled={!editor.can().sinkListItem('listItem')}
        >
          → Indent
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().liftListItem('listItem').run()}
          disabled={!editor.can().liftListItem('listItem')}
        >
          ← Outdent
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          &lt;/&gt;
        </ToolbarButton>
        <ToolbarButton onClick={handleImageUpload}>
          📷 Image
        </ToolbarButton>
        <ToolbarButton onClick={() => setShowYoutubeInput(!showYoutubeInput)}>
          📺 YouTube
        </ToolbarButton>
        <ToolbarButton onClick={handleVideoUpload}>
          🎥 Video
        </ToolbarButton>
      </div>

      {showYoutubeInput && (
        <div className="p-2 border-b border-gray-300 bg-gray-50 flex gap-2">
          <input
            type="text"
            placeholder="Paste YouTube URL..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="flex-1 px-3 py-1 border border-gray-300 rounded"
          />
          <button
            type="button"
            onClick={handleYoutubeEmbed}
            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Embed
          </button>
        </div>
      )}

      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[300px] focus:outline-none"
      />
    </div>
  );
}
