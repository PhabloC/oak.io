import { IoPersonCircle } from "react-icons/io5";

export default function ProfileHero({
  userName,
  userEmail,
  userPhoto,
  profileForm,
  onProfileFormChange,
  onSaveProfile,
  savingProfile,
  saveMessage,
  patrimonioTotal,
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-indigo-400/30 bg-gradient-to-br from-indigo-950/80 via-indigo-900/50 to-cyan-900/40 p-6 shadow-2xl shadow-indigo-950/40">
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-52 w-52 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <img
              src={userPhoto}
              alt="Foto de perfil"
              className="h-24 w-24 rounded-2xl border border-indigo-200/30 object-cover shadow-lg shadow-black/30"
            />
            <div className="absolute -bottom-2 -right-2 rounded-full bg-indigo-600 p-1.5">
              <IoPersonCircle className="text-xl text-white" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-indigo-50 sm:text-3xl">{userName}</h1>
            <p className="mt-1 text-sm text-indigo-200/90">{userEmail}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-100">
                Patrimônio: {patrimonioTotal}
              </span>
            </div>
          </div>
        </div>

        <form
          onSubmit={onSaveProfile}
          className="grid w-full gap-3 rounded-xl border border-indigo-300/20 bg-slate-950/35 p-4 lg:max-w-xl lg:grid-cols-[1fr_1fr_auto]"
          aria-label="Formulário de edição de perfil"
        >
          <label className="flex flex-col gap-1">
            <span className="text-xs text-indigo-200">Nome de exibição</span>
            <input
              type="text"
              value={profileForm.fullName}
              onChange={(event) => onProfileFormChange("fullName", event.target.value)}
              className="rounded-lg border border-indigo-300/20 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300/60"
              placeholder="Seu nome"
              maxLength={60}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-indigo-200">URL da foto</span>
            <input
              type="url"
              value={profileForm.avatarUrl}
              onChange={(event) => onProfileFormChange("avatarUrl", event.target.value)}
              className="rounded-lg border border-indigo-300/20 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300/60"
              placeholder="https://..."
            />
          </label>

          <button
            type="submit"
            disabled={savingProfile}
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 lg:self-end"
          >
            {savingProfile ? "Salvando..." : "Salvar"}
          </button>

          {saveMessage && (
            <p className="text-xs text-cyan-100 lg:col-span-3" role="status">
              {saveMessage}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
