/*
  PROJECTS — edit this file to change what appears in the Work section.

  Each project is an object:
    id        short unique name, used in the URL (letters, numbers, dashes)
    title     card heading
    cat       "design" | "personal" | "code"
    summary   one or two lines shown on the card
    image     (optional) path to an image, e.g. "assets/img/arm.jpg"
    year      (optional) shown on the card
    link      (optional) a write-up page or external URL
    children  (optional) a list of sub-projects, written the same way.
              Sub-projects can have their own children, nested as deep as you like.

  A project with children opens as a folder: clicking it shows its sub-projects.
  A project without children opens its `link`.
*/
window.PROJECTS = [
  {
    id: "gearbox-housing",
    title: "Gearbox housing redesign",
    cat: "design",
    year: 2025,
    summary: "Weight-reduced cast housing; FEA-validated, 18% lighter. SolidWorks, ANSYS.",
    link: "projects/example-project.html"
  },
  {
    id: "sheet-metal-enclosure",
    title: "Sheet-metal enclosure",
    cat: "design",
    year: 2024,
    summary: "DFM-driven enclosure for an electronics module, drawings to GD&T."
  },
  {
    id: "robot-arm",
    title: "3D-printed desk robot arm",
    cat: "personal",
    year: 2025,
    summary: "4-axis arm with printed cycloidal drives and stepper control.",
    link: "projects/example-project.html",
    children: [
      {
        id: "cycloidal-drive",
        title: "Cycloidal drive",
        cat: "design",
        summary: "Printed 1:20 cycloidal reducer; backlash testing across three iterations.",
        children: [
          { id: "rev-a", title: "Rev A", cat: "design", summary: "First print. PLA rollers wore out within an hour." },
          { id: "rev-b", title: "Rev B", cat: "design", summary: "Steel dowel pins as rollers; backlash down to 0.3°." }
        ]
      },
      {
        id: "gripper",
        title: "Compliant gripper",
        cat: "design",
        summary: "Single-piece TPU flexure gripper driven by a micro servo."
      },
      {
        id: "arm-firmware",
        title: "Motion firmware",
        cat: "code",
        summary: "Arduino firmware with trapezoidal motion profiles and serial G-code input."
      }
    ]
  },
  {
    id: "tolerance-calc",
    title: "Tolerance stack-up calculator",
    cat: "code",
    year: 2024,
    summary: "Python tool for worst-case and RSS stack-ups from a CSV of dimensions."
  }
];
