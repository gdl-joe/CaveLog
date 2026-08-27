# Installing CaveLog as an app on your phone

[Deutsch](pwa-installation.md) · **English**

CaveLog is a **Progressive Web App (PWA)** — it behaves like a real app but is installed straight from the browser. No app store, no download.

> **Important:** this guide uses `https://your-domain.com` as a placeholder throughout. There is **no public CaveLog address** — everyone runs their own installation on their own web space (see the [installation guide](installation-dummies.en.md)). So use the address where **your** installation lives.

After installing:
- Its own icon on your home screen
- Opens without the browser address bar, like a proper app
- Keeps working when the signal is poor (offline-capable)

---

## Android — with Chrome

Chrome comes preinstalled on most Android phones and has the best support for installing PWAs.

### How to do it

**1.** Open **Chrome** on your Android phone

**2.** Go to CaveLog:
```
https://your-domain.com
```

**3.** Sign in

**4.** After a moment a banner appears at the bottom:
> **"Add CaveLog to Home screen"**
>
> Tap **"Add"** → done!

---

**If the banner does not appear:**

**4b.** Tap the **three dots** ⋮ at the top right (menu)

**5.** Choose **"Install app"** or **"Add to Home screen"**

   *(the exact wording varies by Android version)*

**6.** Tap **"Install"** in the confirmation dialog

**7.** The CaveLog icon appears on your home screen ✓

---

### Tip for Samsung devices (Samsung Internet)

If you use Samsung Internet:
1. Menu at the bottom → **"Add page to"**
2. **"Home screen"**

---

## iPhone / iPad — with Safari

On Apple devices you must use **Safari** — other browsers (Chrome, Firefox) unfortunately cannot install PWAs on iOS.

### How to do it

**1.** Open **Safari** on your iPhone/iPad

**2.** Go to CaveLog:
```
https://your-domain.com
```

**3.** Sign in

**4.** Tap the **share icon** at the bottom centre

   *(the square with an arrow pointing up ↑)*

**5.** Scroll down the menu to **"Add to Home Screen"**

   *(you may have to scroll a fair way)*

**6.** Tap it → confirm with **"Add"**

**7.** The CaveLog icon appears on your home screen ✓

---

### Worth knowing on iPhone

- The app has to be opened through **Safari** (not Chrome or Firefox)
- On first launch the browser bar shows briefly, then it starts full screen
- iOS 16.4+ has improved PWA support — keep your iOS up to date

---

## Desktop (Windows / Mac)

CaveLog can be installed as an app on a computer too:

**Chrome / Edge:**
1. Open CaveLog in the browser
2. Click the **install icon** (⊕) at the right of the address bar
   *or: menu → "Install CaveLog"*
3. Confirm with "Install"
4. CaveLog opens in its own window, without the browser address bar

---

## Uninstalling the app

**Android:** press and hold the icon → "Uninstall" or "Remove"

**iPhone:** press and hold the icon → "Remove App" → "Remove from Home Screen"

> Note: uninstalling the app does not delete any data on the server.

---

## Offline behaviour

CaveLog stores parts of the app locally so it keeps working on a poor connection:

- The interface always starts, even with no signal
- Trips loaded recently remain readable
- New trips are held locally and uploaded once there is a connection again

---

*Tested with: Android 12+/Chrome 120+, iOS 16.4+/Safari, Windows 11/Chrome 120+*
