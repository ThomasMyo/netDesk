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
title: Automatic Data recorder 
category: code            # design | personal | code  (drives the filter buttons)
year: 2026
summary: Interpreter and Front end configurator for DATAQ acquisition systems  

# id: custom-id             # override the ID taken from the file/folder name
image: /images/DataQ interface.png   # cover photo (card + page header)
# link: https://github.com/you/repo   # external link (repo, video, paper…)
# role: Design engineer
# tools: [SolidWorks, ANSYS, Python]
outcome: Time from testing to presentation was cut down by half
# order: 1                  # lower numbers appear first (default: alphabetical by title)
# draft: true               # hide this project (and anything inside it) from the site
---


## Problem
DATAQ data acquisition systems where the popular choice where I interned due to their low cost for a high bit resolution and sample rate. However their acquisition workflow is barebones, sensor settings are saved per device per user, but couldn't be accessed. As a result, many of the companies data processing workflow was manual. This causes slow data processing time that compromises the breadth of data sweep performed or available time to perform testing

## Approach
Utilizing the DATAQ's documentation. I created an interpreter library that simplified coding procedures for the DATAQ while an accompanying front end allows easy set up. 

With the Library for the DATAQ spun up, its capabilities were also expanded, being able to perform scheduled testing, dynamically adjust which sensor data is being polled. 

Further capabilities such as performing periodic calibration checks for all the sensors were planned and in the works. 

## Result
The set up allows for the user to use the DATAQ as a form of swiss army knife in data acquisition. DATAQ's can now be shared accross test stands and used independently of the test stands it was originally made for.


![DataQ interface, second view](</images/DataQ interface 2.png>)



