"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <div className="bg-[#5E3FA6]">
      <div className="container max-w-screen-md mx-auto py-4 flex flex-col justify-center items-center">
        <div className="flex gap-1 text-white/90 font-semibold text-sm">
          <Link href="/">
            <span>Buscar</span>
          </Link>
          <span>-</span>
          <Link href="/">
            <span>Sobre</span>
          </Link>
          <span>-</span>
          <Link href="/">
            <span>Contacto</span>
          </Link>
        </div>
        <div className="mt-2">
          <span className="text-white/90 text-sm">
            © 2025 - Empleosafari.com
          </span>
        </div>
      </div>
    </div>
  );
}
