import { db } from '@/lib/db';
import { tag } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';

// PUT update tag
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name || name.trim() === '') {
      return Response.json({ error: 'Tag name is required' }, { status: 400 });
    }

    const cleanName = name.trim();

    // Check if another tag with this name exists
    const existingTag = await db
      .select()
      .from(tag)
      .where(eq(tag.name, cleanName))
      .limit(1);

    if (existingTag.length > 0 && existingTag[0].id !== id) {
      return Response.json({ error: 'Tag name already exists' }, { status: 409 });
    }

    const updatedTag = await db
      .update(tag)
      .set({ name: cleanName })
      .where(eq(tag.id, id))
      .returning();

    if (updatedTag.length === 0) {
      return Response.json({ error: 'Tag not found' }, { status: 404 });
    }

    return Response.json(updatedTag[0]);
  } catch (error) {
    console.error('Failed to update tag:', error);
    return Response.json({ error: 'Failed to update tag' }, { status: 500 });
  }
}

// DELETE tag
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deletedTag = await db
      .delete(tag)
      .where(eq(tag.id, id))
      .returning();

    if (deletedTag.length === 0) {
      return Response.json({ error: 'Tag not found' }, { status: 404 });
    }

    return Response.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Failed to delete tag:', error);
    return Response.json({ error: 'Failed to delete tag' }, { status: 500 });
  }
}
