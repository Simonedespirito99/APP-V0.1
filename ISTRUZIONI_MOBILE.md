
# 📱 Guida alla Creazione dell'Installer Nativo (SMIRT)

Questa guida spiega come trasformare il codice sorgente in un'app installabile (.APK per Android o App Nativa per iOS) utilizzando **Capacitor**.

## 🚀 Requisiti Preliminari
1. Installa [Node.js](https://nodejs.org/) sul tuo PC.
2. Scarica questa intera cartella in locale.
3. Apri il terminale nella cartella e installa le dipendenze:
   ```bash
   npm install
   ```

---

## 🤖 Per Android (Generazione APK)
Questa procedura genera un file che puoi inviare ai tecnici per l'installazione immediata.

1. **Installa Android Studio** sul tuo PC.
2. **Inizializza Android** nel progetto:
   ```bash
   npx cap add android
   ```
3. **Sincronizza il codice**:
   ```bash
   npx cap copy android
   ```
4. **Apri il progetto in Android Studio**:
   ```bash
   npx cap open android
   ```
5. **Genera l'APK**:
   - In Android Studio, attendi il caricamento (Gradle Sync).
   - Vai nel menu: `Build` -> `Build Bundle(s) / APK(s)` -> `Build APK(s)`.
   - Una volta terminato, clicca su "Locate" nella notifica in basso a destra.
6. **Distribuzione**: Prendi il file `app-debug.apk` e invialo ai tecnici via WhatsApp/Email.

---

## 🍎 Per iOS (iPhone/iPad)
*Nota: Richiede un computer Mac con Xcode.*

1. **Inizializza iOS**:
   ```bash
   npx cap add ios
   ```
2. **Sincronizza il codice**:
   ```bash
   npx cap copy ios
   ```
3. **Apri Xcode**:
   ```bash
   npx cap open ios
   ```
4. **Installa**:
   - Collega l'iPhone al Mac.
   - In Xcode, seleziona il tuo iPhone come target.
   - Clicca sul tasto **Play (Run)** per installare l'app sul dispositivo.

---

## 🛠️ Note Tecniche
- **ID Pacchetto**: `com.smirt.app` (configurato in `capacitor.config.json`).
- **Icone**: Per cambiare le icone dell'app, sostituisci le immagini nella cartella `resources` e usa `npx capacitor-assets generate`.
- **Aggiornamenti**: Ogni volta che modifichi il codice HTML/JS, esegui `npx cap copy` per aggiornare l'app nativa.
