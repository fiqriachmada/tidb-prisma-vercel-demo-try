import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from 'lib/prisma';
import { requireAdmin } from 'lib/adminAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method === 'GET') {
    const page = Math.max(1, Number(req.query.page) || 1);
    const size = Math.min(100, Math.max(1, Number(req.query.size) || 20));
    const skip = (page - 1) * size;

    const [total, orders] = await Promise.all([
      prisma.order.count(),
      prisma.order.findMany({
        skip,
        take: size,
        orderBy: { orderedAt: 'desc' },
        include: {
          book: { select: { id: true, title: true, price: true, type: true } },
          user: { select: { id: true, nickname: true, name: true } },
        },
      }),
    ]);

    return res.status(200).json({
      data: orders,
      total,
      page,
      totalPages: Math.ceil(total / size),
    });
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
