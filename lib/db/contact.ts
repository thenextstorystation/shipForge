import type { ContactFormInput } from '@/lib/content/types';
import { sql } from './client';

export async function insertContactSubmission(
  data: ContactFormInput,
): Promise<string> {
  const result = await sql<{ id: string }>`
    INSERT INTO contact_submissions (name, email, message)
    VALUES (${data.name}, ${data.email}, ${data.message})
    RETURNING id
  `;

  const row = result.rows[0];
  if (!row) {
    throw new Error('INSERT returned no rows — unexpected DB state');
  }
  return row.id;
}
