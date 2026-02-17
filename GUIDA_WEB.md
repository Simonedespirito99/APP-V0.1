
# 🌐 Pubblicazione Web SMIRT (Vite Edition)

Grazie alla nuova configurazione con **Vite**, l'errore "No Output Directory" su Vercel è risolto.

## Come pubblicare su Vercel
1. Scarica i file sul tuo PC.
2. Se usi la Dashboard di Vercel:
   - Carica la cartella.
   - Vercel leggerà automaticamente il file `vercel.json`.
   - La "Build Command" sarà `npm run build`.
   - La "Output Directory" sarà `dist`.
3. Clicca su **Deploy**.

L'app sarà ora disponibile su un link HTTPS velocissimo e sicuro.

## Sviluppo Locale
Se vuoi testare l'app sul tuo PC prima di caricarla:
```bash
npm install
npm run dev
```
Apri `http://localhost:3000` nel browser.
