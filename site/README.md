# Theta Tau, Zeta Epsilon — chapter website

The website for Theta Tau at Stony Brook University: **thetatausbu.com**.

Built in 2026 by Amaan Abubakar ([amaaxn](https://github.com/amaaxn)), the chapter's webmaster.

## 1. What this is

- The site is built with [Astro](https://astro.build), a tool that turns a folder of files into a fast website.
- You don't need to know how to code to update it. Almost everything on the site comes from a few **JSON files** in `src/data/`. Edit one, and the site updates.
- It's hosted for free on **GitHub Pages**. Every time a change is pushed to GitHub, the site rebuilds and goes live on its own.
- The old WordPress site is archived in the folder above this one, so nothing is lost:
  - `../original-site/` has its pages, text, images and screenshots.

## 2. Run it on your computer

You only need to do this if you want to preview changes before they go live.

**Step 1.** Install Node.js. Go to [nodejs.org](https://nodejs.org), download the **LTS** version, and install it like any other app.

**Step 2.** Open the Terminal app and go into the `site` folder inside the project folder (the one this README is in). (Tip: type `cd ` with a space, drag the `site` folder onto the Terminal window, and press Enter.)

**Step 3.** Install the site's tools. You only do this once.

```bash
npm install
```

**Step 4.** Start the preview.

```bash
npm run dev
```

**Step 5.** Open [http://localhost:4321](http://localhost:4321) in your browser. Leave the Terminal open. When you save a file, the page refreshes by itself. Press `Ctrl + C` in the Terminal to stop.

To check everything before you push:

```bash
npm run build
```

This checks the data files first, then builds the site. If something is broken (say, a missing photo or a typo in an id), it stops and tells you exactly what's wrong. It also prints warnings, like an active brother who has already graduated.

> **JSON tips.** Text goes in "double quotes". Every item in a list is followed by a comma, except the last one. Use `null` (no quotes) for "nothing here".

## 3. Update things

### Roster — `src/data/brothers.json`

One entry per brother, ever. Example:

```json
{
  "id": "jane-doe",
  "name": "Jane Doe",
  "pledgeClass": "Phi",
  "gradYear": 2029,
  "major": "Mechanical Engineering",
  "status": "active",
  "linkedin": "https://www.linkedin.com/in/jane-doe/",
  "photo": "jane-doe.jpg"
}
```

- **id** — the name in lowercase with hyphens (`jane-doe`). Must be unique. If two brothers share a name, add something (`jane-doe-2`).
- **name** — how the name shows on the site. Use the brother's real, professional name, the one on their LinkedIn (`Vincent`, not `Vinny`). No nicknames and no crossing names: the chapter decided to keep the roster professional. The rush chairs in `rush.json` are plain names too, so if you change a name here, change it there as well.
- **pledgeClass** — must exactly match a class name in the `CLASSES` list in `src/lib/data.ts` (for example `"Upsilon"` or `"Gamma Beta"`).
- **gradYear** — the year they graduate, as a number (no quotes).
- **major** — free text.
- **status** — `"active"`, `"inactive"` or `"alumni"`. This decides which page they appear on:
  - `"active"` — on the Actives page (and their class page).
  - `"inactive"` — still on the roster but not active this semester. They show on their class page only, with no label, and not on the Actives or Alumni page.
  - `"alumni"` — on the Alumni page (and their class page).
- **linkedin** — the full profile link, or `null`.
- **photo** — the photo's file name, or `null` to show their initials instead.

**Photos** go in `src/assets/brothers/`. Name the file like the id (`jane-doe.jpg`). Use a JPG, portrait shape (4:5, like 960×1200), at least 480px wide. The site crops and shrinks it for you. If the file name in `photo` doesn't exist, the build fails and tells you which one.

### E-board — `src/data/eboard.json`

- **term** — for example `"2025–2026"`.
- **roles** — a list of `{ "role": "Regent", "brother": "jane-doe" }`.
- Each **brother** must be an `id` from `brothers.json`. If it isn't, the build fails and names the role.
- A role can also have its own **photo**, for example `"photo": "bernadette-baroi-eboard.jpg"` (a file in `src/assets/brothers/`). The e-board row then shows that portrait, and the brother's normal headshot is used everywhere else. Use it to keep the e-board row as one matching set. Without it, the row uses the brother's headshot.

### Rush — `src/data/rush.json`

- **semester** — for example `"Spring 2027"`.
- **startDate** / **endDate** — `"YYYY-MM-DD"`, for example `"2027-01-25"`. Use `null` until the dates are set.
- **interestFormUrl** — link to the interest form, or `null`. With no form, the button links to the rush Instagram instead.
- **datesNote** — the line shown while dates are still unknown.
- **flyer** — the file name of this rush's flyer image, like `"spring-2027.png"`, or `null` to hide the flyer.
- **flyerSemester** — the semester that flyer is from, like `"Spring 2027"`. It becomes the caption under the flyer ("Rush flyer, Spring 2027."). Crop out anything you don't want online, like phone numbers, before adding a flyer.
- **chairs** — the rush chairs' names, like `["Jane Doe", "John Smith"]`. Leave it as `[]` to hide the line.
- **events** — the rush schedule. Each one has `name`, `date` (`YYYY-MM-DD`), `time`, `location`, and `type` (`"professional"`, `"social"` or `"service"`). `time` and `location` are optional. While this list is empty, the Rush page shows the last rush on record from `events.json` instead, so people know what to expect.
- **faq** — the questions from the rush flyer; edit the text in faq if the answers change (`q` and `a`).

**New flyer?** Drop the image (PNG or JPG) in `src/assets/rush/`, then set both **flyer** (its file name) and **flyerSemester** in `rush.json`.

**The countdown runs itself.** It checks the date in each visitor's browser, so it never goes stale:

- No dates yet → "Dates TBA" with your `datesNote`.
- Before `startDate` → a live countdown.
- Between the two dates → "Rush is on".
- After `endDate` → "Rush has ended", until you set up the next rush.

### Events — `src/data/events.json`

Same fields as rush events (`name`, `date`, `time`, `location`, `type`). **type** is `"professional"`, `"social"` or `"service"` (the build stops on anything else). `time` and `location` are optional: leave them out if you don't know them. Two more optional fields:

- **note** — a short extra line, like `"Capped at 30 people."`
- **rush** — the semester, like `"Spring 2027"`, if it was part of rush.

Upcoming vs. past is sorted automatically by date, in the visitor's browser, so it never goes stale.

### Careers — `src/data/careers.json`

One entry per role a brother reported:

- **name** — the brother.
- **company**, **position** — free text.
- **team**, **location** — free text, or `null` if unknown (a missing location shows as a dash).
- **type** — `"internship"` or `"full-time"`.
- **year** — a number, like `2026`.

The site groups roles by the exact **company** spelling, so use one spelling per company (for example `"L3Harris"`, not `"L3Harris Technologies"`). The company wall on the Careers page and the "companies" number on the home page are built from this list. You never edit them by hand, except for the big names at the top:

- **`src/data/companies.json`** — the `headline` list: 12 to 16 company names shown large at the top of the Companies section, in that order, each with its number of roles. Each name must match a **company** in `careers.json` exactly, or the build fails and names it.

### Site-wide — `src/data/site.json`

The chapter email, social links (Instagram, rush Instagram, Facebook, YouTube, Linktree, national site) and chapter facts (founding year, national member count, purpose, donations raised). Change them here and they change everywhere.

Also the **webmaster** (`name`, `since`): shown in the footer's "Webmaster" cell on every page. When someone else takes over the site, change it here.

### Where the content came from

The current content was pulled from the chapter's Google Drive in October 2026:

- **Roster, e-board, classes, majors and grad years** — the "Theta Tau - Start of Semester Fall 2026 Roster" and the "Brother Information" sheet.
- **Careers** — the "Alumni Database" sheet: internships from its Internships tab (year = the summer), current jobs from its Location/Major tabs (year = the year it was reported; last pulled October 2026). Rows in the sheet with no company are left out.
- **Events** — the Google Photos album titles, plus the Fall 2026 rush attendance forms.
- **Chapter photo (home page hero and share image)** — the April 2026 group photo on the lobby stairs, `src/assets/photos/chapter-2026.jpg`. Google Photos only has small 836×627 copies of it, so this is the best copy we had (1672×1254, border trimmed, nothing else done to it). AI upscaling was tried and looked worse. If someone has the original from the camera, drop it in as `chapter-2026.jpg` and run `npm run og`.
- **Headshots and LinkedIn for current brothers** — the headshot form's responses sheet ("Form Responses 1": full name, headshot upload, LinkedIn URL), first pulled November 2026 with ten responses. Only the name, photo and LinkedIn link are used; the email column is never copied. Each upload is cropped to 4:5 around the head and shoulders.
- **SAC lobby headshots** — seven portraits from one shoot in the SAC lobby (Chi class: Amaan Abubakar, Damaris Ferrer, Hua Huang, Raheel Rahman, Ryan Ver Eecke, Delia Steiner; Phi class: Sparsh Jain), supplied by the webmaster in November 2026. Five of the files were only 1086×724, so those crops are about 400 to 480 pixels wide; replace them if the full-size originals turn up.
- **LinkedIn profile photos** — seven brothers had not sent a headshot (Alex Mei, Aaron Chiang, Sumin Lee, David Grager, Vicki Li, Vivek Mahey, Nazar Nemy), so in November 2026 the webmaster had their LinkedIn profile photos saved from his own signed-in LinkedIn. LinkedIn pictures are tight squares, so these cards are closer on the face than the rest, David's and Vicki's most of all. Aaron's source is only 309 pixels and Vivek's is a dark, blurry photo, so those two are soft. Replace any of them when the brother sends a real headshot.
- **E-board headshots** — the 2026–27 e-board photoshoot (the beach portraits), supplied by the chapter in October 2026. The originals are 1333×2000; the site uses 960×1200 crops.

**Still need a headshot** (they show their initials until a photo is added; see Photos above):

- Psi: Maya Pulawska (also the only brother from Phi onward without a LinkedIn link)

## 4. Every semester checklist

**New pledge class crosses** → add each new brother to `brothers.json` with their class name. The class list is `CLASSES` in `src/lib/data.ts`, and it currently ends at Gamma Beta:

> … Sigma, Tau, Upsilon, Phi, Chi, Psi, Gamma Beta

The chapter picks each new class's name, so it isn't listed ahead of time: append the new name and its Greek letters to the end of `CLASSES` first (the last one was added as `['Gamma Beta', 'ΓΒ']`), then use that exact name as `pledgeClass`. The build stops if a `pledgeClass` isn't in the list.

The Fall 2026 new member class initiates around **October 29, 2026**. Once they cross, append their class name to `CLASSES` and add each of them to `brothers.json`.

**After elections** → update `eboard.json`.

**After graduation** → run:

```bash
npm run graduate
```

This moves every active or inactive brother whose grad year has passed to alumni, and prints each name it changed. To see who would change without saving anything:

```bash
npm run graduate -- --dry-run
```

A 5th-year or someone who left early? Just fix their `status` by hand afterwards.

**Before rush** → update `rush.json`: semester, dates, interest form link, chairs and events.

**If the chapter photo changes** (`src/assets/photos/chapter-2026.jpg`, used on the home page and in `scripts/og.html`) → regenerate the image that shows up when someone shares a link to the site. This needs Google Chrome installed.

```bash
npm run og
```

## 5. Put it online

Do this once. After that, every push to `main` updates the site.

1. **Make a GitHub organization** named `thetatausbu` at [github.com/organizations/plan](https://github.com/organizations/plan) (the free plan is fine). This way the site belongs to the chapter, not one person's account. Add the e-board as owners.
2. **Create a public repository** in that organization named exactly `thetatausbu.github.io`.
3. **Push the whole project folder** (the one that contains `site/` and `original-site/`) to it, on the branch `main`. GitHub shows the commands on the empty repo's page.
4. In the repo, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
5. That's it for building. The workflow in `.github/workflows/deploy.yml` builds and publishes the site on every push to `main`. Watch it run under the repo's **Actions** tab.
6. The site is live right away at **https://thetatausbu.github.io**, even before the domain is connected.

**Domain status, checked 2026-11-11: renewed.** `thetatausbu.com` is registered through the chapter's WordPress.com account, the one that signs in with the chapter Gmail. It is paid through **2027-09-08** with auto-renew on. WordPress.com charges the card on file on 2027-08-09, $19 a year. Right now the domain forwards to the old site at thetatausbu.design.blog, and it keeps doing that until the DNS records below are added. Check the current state any time by running `whois thetatausbu.com` and reading the `Domain Status` and `Registry Expiry Date` lines.

**Connect thetatausbu.com:**

1. In the repo: **Settings → Pages → Custom domain**, type `thetatausbu.com`, and save. (The file `public/CNAME` holds the same domain as a backup, but GitHub still needs it typed in here.)
2. The domain is registered at **WordPress.com**. Whoever has that login opens the domain's DNS settings and adds:

| Type  | Name  | Value                   |
|-------|-------|-------------------------|
| A     | @     | 185.199.108.153         |
| A     | @     | 185.199.109.153         |
| A     | @     | 185.199.110.153         |
| A     | @     | 185.199.111.153         |
| CNAME | www   | thetatausbu.github.io   |

3. Wait. DNS can take up to a day.
4. Back in **Settings → Pages**, tick **Enforce HTTPS** once GitHub allows it.

Auto-renew is on, so the domain renews itself every August as long as the card on file still works. Every summer, open **WordPress.com → Billing** and check that the card has not expired and belongs to someone still in the chapter. This matters: the domain expired on 2026-09-09, went offline on 2026-10-21, and was restored on 2026-11-11, about nine days before the restore window closed. Restoring a lapsed domain costs a redemption fee on top of the renewal (WordPress.com lists $80), and after the window anyone can register the name. A date a year ahead in `whois` right after the expiry day does not mean it was paid: the registry shows that placeholder for about six weeks.

## 6. Folder map

- `../original-site/` — in the folder above this one: the old site's archive.
- `src/data/` — the JSON files. This is where almost all updates happen.
- `src/assets/brothers/` — brother headshots. `src/assets/photos/` — chapter and pillar photos.
- `src/pages/` — one file per page (home, rush, brothers, careers, events, 404).
- `src/components/` — reusable pieces (header, footer, brother card, rush countdown).
- `src/assets/rush/` — rush flyers (the one shown is set by `flyer` in `rush.json`).
- `src/layouts/` — the shell every page sits in. `src/styles/` — colors, fonts, spacing.
- `src/fonts/` — the lettering font for titles, Open Gorton (with its license). The text font, Atkinson Hyperlegible Next, is installed by `npm install`; nothing to download.
- `public/` — files copied as-is: logo, icons, share image (`og.jpg`), `CNAME`.
- `scripts/` — helpers: `check-data.mjs` (runs before every build), `graduate.mjs`, `make-og.mjs` + `og.html` (the share image).
- `../.github/workflows/deploy.yml` — the automatic deploy.
