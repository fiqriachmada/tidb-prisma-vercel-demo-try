import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from 'lib/prisma';
import { requireAdmin } from 'lib/adminAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const bookId = Number(req.query.id);
  if (isNaN(bookId)) return res.status(400).json({ error: 'Invalid id' });

  // GET — single book with ratings and orders
  if (req.method === 'GET') {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        authors: { include: { author: true } },
        ratings: {
          take: 20,
          orderBy: { ratedAt: 'desc' },
          include: { user: { select: { id: true, nickname: true, name: true } } },
        },
        orders: {
          take: 20,
          orderBy: { orderedAt: 'desc' },
          include: { user: { select: { id: true, nickname: true, name: true } } },
        },
        _count: { select: { ratings: true, orders: true } },
      },
    });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    return res.status(200).json(book);
  }

  // PUT — update book
  if (req.method === 'PUT') {
    const { title, type, publishedAt, stock, price } = req.body;
    const data: Record<string, any> = {};
    if (title !== undefined) data.title = title;
    if (type !== undefined) data.type = type;
    if (publishedAt !== undefined) data.publishedAt = new Date(publishedAt);
    if (stock !== undefined) data.stock = Number(stock);
    if (price !== undefined) data.price = Number(price);

    const book = await prisma.book.update({ where: { id: bookId }, data });
    return res.status(200).json(book);
  }

  // DELETE — remove book (manual cascade)
  if (req.method === 'DELETE') {
    await prisma.rating.deleteMany({ where: { bookId } });
    await prisma.order.deleteMany({ where: { bookId } });
    await prisma.bookAuthor.deleteMany({ where: { bookId } });
    await prisma.book.delete({ where: { id: bookId } });
    return res.status(200).json({ message: 'Book deleted' });
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
