'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProblemPreview from '@/components/editor/problem-preview';
import SectionEditor from '@/components/editor/section-editor';

interface ProblemContent {
  title: string;
  description: string;
  examples: string;
  constraint: string;
  requirement: string;
  theory: string;
}

const STORAGE_KEY = 'problem-editor-content';

export default function ProblemEditorPage() {
  const [problemContent, setProblemContent] = useState<ProblemContent>({
    title: '',
    description: '',
    examples: '',
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

  const handleContentChange = (section: string, content: string) => {
    setProblemContent(prev => ({
      ...prev,
      [section]: content,
    }));
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
        examples: '',
        constraint: '',
        requirement: '',
        theory: '',
      });
      localStorage.removeItem(STORAGE_KEY);
      console.info('[ProblemEditor] Cleared problem content');
      alert('Problem cleared');
    }
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
          <TabsList className="grid w-full grid-cols-7 mb-8 bg-white dark:bg-zinc-900 p-1 rounded-lg border border-gray-200 dark:border-zinc-800">
            <TabsTrigger value="title" className="text-sm">Title</TabsTrigger>
            <TabsTrigger value="description" className="text-sm">Description</TabsTrigger>
            <TabsTrigger value="examples" className="text-sm">Examples</TabsTrigger>
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Examples</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Provide examples to illustrate the problem</p>
              <SectionEditor
                section="examples"
                content={problemContent.examples}
                onChange={handleContentChange}
                placeholder="Enter examples..."
              />
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
