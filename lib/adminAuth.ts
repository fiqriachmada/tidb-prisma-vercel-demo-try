import { getServerSession } from 'next-auth';
import type { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from 'pages/api/auth/[...nextauth]';

/**
 * Returns the session or responds with 401/403.
 * Use this in every admin API route.
 */
export async function requireAdmin(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<{ id: string; role: string } | null> {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ error: 'Unauthenticated' });
    return null;
  }
  if ((session.user as any)?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden — admin only' });
    return null;
  }
  return { id: (session.user as any).id, role: 'ADMIN' };
}
