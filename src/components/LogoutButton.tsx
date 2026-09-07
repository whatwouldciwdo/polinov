"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton({
  className,
}: {
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={
        className ||
        "neu-btn px-6 py-2.5 text-sm text-gray-300 hover:text-red-400"
      }
    >
      Logout
    </button>
  );
}
