'use client';

import React, { useCallback, useMemo, useRef, useEffect, useState, memo } from 'react';
import { normalizeNodeId, Value } from 'platejs';
import { PlateEditor } from '@/components/editor/plate-editor';

interface SectionEditorProps {
  section: string;
  content: string;
  onChange: (section: string, content: string) => void;
  placeholder?: string;
}

function SectionEditor({
  section,
  content,
  onChange,
  placeholder = 'Enter content...',
}: SectionEditorProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const editorRef = useRef<any>(null);
  
  // Only set initial markdown ONCE on mount - never update it again
  const [initialMarkdown] = useState<string>(() => {
    // Clean up zero-width spaces from initial content
    return (content || '')
      .replace(/\u200B/g, '') // Remove zero-width spaces
      .replace(/\u200C/g, '') // Remove zero-width non-joiner
      .replace(/\u200D/g, ''); // Remove zero-width joiner
  });

  // Parse content to Plate value format
  const initialValue = useMemo(() => {
    // Always return empty default - markdown will be deserialized via initialMarkdown prop
    return normalizeNodeId([
      {
        type: 'p',
        children: [{ text: '' }],
      },
    ]);
  }, []);

  // Store editor reference
  const handleEditorChange = useCallback((editor: any) => {
    editorRef.current = editor;
  }, []);

  // Debounced onChange handler - serialize to markdown
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
          // Fallback: if markdown API not available, use JSON
          markdownContent = JSON.stringify(value);
        }
        
        // Clean up zero-width spaces and trim
        markdownContent = markdownContent
          .replace(/\u200B/g, '') // Remove zero-width spaces
          .replace(/\u200C/g, '') // Remove zero-width non-joiner
          .replace(/\u200D/g, '') // Remove zero-width joiner
          .trim();
        
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

  return (
    <div className="w-full">
      <PlateEditor
        initialValue={initialValue}
        initialMarkdown={initialMarkdown}
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

export default memo(SectionEditor);
