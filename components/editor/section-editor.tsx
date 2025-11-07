'use client';

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { normalizeNodeId, Value } from 'platejs';
import { PlateEditor } from '@/components/editor/plate-editor';

interface SectionEditorProps {
  section: string;
  content: string;
  onChange: (section: string, content: string) => void;
  placeholder?: string;
}

export default function SectionEditor({
  section,
  content,
  onChange,
  placeholder = 'Enter content...',
}: SectionEditorProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const editorRef = useRef<any>(null);
  const [initialMarkdown, setInitialMarkdown] = useState<string>('');

  // Determine if content is markdown or JSON
  const isMarkdown = useMemo(() => {
    if (!content) return false;
    try {
      JSON.parse(content);
      return false; // It's valid JSON, so it's not markdown
    } catch {
      return true; // It's not valid JSON, so treat as markdown
    }
  }, [content]);

  // Set initial markdown if content is markdown
  useEffect(() => {
    if (isMarkdown && content) {
      setInitialMarkdown(content);
    } else {
      setInitialMarkdown('');
    }
  }, [content, isMarkdown]);

  // Parse content to Plate value format (only for JSON, not markdown)
  const initialValue = useMemo(() => {
    if (isMarkdown || !content || content.trim() === '') {
      return normalizeNodeId([
        {
          type: 'p',
          children: [{ text: '' }],
        },
      ]);
    }
    
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return normalizeNodeId(parsed);
      }
    } catch {
      // Fallback to empty paragraph
      return normalizeNodeId([
        {
          type: 'p',
          children: [{ text: '' }],
        },
      ]);
    }

    return normalizeNodeId([
      {
        type: 'p',
        children: [{ text: '' }],
      },
    ]);
  }, [content, isMarkdown]);

  // Store editor reference
  const handleEditorChange = useCallback((editor: any) => {
    editorRef.current = editor;
  }, []);

  // Debounced onChange handler - serialize to markdown and save to localStorage
  const handleChange = useCallback((value: Value) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce the actual onChange callback
    timeoutRef.current = setTimeout(() => {
      try {
        // Serialize to markdown format
        let markdownContent = '';
        if (editorRef.current?.api?.markdown?.serialize) {
          markdownContent = editorRef.current.api.markdown.serialize(value);
        } else {
          // Fallback: serialize as JSON if markdown API not available
          markdownContent = JSON.stringify(value);
        }

        // Save to localStorage with the section name as key
        const storageKey = `problem-editor-${section}`;
        localStorage.setItem(storageKey, markdownContent);
        console.info(`[SectionEditor] Saved ${section} to localStorage:`, markdownContent);

        // Call the onChange callback with markdown content
        onChange(section, markdownContent);
      } catch (error) {
        console.error('Error serializing editor content:', error);
      }
    }, 300);
  }, [section, onChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const storageKey = `problem-editor-${section}`;
    const savedContent = localStorage.getItem(storageKey);
    if (savedContent && !content) {
      console.info(`[SectionEditor] Loaded ${section} from localStorage`);
      onChange(section, savedContent);
    }
  }, [section, onChange, content]);

  return (
    <div className="w-full">
      <PlateEditor
        initialValue={!isMarkdown ? initialValue : undefined}
        initialMarkdown={isMarkdown ? initialMarkdown : undefined}
        onChange={handleChange}
        onEditorChange={handleEditorChange}
        readOnly={false}
        showSettings={false}
      />
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Supports rich text editing with Markdown, LaTeX equations ($...$, $$...$$), code blocks, tables, and more
      </div>
    </div>
  );
}
