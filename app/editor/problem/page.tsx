'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProblemPreview from '@/components/editor/problem-preview';
import SectionEditor from '@/components/editor/section-editor';

interface Example {
  id: string;
  title: string;
  content: string;
}

interface Hint {
  id: string;
  title: string;
  content: string;
}

interface ProblemContent {
  title: string;
  description: string;
  examples: Example[];
  hints: Hint[];
  constraint: string;
  requirement: string;
  theory: string;
}

const STORAGE_KEY = 'problem-editor-content';

export default function ProblemEditorPage() {
  const [problemContent, setProblemContent] = useState<ProblemContent>({
    title: '',
    description: '',
    examples: [],
    hints: [],
    constraint: '',
    requirement: '',
    theory: '',
  });

  const [activeTab, setActiveTab] = useState('title');
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (hasLoadedFromStorage) return;

    try {
      const savedContent = localStorage.getItem(STORAGE_KEY);
      if (savedContent) {
        const parsed = JSON.parse(savedContent);
        setProblemContent(parsed);
        console.info('[ProblemEditor] Loaded problem from localStorage');
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }

    setHasLoadedFromStorage(true);
  }, [hasLoadedFromStorage]);

  const handleContentChange = (section: string, content: string, index?: number) => {
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
  };

  // Save problem to localStorage
  const handleSaveProblem = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(problemContent));
      console.info('[ProblemEditor] Saved problem to localStorage');
      alert('Problem saved successfully!');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      alert('Error saving problem');
    }
  };

  // Load problem from localStorage
  const handleLoadProblem = () => {
    try {
      const savedContent = localStorage.getItem(STORAGE_KEY);
      if (savedContent) {
        const parsed = JSON.parse(savedContent);
        setProblemContent(parsed);
        console.info('[ProblemEditor] Loaded problem from localStorage');
        alert('Problem loaded successfully!');
      } else {
        alert('No saved problem found');
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      alert('Error loading problem');
    }
  };

  // Clear problem
  const handleClearProblem = () => {
    if (window.confirm('Are you sure you want to clear all content? This cannot be undone.')) {
      setProblemContent({
        title: '',
        description: '',
        examples: [],
        hints: [],
        constraint: '',
        requirement: '',
        theory: '',
      });
      localStorage.removeItem(STORAGE_KEY);
      console.info('[ProblemEditor] Cleared problem content');
      alert('Problem cleared');
    }
  };

  // Add new example
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

  // Remove example
  const removeExample = (id: string) => {
    setProblemContent(prev => ({
      ...prev,
      examples: prev.examples.filter(ex => ex.id !== id),
    }));
  };

  // Update example title
  const updateExampleTitle = (id: string, title: string) => {
    setProblemContent(prev => ({
      ...prev,
      examples: prev.examples.map(ex => (ex.id === id ? { ...ex, title } : ex)),
    }));
  };

  // Add new hint
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

  // Remove hint
  const removeHint = (id: string) => {
    setProblemContent(prev => ({
      ...prev,
      hints: prev.hints.filter(hint => hint.id !== id),
    }));
  };

  // Update hint title
  const updateHintTitle = (id: string, title: string) => {
    setProblemContent(prev => ({
      ...prev,
      hints: prev.hints.map(hint => (hint.id === id ? { ...hint, title } : hint)),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Problem Editor</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Create and edit your problem with multiple sections</p>
          
          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleSaveProblem}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              💾 Save Problem
            </button>
            <button
              onClick={handleLoadProblem}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              📂 Load Problem
            </button>
            <button
              onClick={handleClearProblem}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              🗑️ Clear All
            </button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-9 mb-8 bg-white dark:bg-zinc-900 p-1 rounded-lg border border-gray-200 dark:border-zinc-800 overflow-x-auto">
            <TabsTrigger value="title" className="text-sm">Title</TabsTrigger>
            <TabsTrigger value="description" className="text-sm">Description</TabsTrigger>
            <TabsTrigger value="examples" className="text-sm">Examples</TabsTrigger>
            <TabsTrigger value="hints" className="text-sm">Hints</TabsTrigger>
            <TabsTrigger value="constraint" className="text-sm">Constraint</TabsTrigger>
            <TabsTrigger value="requirement" className="text-sm">Requirement</TabsTrigger>
            <TabsTrigger value="theory" className="text-sm">Theory</TabsTrigger>
            <TabsTrigger value="preview" className="text-sm font-bold text-blue-600 dark:text-blue-400">Preview</TabsTrigger>
          </TabsList>

          {/* Title Section */}
          <TabsContent value="title" className="space-y-4">
            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Problem Title</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Enter the title of your problem</p>
              <SectionEditor
                section="title"
                content={problemContent.title}
                onChange={handleContentChange}
                placeholder="Enter problem title..."
              />
            </div>
          </TabsContent>

          {/* Description Section */}
          <TabsContent value="description" className="space-y-4">
            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Problem Description</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Provide a detailed description of the problem</p>
              <SectionEditor
                section="description"
                content={problemContent.description}
                onChange={handleContentChange}
                placeholder="Enter problem description..."
              />
            </div>
          </TabsContent>

          {/* Examples Section */}
          <TabsContent value="examples" className="space-y-4">
            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Examples</h2>
                <button
                  onClick={addExample}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  ➕ Add Example
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Add multiple examples to illustrate the problem</p>

              {problemContent.examples.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 py-8 text-center">No examples yet. Click "Add Example" to create one.</p>
              ) : (
                <div className="space-y-6">
                  {problemContent.examples.map((example, index) => (
                    <div key={example.id} className="bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-4">
                      <div className="flex justify-between items-center mb-4">
                        <input
                          type="text"
                          value={example.title}
                          onChange={(e) => updateExampleTitle(example.id, e.target.value)}
                          className="text-lg font-semibold text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-zinc-700 px-2 py-1 w-full focus:outline-none focus:border-blue-500"
                          placeholder="Example title"
                        />
                        <button
                          onClick={() => removeExample(example.id)}
                          className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                      <SectionEditor
                        section={`examples-${example.id}`}
                        content={example.content}
                        onChange={(_, content) => handleContentChange('examples', content, index)}
                        placeholder={`Enter content for ${example.title}...`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Hints Section */}
          <TabsContent value="hints" className="space-y-4">
            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hints</h2>
                <button
                  onClick={addHint}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  ➕ Add Hint
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Add multiple hints to guide problem solvers</p>

              {problemContent.hints.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 py-8 text-center">No hints yet. Click "Add Hint" to create one.</p>
              ) : (
                <div className="space-y-6">
                  {problemContent.hints.map((hint, index) => (
                    <div key={hint.id} className="bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-4">
                      <div className="flex justify-between items-center mb-4">
                        <input
                          type="text"
                          value={hint.title}
                          onChange={(e) => updateHintTitle(hint.id, e.target.value)}
                          className="text-lg font-semibold text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-zinc-700 px-2 py-1 w-full focus:outline-none focus:border-blue-500"
                          placeholder="Hint title"
                        />
                        <button
                          onClick={() => removeHint(hint.id)}
                          className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                      <SectionEditor
                        section={`hints-${hint.id}`}
                        content={hint.content}
                        onChange={(_, content) => handleContentChange('hints', content, index)}
                        placeholder={`Enter content for ${hint.title}...`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Constraint Section */}
          <TabsContent value="constraint" className="space-y-4">
            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Constraints</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Define the constraints for this problem</p>
              <SectionEditor
                section="constraint"
                content={problemContent.constraint}
                onChange={handleContentChange}
                placeholder="Enter constraints..."
              />
            </div>
          </TabsContent>

          {/* Requirement Section */}
          <TabsContent value="requirement" className="space-y-4">
            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Requirements</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Specify the requirements for solving this problem</p>
              <SectionEditor
                section="requirement"
                content={problemContent.requirement}
                onChange={handleContentChange}
                placeholder="Enter requirements..."
              />
            </div>
          </TabsContent>

          {/* Theory Section */}
          <TabsContent value="theory" className="space-y-4">
            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Theory</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Add theoretical concepts and explanations</p>
              <SectionEditor
                section="theory"
                content={problemContent.theory}
                onChange={handleContentChange}
                placeholder="Enter theory..."
              />
            </div>
          </TabsContent>

          {/* Preview Section */}
          <TabsContent value="preview" className="space-y-4">
            <ProblemPreview content={problemContent} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
