// Renders one project's write-up page from its Markdown file.
(async function () {
  const P = window.Portfolio;
  const { el, kids } = P;
  const main = document.getElementById('project');
  const wanted = new URLSearchParams(location.search).get('p') || '';

  function fail(message) {
    main.replaceChildren(el('h1', null, 'Project not found'), el('p', null, message));
    const a = el('a', 'btn', 'Back to all work');
    a.href = 'index.html#work';
    main.appendChild(a);
  }

  let projects;
  try {
    projects = await P.load();
  } catch (err) {
    return fail('Couldn\'t load the project list (' + err.message + '). ' +
      'If you opened this file directly, use the preview server instead: scripts/serve.ps1.');
  }

  const trail = P.trail(projects, wanted);
  if (!trail || !trail.length) return fail('There is no project at "' + wanted + '".');
  const node = trail[trail.length - 1];
  document.title = node.title + ' — Khoi Pham';
  main.replaceChildren();

  // Breadcrumbs back through the parent folders
  const crumbs = el('nav', 'crumbs');
  crumbs.setAttribute('aria-label', 'Project folders');
  const home = el('a', null, 'All work');
  home.href = 'index.html#work';
  crumbs.appendChild(home);
  trail.slice(0, -1).forEach(parent => {
    crumbs.appendChild(el('span', 'sep', '/'));
    const a = el('a', null, parent.title);
    a.href = P.folderHref(parent);
    crumbs.appendChild(a);
  });
  crumbs.appendChild(el('span', 'sep', '/'));
  crumbs.appendChild(el('span', 'here', node.title)).setAttribute('aria-current', 'page');
  main.appendChild(crumbs);

  // Header: category · year, title, summary
  main.appendChild(el('p', 'eyebrow', P.label(node)));
  main.appendChild(el('h1', null, node.title));
  if (node.summary) main.appendChild(el('p', 'lede', node.summary));

  // Facts table from the optional tags
  const facts = [
    ['Role', node.role],
    ['Tools', (node.tools || []).join(', ')],
    ['Outcome', node.outcome],
  ].filter(f => f[1]);
  if (facts.length || node.link) {
    const dl = el('dl', 'meta');
    facts.forEach(([k, v]) => dl.append(el('dt', null, k), el('dd', null, v)));
    if (node.link) {
      const a = el('a', null, node.link.replace(/^https?:\/\//, ''));
      a.href = node.link;
      a.target = '_blank';
      a.rel = 'noopener';
      const dd = el('dd');
      dd.appendChild(a);
      dl.append(el('dt', null, 'Link'), dd);
    }
    main.appendChild(dl);
  }

  if (node.image) {
    const img = el('img', 'hero-img');
    img.src = node.image;
    img.alt = node.title;
    main.appendChild(img);
  }

  // The write-up itself
  if (node.hasBody && node.file) {
    const article = el('article', 'prose');
    main.appendChild(article);
    try {
      const res = await fetch(node.file, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const md = (await res.text()).replace(/^﻿?---[ \t]*\r?\n[\s\S]*?\r?\n---[ \t]*(\r?\n|$)/, '');
      article.innerHTML = window.marked ? marked.parse(md) : '<pre></pre>';
      if (!window.marked) article.firstChild.textContent = md;
      fixLinks(article, node.file);
    } catch (err) {
      article.appendChild(el('p', 'error', 'Couldn\'t load the write-up (' + err.message + ').'));
    }
  }

  // Sub-projects, for folder projects
  if (kids(node).length) {
    main.appendChild(el('h2', null, 'Inside this project'));
    const grid = el('div', 'grid');
    kids(node).forEach(child => grid.appendChild(P.card(child)));
    main.appendChild(grid);
  }

  // Images and links in Markdown are written relative to the .md file. Point them at the
  // right place, and turn links to other project .md files into links to their pages.
  function fixLinks(container, mdFile) {
    const byFile = {};
    P.walk(projects, n => { if (n.file) byFile[n.file] = n; });
    const base = new URL(mdFile, location.href);
    const siteRoot = new URL('.', location.href).href;
    const isRelative = v => v && !/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(v);

    container.querySelectorAll('img[src]').forEach(img => {
      const src = img.getAttribute('src');
      if (isRelative(src)) img.src = new URL(src, base).href;
    });
    container.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (!isRelative(href)) {
        if (/^https?:/.test(href)) { a.target = '_blank'; a.rel = 'noopener'; }
        return;
      }
      const abs = new URL(href, base);
      const rel = decodeURIComponent(abs.href.replace(siteRoot, '').split('#')[0]);
      const target = byFile[rel];
      a.href = target ? P.pageHref(target) : abs.href;
    });
  }
})();
