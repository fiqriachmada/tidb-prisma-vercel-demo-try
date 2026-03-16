import * as React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  UserCircleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useSnackbar } from 'notistack';

import { authOptions } from 'pages/api/auth/[...nextauth]';
import AdminLayout from 'components/v2/Admin/AdminLayout';

// ─── Types & Schemas ──────────────────────────────────────────────────────────
interface AdminUser {
  id: number;
  nickname: string;
  name: string | null;
  email: string | null;
  role: 'USER' | 'ADMIN';
  balance: string;
  createdAt: string;
  _count: { orders: number };
}

const createUserSchema = z.object({
  nickname: z.string().min(2, 'Min 2 karakter'),
  name: z.string().optional(),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Min 6 karakter'),
  role: z.enum(['USER', 'ADMIN']),
  balance: z.preprocess((v) => Number(v ?? 0), z.number().min(0)).optional(),
});

const editUserSchema = z.object({
  nickname: z.string().min(2, 'Min 2 karakter'),
  name: z.string().optional(),
  email: z.string().email('Email tidak valid'),
  password: z.string().optional(),
  role: z.enum(['USER', 'ADMIN']),
  balance: z.preprocess((v) => Number(v ?? 0), z.number().min(0)).optional(),
});

type CreateForm = z.infer<typeof createUserSchema>;
type EditForm = z.infer<typeof editUserSchema>;

// ─── API helpers ──────────────────────────────────────────────────────────────
const fetchUsers = () => axios.get('/api/admin/users').then((r) => r.data as AdminUser[]);
const createUser = (data: CreateForm) => axios.post('/api/admin/users', data);
const updateUser = ({ id, ...data }: EditForm & { id: number }) =>
  axios.put(`/api/admin/users/${id}`, data);
const deleteUser = (id: number) => axios.delete(`/api/admin/users/${id}`);

// ─── Modal helper ─────────────────────────────────────────────────────────────
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

// ─── Create Form ──────────────────────────────────────────────────────────────
function CreateUserForm({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { register, handleSubmit, formState: { errors } } = useForm<CreateForm>({
    resolver: zodResolver(createUserSchema) as any,
    defaultValues: { role: 'USER', balance: 0 },
  });
  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      enqueueSnackbar('User berhasil dibuat', { variant: 'success' });
      onClose();
    },
    onError: () => enqueueSnackbar('Gagal membuat user', { variant: 'error' }),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="form-control">
          <label className="label py-1"><span className="label-text text-sm">Nickname *</span></label>
          <input className={`input input-bordered input-sm ${errors.nickname ? 'input-error' : ''}`} {...register('nickname')} />
          {errors.nickname && <span className="text-error text-xs mt-1">{errors.nickname.message}</span>}
        </div>
        <div className="form-control">
          <label className="label py-1"><span className="label-text text-sm">Nama</span></label>
          <input className="input input-bordered input-sm" {...register('name')} />
        </div>
      </div>
      <div className="form-control">
        <label className="label py-1"><span className="label-text text-sm">Email *</span></label>
        <input type="email" className={`input input-bordered input-sm ${errors.email ? 'input-error' : ''}`} {...register('email')} />
        {errors.email && <span className="text-error text-xs mt-1">{errors.email.message}</span>}
      </div>
      <div className="form-control">
        <label className="label py-1"><span className="label-text text-sm">Password *</span></label>
        <input type="password" className={`input input-bordered input-sm ${errors.password ? 'input-error' : ''}`} {...register('password')} />
        {errors.password && <span className="text-error text-xs mt-1">{errors.password.message}</span>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="form-control">
          <label className="label py-1"><span className="label-text text-sm">Role</span></label>
          <select className="select select-bordered select-sm" {...register('role')}>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div className="form-control">
          <label className="label py-1"><span className="label-text text-sm">Balance ($)</span></label>
          <input type="number" step="0.01" className="input input-bordered input-sm" {...register('balance')} />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Batal</button>
        <button type="submit" className="btn btn-primary btn-sm" disabled={mutation.isPending}>
          {mutation.isPending && <span className="loading loading-spinner loading-xs" />}
          Buat User
        </button>
      </div>
    </form>
  );
}

