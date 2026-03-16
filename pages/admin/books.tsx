import * as React from 'react';
import Head from 'next/head';
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

const bookSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  type: z.string().min(1, 'Tipe wajib diisi'),
  publishedAt: z.string().min(1, 'Tanggal wajib diisi'),
  stock: z.coerce.number().min(0),
  price: z.coerce.number().min(0),
});
type BookForm = z.infer<typeof bookSchema>;

const BOOK_TYPES = Object.values(BookType);

// ─── API helpers ──────────────────────────────────────────────────────────────
const fetchBooks = () => axios.get('/api/admin/books').then((r) => r.data as AdminBook[]);
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
        <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-md relative">
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
  defaultValues,
  onSubmit,
  isPending,
  onClose,
  submitLabel,
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
        {errors.title && <span className="text-error text-xs mt-1">{errors.title.message}</span>}
      </div>
      <div className="form-control">
        <label className="label py-1"><span className="label-text text-sm">Tipe *</span></label>
        <select className={`select select-bordered select-sm ${errors.type ? 'select-error' : ''}`} {...register('type')}>
          <option value="">— Pilih tipe —</option>
          {BOOK_TYPES.map((t) => (
            <option key={t} value={t}>{t.replaceAll('_nbsp_', ' ').replaceAll('_amp_', '&')}</option>
          ))}
        </select>
        {errors.type && <span className="text-error text-xs mt-1">{errors.type.message}</span>}
      </div>
      <div className="form-control">
        <label className="label py-1"><span className="label-text text-sm">Tanggal Terbit *</span></label>
        <input type="date" className={`input input-bordered input-sm ${errors.publishedAt ? 'input-error' : ''}`} {...register('publishedAt')} />
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

  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const { data: books = [], isLoading } = useQuery({ queryKey: ['admin-books'], queryFn: fetchBooks });

  const filtered = books.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.type.toLowerCase().includes(search.toLowerCase())
  );

  const createMutation = useMutation({
    mutationFn: createBook,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-books'] }); enqueueSnackbar('Buku ditambahkan', { variant: 'success' }); setShowCreate(false); },
    onError: () => enqueueSnackbar('Gagal menambahkan buku', { variant: 'error' }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: BookForm) => updateBook({ ...data, id: editBook!.id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-books'] }); enqueueSnackbar('Buku diperbarui', { variant: 'success' }); setEditBook(null); },
    onError: () => enqueueSnackbar('Gagal memperbarui buku', { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteBook(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-books'] }); enqueueSnackbar('Buku dihapus', { variant: 'success' }); setDeleteTarget(null); },
    onError: () => enqueueSnackbar('Gagal menghapus buku', { variant: 'error' }),
  });

  return (
    <>
      <Head><title>Books | Admin Bookstore</title></Head>
      <AdminLayout title="Manajemen Buku">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Cari judul atau tipe..."
            className="input input-bordered input-sm w-full sm:w-72"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <p className="text-base-content/50 text-sm flex-1">{filtered.length} buku</p>
          <button className="btn btn-primary btn-sm gap-2" onClick={() => setShowCreate(true)}>
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
                  {filtered.map((b) => (
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
                        <p className="truncate text-sm">{b.title}</p>
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
                          <button
                            className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                            onClick={() => setDeleteTarget(b)}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreate && (
          <Modal title="Tambah Buku Baru" onClose={() => setShowCreate(false)}>
            <BookForm onSubmit={createMutation.mutate} isPending={createMutation.isPending} onClose={() => setShowCreate(false)} submitLabel="Tambah Buku" />
          </Modal>
        )}

        {/* Edit Modal */}
        {editBook && (
          <Modal title={`Edit: ${editBook.title}`} onClose={() => setEditBook(null)}>
            <BookForm
              defaultValues={{
                title: editBook.title,
                type: editBook.type,
                publishedAt: editBook.publishedAt.slice(0, 10),
                stock: editBook.stock,
                price: Number(editBook.price),
              }}
              onSubmit={updateMutation.mutate}
              isPending={updateMutation.isPending}
              onClose={() => setEditBook(null)}
              submitLabel="Simpan"
            />
          </Modal>
        )}

        {/* Delete Confirm */}
        {deleteTarget && (
          <Modal title="Hapus Buku" onClose={() => setDeleteTarget(null)}>
            <p className="text-base-content/70 mb-4">
              Yakin ingin menghapus buku <strong>"{deleteTarget.title}"</strong>?
              Semua rating dan pesanan terkait akan dihapus.
            </p>
            <div className="flex justify-end gap-2">
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(null)}>Batal</button>
              <button
                className="btn btn-error btn-sm"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
              >
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
