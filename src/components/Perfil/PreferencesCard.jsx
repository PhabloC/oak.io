import { FaSlidersH } from "react-icons/fa";

const Toggle = ({ id, checked, onChange, label, description }) => (
  <label
    htmlFor={id}
    className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-indigo-400/15 bg-slate-900/50 p-3"
  >
    <span>
      <span className="block text-sm font-medium text-slate-100">{label}</span>
      <span className="mt-1 block text-xs text-slate-400">{description}</span>
    </span>
    <span className="relative mt-1 inline-flex h-6 w-11 items-center rounded-full bg-slate-700">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span className="absolute inset-0 rounded-full bg-slate-600 transition peer-checked:bg-cyan-500" />
      <span className="relative ml-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
    </span>
  </label>
);

export default function PreferencesCard({ preferences, onPreferenceChange }) {
  return (
    <section className="rounded-2xl border border-indigo-400/25 bg-slate-900/45 p-5 backdrop-blur-xl">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-indigo-100">
        <FaSlidersH className="text-cyan-300" aria-hidden="true" />
        Preferências
      </h2>

      <div className="space-y-3">
        <Toggle
          id="detailed-timeline"
          checked={preferences.showDetailedTimeline}
          onChange={(value) => onPreferenceChange("showDetailedTimeline", value)}
          label="Timeline detalhada"
          description="Exibe detalhes extras de cada marco financeiro."
        />
      </div>
    </section>
  );
}

