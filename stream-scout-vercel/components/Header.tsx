"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  return (
    <>
      <header className="siteHeader">
        <Link className="brand" href="/">
          <span className="logo">▶</span>
          <span><strong>Stream Scout</strong><small>Never miss a show</small></span>
        </Link>
        <nav className="desktopNav">
          <Link className={pathname === "/" ? "active" : ""} href="/">Discover</Link>
          <Link className={pathname === "/my-shows" ? "active" : ""} href="/my-shows">My Shows</Link>
        </nav>
      </header>
      <nav className="mobileNav">
        <Link className={pathname === "/" ? "active" : ""} href="/"><span>🔥</span>Discover</Link>
        <Link className={pathname === "/my-shows" ? "active" : ""} href="/my-shows"><span>⭐</span>My Shows</Link>
      </nav>
    </>
  );
}
