import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from 'lib/prisma';
import { requireAdmin } from 'lib/adminAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  // GET — list all books (no pagination for admin)
  if (req.method === 'GET') {
    const books = await prisma.book.findMany({
      take: 200,
      orderBy: { id: 'asc' },
      include: { authors: { include: { author: true } } },
    });
    return res.status(200).json(books);
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
