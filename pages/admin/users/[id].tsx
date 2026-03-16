import * as React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import axios from 'axios';
import Image from 'next/image';
import {
  ArrowLeftIcon, PencilIcon, TrashIcon, ShieldCheckIcon,
  EnvelopeIcon, CurrencyDollarIcon, ShoppingBagIcon, StarIcon,
} from '@heroicons/react/24/outline';
import { useSnackbar } from 'notistack';

import { authOptions } from 'pages/api/auth/[...nextauth]';
import AdminLayout from 'components/v2/Admin/AdminLayout';

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserDetail {
  id: number; nickname: string; name: string | null; email: string | null;
  role: 'USER' | 'ADMIN'; balance: string; createdAt: string;
  _count: { orders: number; ratings: number };
  orders: Array<{
    id: number; quality: number; orderedAt: string;
    book: { id: number; title: string; price: string; type: string };
  }>;
  ratings: Array<{
    score: number; ratedAt: string;
    book: { id: number; title: string };
  }>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminUserDetail() {
  const router = useRouter();
  const { id } = router.query;
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const { data: user, isLoading } = useQuery<UserDetail>({
    queryKey: ['admin-user-detail', id],
    queryFn: () => axios.get(`/api/admin/users/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => axios.delete(`/api/admin/users/${id}`),
    onSuccess: () => { enqueueSnackbar('User dihapus', { variant: 'success' }); router.push('/admin/users'); },
    onError: () => enqueueSnackbar('Gagal menghapus', { variant: 'error' }),
  });

  if (isLoading || !user) {
    return (
      <AdminLayout title="Detail User">
        <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg" /></div>
      </AdminLayout>
    );
  }

  const initials = (user.name ?? user.nickname ?? '?')[0]?.toUpperCase() ?? '?';
  const totalSpent = user.orders.reduce((s, o) => s + Number(o.book.price) * o.quality, 0);

  return (
    <>
      <Head><title>{user.nickname} | Admin</title></Head>
      <AdminLayout title="Detail User">
        {/* Back button */}
        <NextLink href="/admin/users" className="btn btn-ghost btn-sm gap-2 mb-6 w-fit">
          <ArrowLeftIcon className="w-4 h-4" />
          Kembali ke Users
        </NextLink>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Profile Card ─────────────────────────────────────── */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="card bg-base-100 shadow-md border border-base-200">
              <div className="card-body items-center text-center gap-4">
                <div className="bg-primary text-primary-content rounded-full w-20 h-20 text-3xl font-bold flex items-center justify-center">
                  {initials}
                </div>
                <div>
                  <h2 className="font-bold text-xl">{user.name ?? user.nickname}</h2>
                  <p className="text-base-content/50 text-sm">@{user.nickname}</p>
                  <span className={`badge badge-sm mt-2 ${user.role === 'ADMIN' ? 'badge-error' : 'badge-ghost'}`}>
                    {user.role === 'ADMIN' && <ShieldCheckIcon className="w-3 h-3 mr-1" />}
                    {user.role}
                  </span>
                </div>

                <div className="divider my-0 w-full" />

                <div className="w-full flex flex-col gap-3 text-sm">
                  <div className="flex items-center gap-2 text-base-content/70">
                    <EnvelopeIcon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{user.email ?? '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-base-content/70">
                    <CurrencyDollarIcon className="w-4 h-4 shrink-0" />
                    <span>Balance: <strong>${Number(user.balance).toFixed(2)}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-base-content/70">
                    <ShoppingBagIcon className="w-4 h-4 shrink-0" />
                    <span><strong>{user._count.orders}</strong> pesanan · <strong>{user._count.ratings}</strong> ulasan</span>
                  </div>
                </div>

                <div className="divider my-0 w-full" />
                <p className="text-xs text-base-content/40">
                  Bergabung {new Date(user.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="card bg-primary/10 border border-primary/20 shadow-sm">
                <div className="card-body p-4">
                  <p className="text-xs text-primary/70 font-medium">Total Spent</p>
                  <p className="text-xl font-bold text-primary">${totalSpent.toFixed(2)}</p>
                </div>
              </div>
              <div className="card bg-secondary/10 border border-secondary/20 shadow-sm">
                <div className="card-body p-4">
                  <p className="text-xs text-secondary/70 font-medium">Avg/Order</p>
                  <p className="text-xl font-bold text-secondary">
                    ${user._count.orders > 0 ? (totalSpent / user._count.orders).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <NextLink href={`/admin/users?edit=${user.id}`} className="btn btn-primary btn-sm flex-1 gap-2">
                <PencilIcon className="w-4 h-4" />Edit
              </NextLink>
              <button
                className="btn btn-error btn-sm flex-1 gap-2"
                onClick={() => { if (confirm('Hapus user ini?')) deleteMutation.mutate(); }}
                disabled={deleteMutation.isPending}
              >
                <TrashIcon className="w-4 h-4" />Hapus
              </button>
            </div>
          </div>

          {/* ── Right panel ──────────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Orders table */}
            <div className="card bg-base-100 shadow-md border border-base-200">
              <div className="card-body p-0">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-base-200">
                  <ShoppingBagIcon className="w-5 h-5 text-base-content/40" />
                  <h3 className="font-semibold">Riwayat Pesanan</h3>
                  <span className="badge badge-sm ml-auto">{user._count.orders}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead><tr><th>Buku</th><th>Tipe</th><th>Qty</th><th>Total</th><th>Waktu</th></tr></thead>
                    <tbody>
                      {user.orders.map((o) => (
                        <tr key={o.id} className="hover">
                          <td>
                            <NextLink href={`/admin/books/${o.book.id}`} className="font-medium text-sm hover:text-primary transition-colors line-clamp-1">
                              {o.book.title}
                            </NextLink>
                          </td>
                          <td><span className="badge badge-ghost badge-xs">{o.book.type.replaceAll('_nbsp_', ' ')}</span></td>
                          <td>{o.quality}</td>
                          <td className="font-mono text-sm">${(Number(o.book.price) * o.quality).toFixed(2)}</td>
                          <td className="text-xs text-base-content/50">{new Date(o.orderedAt).toLocaleDateString('id-ID')}</td>
                        </tr>
                      ))}
                      {!user.orders.length && (
                        <tr><td colSpan={5} className="text-center py-8 text-base-content/40">Belum ada pesanan</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Ratings table */}
            <div className="card bg-base-100 shadow-md border border-base-200">
              <div className="card-body p-0">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-base-200">
                  <StarIcon className="w-5 h-5 text-base-content/40" />
                  <h3 className="font-semibold">Ulasan Diberikan</h3>
                  <span className="badge badge-sm ml-auto">{user._count.ratings}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead><tr><th>Buku</th><th>Skor</th><th>Tanggal</th></tr></thead>
                    <tbody>
                      {user.ratings.map((r, i) => (
                        <tr key={i} className="hover">
                          <td>
                            <NextLink href={`/admin/books/${r.book.id}`} className="font-medium text-sm hover:text-primary transition-colors">
                              {r.book.title}
                            </NextLink>
                          </td>
                          <td>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, s) => (
                                <StarIcon key={s} className={`w-3 h-3 ${s < r.score ? 'text-warning fill-warning' : 'text-base-content/20'}`} />
                              ))}
                              <span className="text-xs ml-1">{r.score}/5</span>
                            </div>
                          </td>
                          <td className="text-xs text-base-content/50">{new Date(r.ratedAt).toLocaleDateString('id-ID')}</td>
                        </tr>
                      ))}
                      {!user.ratings.length && (
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
