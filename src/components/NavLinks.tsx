"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/history", label: "Riwayat" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 text-sm">
      {LINKS.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg px-2.5 py-1.5 transition-all sm:px-3 ${
              active
                ? "bg-gradient-to-r from-blue-500/20 to-violet-500/20 text-white shadow-sm ring-1 ring-blue-400/30"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
