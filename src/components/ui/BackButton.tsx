"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

export function BackButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label="Volver"
      className="rounded-lg p-2.5 sm:p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 active:bg-zinc-200 transition shrink-0"
    >
      <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
    </Link>
  );
}
