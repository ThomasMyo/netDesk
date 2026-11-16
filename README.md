# netDesk

Portfolio of mechanical engineering work: design, personal projects and code.
Live at https://thomasmyo.github.io/netDesk/

## Layout

```
netDesk/
├── docs/                          ← THE WEBSITE (published to GitHub Pages)
│   ├── index.html                 ← home page: intro, Work grid, About, Contact
│   ├── project.html               ← one page that shows any project's write-up
│   ├── images/                    ← ★ YOUR PHOTOS (referenced as /images/name.jpg)
│   ├── content/
│   │   ├── projects/              ← ★ YOUR PROJECTS, one Markdown file each
│   │   │   ├── _template.md       ← copy this to start a project (lists every tag)
│   │   │   ├── gearbox-housing.md
│   │   │   └── robot-arm/         ← a folder = a project with sub-projects
│   │   │       ├── index.md       ← the folder project's own tags + write-up
│   │   │       ├── gripper.md
│   │   │       └── cycloidal-drive/
│   │   │           ├── index.md
│   │   │           └── rev-a.md
│   │   └── index.json             ← generated from projects/ (not committed)
│   └── assets/
│       ├── theme.css              ← colours, fonts, corner radius, grid background
│       ├── style.css              ← layout and components
│       ├── content.js             ← loads index.json, draws project cards
│       ├── work.js                ← Work grid: folders, breadcrumbs, filters
│       ├── project.js             ← renders a project's Markdown write-up
│       └── (cv.pdf goes here)
├── scripts/
│   ├── build-index.ps1            ← scans content/projects → content/index.json
│   └── serve.ps1                  ← local preview server (rebuilds the index live)
└── .github/workflows/pages.yml    ← builds the index and publishes docs/ on push to main
```

## Adding a project

1. Copy `docs/content/projects/_template.md` and rename it, e.g. `bike-frame.md`. The file name becomes the project's ID.
2. Fill in the tags between the two `---` lines:

   ```yaml
   ---
   title: Bike frame jig
   category: personal        # design | personal | code  (filter buttons)
   year: 2025
   summary: One or two lines for the card.
   image: /images/bike-frame.jpg   # optional, from docs/images/
   link: https://…           # optional external link
   role: Designer            # optional, shown on the write-up page
   tools: [Fusion 360, TIG]  # optional
   outcome: …                # optional
   order: 2                  # optional, lower = earlier
   draft: true               # optional, hides it
   ---
   ```

3. Write the write-up below the second `---` in normal Markdown. If you leave it empty, the card has no write-up page and links to `link:` instead, if you set one.

**Nested projects:** make a folder rather than a file. The folder's `index.md` holds that project's own tags and write-up, and every other `.md` file or sub-folder inside it becomes a sub-project. You can nest to any depth.

**Images:** put them in `docs/images/` and start the path with `/images/`, e.g. `image: /images/bike-frame.jpg` or `![Test rig](/images/rig.jpg)` in the write-up. A leading `/` means "from the site folder", so the same path works from any `.md` file at any depth. Paths without the leading `/` are still relative to the `.md` file. Use lowercase names with dashes: GitHub Pages treats `Photo.JPG` and `photo.jpg` as different files, even though Windows doesn't. For a name with spaces, wrap the write-up path in `< >`: `![Trip](</images/Road Trip.png>)`.

**Linking between projects:** link to the other `.md` file (`[gearbox](../gearbox-housing.md)`). On the site, that becomes a link to the project's page.

Files and folders whose names start with `_` are ignored.

## Previewing locally

```
powershell -ExecutionPolicy Bypass -File scripts/serve.ps1
```

Open http://localhost:8000 and keep the window open. After saving a `.md` file, refresh the browser. The index rebuilds automatically, so there's no build step to remember. Use `-Port 8080` if port 8000 is busy.

The site needs this server (or GitHub Pages). Opening `index.html` directly can't load the project files.

## Publishing

Pushing to `main` runs `.github/workflows/pages.yml`, which builds the index and publishes `docs/`.

**One-time setting:** Settings → Pages → Build and deployment → Source: **GitHub Actions**.

You can also edit `.md` files directly on github.com. Committing there triggers the same deploy.

## Look and feel

Edit `docs/assets/theme.css` to change colours (light and dark), fonts, roundness and the background grid.
