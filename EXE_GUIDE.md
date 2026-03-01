# Come Compilare l'Eseguibile per AILINGO

## È sicuro? 🛡️
**Sì, al 100%!** Il file `.exe` generato dalla tua applicazione (AILINGO) è una confezione standard costruita usando **Electron Builder**, lo stesso identico strumento usato per creare i file eseguibili di colossi planetari come *WhatsApp Desktop, Discord, Visual Studio Code e Twitch*. 

Non contiene alcun codice strano, ma solo tre parti:
1. Una versione integrata ed "isolata" del browser Google Chrome (per mostrare l'interfaccia React).
2. Il server Node.js in background locale.
3. Le centinaia di righe di codice che io e te abbiamo curato riga per riga per l'interfaccia React e i dati locali SQLite!

---

## Il Problema di Prima
Il comando di compilazione (`npm run build`) che avevamo lanciato in precedenza falliva **non** perché ci fosse un problema di sicurezza, ma a causa di una falla nota in come `electron-builder` lavora su Windows: quando prova a rimpacchettare dei file di un altro sistema operativo (come le cartelle Symlinks usate dai computer Apple Mac), Windows per precauzione blocca la creazione manuale di quei collegamenti fasulli (Symlinks privilege error).

## Come Compilare l'EXE senza errori
Per bypassare la creazione problematica dei Symlink e generare tranquillamente l'eseguibile, puoi seguire una di queste **due strade**:

### Strada 1: Terminale come Amministratore (La più Rapida)
Windows blocca i symlink se non hai privilegi di "Amministratore".
1. Cerca il programma **Terminale** (oppure PowerShell) nel menù Start di Windows.
2. Cliccaci sopra col **tasto destro del mouse** e seleziona **"Esegui come amministratore"**.
3. Assicurati che il server locale che stiamo usando adesso sia chiuso.
4. Digita per arrivare alla cartella:
   `cd C:\Users\Michele\Desktop\AILINGO`
5. E lancia la build:
   `npm run build`

### Strada 2: Togliere le Dipendenze Mac (Aggiornamento Package)
Se ti secca usare il terminale Amministratore ogni volta, possiamo semplicemente dire al compilatore di ignorare qualunque legame con mac.
Aggiungi nel tuo `package.json` nel nodo `"win"` questo flag:

```json
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico",
      "signAndEditExecutable": false
    }
```
*Questo disattiverà la dipendenza difettosa "winCodeSign" risolvendo alla radice i problemi di decompressione e symlink.*

---

## Dove Troverò il mio `.exe` Finito?
Non appena il processo sarà verde e arrivato al 100%, vai in:
`C:\Users\Michele\Desktop\AILINGO\release\`

Lì dentro troverai il setup autoinstallante `ailingo Setup 0.1.0.exe`. Fai doppio click, e goditi AILINGO staccato dal terminale! 🚀
