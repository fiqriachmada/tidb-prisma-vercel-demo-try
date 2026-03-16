import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from 'lib/prisma';
import bcrypt from 'bcryptjs';
import { requireAdmin } from 'lib/adminAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  // GET — paginated list of users
  if (req.method === 'GET') {
    const page = Math.max(1, Number(req.query.page) || 1);
    const size = Math.min(100, Math.max(1, Number(req.query.size) || 20));
    const skip = (page - 1) * size;

    const [total, users] = await Promise.all([
      (prisma.user.count as any)(),
      (prisma.user.findMany as any)({
        skip,
        take: size,
        orderBy: { id: 'asc' },
        select: {
          id: true,
          nickname: true,
          name: true,
          email: true,
          role: true,
          balance: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
    ]);

    return res.status(200).json({
      data: users,
      total,
      page,
      totalPages: Math.ceil(total / size),
    });
  }

  // POST — create user
  if (req.method === 'POST') {
    const { nickname, name, email, password, role, balance } = req.body;
    if (!nickname || !email || !password) {
      return res.status(400).json({ error: 'nickname, email, password are required' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await (prisma.user.create as any)({
      data: {
        nickname,
        name: name || null,
        email,
        passwordHash,
        role: role || 'USER',
        balance: Number(balance ?? 0),
      },
      select: { id: true, nickname: true, name: true, email: true, role: true, balance: true },
    });
    return res.status(201).json(user);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
