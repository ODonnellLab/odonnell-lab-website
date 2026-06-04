/* ODonnell Lab — Shared site utilities */

/* ── Nav active state ────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname.replace(/\/$/, '') || '/index.html';
  document.querySelectorAll('.site-nav a').forEach(a => {
    try {
      const href = new URL(a.href).pathname.replace(/\/$/, '') || '/index.html';
      if (href === path) a.classList.add('active');
    } catch (_) {}
  });
});

/* ── Data loader ─────────────────────────────────────────── */
async function loadData(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`${resp.status} loading ${url}`);
  return resp.json();
}

function renderError(container, message) {
  container.innerHTML = `<div class="callout red"><p>${message}</p></div>`;
}

/* ── BibTeX parser ───────────────────────────────────────── */
function parseBibtex(text) {
  const entries = [];

  // Strip comments
  text = text.replace(/%[^\n]*/g, '');

  // Match each @type{key, ... } block
  const entryRe = /@(\w+)\s*\{\s*([^,\s]+)\s*,([^@]*?)\}\s*(?=@|$)/gs;
  let m;
  while ((m = entryRe.exec(text)) !== null) {
    const type = m[1].toLowerCase();
    if (type === 'string' || type === 'preamble' || type === 'comment') continue;

    const fields = {};
    const fieldRe = /(\w+)\s*=\s*(?:\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}|"([^"]*)"|([\w\d]+))\s*[,}]/g;
    let f;
    while ((f = fieldRe.exec(m[3])) !== null) {
      const key = f[1].toLowerCase();
      const val = (f[2] ?? f[3] ?? f[4] ?? '').trim();
      fields[key] = stripLatex(val);
    }

    const entry = {
      type,
      key: m[2],
      title:     fields.title     || '',
      author:    fields.author    || fields.authors || '',
      journal:   fields.journal   || fields.booktitle || fields.publisher || '',
      year:      parseInt(fields.year) || 0,
      volume:    fields.volume    || '',
      pages:     fields.pages     || '',
      doi:       fields.doi       || '',
      url:       fields.url       || '',
      pmid:      fields.pmid      || '',
      note:      fields.note      || '',
      keywords:  fields.keywords  || '',
      highlight: /highlight/i.test(fields.keywords || '') || /highlight/i.test(fields.note || ''),
    };

    // Clean up pages em-dash
    entry.pages = entry.pages.replace(/--+/g, '–');

    entries.push(entry);
  }

  return entries;
}

function stripLatex(str) {
  return str
    .replace(/\\'\{([a-zA-Z])\}/g, '$1')   // \'{e} → e
    .replace(/\\'([a-zA-Z])/g, '$1')        // \'e → e
    .replace(/\\\`\{([a-zA-Z])\}/g, '$1')
    .replace(/\\\^\{([a-zA-Z])\}/g, '$1')
    .replace(/\\"\{([a-zA-Z])\}/g, '$1')
    .replace(/\\\~\{([a-zA-Z])\}/g, '$1')
    .replace(/\{\\em\s+([^}]*)\}/g, '$1')   // {\em text}
    .replace(/\{\\it\s+([^}]*)\}/g, '$1')
    .replace(/\{\\bf\s+([^}]*)\}/g, '$1')
    .replace(/\{\\textit\{([^}]*)\}\}/g, '$1')
    .replace(/\\textit\{([^}]*)\}/g, '$1')
    .replace(/\\textrm\{([^}]*)\}/g, '$1')
    .replace(/\\textbf\{([^}]*)\}/g, '$1')
    .replace(/\{([^{}]*)\}/g, '$1')          // strip remaining {braces}
    .replace(/\{([^{}]*)\}/g, '$1')          // second pass for nested
    .replace(/\\&/g, '&')
    .replace(/\\\$/g, '$')
    .replace(/\\%/g, '%')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ── Author formatter ────────────────────────────────────── */
function formatAuthors(authorStr, labName) {
  // BibTeX "Last, First and Last2, First2" or "First Last and First2 Last2"
  const parts = authorStr.split(/\s+and\s+/i).map(a => {
    a = a.trim();
    if (a.includes(',')) {
      const [last, first] = a.split(',').map(s => s.trim());
      return `${first} ${last}`;
    }
    return a;
  });

  return parts.map(name => {
    const isLab = labName && name.toLowerCase().includes(labName.toLowerCase());
    return isLab ? `<strong>${name}</strong>` : name;
  }).join(', ');
}
