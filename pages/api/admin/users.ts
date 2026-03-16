import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from 'lib/prisma';
import bcrypt from 'bcryptjs';
import { requireAdmin } from 'lib/adminAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  // GET — list all users
  if (req.method === 'GET') {
    const users = await (prisma.user.findMany as any)({
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
      orderBy: { id: 'asc' },
    });
    return res.status(200).json(users);
  }

  // POST — create user
  if (req.method === 'POST') {
    const { nickname, name, email, password, role = 'USER', balance = 0 } = req.body;
    if (!nickname || !email || !password) {
      return res.status(400).json({ error: 'nickname, email, password are required' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await (prisma.user.create as any)({
      data: { nickname, name, email, passwordHash, role, balance: Number(balance) },
      select: { id: true, nickname: true, name: true, email: true, role: true, balance: true },
    });
    return res.status(201).json(user);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
