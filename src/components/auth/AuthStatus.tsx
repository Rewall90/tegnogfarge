"use client";

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function AuthStatus() {
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  if (session && session.user) {
    return (
      <>
        <span className="text-[#264653] text-lg">Hei, {session.user.name}</span>
        <button
          onClick={handleSignOut}
          className="text-[#264653] hover:text-[#1E3A40] text-lg"
        >
          Logg ut
        </button>
      </>
    );
  }

  return (
    <Link href="/login" className="bg-[#EB7060] text-black px-5 py-2.5 rounded hover:bg-[#EB7060]/90 text-lg">
      Logg inn/Registrer
    </Link>
  );
} 