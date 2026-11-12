// Shared helpers for reading the project index (content/index.json) and drawing project cards.
// The index is generated from the Markdown files in content/projects by scripts/build-index.ps1.
window.Portfolio = (function () {
  const LABELS = { design: 'Design', personal: 'Personal', code: 'Code' };
  let request;

  function load() {
    if (!request) {
      request = fetch('content/index.json', { cache: 'no-cache' })
        .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(d => d.projects || []);
    }
    return request;
  }

  const kids = n => (n && Array.isArray(n.children)) ? n.children : [];
  const isFolder = n => kids(n).length > 0;

  // "robot-arm/cycloidal-drive" -> [robot-arm node, cycloidal-drive node], or null if not found.
  function trail(projects, path) {
    const out = [];
    let level = projects;
    for (const id of String(path || '').split('/').filter(Boolean)) {
      const next = level.find(n => n.id === id);
      if (!next) return null;
      out.push(next);
      level = kids(next);
    }
    return out;
  }

  function walk(projects, fn) {
    projects.forEach(n => { fn(n); walk(kids(n), fn); });
  }

  const pageHref = n => 'project.html?p=' + encodeURIComponent(n.path);
  const folderHref = n => 'index.html#work/' + n.path;

  // Where a card goes: folders open in the Work grid, projects with a write-up open their page,
  // otherwise the external link (if any).
  function cardHref(n, openFolder) {
    if (isFolder(n)) return (openFolder || folderHref)(n);
    if (n.hasBody) return pageHref(n);
    return n.link || null;
  }

  function label(n) {
    return [LABELS[n.category] || n.category, n.year].filter(Boolean).join(' · ');
  }

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function card(node, openFolder) {
    const folder = isFolder(node);
    const article = el('article', 'card' + (folder ? ' group' : ''));
    const href = cardHref(node, openFolder);
    const a = el(href ? 'a' : 'div', 'card-link');
    if (href) {
      a.href = href;
      if (/^https?:/.test(href)) { a.target = '_blank'; a.rel = 'noopener'; }
    } else {
      article.classList.add('no-link');
    }

    const thumb = el('div', 'thumb');
    if (node.image) {
      const img = el('img');
      img.src = node.image;
      img.alt = node.title;
      img.loading = 'lazy';
      thumb.appendChild(img);
    } else {
      thumb.appendChild(el('span', null, node.category === 'code' ? '</>' : 'IMG'));
    }
    if (folder) {
      const n = kids(node).length;
      thumb.appendChild(el('span', 'badge', n + (n === 1 ? ' sub-project' : ' sub-projects')));
    }

    const body = el('div', 'card-body');
    body.append(el('p', 'tag', label(node)), el('h3', null, node.title), el('p', null, node.summary || ''));
    if (folder) body.appendChild(el('p', 'open-hint', 'Open folder →'));
    else if (node.hasBody) body.appendChild(el('p', 'open-hint', 'Read more →'));
    else if (href) body.appendChild(el('p', 'open-hint', 'Visit link ↗'));

    a.append(thumb, body);
    article.appendChild(a);
    return article;
  }

  return { LABELS, load, kids, isFolder, trail, walk, pageHref, folderHref, label, el, card };
})();
