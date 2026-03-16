import * as React from 'react';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { XMarkIcon, EnvelopeIcon, LockClosedIcon, UserIcon, EyeIcon, EyeSlashIcon, BookOpenIcon } from '@heroicons/react/24/outline';

import { useAuthModalStore } from 'store';
import { loginSchema, registerSchema, LoginFormValues, RegisterFormValues } from 'types/auth';

// ─── Login Form ───────────────────────────────────────────────────────────────

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const setTab = useAuthModalStore((s) => s.setTab);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setServerError('');
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setServerError('Email atau password salah. Coba lagi.');
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {serverError && (
        <div className="alert alert-error py-2 text-sm">
          <span>{serverError}</span>
        </div>
      )}

      {/* Email */}
      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text font-medium">Email</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
            <EnvelopeIcon className="w-5 h-5" />
          </span>
          <input
            id="login-email"
            type="email"
            placeholder="demo@bookstore.com"
            className={`input input-bordered w-full pl-10 ${errors.email ? 'input-error' : ''}`}
            {...register('email')}
          />
        </div>
        {errors.email && (
          <label className="label pt-1">
            <span className="label-text-alt text-error">{errors.email.message}</span>
          </label>
        )}
      </div>

      {/* Password */}
      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text font-medium">Password</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
            <LockClosedIcon className="w-5 h-5" />
          </span>
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className={`input input-bordered w-full pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
            {...register('password')}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
          >
            {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <label className="label pt-1">
            <span className="label-text-alt text-error">{errors.password.message}</span>
          </label>
        )}
      </div>

      <button
        id="login-submit-btn"
        type="submit"
        className="btn btn-primary w-full mt-2"
        disabled={loading}
      >
        {loading && <span className="loading loading-spinner loading-sm" />}
        {loading ? 'Masuk...' : 'Masuk'}
      </button>

      <p className="text-center text-sm text-base-content/60">
        Belum punya akun?{' '}
        <button
          type="button"
          className="text-primary font-medium hover:underline"
          onClick={() => setTab('register')}
        >
          Daftar sekarang
        </button>
      </p>

      <div className="divider text-xs text-base-content/40">Demo credentials</div>
      <p className="text-center text-xs text-base-content/50">
        Email: <code>demo@bookstore.com</code> &nbsp;|&nbsp; Password: <code>password123</code>
      </p>
    </form>
  );
}

// ─── Register Form ────────────────────────────────────────────────────────────

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const setTab = useAuthModalStore((s) => s.setTab);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    setServerError('');
    // In a real app, call POST /api/auth/register, then signIn
    // For demo we just auto-login with mock credentials
    const result = await signIn('credentials', {
      email: 'demo@bookstore.com',
      password: 'password123',
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setServerError('Registrasi gagal. Silakan coba lagi.');
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {serverError && (
        <div className="alert alert-error py-2 text-sm">
          <span>{serverError}</span>
        </div>
      )}

      {/* Name */}
      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text font-medium">Nama Lengkap</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
            <UserIcon className="w-5 h-5" />
          </span>
          <input
            id="register-name"
            type="text"
            placeholder="John Doe"
            className={`input input-bordered w-full pl-10 ${errors.name ? 'input-error' : ''}`}
            {...register('name')}
          />
        </div>
        {errors.name && (
          <label className="label pt-1">
            <span className="label-text-alt text-error">{errors.name.message}</span>
          </label>
        )}
      </div>

      {/* Email */}
      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text font-medium">Email</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
            <EnvelopeIcon className="w-5 h-5" />
          </span>
          <input
            id="register-email"
            type="email"
            placeholder="email@example.com"
            className={`input input-bordered w-full pl-10 ${errors.email ? 'input-error' : ''}`}
            {...register('email')}
          />
        </div>
        {errors.email && (
          <label className="label pt-1">
            <span className="label-text-alt text-error">{errors.email.message}</span>
          </label>
        )}
      </div>

      {/* Password */}
      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text font-medium">Password</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
            <LockClosedIcon className="w-5 h-5" />
          </span>
          <input
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className={`input input-bordered w-full pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
            {...register('password')}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
          >
            {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <label className="label pt-1">
            <span className="label-text-alt text-error">{errors.password.message}</span>
          </label>
        )}
      </div>

      {/* Confirm Password */}
      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text font-medium">Konfirmasi Password</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
            <LockClosedIcon className="w-5 h-5" />
          </span>
          <input
            id="register-confirm-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className={`input input-bordered w-full pl-10 ${errors.confirmPassword ? 'input-error' : ''}`}
            {...register('confirmPassword')}
          />
        </div>
        {errors.confirmPassword && (
          <label className="label pt-1">
            <span className="label-text-alt text-error">{errors.confirmPassword.message}</span>
          </label>
        )}
      </div>

      <button
        id="register-submit-btn"
        type="submit"
        className="btn btn-primary w-full mt-2"
        disabled={loading}
      >
        {loading && <span className="loading loading-spinner loading-sm" />}
        {loading ? 'Mendaftar...' : 'Daftar'}
      </button>

      <p className="text-center text-sm text-base-content/60">
        Sudah punya akun?{' '}
        <button
          type="button"
          className="text-primary font-medium hover:underline"
          onClick={() => setTab('login')}
        >
          Masuk
        </button>
      </p>
    </form>
  );
}

// ─── Auth Modal ───────────────────────────────────────────────────────────────

export default function AuthModal() {
  const { isOpen, activeTab, closeModal, setTab } = useAuthModalStore();

  // Close on Escape key
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeModal]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={closeModal}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-md relative animate-in zoom-in-95 duration-200">
          {/* Close button */}
          <button
            id="auth-modal-close"
            className="btn btn-sm btn-ghost btn-circle absolute right-3 top-3"
            onClick={closeModal}
            aria-label="Tutup modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center pt-8 pb-4 px-6">
            <div className="flex items-center gap-2 mb-1">
              <BookOpenIcon className="w-7 h-7 text-primary" />
              <span className="text-xl font-bold text-primary">Bookstore</span>
            </div>
            <h2 id="auth-modal-title" className="text-2xl font-bold mt-2">
              {activeTab === 'login' ? 'Selamat Datang' : 'Buat Akun'}
            </h2>
            <p className="text-base-content/60 text-sm mt-1">
              {activeTab === 'login'
                ? 'Masuk untuk melanjutkan berbelanja'
                : 'Daftarkan diri Anda gratis'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex mx-6 rounded-xl overflow-hidden border border-base-300 mb-4">
            <button
              id="auth-tab-login"
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                activeTab === 'login'
                  ? 'bg-primary text-primary-content'
                  : 'hover:bg-base-200'
              }`}
              onClick={() => setTab('login')}
            >
              Masuk
            </button>
            <button
              id="auth-tab-register"
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                activeTab === 'register'
                  ? 'bg-primary text-primary-content'
                  : 'hover:bg-base-200'
              }`}
              onClick={() => setTab('register')}
            >
              Daftar
            </button>
          </div>

          {/* Form */}
          <div className="px-6 pb-8">
            {activeTab === 'login' ? (
              <LoginForm onSuccess={closeModal} />
            ) : (
              <RegisterForm onSuccess={closeModal} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
