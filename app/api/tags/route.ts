import { db } from '@/lib/db';
import { tag } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { NextRequest } from 'next/server';

// GET all tags
export async function GET() {
  try {
    const tags = await db
      .select()
      .from(tag)
      .orderBy(desc(tag.createdAt));
    
    return Response.json(tags);
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return Response.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

// POST create new tag
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || name.trim() === '') {
      return Response.json({ error: 'Tag name is required' }, { status: 400 });
    }

    const cleanName = name.trim();

    // Check if tag already exists
    const existingTag = await db
      .select()
      .from(tag)
      .where(eq(tag.name, cleanName))
      .limit(1);

    if (existingTag.length > 0) {
      return Response.json({ error: 'Tag already exists' }, { status: 409 });
    }

    const newTag = await db
      .insert(tag)
      .values({
        id: crypto.randomUUID(),
        name: cleanName,
      })
      .returning();

    return Response.json(newTag[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create tag:', error);
    return Response.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}
