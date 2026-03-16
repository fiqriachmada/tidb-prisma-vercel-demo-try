import { z } from 'zod';

// ─── Zod Schemas ────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(6, 'Password minimal 6 karakter')
    .max(100, 'Password terlalu panjang'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama terlalu panjang'),
    email: z
      .string()
      .min(1, 'Email wajib diisi')
      .email('Format email tidak valid'),
    password: z
      .string()
      .min(6, 'Password minimal 6 karakter')
      .max(100, 'Password terlalu panjang'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  });

// ─── Inferred Types ─────────────────────────────────────────────────────────

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;

// ─── Session / User Types ────────────────────────────────────────────────────

export type UserRole = 'USER' | 'ADMIN';

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: UserRole;
}

export type AuthModalTab = 'login' | 'register';

export type Theme = 'light' | 'dark';

