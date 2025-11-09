'use client';

import React, { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProblemPreview from '@/components/editor/problem-preview';
import SectionEditor from '@/components/editor/section-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Example {
  id: string;
  content: string;
}

interface Hint {
  id: string;
  content: string;
}

interface ProblemContent {
  slug: string;
  title: string;
  description: string;
  examples: Example[];
  hints: Hint[];
  constraint: string;
  requirement: string;
  theory: string;
}

export default function ProblemEditorPage() {
  const [problemContent, setProblemContent] = useState<ProblemContent>({
    slug: '',
    title: '',
    description: '',
    examples: [],
    hints: [],
    constraint: '',
    requirement: '',
    theory: '',
  });

  const [activeTab, setActiveTab] = useState('slug');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleContentChange = useCallback((section: string, content: string, index?: number) => {
    setProblemContent(prev => {
      if (section === 'examples' && index !== undefined) {
        const newExamples = [...prev.examples];
        if (newExamples[index]) {
          newExamples[index].content = content;
        }
        return { ...prev, examples: newExamples };
      }
      if (section === 'hints' && index !== undefined) {
        const newHints = [...prev.hints];
        if (newHints[index]) {
          newHints[index].content = content;
        }
        return { ...prev, hints: newHints };
      }
      return {
        ...prev,
        [section]: content,
      };
    });
  }, []);

  const addExample = () => {
    setProblemContent(prev => ({
      ...prev,
      examples: [
        ...prev.examples,
        {
          id: Date.now().toString(),
          title: `Example ${prev.examples.length + 1}`,
          content: '',
        },
      ],
    }));
  };

  const removeExample = (id: string) => {
    setProblemContent(prev => ({
      ...prev,
      examples: prev.examples.filter(ex => ex.id !== id),
    }));
  };

  const addHint = () => {
    setProblemContent(prev => ({
      ...prev,
      hints: [
        ...prev.hints,
        {
          id: Date.now().toString(),
          title: `Hint ${prev.hints.length + 1}`,
          content: '',
        },
      ],
    }));
  };

  const removeHint = (id: string) => {
    setProblemContent(prev => ({
      ...prev,
      hints: prev.hints.filter(hint => hint.id !== id),
    }));
  };

  const fetchProblem = async () => {
    if (!problemContent.slug.trim()) {
      setMessage('Please enter a problem slug');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`/api/problems?slug=${encodeURIComponent(problemContent.slug)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setMessage('Problem not found. Create a new one.');
        } else {
          setMessage('Failed to fetch problem');
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      const examples = data.examples || [];
      const hints = data.hints || [];

      setProblemContent({
        slug: data.id,
        title: data.title || '',
        description: data.description || '',
        examples: examples.map((content: string, idx: number) => ({
          id: `ex-${idx}`,
          title: `Example ${idx + 1}`,
          content: content || '',
        })),
        hints: hints.map((content: string, idx: number) => ({
          id: `hint-${idx}`,
          title: `Hint ${idx + 1}`,
          content: content || '',
        })),
        constraint: data.constraints || '',
        requirement: data.requirements || '',
        theory: data.theory || '',
      });

      setMessage('Problem loaded successfully');
    } catch (error) {
      console.error('Error fetching problem:', error);
      setMessage('Error fetching problem');
    } finally {
      setLoading(false);
    }
  };

  const saveProblem = async () => {
    if (!problemContent.slug.trim()) {
      setMessage('Please enter a problem slug');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      // Helper function to clean zero-width spaces
      const cleanText = (text: string) => {
        return text
          .replace(/\u200B/g, '') // Remove zero-width spaces
          .replace(/\u200C/g, '') // Remove zero-width non-joiner
          .replace(/\u200D/g, '') // Remove zero-width joiner
          .trim();
      };

      const payload = {
        slug: cleanText(problemContent.slug),
        title: cleanText(problemContent.title),
        description: cleanText(problemContent.description),
        examples: problemContent.examples.map(ex => cleanText(ex.content)),
        requirements: cleanText(problemContent.requirement),
        theory: cleanText(problemContent.theory),
        hints: problemContent.hints.map(h => cleanText(h.content)),
        constraints: cleanText(problemContent.constraint),
        runnerTemplate: '',
      };

      const response = await fetch('/api/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setMessage('Failed to save problem');
        setLoading(false);
        return;
      }

      setMessage('Problem saved successfully');
    } catch (error) {
      console.error('Error saving problem:', error);
      setMessage('Error saving problem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Problem Editor</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Create and edit your problem with multiple sections</p>

          <div className="flex gap-3 items-end mt-6">
            <div className="flex-1 max-w-md">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Problem Slug
              </label>
              <Input
                type="text"
                placeholder="e.g., metrics-f1-micro"
                value={problemContent.slug}
                onChange={(e) => setProblemContent(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full"
              />
            </div>
            <Button onClick={fetchProblem} disabled={loading} variant="outline">
              {loading ? 'Loading...' : 'Fetch'}
            </Button>
            <Button onClick={saveProblem} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>

          {message && (
            <div className={`mt-3 text-sm ${message.includes('success') ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
              {message}
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-9 mb-8 bg-white dark:bg-zinc-900 p-1 rounded-lg border border-gray-200 dark:border-zinc-800">
            <TabsTrigger value="slug" className="text-sm">Slug</TabsTrigger>
            <TabsTrigger value="title" className="text-sm">Title</TabsTrigger>
            <TabsTrigger value="description" className="text-sm">Description</TabsTrigger>
            <TabsTrigger value="examples" className="text-sm">Examples</TabsTrigger>
            <TabsTrigger value="hints" className="text-sm">Hints</TabsTrigger>
            <TabsTrigger value="constraint" className="text-sm">Constraint</TabsTrigger>
            <TabsTrigger value="requirement" className="text-sm">Requirement</TabsTrigger>
            <TabsTrigger value="theory" className="text-sm">Theory</TabsTrigger>
            <TabsTrigger value="preview" className="text-sm font-bold text-blue-600 dark:text-blue-400">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="slug" className="space-y-4">
            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Problem Slug</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Enter a unique slug for this problem</p>
              <div className="space-y-4">
                <Input type="text" placeholder="e.g., metrics-f1-micro" value={problemContent.slug} onChange={(e) => setProblemContent(prev => ({ ...prev, slug: e.target.value }))} className="w-full text-lg" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="title" className="space-y-4">
            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Problem Title</h2>
              <SectionEditor section="title" content={problemContent.title} onChange={handleContentChange} placeholder="Enter problem title..." />
            </div>
          </TabsContent>

          <TabsContent value="description" className="space-y-4">
            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Problem Description</h2>
              <SectionEditor section="description" content={problemContent.description} onChange={handleContentChange} placeholder="Enter problem description..." />
            </div>
          </TabsContent>

          <TabsContent value="examples" className="space-y-4">
            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Examples</h2>
                <button onClick={addExample} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">➕ Add Example</button>
              </div>
              {problemContent.examples.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No examples yet</p>
              ) : (
                <div className="space-y-4">
                  {problemContent.examples.map((example, index) => (
                    <div key={example.id} className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-4 border border-gray-200 dark:border-zinc-700">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Example {index + 1}</span>
                        <button onClick={() => removeExample(example.id)} className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">✕ Remove</button>
                      </div>
                      <SectionEditor section={`examples-${example.id}`} content={example.content} onChange={(_, content) => handleContentChange('examples', content, index)} placeholder="Enter example content..." />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="hints" className="space-y-4">
            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hints</h2>
                <button onClick={addHint} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">➕ Add Hint</button>
              </div>
              {problemContent.hints.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hints yet</p>
              ) : (
                <div className="space-y-4">
                  {problemContent.hints.map((hint, index) => (
                    <div key={hint.id} className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-4 border border-gray-200 dark:border-zinc-700">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Hint {index + 1}</span>
                        <button onClick={() => removeHint(hint.id)} className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">✕ Remove</button>
                      </div>
                      <SectionEditor section={`hints-${hint.id}`} content={hint.content} onChange={(_, content) => handleContentChange('hints', content, index)} placeholder="Enter hint content..." />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="constraint" className="space-y-4">
            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Constraints</h2>
              <SectionEditor section="constraint" content={problemContent.constraint} onChange={handleContentChange} placeholder="Enter constraints..." />
            </div>
          </TabsContent>

          <TabsContent value="requirement" className="space-y-4">
            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Requirements</h2>
              <SectionEditor section="requirement" content={problemContent.requirement} onChange={handleContentChange} placeholder="Enter requirements..." />
            </div>
          </TabsContent>

          <TabsContent value="theory" className="space-y-4">
            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Theory</h2>
              <SectionEditor section="theory" content={problemContent.theory} onChange={handleContentChange} placeholder="Enter theory..." />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <ProblemPreview content={problemContent} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
