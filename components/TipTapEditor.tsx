'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useState } from 'react';

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
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
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
          editor.chain().focus().insertContent(`
            <video controls class="max-w-full">
              <source src="${url}" type="${file.type}">
              Your browser does not support the video tag.
            </video>
          `).run();
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
      editor.chain().focus().insertContent(`
        <iframe 
          width="560" 
          height="315" 
          src="https://www.youtube.com/embed/${videoId}" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen
          class="max-w-full"
        ></iframe>
      `).run();
      setYoutubeUrl('');
      setShowYoutubeInput(false);
    }
  };

  const ToolbarButton = ({ 
    onClick, 
    active = false, 
    children 
  }: { 
    onClick: () => void; 
    active?: boolean; 
    children: React.ReactNode 
  }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded hover:bg-gray-200 ${active ? 'bg-gray-200' : ''}`}
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
