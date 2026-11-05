# Mon Compte

Application web mobile de fintech, épurée et responsive : un bandeau bleu foncé « Mon Compte » avec le solde (fictif) en grand, un bouton central « Effectuer un transfert » et l'« Historique des opérations » (montants reçus en vert, envoyés en noir).

Le bouton de transfert ouvre un panneau avec contacts fréquents, destinataire, montant et motif ; un transfert validé débite le solde et apparaît immédiatement dans l'historique. Le solde peut être masqué d'un geste.

## Technologies

- TanStack Start (React 19, TypeScript)
- Tailwind CSS 4
- Radix UI (panneau de transfert), lucide-react (icônes), sonner (notifications)
- Déploiement sur Netlify

## Lancer en local

```bash
pnpm install
netlify dev   # ou : pnpm dev
```

## Données

Les données de démonstration (solde, transactions, contacts) se trouvent dans `src/data/transactions.ts`. Elles ne sont pas persistées : un rechargement de la page réinitialise la démo.
