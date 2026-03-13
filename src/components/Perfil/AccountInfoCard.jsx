import { MdCalendarToday, MdLogin, MdSync } from "react-icons/md";
import { IoExit } from "react-icons/io5";

export default function AccountInfoCard({
  memberSince,
  lastSignIn,
  lastSync,
  onLogout,
}) {
  return (
    <section className="rounded-2xl border border-indigo-400/25 bg-slate-900/45 p-5 backdrop-blur-xl">
      <h2 className="mb-4 text-base font-semibold text-indigo-100">Informações da conta</h2>

      <ul className="space-y-3" aria-label="Detalhes da conta">
        <li className="flex items-start gap-3 rounded-lg border border-indigo-400/15 bg-slate-900/50 p-3">
          <MdCalendarToday className="mt-0.5 text-lg text-indigo-300" aria-hidden="true" />
          <div>
            <p className="text-xs text-slate-400">Membro desde</p>
            <p className="text-sm text-slate-100">{memberSince}</p>
          </div>
        </li>
        <li className="flex items-start gap-3 rounded-lg border border-indigo-400/15 bg-slate-900/50 p-3">
          <MdLogin className="mt-0.5 text-lg text-indigo-300" aria-hidden="true" />
          <div>
            <p className="text-xs text-slate-400">Último acesso</p>
            <p className="text-sm text-slate-100">{lastSignIn}</p>
          </div>
        </li>
        <li className="flex items-start gap-3 rounded-lg border border-indigo-400/15 bg-slate-900/50 p-3">
          <MdSync className="mt-0.5 text-lg text-cyan-300" aria-hidden="true" />
          <div>
            <p className="text-xs text-slate-400">Última sincronização</p>
            <p className="text-sm text-slate-100">{lastSync}</p>
          </div>
        </li>
      </ul>

      <button
        onClick={onLogout}
        className="mt-5 inline-flex items-center gap-2 rounded-lg border border-red-400/35 bg-red-500/15 px-4 py-2 text-sm font-medium text-red-100 transition hover:bg-red-500/25"
      >
        <IoExit className="text-base" aria-hidden="true" />
        Sair da conta
      </button>
    </section>
  );
}

