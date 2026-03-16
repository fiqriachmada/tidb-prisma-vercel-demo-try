import * as React from 'react';
import { ExclamationTriangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuthModalStore } from 'store';

interface LoginWarningProps {
  message?: string;
  className?: string;
}

/**
 * Alert banner prompting users to log in before proceeding.
 * Shown on checkout and other guarded actions.
 */
export default function LoginWarning({
  message = 'Anda harus masuk terlebih dahulu untuk melanjutkan pembelian.',
  className = '',
}: LoginWarningProps) {
  const openModal = useAuthModalStore((s) => s.openModal);

  return (
    <div
      role="alert"
      className={`alert alert-warning shadow-lg rounded-2xl flex items-center gap-4 ${className}`}
    >
      <ExclamationTriangleIcon className="w-6 h-6 shrink-0 stroke-current" />
      <div className="flex-1">
        <h3 className="font-bold">Login Diperlukan</h3>
        <p className="text-sm">{message}</p>
      </div>
      <button
        id="login-warning-btn"
        className="btn btn-sm btn-primary gap-2"
        onClick={() => openModal('login', 'checkout')}
      >
        <UserCircleIcon className="w-4 h-4" />
        Masuk Sekarang
      </button>
    </div>
  );
}
