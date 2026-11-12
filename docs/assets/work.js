// Renders the Work section from the Markdown project index, with nested (folder-style) projects.
// The URL hash keeps the location, e.g. #work/robot-arm/cycloidal-drive, so links can be shared.
(function () {
  const P = window.Portfolio;
  const { el, kids, isFolder } = P;
  const grid = document.getElementById('work-grid');
  const crumbs = document.getElementById('work-crumbs');
  const intro = document.getElementById('work-intro');
  const section = document.getElementById('work');
  const filterButtons = document.querySelectorAll('.filters button');

  let root = [];
  let filter = 'all';
  let path = []; // project objects from the top level down to the open folder

  // A project matches the filter if it, or anything nested inside it, is in that category.
  function matches(node) {
    return filter === 'all' || node.category === filter || kids(node).some(matches);
  }

  function countLeaves(node) {
    const c = kids(node);
    return c.length ? c.reduce((s, k) => s + countLeaves(k), 0) : 1;
  }

  const hashFor = nodes => '#work' + nodes.map(n => '/' + n.id).join('');
  const openFolder = node => '#work/' + node.path;

  function render() {
    const current = path[path.length - 1];
    const items = current ? kids(current) : root;

    // Breadcrumbs: All work / Robot arm / Cycloidal drive
    crumbs.replaceChildren();
    crumbs.hidden = path.length === 0;
    const steps = [{ title: 'All work', nodes: [] }].concat(
      path.map((n, i) => ({ title: n.title, nodes: path.slice(0, i + 1) })));
    steps.forEach((t, i) => {
      if (i) crumbs.appendChild(el('span', 'sep', '/'));
      if (i === steps.length - 1) {
        crumbs.appendChild(el('span', 'here', t.title)).setAttribute('aria-current', 'page');
      } else {
        const a = el('a', null, t.title);
        a.href = hashFor(t.nodes);
        crumbs.appendChild(a);
      }
    });

    // Folder intro: the open project's summary, plus links to its write-up / external link
    intro.replaceChildren();
    intro.hidden = !current;
    if (current) {
      intro.appendChild(el('h3', null, current.title));
      if (current.summary) intro.appendChild(el('p', null, current.summary));
      const facts = [P.LABELS[current.category] || current.category, current.year,
        countLeaves(current) + ' items inside'].filter(Boolean);
      intro.appendChild(el('p', 'tag', facts.join(' · ')));
      if (current.hasBody) {
        const a = el('a', 'btn ghost small', 'Read the write-up');
        a.href = P.pageHref(current);
        intro.appendChild(a);
      }
      if (current.link) {
        const a = el('a', 'btn ghost small', 'Visit link ↗');
        a.href = current.link;
        a.target = '_blank';
        a.rel = 'noopener';
        intro.appendChild(a);
      }
    }

    grid.replaceChildren();
    const shown = items.filter(matches);
    shown.forEach(n => grid.appendChild(P.card(n, openFolder)));
    if (!shown.length) {
      grid.appendChild(el('p', 'empty', items.length
        ? 'Nothing in this category here. Try "All".'
        : 'No projects yet. Add Markdown files to docs/content/projects.'));
    }
  }

  // Turn "#work/robot-arm/gripper" into the list of matching folder projects.
  function readHash() {
    const parts = location.hash.replace(/^#/, '').split('/');
    if (parts[0] !== 'work') return null;
    const found = [];
    let level = root;
    for (const id of parts.slice(1).filter(Boolean)) {
      const next = level.find(n => n.id === id && isFolder(n));
      if (!next) break; // unknown id: stop at the deepest valid folder
      found.push(next);
      level = kids(next);
    }
    return found;
  }

  function onHash(scroll) {
    const found = readHash();
    if (found === null) return; // hash points elsewhere (#about etc.)
    path = found;
    render();
    if (scroll && path.length) {
      const top = section.getBoundingClientRect().top;
      if (top < 0 || top > innerHeight * 0.5) section.scrollIntoView({ behavior: 'smooth' });
    }
  }

  filterButtons.forEach(btn => btn.addEventListener('click', () => {
    filterButtons.forEach(b => {
      b.classList.toggle('active', b === btn);
      b.setAttribute('aria-pressed', b === btn);
    });
    filter = btn.dataset.filter;
    render();
  }));

  grid.appendChild(el('p', 'empty', 'Loading projects…'));
  P.load().then(projects => {
    root = projects;
    window.addEventListener('hashchange', () => onHash(true));
    onHash(false);
    render();
    if (path.length) section.scrollIntoView();
  }).catch(err => {
    grid.replaceChildren(el('p', 'error',
      'Couldn\'t load the project list (' + err.message + '). ' +
      'If you opened this file directly, use the preview server instead: scripts/serve.ps1.'));
  });
})();
