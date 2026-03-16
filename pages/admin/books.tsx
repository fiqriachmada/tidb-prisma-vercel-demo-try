import * as React from 'react';
import Head from 'next/head';
import NextLink from 'next/link';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import Image from 'next/image';
import {
  PencilIcon, TrashIcon, PlusIcon, XMarkIcon,
  ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useSnackbar } from 'notistack';

import { authOptions } from 'pages/api/auth/[...nextauth]';
import AdminLayout from 'components/v2/Admin/AdminLayout';
import { BookType } from '@prisma/client';

// ─── Types & Schemas ──────────────────────────────────────────────────────────
interface AdminBook {
  id: number;
  title: string;
  type: string;
  publishedAt: string;
  stock: number;
  price: string;
}
interface PagedBooks { data: AdminBook[]; total: number; page: number; totalPages: number; }

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const BOOK_TYPES = Object.values(BookType);

const bookSchema = z.object({
  title: z.string().min(1),
  type: z.string().min(1),
  publishedAt: z.string().min(1),
  stock: z.preprocess((v) => Number(v ?? 0), z.number().min(0)),
  price: z.preprocess((v) => Number(v ?? 0), z.number().min(0)),
});
type BookForm = z.infer<typeof bookSchema>;

// ─── API helpers ──────────────────────────────────────────────────────────────
const fetchBooks = (page: number, size: number, search: string) =>
  axios.get(`/api/admin/books?page=${page}&size=${size}&search=${encodeURIComponent(search)}`).then((r) => r.data as PagedBooks);
const createBook = (data: BookForm) => axios.post('/api/admin/books', data);
const updateBook = ({ id, ...data }: BookForm & { id: number }) =>
  axios.put(`/api/admin/books/${id}`, data);
const deleteBook = (id: number) => axios.delete(`/api/admin/books/${id}`);

// ─── Shared Modal ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
            <h3 className="font-bold text-lg">{title}</h3>
            <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </>
  );
}

