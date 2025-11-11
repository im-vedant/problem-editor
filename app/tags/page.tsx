'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Tag {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch all tags
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tags');
      if (!response.ok) throw new Error('Failed to fetch tags');
      const data = await response.json();
      setTags(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch tags');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTagName.trim()) {
      setError('Tag name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create tag');
      }

      const newTag = await response.json();
      setTags([newTag, ...tags]);
      setNewTagName('');
      setMessage('Tag created successfully');
      setError('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create tag');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTag = async (id: string) => {
    if (!editingName.trim()) {
      setError('Tag name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/tags/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update tag');
      }

      const updatedTag = await response.json();
      setTags(tags.map(t => t.id === id ? updatedTag : t));
      setEditingId(null);
      setEditingName('');
      setMessage('Tag updated successfully');
      setError('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update tag');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete tag');
      }

      setTags(tags.filter(t => t.id !== id));
      setMessage('Tag deleted successfully');
      setError('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete tag');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditingName(tag.name);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Tags Management</h1>

        {/* Messages */}
        {message && (
          <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Create Tag Form */}
        <form onSubmit={handleCreateTag} className="mb-8 p-6 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Create New Tag</h2>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter tag name..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              disabled={loading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Creating...' : 'Create Tag'}
            </Button>
          </div>
        </form>

        {/* Tags List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Tags ({tags.length})
          </h2>

          {tags.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No tags created yet
            </div>
          ) : (
            <div className="space-y-2">
              {tags.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                >
                  {editingId === t.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        disabled={loading}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => handleUpdateTag(t.id)}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Save
                      </Button>
                      <Button
                        onClick={() => setEditingId(null)}
                        disabled={loading}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {t.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Created: {new Date(t.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => startEdit(t)}
                          disabled={loading}
                          variant="outline"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteTag(t.id)}
                          disabled={loading}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Delete
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
