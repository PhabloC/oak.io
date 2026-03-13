import { FaTrophy } from "react-icons/fa";

export default function AchievementsSection({ achievements, compact }) {
  const unlocked = achievements.filter((item) => item.unlocked).length;

  return (
    <section className="rounded-2xl border border-indigo-400/25 bg-slate-900/45 p-5 backdrop-blur-xl">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold text-indigo-100">
          <FaTrophy className="text-amber-400" aria-hidden="true" />
          Conquistas
        </h2>
        <span className="rounded-full border border-indigo-400/20 bg-indigo-500/20 px-3 py-1 text-xs text-indigo-100">
          {unlocked}/{achievements.length}
        </span>
      </header>

      <ul
        className={`grid gap-2 ${
          compact ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
        }`}
        aria-label="Lista de conquistas"
      >
        {achievements.map((item) => (
          <li
            key={item.id}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
              item.unlocked
                ? "border-amber-400/35 bg-amber-500/15 text-amber-100"
                : "border-slate-700/70 bg-slate-900/70 text-slate-400"
            }`}
          >
            <span className="text-lg" aria-hidden="true">
              {item.emoji}
            </span>
            <span className="font-medium">{item.label}</span>
            {!item.unlocked && (
              <span className="ml-auto text-xs text-slate-500" aria-label="Bloqueada">
                Bloqueada
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

