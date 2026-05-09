"use client";

type AdminLogoutButtonProps = {
  className?: string;
};

export function AdminLogoutButton({
  className = "admin-topbar-logout secondary-btn",
}: AdminLogoutButtonProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/admin/login";
      }}
    >
      Log out
    </button>
  );
}
