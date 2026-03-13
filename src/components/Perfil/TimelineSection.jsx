import { FaHistory } from "react-icons/fa";

export default function TimelineSection({ events, formatDate, detailed }) {
  return (
    <section className="rounded-2xl border border-indigo-400/25 bg-slate-900/45 p-5 backdrop-blur-xl">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-indigo-100">
        <FaHistory className="text-cyan-300" aria-hidden="true" />
        Linha do tempo financeira
      </h2>

      {events.length === 0 ? (
        <p className="rounded-lg border border-slate-700/80 bg-slate-900/65 p-4 text-center text-sm text-slate-400">
          Nenhum marco registrado ainda. Comece a usar o app para preencher sua jornada.
        </p>
      ) : (
        <ol className="relative space-y-5 border-l border-indigo-400/25 pl-5" aria-label="Linha do tempo do perfil">
          {events.map((event) => (
            <li key={event.id} className="relative">
              <span className="absolute -left-[30px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs">
                {event.icon}
              </span>
              <p className="text-sm font-medium text-indigo-100">{event.label}</p>
              {detailed && event.extra && <p className="text-sm text-slate-300">{event.extra}</p>}
              <p className="mt-1 text-xs text-cyan-200/80">{formatDate(event.date)}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

