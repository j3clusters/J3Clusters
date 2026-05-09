"use client";

import { useRouter } from "next/navigation";

type UserLogoutButtonProps = {
  className?: string;
};

export function UserLogoutButton({ className }: UserLogoutButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={className ?? "secondary-btn"}
      onClick={async () => {
        await fetch("/api/auth/user-logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      }}
    >
      Logout
    </button>
  );
}
