---
# ─────────────────────────────────────────────────────────────────────
# PROJECT TEMPLATE: copy this file, rename it, and fill in the tags.
# Files starting with "_" are ignored, so this one never shows on the site.
#
# The file name becomes the project's ID (used in links), e.g.
#   gearbox-housing.md         →  id "gearbox-housing"
#   robot-arm/index.md         →  id "robot-arm"  (a folder project)
#
# NESTING: to give a project sub-projects, make a folder instead of a file:
#   robot-arm/
#     index.md                 ← the folder's own tags + write-up
#     gripper.md               ← a sub-project
#     cycloidal-drive/         ← a sub-project that has its own sub-projects
#       index.md
#       rev-a.md
#
# IMAGES: put them in docs/images/ and start the path with /images/ — this works from
# any file at any depth. Lowercase names with dashes are safest (my-photo.jpg).
# A name with spaces works in the image: tag; in the write-up wrap it in < >:
#   ![Road trip](</images/Road Trip.png>)
#
# Only title and category are really needed; everything else is optional.
# ─────────────────────────────────────────────────────────────────────
title: Project title
category: design            # design | personal | code  (drives the filter buttons)
year: 2025
summary: One or two lines shown on the project card.

# id: custom-id             # override the ID taken from the file/folder name
# image: /images/cover.jpg  # card + header image, from docs/images/ (see IMAGES above)
# link: https://github.com/you/repo   # external link (repo, video, paper…)
# role: Design engineer
# tools: [SolidWorks, ANSYS, Python]
# outcome: 18% lighter, passed fatigue testing
# order: 1                  # lower numbers appear first (default: alphabetical by title)
# draft: true               # hide this project (and anything inside it) from the site
---

Everything below the second `---` is the write-up, in normal Markdown.
Leave it empty and the card simply won't link to a write-up page.

## Problem

## Approach

![Caption](/images/photo.jpg)

## Result