// ─── Book Form ────────────────────────────────────────────────────────────────
function BookForm({
  defaultValues, onSubmit, isPending, onClose, submitLabel,
}: {
  defaultValues?: Partial<BookForm>;
  onSubmit: (data: BookForm) => void;
  isPending: boolean;
  onClose: () => void;
  submitLabel: string;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<BookForm>({
    resolver: zodResolver(bookSchema) as any,
    defaultValues: { stock: 0, price: 0, ...defaultValues },
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div className="form-control">
        <label className="label py-1"><span className="label-text text-sm">Judul *</span></label>
        <input className={`input input-bordered input-sm ${errors.title ? 'input-error' : ''}`} {...register('title')} />
      </div>
      <div className="form-control">
        <label className="label py-1"><span className="label-text text-sm">Tipe *</span></label>
        <select className={`select select-bordered select-sm ${errors.type ? 'select-error' : ''}`} {...register('type')}>
          <option value="">— Pilih tipe —</option>
          {BOOK_TYPES.map((t) => (
            <option key={t} value={t}>{t.replaceAll('_nbsp_', ' ').replaceAll('_amp_', '&')}</option>
          ))}
        </select>
      </div>
      <div className="form-control">
        <label className="label py-1"><span className="label-text text-sm">Tanggal Terbit *</span></label>
        <input type="date" className="input input-bordered input-sm" {...register('publishedAt')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="form-control">
          <label className="label py-1"><span className="label-text text-sm">Stok</span></label>
          <input type="number" className="input input-bordered input-sm" {...register('stock')} />
        </div>
        <div className="form-control">
          <label className="label py-1"><span className="label-text text-sm">Harga ($)</span></label>
          <input type="number" step="0.01" className="input input-bordered input-sm" {...register('price')} />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Batal</button>
        <button type="submit" className="btn btn-primary btn-sm" disabled={isPending}>
          {isPending && <span className="loading loading-spinner loading-xs" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminBooks() {
  const [showCreate, setShowCreate] = React.useState(false);
  const [editBook, setEditBook] = React.useState<AdminBook | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AdminBook | null>(null);
  const [search, setSearch] = React.useState('');
  const [searchInput, setSearchInput] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [size, setSize] = React.useState(20);

  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-books', page, size, search],
    queryFn: () => fetchBooks(page, size, search),
  });

  const books = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const createMutation = useMutation({
    mutationFn: createBook,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-books'] }); enqueueSnackbar('Buku ditambahkan', { variant: 'success' }); setShowCreate(false); },
    onError: () => enqueueSnackbar('Gagal menambahkan', { variant: 'error' }),
  });
  const updateMutation = useMutation({
    mutationFn: (d: BookForm) => updateBook({ ...d, id: editBook!.id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-books'] }); enqueueSnackbar('Buku diperbarui', { variant: 'success' }); setEditBook(null); },
    onError: () => enqueueSnackbar('Gagal memperbarui', { variant: 'error' }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteBook(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-books'] }); enqueueSnackbar('Buku dihapus', { variant: 'success' }); setDeleteTarget(null); },
    onError: () => enqueueSnackbar('Gagal menghapus', { variant: 'error' }),
  });

  return (
    <>
      <Head><title>Books | Admin Bookstore</title></Head>
      <AdminLayout title="Manajemen Buku">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className="relative w-full sm:w-72">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Cari judul buku..."
              className="input input-bordered input-sm w-full pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <p className="text-base-content/50 text-sm flex-1">
            {data ? `${data.total} buku · hal. ${page}/${totalPages}` : '...'}
          </p>
          <button className="btn btn-primary btn-sm gap-2 shrink-0" onClick={() => setShowCreate(true)}>
            <PlusIcon className="w-4 h-4" />
            Tambah Buku
          </button>
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
                    <th>Cover</th>
                    <th>Judul</th>
                    <th>Tipe</th>
                    <th>Terbit</th>
                    <th>Stok</th>
                    <th>Harga</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((b) => (
                    <tr key={b.id} className="hover">
                      <td>
                        <div className="rounded-lg overflow-hidden w-10 h-14 bg-base-200">
                          <Image
                            src={`https://picsum.photos/seed/${b.id}/40/60`}
                            alt={b.title}
                            width={40}
                            height={60}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </td>
                      <td className="font-medium max-w-[200px]">
                        <NextLink href={`/admin/books/${b.id}`} className="text-sm hover:text-primary transition-colors line-clamp-1">
                          {b.title}
                        </NextLink>
                        <p className="text-xs text-base-content/40">#{b.id}</p>
                      </td>
                      <td>
                        <span className="badge badge-ghost badge-sm text-xs">
                          {b.type.replaceAll('_nbsp_', ' ').replaceAll('_amp_', '&')}
                        </span>
                      </td>
                      <td className="text-xs text-base-content/60">
                        {new Date(b.publishedAt).toLocaleDateString('id-ID')}
                      </td>
                      <td>
                        <span className={`font-mono text-sm ${b.stock < 10 ? 'text-error font-bold' : ''}`}>
                          {b.stock}
                        </span>
                      </td>
                      <td className="font-mono text-sm">${Number(b.price).toFixed(2)}</td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <button className="btn btn-ghost btn-xs" onClick={() => setEditBook(b)}>
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button className="btn btn-ghost btn-xs text-error hover:bg-error/10" onClick={() => setDeleteTarget(b)}>
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!books.length && (
                    <tr><td colSpan={7} className="text-center py-10 text-base-content/40">Tidak ada buku ditemukan</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Pagination footer ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-base-content/50">Tampilkan</span>
            <select
              className="select select-bordered select-sm w-20"
              value={size}
              onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span className="text-base-content/50">per halaman</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="btn btn-sm btn-ghost"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Prev
            </button>
            <span className="text-sm font-medium px-2">{page} / {totalPages}</span>
            <button
              className="btn btn-sm btn-ghost"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modals */}
        {showCreate && (
          <Modal title="Tambah Buku Baru" onClose={() => setShowCreate(false)}>
            <BookForm onSubmit={createMutation.mutate} isPending={createMutation.isPending} onClose={() => setShowCreate(false)} submitLabel="Tambah Buku" />
          </Modal>
        )}
        {editBook && (
          <Modal title={`Edit: ${editBook.title}`} onClose={() => setEditBook(null)}>
            <BookForm
              defaultValues={{ title: editBook.title, type: editBook.type, publishedAt: editBook.publishedAt.slice(0, 10), stock: editBook.stock, price: Number(editBook.price) }}
              onSubmit={updateMutation.mutate}
              isPending={updateMutation.isPending}
              onClose={() => setEditBook(null)}
              submitLabel="Simpan"
            />
          </Modal>
        )}
        {deleteTarget && (
          <Modal title="Hapus Buku" onClose={() => setDeleteTarget(null)}>
            <p className="text-base-content/70 mb-4">Yakin hapus <strong>"{deleteTarget.title}"</strong>? Semua rating dan pesanan terkait akan dihapus.</p>
            <div className="flex justify-end gap-2">
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(null)}>Batal</button>
              <button className="btn btn-error btn-sm" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteTarget.id)}>
                {deleteMutation.isPending && <span className="loading loading-spinner loading-xs" />}
                Hapus
              </button>
            </div>
          </Modal>
        )}
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
