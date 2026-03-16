import * as React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { useQuery } from '@tanstack/react-query';
import NextLink from 'next/link';
import axios from 'axios';
import { ChevronLeftIcon, ChevronRightIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

import { authOptions } from 'pages/api/auth/[...nextauth]';
import AdminLayout from 'components/v2/Admin/AdminLayout';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Order {
  id: number; quality: number; orderedAt: string;
  book: { id: number; title: string; price: string; type: string };
  user: { id: number; nickname: string; name: string | null };
}
interface PagedOrders { data: Order[]; total: number; page: number; totalPages: number; }

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminOrders() {
  const [page, setPage] = React.useState(1);
  const [size, setSize] = React.useState(20);

  const { data, isLoading } = useQuery<PagedOrders>({
    queryKey: ['admin-orders', page, size],
    queryFn: () => axios.get(`/api/admin/orders?page=${page}&size=${size}`).then((r) => r.data),
  });

  const orders = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <>
      <Head><title>Orders | Admin Bookstore</title></Head>
      <AdminLayout title="Manajemen Orders">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-base-content/50 text-sm">
            {data ? `${data.total} order · halaman ${page} dari ${totalPages}` : '...'}
          </p>
        </div>

        {/* Table */}
        <div className="card bg-base-100 shadow-md border border-base-200 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-16"><span className="loading loading-spinner loading-md" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead className="bg-base-200">
                  <tr>
                    <th>#</th>
                    <th>Pembeli</th>
                    <th>Buku</th>
                    <th>Tipe</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="hover">
                      <td className="text-base-content/40 text-xs font-mono">{o.id}</td>
                      <td>
                        <NextLink
                          href={`/admin/users/${o.user.id}`}
                          className="font-medium text-sm hover:text-primary transition-colors"
                        >
                          {o.user.name ?? o.user.nickname}
                        </NextLink>
                        <p className="text-xs text-base-content/40">@{o.user.nickname}</p>
                      </td>
                      <td className="max-w-[180px]">
                        <NextLink
                          href={`/admin/books/${o.book.id}`}
                          className="font-medium text-sm hover:text-primary transition-colors line-clamp-2"
                        >
                          {o.book.title}
                        </NextLink>
                      </td>
                      <td>
                        <span className="badge badge-ghost badge-xs">
                          {o.book.type.replaceAll('_nbsp_', ' ').replaceAll('_amp_', '&')}
                        </span>
                      </td>
                      <td className="text-sm">{o.quality}</td>
                      <td className="font-mono text-sm font-semibold text-success">
                        ${(Number(o.book.price) * o.quality).toFixed(2)}
                      </td>
                      <td className="text-xs text-base-content/50">
                        {new Date(o.orderedAt).toLocaleDateString('id-ID', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                        <br />
                        <span className="text-base-content/30">
                          {new Date(o.orderedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!orders.length && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-base-content/40">
                        <ShoppingBagIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        Belum ada order
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Pagination footer ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-base-content/50">Tampilkan</span>
            <select
              className="select select-bordered select-sm w-20"
              value={size}
              onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }}
            >
              {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <span className="text-base-content/50">per halaman</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-sm btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeftIcon className="w-4 h-4" />Prev
            </button>
            <span className="text-sm font-medium px-2">{page} / {totalPages}</span>
            <button className="btn btn-sm btn-ghost" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next<ChevronRightIcon className="w-4 h-4" />
            </button>
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
