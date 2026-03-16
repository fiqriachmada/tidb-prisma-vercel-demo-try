import * as React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  UsersIcon,
  BookOpenIcon,
  ShoppingBagIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

import { authOptions } from 'pages/api/auth/[...nextauth]';
import AdminLayout from 'components/v2/Admin/AdminLayout';

// ─── Stats data fetcher ───────────────────────────────────────────────────────
async function fetchStats() {
  const res = await axios.get('/api/admin/stats');
  return res.data as {
    totalUsers: number;
    totalBooks: number;
    totalOrders: number;
    recentOrders: Array<{
      id: number;
      quality: number;
      orderedAt: string;
      book: { title: string; price: string };
      user: { nickname: string; name: string | null };
    }>;
  };
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="card bg-base-100 shadow-md border border-base-200">
      <div className="card-body flex-row items-center gap-4 p-5">
        <div className={`rounded-2xl p-4 ${color}`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div>
          <p className="text-sm text-base-content/50 font-medium">{label}</p>
          <p className="text-3xl font-bold leading-tight">{value ?? '—'}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: fetchStats });

  return (
    <>
      <Head>
        <title>Admin Dashboard | Bookstore</title>
      </Head>
      <AdminLayout title="Dashboard">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Total Users"
            value={isLoading ? '...' : data?.totalUsers ?? 0}
            icon={UsersIcon}
            color="bg-primary"
          />
          <StatCard
            label="Total Books"
            value={isLoading ? '...' : data?.totalBooks ?? 0}
            icon={BookOpenIcon}
            color="bg-secondary"
          />
          <StatCard
            label="Total Orders"
            value={isLoading ? '...' : data?.totalOrders ?? 0}
            icon={ShoppingBagIcon}
            color="bg-accent"
          />
        </div>

        {/* Recent orders table */}
        <div className="card bg-base-100 shadow-md border border-base-200">
          <div className="card-body p-0">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-base-200">
              <ClockIcon className="w-5 h-5 text-base-content/40" />
              <h2 className="font-semibold">Pesanan Terbaru</h2>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-md" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>User</th>
                      <th>Buku</th>
                      <th>Qty</th>
                      <th>Total</th>
                      <th>Waktu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.recentOrders ?? []).map((o) => (
                      <tr key={o.id} className="hover">
                        <td className="text-base-content/50 text-xs">{o.id}</td>
                        <td className="font-medium">{o.user.name ?? o.user.nickname}</td>
                        <td className="max-w-[180px] truncate">{o.book.title}</td>
                        <td>{o.quality}</td>
                        <td>${(Number(o.book.price) * o.quality).toFixed(2)}</td>
                        <td className="text-xs text-base-content/50">
                          {new Date(o.orderedAt).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                    {!data?.recentOrders?.length && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-base-content/40">
                          Belum ada pesanan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

// ─── Server-side auth guard ───────────────────────────────────────────────────
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session) return { redirect: { destination: '/', permanent: false } };
  if ((session.user as any)?.role !== 'ADMIN') {
    return { redirect: { destination: '/', permanent: false } };
  }
  return { props: {} };
};
