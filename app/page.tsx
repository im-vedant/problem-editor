'use client';

import React, { useState, useCallback, useEffect } from 'react';
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

interface Tag {
  id: string;
  name: string;
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
  difficulty: 'easy' | 'medium' | 'hard';
  selectedTags: Tag[];
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
    difficulty: 'easy',
    selectedTags: [],
  });

  const [activeTab, setActiveTab] = useState('slug');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [tagFilterText, setTagFilterText] = useState('');

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-tags-container]')) {
        setShowTagDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Fetch all tags on component mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags');
        if (response.ok) {
          const data = await response.json();
          setAllTags(data);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };
    fetchTags();
  }, []);

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
      const tags = data.tags || [];

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
        difficulty: data.difficulty || 'easy',
        selectedTags: tags || [],
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
        difficulty: problemContent.difficulty,
        tagIds: problemContent.selectedTags.map(tag => tag.id),
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
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-black">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Problem Editor</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create and edit your problem</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={fetchProblem} disabled={loading} variant="outline">
              {loading ? 'Loading...' : 'Fetch'}
            </Button>
            <Button onClick={saveProblem} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
        {message && (
          <div className={`mt-3 text-sm ${message.includes('success') ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
            {message}
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-84 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Slug Input */}
            <div>
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

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty
              </label>
              <select
                value={problemContent.difficulty}
                onChange={(e) => setProblemContent(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Tags */}
            <div data-tags-container>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="relative">
                <div className="flex flex-wrap gap-2 p-2 min-h-10 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 focus-within:ring-2 focus-within:ring-blue-500">
                  {problemContent.selectedTags.map(tag => (
                    <div key={tag.id} className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-2 py-0.5 rounded-full text-xs">
                      {tag.name}
                      <button
                        onClick={() => setProblemContent(prev => ({
                          ...prev,
                          selectedTags: prev.selectedTags.filter(t => t.id !== tag.id)
                        }))}
                        className="font-bold cursor-pointer hover:text-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    placeholder={problemContent.selectedTags.length === 0 ? "Add tags..." : ""}
                    value={tagFilterText}
                    onChange={(e) => setTagFilterText(e.target.value)}
                    onFocus={() => setShowTagDropdown(true)}
                    className="flex-1 min-w-20 outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm"
                  />
                </div>
                {showTagDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {allTags
                      .filter(tag => 
                        !problemContent.selectedTags.find(t => t.id === tag.id) &&
                        tag.name.toLowerCase().includes(tagFilterText.toLowerCase())
                      )
                      .map(tag => (
                      <div
                        key={tag.id}
                        onClick={() => {
                          setProblemContent(prev => ({
                            ...prev,
                            selectedTags: [...prev.selectedTags, tag]
                          }));
                          setTagFilterText('');
                        }}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-900 dark:text-white text-sm"
                      >
                        {tag.name}
                      </div>
                    ))}
                    {allTags.filter(tag => 
                      !problemContent.selectedTags.find(t => t.id === tag.id) &&
                      tag.name.toLowerCase().includes(tagFilterText.toLowerCase())
                    ).length === 0 && (
                      <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">
                        {allTags.length === 0 ? 'No tags' : 'No match'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="pt-4 border-t border-gray-200 dark:border-zinc-800">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Sections</p>
              <div className="space-y-1">
                {[
                  { value: 'slug', label: 'Slug' },
                  { value: 'title', label: 'Title' },
                  { value: 'description', label: 'Description' },
                  { value: 'examples', label: 'Examples' },
                  { value: 'hints', label: 'Hints' },
                  { value: 'constraint', label: 'Constraint' },
                  { value: 'requirement', label: 'Requirement' },
                  { value: 'theory', label: 'Theory' },
                  { value: 'preview', label: '👁️ Preview', highlight: true },
                ].map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeTab === tab.value
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
                    } ${tab.highlight ? 'font-bold' : ''}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Hide the TabsList since we're using the sidebar */}
            <style>{`[role="tablist"] { display: none; }`}</style>

          <TabsContent value="slug" className="m-0 p-8">
            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 p-6 max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Problem Slug</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Enter a unique slug for this problem</p>
              <div className="space-y-4">
                <Input type="text" placeholder="e.g., metrics-f1-micro" value={problemContent.slug} onChange={(e) => setProblemContent(prev => ({ ...prev, slug: e.target.value }))} className="w-full text-lg" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="title" className="m-0 p-8">
            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 p-6 max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Problem Title</h2>
              <SectionEditor section="title" content={problemContent.title} onChange={handleContentChange} placeholder="Enter problem title..." />
            </div>
          </TabsContent>

          <TabsContent value="description" className="m-0 p-8">
            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 p-6 max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Problem Description</h2>
              <SectionEditor section="description" content={problemContent.description} onChange={handleContentChange} placeholder="Enter problem description..." />
            </div>
          </TabsContent>

          <TabsContent value="examples" className="m-0 p-8">
            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 p-6 max-w-4xl">
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

          <TabsContent value="hints" className="m-0 p-8">
            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 p-6 max-w-4xl">
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

          <TabsContent value="constraint" className="m-0 p-8">
            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 p-6 max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Constraints</h2>
              <SectionEditor section="constraint" content={problemContent.constraint} onChange={handleContentChange} placeholder="Enter constraints..." />
            </div>
          </TabsContent>

          <TabsContent value="requirement" className="m-0 p-8">
            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 p-6 max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Requirements</h2>
              <SectionEditor section="requirement" content={problemContent.requirement} onChange={handleContentChange} placeholder="Enter requirements..." />
            </div>
          </TabsContent>

          <TabsContent value="theory" className="m-0 p-8">
            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 p-6 max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Theory</h2>
              <SectionEditor section="theory" content={problemContent.theory} onChange={handleContentChange} placeholder="Enter theory..." />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="m-0 p-8">
            <div className="max-w-4xl">
              <ProblemPreview content={problemContent} />
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
}
