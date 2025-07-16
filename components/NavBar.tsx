'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn } from '@clerk/nextjs';

export default function NavBar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/create-call', label: 'Create calls' },
    { href: '/schedule', label: 'Schedule Calls' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/call-records', label: 'Call Records' },
    { href: '/create-number', label: 'Create Number' },
    { href: '/create-assistant', label: 'Create Assistant' },
  ];

  return (
    <nav className="flex gap-3">
      <SignedIn>
        {links.map(({ href, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1 rounded-md transition-colors ${
                isActive ? 'bg-black text-white' : 'text-gray-800 hover:text-blue-500'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </SignedIn>
    </nav>
  );
}
