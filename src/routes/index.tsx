import { useMemo, useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  Lightbulb,
  LogOut,
  Plane,
  Send,
  ShoppingBag,
  Utensils,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  BANK_IDENTIFIERS,
  validateBankIdentifier,
} from "@/lib/bank-identifiers";
import { getSession, logout } from "@/lib/auth.functions";
import { INITIAL_BALANCE, INITIAL_TRANSACTIONS } from "@/data/transactions";
import type { Transaction, TransactionCategory } from "@/data/transactions";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    if (!(await getSession())) throw redirect({ to: "/login" });
  },
  component: Home,
});

const numberFormat = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatEur(value: number) {
  return `${numberFormat.format(value)} €`;
}

const dayFormat = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

const timeFormat = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

const CATEGORY_ICONS: Record<TransactionCategory, LucideIcon> = {
  salary: Wallet,
  transfer: Send,
  shopping: ShoppingBag,
  food: Utensils,
  travel: Plane,
  bill: Lightbulb,
};

function Home() {
  const balance = INITIAL_BALANCE;
  const transactions = INITIAL_TRANSACTIONS;
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    await navigate({ to: "/login" });
  }

  const groups = useMemo(() => {
    const sorted = [...transactions].sort((a, b) =>
      b.date.localeCompare(a.date),
    );
    const map = new Map<string, Transaction[]>();
    for (const tx of sorted) {
      const key = dayFormat.format(new Date(tx.date));
      map.set(key, [...(map.get(key) ?? []), tx]);
    }
    return [...map.entries()];
  }, [transactions]);

  return (
    <div className="min-h-dvh bg-slate-100">
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-slate-50 shadow-xl shadow-slate-300/40 sm:my-0">
        {/* Bandeau compte */}
        <header className="relative overflow-hidden rounded-b-[2rem] bg-[#0b1d4a] px-6 pt-[max(env(safe-area-inset-top),1.5rem)] pb-16 text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-20 size-64 rounded-full bg-blue-500/25 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-16 size-56 rounded-full bg-indigo-400/20 blur-3xl"
          />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-white/15 text-sm font-semibold ring-1 ring-white/20">
                JD
              </div>
              <div>
                <p className="text-xs text-blue-200/80">Bonjour,</p>
                <p className="text-sm font-medium">Jean Dupont</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Se déconnecter"
                className="flex size-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              >
                <LogOut className="size-5" />
              </button>
            </div>
          </div>

          <div className="relative mt-8">
            <h1 className="text-sm font-medium tracking-wide text-blue-200 uppercase">
              Mon Compte
            </h1>
            <div className="mt-2 flex items-end gap-3">
              <p
                className="text-[2.6rem] leading-none font-bold tracking-tight tabular-nums sm:text-5xl"
                aria-live="polite"
              >
                {hidden ? "••• ••• •••" : formatEur(balance)}
              </p>
              <button
                type="button"
                onClick={() => setHidden((v) => !v)}
                aria-label={hidden ? "Afficher le solde" : "Masquer le solde"}
                className="mb-1 rounded-full p-1.5 text-blue-200 transition hover:bg-white/10 hover:text-white"
              >
                {hidden ? (
                  <Eye className="size-5" />
                ) : (
                  <EyeOff className="size-5" />
                )}
              </button>
            </div>
            <p className="mt-3 text-xs text-blue-200/70">
              Solde disponible · Compte courant •••• 4821
            </p>
          </div>
        </header>

        {/* Action principale */}
        <div className="relative z-10 -mt-8 flex justify-center px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 px-6 py-5 text-lg font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 active:scale-[0.98] focus-visible:ring-4 focus-visible:ring-blue-300 focus-visible:outline-none"
          >
            <ArrowUpRight className="size-6" />
            Effectuer un virement
          </button>
        </div>

        {/* Historique */}
        <section className="flex-1 px-6 pt-8 pb-[max(env(safe-area-inset-bottom),2rem)]">
          <h2 className="text-lg font-semibold text-slate-900">
            Historique des opérations
          </h2>

          <div className="mt-4 space-y-6">
            {groups.map(([day, items]) => (
              <div key={day}>
                <p className="mb-2 text-xs font-medium tracking-wide text-slate-400 uppercase first-letter:uppercase">
                  {day}
                </p>
                <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                  {items.map((tx) => (
                    <TransactionRow key={tx.id} tx={tx} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>

      <TransferSheet open={open} onOpenChange={setOpen} balance={balance} />
    </div>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const Icon = CATEGORY_ICONS[tx.category];
  const received = tx.kind === "received";
  return (
    <li className="flex items-center gap-3 px-4 py-3.5">
      <div
        className={cn(
          "relative flex size-11 shrink-0 items-center justify-center rounded-full",
          received
            ? "bg-emerald-50 text-emerald-600"
            : "bg-slate-100 text-slate-700",
        )}
      >
        <Icon className="size-5" />
        <span
          className={cn(
            "absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full ring-2 ring-white",
            received ? "bg-emerald-500 text-white" : "bg-slate-900 text-white",
          )}
        >
          {received ? (
            <ArrowDownLeft className="size-2.5" strokeWidth={3} />
          ) : (
            <ArrowUpRight className="size-2.5" strokeWidth={3} />
          )}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">
          {tx.name}
        </p>
        <p className="truncate text-xs text-slate-500">
          {tx.label} · {timeFormat.format(new Date(tx.date))}
        </p>
      </div>
      <p
        className={cn(
          "shrink-0 text-sm font-semibold tabular-nums",
          received ? "text-emerald-600" : "text-slate-900",
        )}
      >
        {received ? "+" : "−"}
        {formatEur(tx.amount)}
      </p>
    </li>
  );
}

function TransferSheet({
  open,
  onOpenChange,
  balance,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: number;
}) {
  const [identifierType, setIdentifierType] = useState<"IBAN" | "BIC" | "RIB">(
    "IBAN",
  );
  const [identifier, setIdentifier] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [accountBlocked, setAccountBlocked] = useState(false);

  function reset() {
    setIdentifierType("IBAN");
    setIdentifier("");
    setAmount("");
    setNote("");
    setError(null);
    setAccountBlocked(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAccountBlocked(false);
    const value = Number(amount.replace(/\s/g, "").replace(",", "."));
    const identifierError = validateBankIdentifier(identifierType, identifier);
    if (identifierError) return setError(identifierError);
    if (!Number.isFinite(value) || value <= 0)
      return setError("Saisissez un montant valide.");
    if (value > balance) return setError("Solde insuffisant.");
    setError(null);
    setAccountBlocked(true);
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[90dvh] max-w-md gap-0 overflow-y-auto rounded-t-3xl border-0 pb-[max(env(safe-area-inset-bottom),1.5rem)]"
      >
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-slate-200" />
        <SheetHeader className="px-6 pt-4">
          <SheetTitle className="text-xl">Effectuer un virement</SheetTitle>
          <SheetDescription>Disponible : {formatEur(balance)}</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 pt-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Type de coordonnées bancaires
            </span>
            <select
              value={identifierType}
              onChange={(e) => {
                setIdentifierType(e.target.value as "IBAN" | "BIC" | "RIB");
                setIdentifier("");
                setError(null);
                setAccountBlocked(false);
              }}
              className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-base text-foreground outline-none focus-visible:ring-4 focus-visible:ring-ring/30"
            >
              <option value="IBAN">IBAN</option>
              <option value="BIC">BIC</option>
              <option value="RIB">RIB</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              {identifierType}
            </span>
            <input
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setError(null);
                setAccountBlocked(false);
              }}
              placeholder={BANK_IDENTIFIERS[identifierType].example}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-describedby={
                error
                  ? "bank-identifier-hint bank-transfer-error"
                  : "bank-identifier-hint"
              }
              aria-invalid={
                !!error && !!validateBankIdentifier(identifierType, identifier)
              }
              className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-base text-foreground outline-none focus-visible:ring-4 focus-visible:ring-ring/30"
            />
          </label>
          <p
            id="bank-identifier-hint"
            className="text-xs text-muted-foreground"
          >
            {BANK_IDENTIFIERS[identifierType].hint}
          </p>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Montant
            </span>
            <div className="relative">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-10 pl-4 text-2xl font-semibold tabular-nums outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
              <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xl font-semibold text-slate-400">
                €
              </span>
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Motif <span className="text-slate-400">(facultatif)</span>
            </span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex : Loyer novembre"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </label>

          {accountBlocked && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-600"
            >
              Le compte n’est pas utilisable. Veuillez contacter le service
              client.
            </p>
          )}

          {error && (
            <p
              id="bank-transfer-error"
              role="alert"
              className="text-sm font-medium text-red-600"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 active:scale-[0.98]"
          >
            <Send className="size-5" />
            Valider
          </button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
