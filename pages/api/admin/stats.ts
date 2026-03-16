import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from 'lib/prisma';
import { requireAdmin } from 'lib/adminAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end();
  }

  const [totalUsers, totalBooks, totalOrders, recentOrders] = await Promise.all([
    (prisma.user.count as any)(),
    prisma.book.count(),
    prisma.order.count(),
    prisma.order.findMany({
      take: 10,
      orderBy: { orderedAt: 'desc' },
      include: {
        book: { select: { title: true, price: true } },
        user: { select: { nickname: true, name: true } },
      },
    }),
  ]);

  return res.status(200).json({ totalUsers, totalBooks, totalOrders, recentOrders });
}
