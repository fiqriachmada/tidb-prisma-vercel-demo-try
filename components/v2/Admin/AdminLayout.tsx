import * as React from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import {
  HomeIcon,
  UsersIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { signOut } from 'next-auth/react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: HomeIcon },
  { label: 'Users', href: '/admin/users', icon: UsersIcon },
  { label: 'Books', href: '/admin/books', icon: BookOpenIcon },
  { label: 'Orders', href: '/admin/orders', icon: ClipboardDocumentListIcon },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title = 'Admin Dashboard' }: AdminLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const isActive = (href: string) =>
    href === '/admin' ? router.pathname === '/admin' : router.pathname.startsWith(href);

  return (
    <div className="min-h-screen flex bg-base-200">
      {/* ── Mobile overlay ──────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-30 flex flex-col
          bg-neutral text-neutral-content shadow-2xl
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-neutral-content/10">
          <div className="bg-primary rounded-xl p-2">
            <BookOpenIcon className="w-6 h-6 text-primary-content" />
          </div>
          <div>
            <p className="font-bold text-lg leading-tight">Bookstore</p>
            <p className="text-xs text-neutral-content/50 leading-tight">Admin Panel</p>
          </div>
          <button
            className="ml-auto lg:hidden btn btn-ghost btn-xs btn-circle"
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <NextLink
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-150
                  ${active
                    ? 'bg-primary text-primary-content shadow-md'
                    : 'text-neutral-content/70 hover:bg-neutral-content/10 hover:text-neutral-content'
                  }
                `}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {item.label}
                {active && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-primary-content/60" />
                )}
              </NextLink>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-neutral-content/10 flex flex-col gap-1">
          <NextLink
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-neutral-content/60 hover:text-neutral-content hover:bg-neutral-content/10 transition-colors"
          >
            <ShoppingBagIcon className="w-5 h-5" />
            Kembali ke Toko
          </NextLink>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-error/80 hover:text-error hover:bg-error/10 transition-colors w-full text-left"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            Keluar
          </button>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-base-100 border-b border-base-300 px-6 py-4 flex items-center gap-4 shadow-sm">
          <button
            className="btn btn-ghost btn-sm btn-circle lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-lg leading-tight">{title}</h1>
            <p className="text-xs text-base-content/50">Admin Dashboard</p>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
