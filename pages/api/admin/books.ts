import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from 'lib/prisma';
import { requireAdmin } from 'lib/adminAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  // GET — paginated list of books
  if (req.method === 'GET') {
    const page = Math.max(1, Number(req.query.page) || 1);
    const size = Math.min(100, Math.max(1, Number(req.query.size) || 20));
    const search = (req.query.search as string) || '';
    const skip = (page - 1) * size;

    const where = search
      ? { title: { contains: search } }
      : undefined;

    const [total, books] = await Promise.all([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        skip,
        take: size,
        orderBy: { id: 'asc' },
        select: {
          id: true,
          title: true,
          type: true,
          publishedAt: true,
          stock: true,
          price: true,
        },
      }),
    ]);

    return res.status(200).json({
      data: books,
      total,
      page,
      totalPages: Math.ceil(total / size),
    });
  }

  // POST — create book
  if (req.method === 'POST') {
    const { title, type, publishedAt, stock, price } = req.body;
    if (!title || !type || !publishedAt) {
      return res.status(400).json({ error: 'title, type, publishedAt are required' });
    }
    const book = await prisma.book.create({
      data: {
        title,
        type,
        publishedAt: new Date(publishedAt),
        stock: Number(stock ?? 0),
        price: Number(price ?? 0),
      },
    });
    return res.status(201).json(book);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
