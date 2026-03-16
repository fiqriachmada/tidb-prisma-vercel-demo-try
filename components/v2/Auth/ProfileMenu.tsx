import * as React from 'react';
import { signOut } from 'next-auth/react';
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';

import { useCurrentUser } from 'hooks/useCurrentUser';
import { useTheme } from 'hooks/useTheme';
import { useAuthModalStore } from 'store';

export default function ProfileMenu() {
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const { theme, toggleTheme } = useTheme();
  const openModal = useAuthModalStore((s) => s.openModal);

  if (isLoading) {
    return (
      <div className="w-10 h-10 flex items-center justify-center">
        <span className="loading loading-spinner loading-sm" />
      </div>
    );
  }

  // ── Unauthenticated: show simple login button ─────────────────────────────
  if (!isAuthenticated || !user) {
    return (
      <button
        id="header-login-btn"
        className="btn btn-primary btn-sm"
        onClick={() => openModal('login')}
      >
        <UserCircleIcon className="w-5 h-5" />
        Masuk
      </button>
    );
  }

  // ── Authenticated: avatar + dropdown ──────────────────────────────────────
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : user.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <div className="dropdown dropdown-end">
      {/* Avatar trigger */}
      <label
        id="profile-menu-trigger"
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle avatar online placeholder"
      >
        {user.image ? (
          <div className="w-10 rounded-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={user.image} alt={user.name ?? 'Profile'} referrerPolicy="no-referrer" />
          </div>
        ) : (
          <div className="bg-primary text-primary-content rounded-full w-10 flex items-center justify-center font-bold text-sm">
            {initials}
          </div>
        )}
      </label>

      {/* Dropdown */}
      <ul
        tabIndex={0}
        className="dropdown-content menu shadow-2xl bg-base-100 rounded-2xl w-64 mt-2 z-50 p-2 gap-1 border border-base-300"
      >
        {/* User info */}
        <li className="px-3 py-2 pointer-events-none">
          <div className="flex flex-col gap-0">
            <span className="font-semibold text-base leading-tight">
              {user.name ?? 'Pengguna'}
            </span>
            <span className="text-xs text-base-content/50 leading-tight">{user.email}</span>
          </div>
        </li>

        <li>
          <div className="divider my-0" />
        </li>

        {/* Theme toggle */}
        <li>
          <button
            id="theme-toggle-btn"
            className="flex items-center gap-3 rounded-xl"
            onClick={toggleTheme}
          >
            {theme === 'light' ? (
              <>
                <MoonIcon className="w-5 h-5 text-base-content/60" />
                <span>Mode Gelap</span>
              </>
            ) : (
              <>
                <SunIcon className="w-5 h-5 text-base-content/60" />
                <span>Mode Terang</span>
              </>
            )}
            {/* Toggle pill */}
            <span className="ml-auto">
              <span
                className={`toggle toggle-sm ${theme === 'dark' ? 'toggle-primary' : ''}`}
              />
            </span>
          </button>
        </li>

        <li>
          <div className="divider my-0" />
        </li>

        {/* Sign out */}
        <li>
          <button
            id="signout-btn"
            className="flex items-center gap-3 text-error rounded-xl hover:bg-error/10"
            onClick={() => signOut({ redirect: false })}
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Keluar
          </button>
        </li>
      </ul>
    </div>
  );
}
