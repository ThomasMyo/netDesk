// Renders the Work section from window.PROJECTS, with nested (folder-style) projects.
// URL hash keeps the location, e.g. #work/robot-arm/cycloidal-drive, so links can be shared.
(function () {
  const root = window.PROJECTS || [];
  const grid = document.getElementById('work-grid');
  const crumbs = document.getElementById('work-crumbs');
  const intro = document.getElementById('work-intro');
  const section = document.getElementById('work');
  const filterButtons = document.querySelectorAll('.filters button');
  const LABELS = { design: 'Design', personal: 'Personal', code: 'Code' };

  let filter = 'all';
  let path = []; // list of project objects from the top level down to the open folder

  const kids = n => Array.isArray(n.children) ? n.children : [];

  // A project matches the filter if it, or anything nested inside it, is in that category.
  function matches(node) {
    return filter === 'all' || node.cat === filter || kids(node).some(matches);
  }

  function countLeaves(node) {
    const c = kids(node);
    return c.length ? c.reduce((s, k) => s + countLeaves(k), 0) : 1;
  }

  function hashFor(nodes) {
    return '#work' + nodes.map(n => '/' + n.id).join('');
  }

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function card(node) {
    const isGroup = kids(node).length > 0;
    const article = el('article', 'card' + (isGroup ? ' group' : ''));
    const href = isGroup ? hashFor(path.concat(node)) : node.link;
    const a = el(href ? 'a' : 'div', 'card-link');
    if (href) a.href = href;

    const thumb = el('div', 'thumb');
    if (node.image) {
      const img = el('img');
      img.src = node.image;
      img.alt = node.title;
      img.loading = 'lazy';
      thumb.appendChild(img);
    } else {
      thumb.appendChild(el('span', null, node.cat === 'code' ? '</>' : 'IMG'));
    }
    if (isGroup) {
      const n = kids(node).length;
      thumb.appendChild(el('span', 'badge', n + (n === 1 ? ' sub-project' : ' sub-projects')));
    }

    const body = el('div', 'card-body');
    const meta = el('p', 'tag', (LABELS[node.cat] || node.cat) + (node.year ? ' · ' + node.year : ''));
    body.append(meta, el('h3', null, node.title), el('p', null, node.summary || ''));
    if (isGroup) body.appendChild(el('p', 'open-hint', 'Open folder →'));
    else if (!href) article.classList.add('no-link');

    a.append(thumb, body);
    article.appendChild(a);
    return article;
  }

  function render() {
    const current = path[path.length - 1];
    const items = current ? kids(current) : root;

    // Breadcrumbs: Work / Robot arm / Cycloidal drive
    crumbs.replaceChildren();
    crumbs.hidden = path.length === 0;
    const trail = [{ title: 'All work', nodes: [] }].concat(
      path.map((n, i) => ({ title: n.title, nodes: path.slice(0, i + 1) })));
    trail.forEach((t, i) => {
      if (i) crumbs.appendChild(el('span', 'sep', '/'));
      if (i === trail.length - 1) {
        crumbs.appendChild(el('span', 'here', t.title)).setAttribute('aria-current', 'page');
      } else {
        const a = el('a', null, t.title);
        a.href = hashFor(t.nodes);
        crumbs.appendChild(a);
      }
    });

    // Folder intro: summary of the open project plus its write-up link
    intro.replaceChildren();
    intro.hidden = !current;
    if (current) {
      intro.appendChild(el('h3', null, current.title));
      if (current.summary) intro.appendChild(el('p', null, current.summary));
      const facts = [LABELS[current.cat], current.year, countLeaves(current) + ' items inside'].filter(Boolean);
      intro.appendChild(el('p', 'tag', facts.join(' · ')));
      if (current.link) {
        const a = el('a', 'btn ghost small', 'Read the write-up');
        a.href = current.link;
        intro.appendChild(a);
      }
    }

    grid.replaceChildren();
    const shown = items.filter(matches);
    shown.forEach(n => grid.appendChild(card(n)));
    if (!shown.length) {
      grid.appendChild(el('p', 'empty', 'Nothing in this category here. Try "All".'));
    }
  }

  // Turn "#work/robot-arm/gripper" into the list of matching project objects.
  function readHash() {
    const parts = location.hash.replace(/^#/, '').split('/');
    if (parts[0] !== 'work') return null;
    const found = [];
    let level = root;
    for (const id of parts.slice(1).filter(Boolean)) {
      const next = level.find(n => n.id === id && kids(n).length);
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

  window.addEventListener('hashchange', () => onHash(true));
  onHash(false);
  render();
  // Deep link on first load: wait for fonts/layout so the scroll lands on the Work section.
  if (path.length) window.addEventListener('load', () => section.scrollIntoView());
})();
