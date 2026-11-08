import { useState } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff, Landmark, Loader2, Lock, Mail } from 'lucide-react'

import { getSession, login } from '@/lib/auth.functions'
import { DemoBadge } from '@/components/demo-badge'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    if (await getSession()) throw redirect({ to: '/' })
  },
  head: () => ({ meta: [{ title: 'Connexion · Mon Compte (démo)' }] }),
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password) {
      setError('Renseignez votre email et votre mot de passe.')
      return
    }
    setPending(true)
    try {
      const res = await login({ data: { email, password } })
      if (!res.ok) {
        setError('Email ou mot de passe incorrect.')
        setPassword('')
        return
      }
      await navigate({ to: '/' })
    } catch {
      setError('Connexion impossible pour le moment. Réessayez.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="min-h-dvh bg-slate-100">
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-slate-50 shadow-xl shadow-slate-300/40">
        <header className="relative overflow-hidden rounded-b-[2rem] bg-[#0b1d4a] px-6 pt-[max(env(safe-area-inset-top),2rem)] pb-14 text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-20 size-64 rounded-full bg-blue-500/25 blur-3xl"
          />
          <div className="relative flex justify-end">
            <DemoBadge />
          </div>
          <div className="relative mt-6 flex flex-col items-center text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <Landmark className="size-8" />
            </div>
            <img
              src="/lcl-logo.png"
              alt="LCL Banque et Assurance"
              width={250}
              height={202}
              className="mt-5 h-40 w-auto"
            />
            <h1 className="mt-5 text-2xl font-bold tracking-tight">
              Connexion
            </h1>
            <p className="mt-1 text-sm text-blue-200/80">
              Accédez à votre espace Mon Compte LCL
            </p>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="relative z-10 -mt-8 mx-6 space-y-5 rounded-3xl bg-white p-6 shadow-lg shadow-slate-200 ring-1 ring-slate-100"
        >
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Email
            </span>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                inputMode="email"
                placeholder="vous@exemple.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-12 text-base outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Mot de passe
            </span>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-12 pl-12 text-base outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword
                    ? 'Masquer le mot de passe'
                    : 'Afficher le mot de passe'
                }
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-2 text-slate-400 transition hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 active:scale-[0.98] focus-visible:ring-4 focus-visible:ring-blue-300 focus-visible:outline-none disabled:opacity-70"
          >
            {pending && <Loader2 className="size-5 animate-spin" />}
            Se connecter
          </button>
        </form>

        <p className="mt-6 flex items-center justify-center gap-1.5 px-6 text-xs text-slate-500">
          <Lock className="size-3.5" />
          Connexion sécurisée · LCL
        </p>
      </main>
    </div>
  )
}
