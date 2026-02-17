
# 📱 Creazione App Nativa con Vite

Ora che usiamo Vite, la procedura per Android è ancora più solida.

## 🤖 Per Android (APK)
1. Nel terminale della cartella:
   ```bash
   npm install
   npm run build
   npx cap add android
   npx cap copy android
   npx cap open android
   ```
2. In **Android Studio**:
   - Vai su `Build > Build APK(s)`.
   - Invia il file ai tecnici.

**Nota importante**: Ogni volta che modifichi il codice, devi lanciare `npm run build` e poi `npx cap copy android` per aggiornare l'app sul telefono.
