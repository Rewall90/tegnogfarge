"use client";

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { authStatusTranslations } from '@/i18n/translations/authStatus';
import type { Locale } from '@/i18n';

export default function AuthStatus() {
  const sessionData = useSession();
  const session = sessionData?.data;
  const params = useParams();
  const locale = (params?.locale as string || 'no') as Locale;
  const t = authStatusTranslations[locale] || authStatusTranslations.no;

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  if (session && session.user) {
    return (
      <>
        <span className="text-[#264653] text-lg">{t.greeting}, {session.user.name}</span>
        <button
          onClick={handleSignOut}
          className="text-[#264653] hover:text-[#1E3A40] text-lg"
        >
          {t.logout}
        </button>
      </>
    );
  }

  return (
    <Link href="/login" className="bg-[#EB7060] text-black px-5 py-2.5 rounded hover:bg-[#EB7060]/90 text-lg">
      {t.loginRegister}
    </Link>
  );
} 