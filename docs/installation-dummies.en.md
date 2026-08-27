# Installing CaveLog — step by step (no prior knowledge needed)

[Deutsch](installation-dummies.md) · **English**

> **First, because people often ask:** there is no ready-made CaveLog server and no address to sign in to. CaveLog is software that **you install on your own web space** — after that it runs under your own address. Wherever this guide says `your-domain.com`, put your own address.

This guide explains how to install CaveLog on your own web server — no terminal, no MySQL, no programming knowledge.

> **Note:** the app interface and the setup screens are in German. This guide walks you through them; where a button label matters, the German text is given along with its meaning.

**What you need:**
- Web space with PHP 8+ (for example all-inkl.com, Strato, IONOS, Hetzner)
- An FTP program (we recommend **FileZilla** — free)
- About 15 minutes

---

## 1. Download the package

1. Go to **https://github.com/gdl-joe/CaveLog**

2. Click the green **`<> Code`** button

3. In the dropdown choose **"Download ZIP"**

4. The archive downloads (roughly 2–3 MB)

5. Unpack it on your computer:
   - Windows: right-click → "Extract All"
   - Mac: double-click the zip file

6. You get a folder called **`CaveLog-main`**

---

## 2. Install FileZilla (if you do not have it)

1. Go to **https://filezilla-project.org**
2. Click "Download FileZilla Client"
3. Install the program

---

## 3. Connect to the server (FTP)

You need your FTP credentials — find them in your hosting provider's control panel.

**On all-inkl.com:**
- KAS → Webhosting → FTP-Zugänge (FTP accounts)

**Open FileZilla:**

1. In the quick-connect bar at the top, enter:
   - **Host:** `ftp.your-domain.com`
   - **Username:** your FTP user
   - **Password:** your FTP password
   - **Port:** `21`

2. Click **"Quickconnect"**

3. On the right-hand side (the server), navigate to the web root:
   - all-inkl.com: `html/`
   - Strato/IONOS: often the root directory itself

---

## 4. Upload the files

The principle is simple: upload the **contents** of `CaveLog-main/deploy/` to the server.

In FileZilla, open `CaveLog-main/deploy/` on the left (your computer). Select **everything inside it** (Ctrl+A / Cmd+A) and drag it into your target folder on the server (right).

```
CaveLog-main/deploy/        →    html/
─────────────────────────────────────────────────
.htaccess                   →    ✓ very important!
index.html                  →    ✓
assets/                     →    ✓
api/                        →    ✓
lib/                        →    ✓
config/                     →    ✓
database/                   →    ✓
setup/                      →    ✓
db/                         →    ✓
```

That is all — everything in **one** step from **one** folder.

> `.htaccess` starts with a dot, and some FTP programs hide such files. In FileZilla enable *Server → Force showing hidden files* if you cannot see it.

### Create the uploads folder

The `uploads/` folder for photos has to be created by hand:

1. On the server side, right-click → "Create directory" → `uploads`
2. Right-click the `uploads` folder → "File permissions" → `755`

---

## 5. Set up in the browser

Now the actual magic. Open your browser and go to:

```
https://your-domain.com/setup/init.php
```

You will see a form with a system check:

1. All check marks should be **green** ✓
2. Enter your **name**
3. Enter your **email address** — this is what you will sign in with
4. Choose a **strong password** (at least 10 characters)
5. Enter the password again
6. Click **"CaveLog einrichten →"** (set up CaveLog)

If all goes well, a green check mark appears ✅

> **After setup:** sign in and open **Verwaltung → System** (Administration → System). There, "Datenbank aktualisieren" (update database) creates the remaining fields, and "Alle entfernen" (remove all) deletes the setup files from the server — both at the press of a button, without FTP.
>
> Under **Verwaltung → Zugänge** (Administration → Accounts) you can then invite fellow cavers: you receive a link to pass on, and the invited person sets their own password. The default is a **viewer account** — they see everything and change nothing.

---

## 6. Delete the setup file (important!)

Go back to FileZilla. On the server, in `html/setup/`, right-click `init.php` and choose **"Delete"**.

> ⚠️ Do not skip this step — otherwise the file lets anyone create a new admin account.

---

## 7. Sign in

Open your domain:

```
https://your-domain.com
```

You will see the login screen. Enter the email and password you chose in step 5.

**Welcome to CaveLog!** ⛰️

---

## Common problems

### "Require all denied" or a blank page
→ The `.htaccess` file from `deploy/` is missing or was not uploaded. It starts with a dot and is hidden by some FTP programs — in FileZilla, enable *Server → Force showing hidden files*.

### "Connection refused" over FTP
→ Check the host address and port. On all-inkl.com it is sometimes `ftpXX.all-inkl.com` rather than your domain.

### `setup/init.php` shows red crosses
→ Your host has not enabled PDO SQLite. Look under the PHP settings in your control panel, or contact your host.

### The page loads but nothing happens
→ JavaScript is disabled, or the browser is too old. Please use a current version of Chrome or Firefox.

---

## Optional: enable the Mapy.cz map

Without an API key the map shows OpenStreetMap tiles. That works, but without the detailed outdoor topography.

For Mapy.cz:
1. Create a free account at **https://developer.mapy.com**
2. Create a key there (and restrict it to your domain straight away)
3. On the server, open `config/config.php` and enter the key:
   ```php
   'mapy_key' => 'your-key-here',
   ```
4. Done — the map uses it from the next page load onwards.

**It works without a key too:** the map then shows OpenStreetMap. That is perfectly usable, just with less terrain detail than the outdoor map.

---

*This guide was written for hosts with PHP 8+ and PDO SQLite enabled (the default with most providers).*