// ─── Edit Form ────────────────────────────────────────────────────────────────
function EditUserForm({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { register, handleSubmit, formState: { errors } } = useForm<EditForm>({
    resolver: zodResolver(editUserSchema) as any,
    defaultValues: {
      nickname: user.nickname,
      name: user.name ?? '',
      email: user.email ?? '',
      role: user.role,
      balance: Number(user.balance),
    },
  });
  const mutation = useMutation({
    mutationFn: (data: EditForm) => updateUser({ ...data, id: user.id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      enqueueSnackbar('User diperbarui', { variant: 'success' });
      onClose();
    },
    onError: () => enqueueSnackbar('Gagal memperbarui user', { variant: 'error' }),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="form-control">
          <label className="label py-1"><span className="label-text text-sm">Nickname *</span></label>
          <input className={`input input-bordered input-sm ${errors.nickname ? 'input-error' : ''}`} {...register('nickname')} />
        </div>
        <div className="form-control">
          <label className="label py-1"><span className="label-text text-sm">Nama</span></label>
          <input className="input input-bordered input-sm" {...register('name')} />
        </div>
      </div>
      <div className="form-control">
        <label className="label py-1"><span className="label-text text-sm">Email *</span></label>
        <input type="email" className={`input input-bordered input-sm ${errors.email ? 'input-error' : ''}`} {...register('email')} />
      </div>
      <div className="form-control">
        <label className="label py-1"><span className="label-text text-sm">Password baru (kosongkan jika tidak diubah)</span></label>
        <input type="password" className="input input-bordered input-sm" placeholder="••••••••" {...register('password')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="form-control">
          <label className="label py-1"><span className="label-text text-sm">Role</span></label>
          <select className="select select-bordered select-sm" {...register('role')}>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div className="form-control">
          <label className="label py-1"><span className="label-text text-sm">Balance ($)</span></label>
          <input type="number" step="0.01" className="input input-bordered input-sm" {...register('balance')} />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Batal</button>
        <button type="submit" className="btn btn-primary btn-sm" disabled={mutation.isPending}>
          {mutation.isPending && <span className="loading loading-spinner loading-xs" />}
          Simpan
        </button>
      </div>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminUsers() {
  const [showCreate, setShowCreate] = React.useState(false);
  const [editUser, setEditUser] = React.useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AdminUser | null>(null);

  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { data: users = [], isLoading } = useQuery({ queryKey: ['admin-users'], queryFn: fetchUsers });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      enqueueSnackbar('User dihapus', { variant: 'success' });
      setDeleteTarget(null);
    },
    onError: () => enqueueSnackbar('Gagal menghapus user', { variant: 'error' }),
  });

  return (
    <>
      <Head><title>Users | Admin Bookstore</title></Head>
      <AdminLayout title="Manajemen Users">
        {/* Header actions */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-base-content/50 text-sm">{users.length} user ditemukan</p>
          <button className="btn btn-primary btn-sm gap-2" onClick={() => setShowCreate(true)}>
            <PlusIcon className="w-4 h-4" />
            Tambah User
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
                    <th>#</th>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Balance</th>
                    <th>Orders</th>
                    <th>Bergabung</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="hover">
                      <td className="text-base-content/40 text-xs">{u.id}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="avatar placeholder">
                            <div className="bg-primary text-primary-content rounded-full w-8 text-xs font-bold flex items-center justify-center">
                              {(u.name ?? u.nickname ?? '?')[0]?.toUpperCase() ?? '?'}
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-sm leading-tight">{u.name ?? u.nickname}</p>
                            <p className="text-xs text-base-content/40">@{u.nickname}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm">{u.email ?? '—'}</td>
                      <td>
                        <span className={`badge badge-sm gap-1 ${u.role === 'ADMIN' ? 'badge-error' : 'badge-ghost'}`}>
                          {u.role === 'ADMIN' && <ShieldCheckIcon className="w-3 h-3" />}
                          {u.role}
                        </span>
                      </td>
                      <td className="font-mono text-sm">${Number(u.balance).toFixed(2)}</td>
                      <td className="text-sm">{u._count.orders}</td>
                      <td className="text-xs text-base-content/40">
                        {new Date(u.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <button className="btn btn-ghost btn-xs" onClick={() => setEditUser(u)}>
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button className="btn btn-ghost btn-xs text-error hover:bg-error/10" onClick={() => setDeleteTarget(u)}>
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
          <Modal title="Tambah User Baru" onClose={() => setShowCreate(false)}>
            <CreateUserForm onClose={() => setShowCreate(false)} />
          </Modal>
        )}

        {/* Edit Modal */}
        {editUser && (
          <Modal title={`Edit User: ${editUser.nickname}`} onClose={() => setEditUser(null)}>
            <EditUserForm user={editUser} onClose={() => setEditUser(null)} />
          </Modal>
        )}

        {/* Delete Confirm */}
        {deleteTarget && (
          <Modal title="Hapus User" onClose={() => setDeleteTarget(null)}>
            <p className="text-base-content/70 mb-4">
              Yakin ingin menghapus user <strong>{deleteTarget.name ?? deleteTarget.nickname}</strong>?
              Tindakan ini tidak dapat dibatalkan.
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
