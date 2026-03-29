"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { logout } from "@/app/login/actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        aria-label="Cerrar sesión"
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 cursor-pointer hover:bg-zinc-100 active:bg-zinc-200 transition"
      >
        <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
        <span className="hidden sm:inline">Salir</span>
      </button>
    </form>
  );
}
