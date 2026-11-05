// Données fictives de démonstration : solde et historique des opérations.

export type TransactionKind = 'received' | 'sent'

export type TransactionCategory =
  | 'salary'
  | 'transfer'
  | 'shopping'
  | 'food'
  | 'travel'
  | 'bill'

export interface Transaction {
  id: string
  name: string
  label: string
  amount: number
  kind: TransactionKind
  category: TransactionCategory
  date: string
}

export const INITIAL_BALANCE = 250_000_000

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', name: 'Amina Diallo', label: 'Virement reçu', amount: 1_250_000, kind: 'received', category: 'transfer', date: '2026-11-05T09:42:00Z' },
  { id: 't2', name: 'Air France', label: 'Billet Paris – Dakar', amount: 1_840, kind: 'sent', category: 'travel', date: '2026-11-05T07:15:00Z' },
  { id: 't3', name: 'Global Holdings Ltd', label: 'Dividendes', amount: 4_500_000, kind: 'received', category: 'salary', date: '2026-11-04T16:03:00Z' },
  { id: 't4', name: 'Karim Benali', label: 'Remboursement dîner', amount: 120, kind: 'sent', category: 'transfer', date: '2026-11-04T21:30:00Z' },
  { id: 't5', name: 'Le Petit Bistrot', label: 'Restaurant', amount: 86.5, kind: 'sent', category: 'food', date: '2026-11-03T20:12:00Z' },
  { id: 't6', name: 'Sophie Martin', label: 'Virement reçu', amount: 35_000, kind: 'received', category: 'transfer', date: '2026-11-02T11:48:00Z' },
  { id: 't7', name: 'Apple Store', label: 'Achat en ligne', amount: 2_399, kind: 'sent', category: 'shopping', date: '2026-11-01T14:20:00Z' },
  { id: 't8', name: 'EDF Énergie', label: 'Facture électricité', amount: 312.4, kind: 'sent', category: 'bill', date: '2026-10-31T08:00:00Z' },
]

export const FREQUENT_CONTACTS = [
  'Amina Diallo',
  'Karim Benali',
  'Sophie Martin',
  'Lucas Moreau',
]
