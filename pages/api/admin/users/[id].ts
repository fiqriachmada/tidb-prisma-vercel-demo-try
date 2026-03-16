import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from 'lib/prisma';
import bcrypt from 'bcryptjs';
import { requireAdmin } from 'lib/adminAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const userId = Number(req.query.id);
  if (isNaN(userId)) return res.status(400).json({ error: 'Invalid id' });

  // GET — single user with orders
  if (req.method === 'GET') {
    const user = await (prisma.user.findUnique as any)({
      where: { id: userId },
      select: {
        id: true, nickname: true, name: true, email: true,
        role: true, balance: true, createdAt: true,
        orders: {
          take: 50,
          orderBy: { orderedAt: 'desc' },
          include: {
            book: { select: { id: true, title: true, price: true, type: true } },
          },
        },
        ratings: {
          take: 20,
          orderBy: { ratedAt: 'desc' },
          include: { book: { select: { id: true, title: true } } },
        },
        _count: { select: { orders: true, ratings: true } },
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json(user);
  }

  // PUT — update user
  if (req.method === 'PUT') {
    const { nickname, name, email, password, role, balance } = req.body;
    const data: Record<string, any> = {};
    if (nickname !== undefined) data.nickname = nickname;
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (role !== undefined) data.role = role;
    if (balance !== undefined) data.balance = Number(balance);
    if (password) data.passwordHash = await bcrypt.hash(password, 10);

    const user = await (prisma.user.update as any)({
      where: { id: userId }, data,
      select: { id: true, nickname: true, name: true, email: true, role: true, balance: true },
    });
    return res.status(200).json(user);
  }

  // DELETE — remove user
  if (req.method === 'DELETE') {
    await (prisma.user.delete as any)({ where: { id: userId } });
    return res.status(200).json({ message: 'User deleted' });
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
