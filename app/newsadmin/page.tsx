'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function NewsAdminPage() {
  const sessionResult = useSession();
  const session = sessionResult?.data || null;
  const status = sessionResult?.status || 'loading';
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#bc7d30] underline hover:text-[#bc7d30]/80',
        },
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] p-4 text-[#bc7d30] [&_p]:mb-4 [&_p]:leading-relaxed [&_img]:my-4',
        'data-placeholder': 'Start typing your news post... Drag and drop images or paste them here.',
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const src = e.target?.result as string;
              if (src) {
                editor?.chain().focus().setImage({ src }).run();
              }
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event, slice) => {
        const items = Array.from(event.clipboardData?.items || []);
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const src = e.target?.result as string;
                if (src) {
                  editor?.chain().focus().setImage({ src }).run();
                }
              };
              reader.readAsDataURL(file);
              event.preventDefault();
              return true;
            }
          }
        }
        return false;
      },
    },
  });

  // Auto-detect and convert links in the entire document
  const handleLinkDetection = () => {
    if (!editor) return;
    
    const { doc } = editor.state;
    const text = doc.textContent;
    
    // URL regex pattern
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = Array.from(text.matchAll(urlRegex));
    
    if (matches.length > 0) {
      // Process matches in reverse order to maintain correct positions
      matches.reverse().forEach((match) => {
        if (match.index !== undefined) {
          const url = match[0];
          const from = match.index;
          const to = from + url.length;
          
          // Check if this text is already a link
          const $from = doc.resolve(from);
          const $to = doc.resolve(to);
          const mark = $from.marksAcross($to)?.find(m => m.type.name === 'link');
          
          if (!mark) {
            editor
              .chain()
              .setTextSelection({ from, to })
              .setLink({ href: url })
              .run();
          }
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor || !title.trim()) {
      alert('Please enter a title and some content.');
      return;
    }

    setIsSubmitting(true);
    try {
      const content = editor.getHTML();
      
      // TODO: Replace with actual Cloudflare upload
      const response = await fetch('/api/news/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      if (response.ok) {
        alert('News post submitted successfully!');
        setTitle('');
        editor.commands.clearContent();
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      console.error('Error submitting news:', error);
      alert('Error submitting news post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-black text-[#bc7d30] flex items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-black text-[#bc7d30] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">News Admin</h1>
          <button
            onClick={() => signIn('google')}
            className="px-6 py-3 bg-[#bc7d30] text-black font-bold rounded-lg hover:bg-[#bc7d30]/80 transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-[#bc7d30]">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">News Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#bc7d30]/60">{session.user?.email}</span>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 border border-[#bc7d30]/30 rounded-lg hover:border-[#bc7d30]/60 transition-colors text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-lg font-semibold mb-2">
              Post Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-black border border-[#bc7d30]/30 rounded-lg text-[#bc7d30] placeholder-[#bc7d30]/50 focus:outline-none focus:border-[#bc7d30]/60 transition-colors"
              placeholder="Enter post title..."
              required
            />
          </div>

          {/* Editor Toolbar */}
          <div className="border border-[#bc7d30]/30 rounded-t-lg p-2 flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`px-3 py-1 rounded border border-[#bc7d30]/30 hover:border-[#bc7d30]/60 transition-colors ${
                editor?.isActive('bold') ? 'bg-[#bc7d30]/20' : ''
              }`}
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`px-3 py-1 rounded border border-[#bc7d30]/30 hover:border-[#bc7d30]/60 transition-colors ${
                editor?.isActive('italic') ? 'bg-[#bc7d30]/20' : ''
              }`}
            >
              <em>I</em>
            </button>
            <button
              type="button"
              onClick={handleLinkDetection}
              className="px-3 py-1 rounded border border-[#bc7d30]/30 hover:border-[#bc7d30]/60 transition-colors"
            >
              🔗 Auto Link
            </button>
            <div className="flex-1" />
            <span className="text-xs text-[#bc7d30]/60 self-center px-2">
              Drag & drop images or paste them
            </span>
          </div>

          {/* Editor Content */}
          <div className="border border-t-0 border-[#bc7d30]/30 rounded-b-lg min-h-[400px] bg-black/50">
            <EditorContent editor={editor} />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#bc7d30] text-black font-bold rounded-lg hover:bg-[#bc7d30]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit to Cloudflare'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

