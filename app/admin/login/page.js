import { login } from '../actions';

export const dynamic = 'force-dynamic';

export default function LoginPage({ searchParams }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <form action={login} className="bg-panel border border-line rounded-2xl p-8 w-full max-w-sm">
        <h1 className="font-display font-bold text-xl mb-1">Admin EarbudsTimeline</h1>
        <p className="text-dim text-sm mb-6">Connectez-vous pour gérer les marques et les écouteurs.</p>

        {searchParams?.error && (
          <p className="text-rose-400 text-sm mb-4">Mot de passe incorrect.</p>
        )}

        <label className="block text-xs text-dim mb-1.5" htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          name="password"
          required
          autoFocus
          className="w-full bg-panel2 border border-line rounded-lg px-3 py-2.5 text-sm mb-5 outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="w-full bg-accent text-ink font-semibold rounded-lg py-2.5 text-sm hover:opacity-90 transition-opacity"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
}
