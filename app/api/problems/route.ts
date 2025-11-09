import { db } from '@/lib/db';
import { problem } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');
    console.log('Fetching problem with slug:', slug);

    if (!slug) {
      return Response.json(
        { error: 'slug parameter is required' },
        { status: 400 }
      );
    }

    const problemData = await db
      .select()
      .from(problem)
      .where(eq(problem.id, slug));

    if (!problemData.length) {
      return Response.json(
        { error: 'Problem not found' },
        { status: 404 }
      );
    }

    const problemRecord = problemData[0];
    
    // Parse JSON strings back to arrays of strings
    const parsedProblem = {
      ...problemRecord,
      examples: problemRecord.examples ? JSON.parse(problemRecord.examples) : [],
      hints: problemRecord.hints ? JSON.parse(problemRecord.hints) : [],
    };

    return Response.json(parsedProblem);
  } catch (error) {
    console.error('Failed to fetch problem:', error);
    return Response.json(
      { error: 'Failed to fetch problem' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      slug,
      title,
      description,
      examples,
      requirements,
      theory,
      hints,
      constraints,
      runnerTemplate,
    } = body;

    if (!slug || !title) {
      return Response.json(
        { error: 'slug and title are required' },
        { status: 400 }
      );
    }

    // Check if problem exists
    const existing = await db
      .select()
      .from(problem)
      .where(eq(problem.id, slug))
      .limit(1);

    if (existing.length > 0) {
      // Update existing problem
      const updated = await db
        .update(problem)
        .set({
          title,
          description: description || '',
          examples: JSON.stringify(examples || []),
          requirements: requirements || '',
          theory: theory || '',
          hints: JSON.stringify(hints || []),
          constraints: constraints || '',
          runnerTemplate: runnerTemplate || '',
          updatedAt: new Date(),
        })
        .where(eq(problem.id, slug))
        .returning();

      return Response.json(updated[0], { status: 200 });
    } else {
      // Create new problem
      const newProblem = await db
        .insert(problem)
        .values({
          id: slug,
          title,
          description: description || '',
          examples: JSON.stringify(examples || []),
          requirements: requirements || '',
          theory: theory || '',
          hints: JSON.stringify(hints || []),
          constraints: constraints || '',
          runnerTemplate: runnerTemplate || '',
        })
        .returning();

      return Response.json(newProblem[0], { status: 201 });
    }
  } catch (error) {
    console.error('Failed to save problem:', error);
    return Response.json(
      { error: 'Failed to save problem' },
      { status: 500 }
    );
  }
}
