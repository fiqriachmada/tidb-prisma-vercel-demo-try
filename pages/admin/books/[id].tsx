import * as React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import {
  ArrowLeftIcon, PencilIcon, TrashIcon, StarIcon,
  ShoppingBagIcon, BookOpenIcon, UserIcon,
} from '@heroicons/react/24/outline';
import { useSnackbar } from 'notistack';

import { authOptions } from 'pages/api/auth/[...nextauth]';
import AdminLayout from 'components/v2/Admin/AdminLayout';

// ─── Types ────────────────────────────────────────────────────────────────────
interface BookDetail {
  id: number; title: string; type: string; publishedAt: string;
  stock: number; price: string;
  authors: Array<{ author: { id: string; name: string } }>;
  _count: { ratings: number; orders: number };
  ratings: Array<{
    score: number; ratedAt: string;
    user: { id: number; nickname: string; name: string | null };
  }>;
  orders: Array<{
    id: number; quality: number; orderedAt: string;
    user: { id: number; nickname: string; name: string | null };
  }>;
}

// ─── Star display ─────────────────────────────────────────────────────────────
function Stars({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon key={i} className={`w-3.5 h-3.5 ${i < score ? 'text-warning fill-warning' : 'text-base-content/20'}`} />
      ))}
      <span className="text-xs text-base-content/50 ml-1">{score}/5</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminBookDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { enqueueSnackbar } = useSnackbar();

  const { data: book, isLoading } = useQuery<BookDetail>({
    queryKey: ['admin-book-detail', id],
    queryFn: () => axios.get(`/api/admin/books/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => axios.delete(`/api/admin/books/${id}`),
    onSuccess: () => { enqueueSnackbar('Buku dihapus', { variant: 'success' }); router.push('/admin/books'); },
    onError: () => enqueueSnackbar('Gagal menghapus', { variant: 'error' }),
  });

  if (isLoading || !book) {
    return (
      <AdminLayout title="Detail Buku">
        <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg" /></div>
      </AdminLayout>
    );
  }

  const avgRating = book.ratings.length
    ? book.ratings.reduce((s, r) => s + r.score, 0) / book.ratings.length
    : 0;
  const totalRevenue = book.orders.reduce((s, o) => s + Number(book.price) * o.quality, 0);

  return (
    <>
      <Head><title>{book.title} | Admin</title></Head>
      <AdminLayout title="Detail Buku">
        <NextLink href="/admin/books" className="btn btn-ghost btn-sm gap-2 mb-6 w-fit">
          <ArrowLeftIcon className="w-4 h-4" />
          Kembali ke Books
        </NextLink>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Book Info Card ───────────────────────────────────── */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="card bg-base-100 shadow-md border border-base-200">
              <div className="card-body gap-4">
                {/* Cover */}
                <div className="rounded-xl overflow-hidden">
                  <Image
                    src={`https://picsum.photos/seed/${book.id}/400/240`}
                    alt={book.title}
                    width={400}
                    height={240}
                    className="w-full object-cover"
                  />
                </div>

                <div>
                  <h2 className="font-bold text-lg leading-tight">{book.title}</h2>
                  <p className="text-base-content/50 text-sm mt-1">
                    {book.authors.map(a => a.author.name).join(', ') || 'Unknown author'}
                  </p>
                  <span className="badge badge-ghost badge-sm mt-2">
                    {book.type.replaceAll('_nbsp_', ' ').replaceAll('_amp_', '&')}
                  </span>
                </div>

                <div className="divider my-0" />

                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-base-content/50">Harga</span>
                    <strong className="font-mono">${Number(book.price).toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/50">Stok</span>
                    <strong className={book.stock < 10 ? 'text-error' : ''}>{book.stock}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/50">Terbit</span>
                    <span>{new Date(book.publishedAt).toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base-content/50">Rating</span>
                    <Stars score={Math.round(avgRating)} />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="card bg-accent/10 border border-accent/20 shadow-sm">
                <div className="card-body p-4">
                  <p className="text-xs text-accent/70 font-medium">Revenue</p>
                  <p className="text-xl font-bold text-accent">${totalRevenue.toFixed(0)}</p>
                </div>
              </div>
              <div className="card bg-primary/10 border border-primary/20 shadow-sm">
                <div className="card-body p-4">
                  <p className="text-xs text-primary/70 font-medium">Terjual</p>
                  <p className="text-xl font-bold text-primary">{book._count.orders}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <NextLink href={`/admin/books?edit=${book.id}`} className="btn btn-primary btn-sm flex-1 gap-2">
                <PencilIcon className="w-4 h-4" />Edit
              </NextLink>
              <button
                className="btn btn-error btn-sm flex-1 gap-2"
                onClick={() => { if (confirm('Hapus buku ini? Semua data terkait akan hilang.')) deleteMutation.mutate(); }}
                disabled={deleteMutation.isPending}
              >
                <TrashIcon className="w-4 h-4" />Hapus
              </button>
            </div>
          </div>

          {/* ── Right panel ──────────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Orders */}
            <div className="card bg-base-100 shadow-md border border-base-200">
              <div className="card-body p-0">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-base-200">
                  <ShoppingBagIcon className="w-5 h-5 text-base-content/40" />
                  <h3 className="font-semibold">Pesanan Terbaru</h3>
                  <span className="badge badge-sm ml-auto">{book._count.orders}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead><tr><th>Pembeli</th><th>Qty</th><th>Total</th><th>Waktu</th></tr></thead>
                    <tbody>
                      {book.orders.map((o) => (
                        <tr key={o.id} className="hover">
                          <td>
                            <NextLink href={`/admin/users/${o.user.id}`} className="font-medium text-sm hover:text-primary transition-colors">
                              {o.user.name ?? o.user.nickname}
                            </NextLink>
                          </td>
                          <td>{o.quality}</td>
                          <td className="font-mono text-sm">${(Number(book.price) * o.quality).toFixed(2)}</td>
                          <td className="text-xs text-base-content/50">{new Date(o.orderedAt).toLocaleDateString('id-ID')}</td>
                        </tr>
                      ))}
                      {!book.orders.length && (
                        <tr><td colSpan={4} className="text-center py-8 text-base-content/40">Belum ada pesanan</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Ratings */}
            <div className="card bg-base-100 shadow-md border border-base-200">
              <div className="card-body p-0">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-base-200">
                  <StarIcon className="w-5 h-5 text-base-content/40" />
                  <h3 className="font-semibold">Ulasan Pembaca</h3>
                  <span className="badge badge-sm ml-auto">{book._count.ratings}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead><tr><th>Pembaca</th><th>Rating</th><th>Tanggal</th></tr></thead>
                    <tbody>
                      {book.ratings.map((r, i) => (
                        <tr key={i} className="hover">
                          <td>
                            <NextLink href={`/admin/users/${r.user.id}`} className="font-medium text-sm hover:text-primary transition-colors">
                              {r.user.name ?? r.user.nickname}
                            </NextLink>
                          </td>
                          <td><Stars score={r.score} /></td>
                          <td className="text-xs text-base-content/50">{new Date(r.ratedAt).toLocaleDateString('id-ID')}</td>
                        </tr>
                      ))}
                      {!book.ratings.length && (
                        <tr><td colSpan={3} className="text-center py-8 text-base-content/40">Belum ada ulasan</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return { redirect: { destination: '/', permanent: false } };
  }
  return { props: {} };
};
