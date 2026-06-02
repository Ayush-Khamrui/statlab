/* ============================================================
   StatLab core — registry, router, nav, progress, rendering
   ============================================================ */
(function () {
  'use strict';

  // ---------- Course registry ----------
  const Course = {
    modules: [],
    addModule(m) {
      m.allSections = (m.sections || []).slice();
      if (m.cheatsheet) m.allSections.push({ id: 'cheatsheet', title: 'Cheat Sheet', icon: '📜', type: 'cheatsheet' });
      if (m.quiz && m.quiz.length) m.allSections.push({ id: 'practice', title: 'Practice Quiz', icon: '🎯', type: 'quiz' });
      this.modules.push(m);
    },
    get(id) { return this.modules.find(m => m.id === id); }
  };
  window.Course = Course;

  // ---------- Progress (localStorage) ----------
  const PKEY = 'statlab.progress.v1';
  const Progress = {
    data: JSON.parse(localStorage.getItem(PKEY) || '{}'),
    key(mid, sid) { return mid + '/' + sid; },
    isDone(mid, sid) { return !!this.data[this.key(mid, sid)]; },
    set(mid, sid, v) {
      const k = this.key(mid, sid);
      if (v) this.data[k] = Date.now(); else delete this.data[k];
      localStorage.setItem(PKEY, JSON.stringify(this.data));
    },
    moduleStats(m) {
      const total = m.allSections.length;
      const done = m.allSections.filter(s => this.isDone(m.id, s.id)).length;
      return { done, total, pct: total ? Math.round(done / total * 100) : 0 };
    },
    overall() {
      let total = 0, done = 0;
      Course.modules.forEach(m => { const s = this.moduleStats(m); total += s.total; done += s.done; });
      return { done, total, pct: total ? Math.round(done / total * 100) : 0 };
    },
    reset() { this.data = {}; localStorage.removeItem(PKEY); }
  };

  // ---------- Helpers ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function toast(msg) {
    let t = $('.toast'); if (!t) { t = el('div', 'toast'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 1900);
  }

  // ---------- Python syntax highlighter (lightweight) ----------
  const PY_KW = new Set(('False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield').split(' '));
  const PY_BI = new Set(('print len range sum min max abs round sorted map filter zip enumerate list dict set tuple int float str bool type isinstance open input format np pd plt scipy sklearn stats').split(' '));
  function escapeHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function highlightPython(code) {
    const out = [];
    const re = /(#[^\n]*)|("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+\.?\d*(?:e[+-]?\d+)?\b)|([A-Za-z_]\w*)|(\s+)|([^\w\s])/g;
    let m;
    while ((m = re.exec(code)) !== null) {
      if (m[1]) out.push('<span class="tok-com">' + escapeHtml(m[1]) + '</span>');
      else if (m[2]) out.push('<span class="tok-str">' + escapeHtml(m[2]) + '</span>');
      else if (m[3]) out.push('<span class="tok-num">' + escapeHtml(m[3]) + '</span>');
      else if (m[4]) {
        const w = m[4];
        const after = code.slice(re.lastIndex).match(/^\s*\(/);
        if (PY_KW.has(w)) out.push('<span class="tok-kw">' + w + '</span>');
        else if (PY_BI.has(w)) out.push('<span class="tok-bi">' + w + '</span>');
        else if (after) out.push('<span class="tok-fn">' + w + '</span>');
        else out.push(w);
      }
      else if (m[5]) out.push(m[5]);
      else if (m[6]) out.push('<span class="tok-op">' + escapeHtml(m[6]) + '</span>');
    }
    return out.join('');
  }

  // ---------- Post-render processing ----------
  function processCode(root) {
    $$('pre.code', root).forEach(pre => {
      if (pre.dataset.hl) return; pre.dataset.hl = '1';
      const lang = (pre.dataset.lang || 'python').toLowerCase();
      const raw = pre.textContent;
      const wrap = el('div', 'codeblock');
      const head = el('div', 'codeblock-head',
        '<span class="dot" style="background:#ff6b81"></span><span class="dot" style="background:#ffce5c"></span><span class="dot" style="background:#4ed98a"></span>' +
        '<span class="codeblock-lang">' + lang + '</span>' +
        '<button class="copy-btn">Copy</button>');
      const newPre = el('pre', 'code');
      newPre.innerHTML = '<code>' + (lang === 'python' ? highlightPython(raw) : escapeHtml(raw)) + '</code>';
      wrap.appendChild(head); wrap.appendChild(newPre);
      pre.replaceWith(wrap);
      head.querySelector('.copy-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(raw).then(() => toast('Copied to clipboard'));
      });
    });
  }
  function replaceLatexCommandGroups(src, command, render) {
    let out = '', i = 0;
    const token = '\\' + command;
    while (i < src.length) {
      const at = src.indexOf(token, i);
      if (at === -1) { out += src.slice(i); break; }
      out += src.slice(i, at);
      let p = at + token.length;
      const groups = [];
      while (src[p] === '{') {
        let depth = 1, j = p + 1;
        while (j < src.length && depth) {
          if (src[j] === '{') depth++;
          else if (src[j] === '}') depth--;
          j++;
        }
        if (depth) break;
        groups.push(src.slice(p + 1, j - 1));
        p = j;
      }
      if (!groups.length) { out += token; i = p; continue; }
      out += render(groups);
      i = p;
    }
    return out;
  }
  function fallbackMathHtml(latex, display = false) {
    let s = escapeHtml(latex).replace(/\s+/g, ' ').trim();
    const greek = {
      alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', lambda: 'λ',
      mu: 'μ', pi: 'π', sigma: 'σ', Sigma: 'Σ', theta: 'θ', varepsilon: 'ε'
    };
    const ops = {
      sum: '∑', prod: '∏', int: '∫', cdot: '·', times: '×', pm: '±', approx: '≈',
      ne: '≠', ge: '≥', le: '≤', in: '∈', cup: '∪', cap: '∩', varnothing: '∅',
      mid: '|', quad: ' ', qquad: ' ', dots: '…', ldots: '…'
    };
    s = s
      .replace(/\\(?:d?frac)([A-Za-z0-9])([A-Za-z0-9])/g, (_, a, b) => '\\frac{' + a + '}{' + b + '}')
      .replace(/\\bar\s+([A-Za-z])/g, (_, v) => '\\bar{' + v + '}')
      .replace(/\\hat\s+([A-Za-z])/g, (_, v) => '\\hat{' + v + '}')
      .replace(/\\mathcal\s*\{?([A-Za-z])\}?/g, '<span class="math-cal">$1</span>');
    const frac = g => display
      ? '<span class="math-frac"><span>' + fallbackMathHtml(g[0], display) + '</span><span>' + fallbackMathHtml(g[1] || '', display) + '</span></span>'
      : '<span class="math-inline-frac">' + fallbackMathHtml(g[0], display) + '/' + fallbackMathHtml(g[1] || '', display) + '</span>';
    s = replaceLatexCommandGroups(s, 'frac', frac);
    s = replaceLatexCommandGroups(s, 'dfrac', frac);
    s = replaceLatexCommandGroups(s, 'sqrt', g => '<span class="math-sqrt">' + fallbackMathHtml(g[0], display) + '</span>');
    s = replaceLatexCommandGroups(s, 'bar', g => '<span class="math-over">' + fallbackMathHtml(g[0], display) + '</span>');
    s = replaceLatexCommandGroups(s, 'hat', g => '<span class="math-hat">' + fallbackMathHtml(g[0], display) + '</span>');
    s = replaceLatexCommandGroups(s, 'text', g => '<span class="math-text">' + g[0] + '</span>');
    s = replaceLatexCommandGroups(s, 'mathbf', g => '<strong>' + fallbackMathHtml(g[0], display) + '</strong>');
    s = replaceLatexCommandGroups(s, 'mathbb', g => '<span class="math-bb">' + g[0] + '</span>');
    s = replaceLatexCommandGroups(s, 'operatorname', g => '<span class="math-text">' + g[0] + '</span>');
    s = replaceLatexCommandGroups(s, 'binom', g => '<span class="math-binom"><span>' + fallbackMathHtml(g[0], display) + '</span><span>' + fallbackMathHtml(g[1] || '', display) + '</span></span>');
    s = s
      .replace(/\\([A-Za-z]+)/g, (_, name) => greek[name] || ops[name] || name)
      .replace(/_\{([^{}]+)\}/g, (_, v) => '<sub>' + fallbackMathHtml(v, display) + '</sub>')
      .replace(/\^\{([^{}]+)\}/g, (_, v) => '<sup>' + fallbackMathHtml(v, display) + '</sup>')
      .replace(/_([A-Za-z0-9+\-])/g, '<sub>$1</sub>')
      .replace(/\^([A-Za-z0-9+\-])/g, '<sup>$1</sup>')
      .replace(/∑<sub>(.*?)<\/sub><sup>(.*?)<\/sup>/g, '<span class="math-op">∑<span><sup>$2</sup><sub>$1</sub></span></span>')
      .replace(/∏<sub>(.*?)<\/sub><sup>(.*?)<\/sup>/g, '<span class="math-op">∏<span><sup>$2</sup><sub>$1</sub></span></span>')
      .replace(/\\,/g, ' ')
      .replace(/\\/g, '');
    return s;
  }
  function renderFallbackMath(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const p = node.parentElement;
        if (!p || !node.nodeValue.includes('$')) return NodeFilter.FILTER_REJECT;
        if (p.closest('pre, code, script, style, .katex, .math-fallback')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const frag = document.createDocumentFragment();
      const parts = node.nodeValue.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g);
      parts.forEach(part => {
        const display = part.startsWith('$$') && part.endsWith('$$');
        const inline = part.startsWith('$') && part.endsWith('$');
        if (!display && !inline) { frag.appendChild(document.createTextNode(part)); return; }
        const span = el('span', display ? 'math-fallback math-display' : 'math-fallback');
        span.innerHTML = fallbackMathHtml(part.slice(display ? 2 : 1, display ? -2 : -1), display);
        frag.appendChild(span);
      });
      node.replaceWith(frag);
    });
  }
  function renderMath(root) {
    if (window.renderMathInElement) {
      try {
        window.renderMathInElement(root, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
          ],
          throwOnError: false, errorColor: '#9aa6c4'
        });
      } catch (e) { renderFallbackMath(root); }
    } else {
      renderFallbackMath(root);
    }
  }
  function mountViz(root) {
    $$('.viz[data-viz]', root).forEach(node => {
      const name = node.dataset.viz;
      if (window.Viz && typeof window.Viz[name] === 'function') {
        try { window.Viz[name](node); } catch (e) { console.error('viz', name, e); node.innerHTML = '<p class="muted">Visualization failed to load.</p>'; }
      }
    });
  }

  // ---------- Background animation: drifting Gaussian particles ----------
  function startBackground() {
    const c = $('#bg-canvas'); if (!c) return;
    const ctx = c.getContext('2d');
    let w, h, pts = [];
    function resize() {
      w = c.width = innerWidth * devicePixelRatio; h = c.height = innerHeight * devicePixelRatio;
      c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px';
    }
    function gauss() { let u = 0, v = 0; while (u === 0) u = Math.random(); while (v === 0) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
    function init() {
      pts = []; const n = Math.min(70, Math.floor(innerWidth / 22));
      for (let i = 0; i < n; i++) pts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .25 * devicePixelRatio, vy: (Math.random() - .5) * .25 * devicePixelRatio, r: (Math.random() * 1.6 + .6) * devicePixelRatio });
    }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      const accent = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#7c5cff';
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]; p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1;
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = Math.hypot(dx, dy);
          if (d < 140 * devicePixelRatio) {
            ctx.strokeStyle = accent; ctx.globalAlpha = (1 - d / (140 * devicePixelRatio)) * 0.12;
            ctx.lineWidth = devicePixelRatio; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        ctx.globalAlpha = .5; ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1; requestAnimationFrame(frame);
    }
    resize(); init(); frame();
    addEventListener('resize', () => { resize(); init(); });
  }

  // ---------- Navigation ----------
  function buildNav() {
    const nav = $('#nav'); nav.innerHTML = '';
    // gradient def for ring
    const svgGrad = '<svg width="0" height="0"><defs><linearGradient id="ringgrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#7c5cff"/><stop offset="100%" stop-color="#29d3c2"/></linearGradient></defs></svg>';
    document.body.insertAdjacentHTML('beforeend', svgGrad);
    Course.modules.forEach(m => {
      const stats = Progress.moduleStats(m);
      const mod = el('div', 'nav-module'); mod.dataset.mid = m.id;
      const head = el('div', 'nav-mod-head',
        '<div class="nav-mod-icon">' + m.icon + '</div>' +
        '<div class="nav-mod-title"><div class="nav-mod-num">MODULE ' + m.num + ' · <span class="nav-mod-prog">' + stats.pct + '%</span></div>' + m.title + '</div>' +
        '<div class="nav-mod-chev">▶</div>');
      const secWrap = el('div', 'nav-sections');
      m.allSections.forEach(s => {
        const sec = el('div', 'nav-section'); sec.dataset.mid = m.id; sec.dataset.sid = s.id;
        if (Progress.isDone(m.id, s.id)) sec.classList.add('done');
        sec.innerHTML = '<span class="nav-check">✓</span><span>' + s.title + '</span>';
        sec.addEventListener('click', () => location.hash = '#/' + m.id + '/' + s.id);
        secWrap.appendChild(sec);
      });
      head.addEventListener('click', () => mod.classList.toggle('open'));
      mod.appendChild(head); mod.appendChild(secWrap); nav.appendChild(mod);
    });
    updateProgressUI();
  }
  function updateProgressUI() {
    const o = Progress.overall();
    const ring = $('#overall-ring');
    if (ring) { const circ = 2 * Math.PI * 30; ring.style.strokeDasharray = circ; ring.style.strokeDashoffset = circ * (1 - o.pct / 100); }
    $('#overall-pct').textContent = o.pct + '%';
    $('#overall-sub').textContent = o.done + ' / ' + o.total + ' sections';
    Course.modules.forEach(m => {
      const stats = Progress.moduleStats(m);
      const node = $('.nav-module[data-mid="' + m.id + '"] .nav-mod-prog');
      if (node) node.textContent = stats.pct + '%';
    });
  }
  function highlightNav(mid, sid) {
    $$('.nav-section').forEach(n => n.classList.toggle('active', n.dataset.mid === mid && n.dataset.sid === sid));
    $$('.nav-module').forEach(n => {
      const on = n.dataset.mid === mid;
      n.querySelector('.nav-mod-head').classList.toggle('active', on);
      if (on) n.classList.add('open');
    });
  }

  // ---------- Rendering ----------
  const view = () => $('#view');
  function setView(html) {
    const v = view(); v.innerHTML = '';
    const wrap = el('div', 'fade-in'); wrap.innerHTML = html; v.appendChild(wrap);
    processCode(wrap); renderMath(wrap); mountViz(wrap);
    v.scrollTop = 0; window.scrollTo(0, 0); v.focus();
    return wrap;
  }

  function renderHome() {
    const o = Progress.overall();
    const cards = Course.modules.map(m => {
      const s = Progress.moduleStats(m);
      return '<div class="module-card" data-go="#/' + m.id + '/' + m.allSections[0].id + '">' +
        '<div class="mc-icon">' + m.icon + '</div>' +
        '<div class="mc-num">MODULE ' + m.num + '</div>' +
        '<h3>' + m.title + '</h3><p>' + m.subtitle + '</p>' +
        '<div class="mc-bar"><i style="width:' + s.pct + '%"></i></div>' +
        '<div class="mc-meta"><span>' + s.done + '/' + s.total + ' sections</span><span>' + s.pct + '%</span></div>' +
        '</div>';
    }).join('');
    const html =
      '<section class="hero">' +
      '<div class="crumb" style="justify-content:center">BITS PILANI · M.TECH AI/ML · AIMLCZC418</div>' +
      '<h1>Statistical Methods,<br><span class="grad-text">made intuitive & interactive</span></h1>' +
      '<p class="lead">Your personal companion for the whole subject — narrative notes, animated intuitions, live graphs you can poke, Python you can run, and interview angles for your Tech&nbsp;Lead AI/ML move. Built from your lectures &amp; ISM notes.</p>' +
      '<div class="hero-cta">' +
      '<button class="btn-primary" data-go="#/' + Course.modules[0].id + '/' + Course.modules[0].allSections[0].id + '">' + (o.pct > 0 ? 'Continue learning →' : 'Start Module 1 →') + '</button>' +
      '<button class="btn-ghost" id="home-shuffle">🎲 Surprise me</button>' +
      '</div>' +
      '<div class="stat-strip">' +
      '<div class="s"><b>' + Course.modules.length + '</b><span>MODULES</span></div>' +
      '<div class="s"><b>' + o.total + '</b><span>SECTIONS</span></div>' +
      '<div class="s"><b>' + countViz() + '</b><span>LIVE DEMOS</span></div>' +
      '<div class="s"><b>' + countQuiz() + '</b><span>QUIZ QUESTIONS</span></div>' +
      '</div>' +
      '</section>' +
      '<div class="callout aiml" data-icon="🧭"><div class="callout-title">How to use this</div>' +
      '<p>Work module by module. Each section ends with a <b>“mark complete”</b> button that fills your progress rings. Every concept carries three lenses: <b style="color:var(--accent-2)">Intuition</b> (the mental picture), <b style="color:var(--gold)">Interview</b> (how it shows up for a Tech Lead), and <b style="color:var(--red)">Pitfall</b> (what trips people up). Press <kbd>/</kbd> anytime to jump to any topic.</p></div>' +
      '<h2>The six modules</h2>' +
      '<div class="module-cards">' + cards + '</div>';
    const wrap = setView(html);
    $$('[data-go]', wrap).forEach(b => b.addEventListener('click', () => location.hash = b.dataset.go));
    const sh = $('#home-shuffle', wrap);
    if (sh) sh.addEventListener('click', () => {
      const m = Course.modules[Math.floor(Math.random() * Course.modules.length)];
      const s = m.sections[Math.floor(Math.random() * m.sections.length)];
      location.hash = '#/' + m.id + '/' + s.id;
    });
  }
  function countViz() { let n = 0; Course.modules.forEach(m => m.allSections.forEach(s => { if (s.html) n += (s.html.match(/data-viz=/g) || []).length; })); return n; }
  function countQuiz() { let n = 0; Course.modules.forEach(m => n += (m.quiz ? m.quiz.length : 0)); return n; }

  function sectionFooter(m, idx) {
    const list = m.allSections;
    const prev = idx > 0 ? list[idx - 1] : null;
    const nextSec = idx < list.length - 1 ? list[idx + 1] : null;
    // cross-module next
    let nextHash = null, nextLabel = null;
    if (nextSec) { nextHash = '#/' + m.id + '/' + nextSec.id; nextLabel = nextSec.title; }
    else { const mi = Course.modules.indexOf(m); if (mi < Course.modules.length - 1) { const nm = Course.modules[mi + 1]; nextHash = '#/' + nm.id + '/' + nm.allSections[0].id; nextLabel = 'Module ' + nm.num + ': ' + nm.allSections[0].title; } }
    let prevHash = null, prevLabel = null;
    if (prev) { prevHash = '#/' + m.id + '/' + prev.id; prevLabel = prev.title; }
    else { const mi = Course.modules.indexOf(m); if (mi > 0) { const pm = Course.modules[mi - 1]; const last = pm.allSections[pm.allSections.length - 1]; prevHash = '#/' + pm.id + '/' + last.id; prevLabel = 'Module ' + pm.num + ': ' + last.title; } }
    let h = '<div class="section-foot">';
    h += prevHash ? '<button class="foot-btn prev" data-go="' + prevHash + '"><small>← Previous</small><b>' + prevLabel + '</b></button>' : '<span></span>';
    h += nextHash ? '<button class="foot-btn next" data-go="' + nextHash + '"><small>Next →</small><b>' + nextLabel + '</b></button>' : '<span></span>';
    h += '</div>';
    return h;
  }

  function renderSection(mid, sid) {
    const m = Course.get(mid); if (!m) return renderHome();
    const idx = m.allSections.findIndex(s => s.id === sid);
    const s = idx >= 0 ? m.allSections[idx] : m.allSections[0];
    let body = '';
    if (s.type === 'cheatsheet') body = '<div class="cheatsheet">' + m.cheatsheet + '</div>';
    else if (s.type === 'quiz') body = '<div data-quiz="' + m.id + '"></div>';
    else body = s.html || '<p class="muted">Coming soon.</p>';

    const done = Progress.isDone(m.id, s.id);
    const html =
      '<div class="crumb"><span class="chip">' + m.icon + ' Module ' + m.num + '</span><span>' + m.title + '</span></div>' +
      '<h1>' + (s.icon ? s.icon + ' ' : '') + s.title + '</h1>' +
      body +
      '<button class="complete-btn ' + (done ? 'done' : '') + '" id="complete-btn">' + (done ? '✓ Completed' : '○ Mark this section complete') + '</button>' +
      sectionFooter(m, idx);
    const wrap = setView(html);
    // mount quiz
    const qNode = $('[data-quiz]', wrap);
    if (qNode && window.Quiz) window.Quiz.mount(qNode, m);
    // footer nav
    $$('[data-go]', wrap).forEach(b => b.addEventListener('click', () => location.hash = b.dataset.go));
    // complete
    const cb = $('#complete-btn', wrap);
    cb.addEventListener('click', () => {
      const now = !Progress.isDone(m.id, s.id);
      Progress.set(m.id, s.id, now);
      cb.classList.toggle('done', now);
      cb.textContent = now ? '✓ Completed' : '○ Mark this section complete';
      const navSec = $('.nav-section[data-mid="' + m.id + '"][data-sid="' + s.id + '"]');
      if (navSec) navSec.classList.toggle('done', now);
      updateProgressUI();
      if (now) { toast('Nice — section complete! 🎉'); }
    });
    highlightNav(m.id, s.id);
  }

  // ---------- Router ----------
  function route() {
    const h = location.hash.replace(/^#\/?/, '');
    if (!h || h === 'home') { renderHome(); highlightNav(null, null); document.title = 'StatLab · Statistical Methods'; return; }
    const [mid, sid] = h.split('/');
    const m = Course.get(mid);
    if (m) { renderSection(mid, sid || m.allSections[0].id); document.title = 'StatLab · ' + m.title; }
    else renderHome();
  }

  // ---------- Command palette ----------
  function buildSearchIndex() {
    const idx = [];
    Course.modules.forEach(m => m.allSections.forEach(s => {
      idx.push({ icon: s.icon || m.icon, title: s.title, meta: 'M' + m.num, hash: '#/' + m.id + '/' + s.id, terms: (s.title + ' ' + (s.search || '') + ' ' + m.title).toLowerCase() });
    }));
    return idx;
  }
  function setupPalette() {
    const pal = $('#cmd-palette'), input = $('#cmd-input'), results = $('#cmd-results');
    const index = buildSearchIndex(); let sel = 0, filtered = index;
    function open() { pal.hidden = false; input.value = ''; render(index); input.focus(); }
    function close() { pal.hidden = true; }
    function render(list) {
      filtered = list; sel = 0;
      results.innerHTML = list.slice(0, 40).map((r, i) =>
        '<li data-hash="' + r.hash + '" class="' + (i === 0 ? 'sel' : '') + '"><span class="ci">' + r.icon + '</span><span class="ct">' + r.title + '</span><span class="cm">' + r.meta + '</span></li>').join('') ||
        '<li class="muted" style="cursor:default">No matches</li>';
    }
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      render(q ? index.filter(r => q.split(/\s+/).every(t => r.terms.includes(t))) : index);
    });
    input.addEventListener('keydown', e => {
      const items = $$('li[data-hash]', results);
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, items.length - 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); }
      else if (e.key === 'Enter') { if (items[sel]) { location.hash = items[sel].dataset.hash; close(); } return; }
      else if (e.key === 'Escape') { close(); return; }
      items.forEach((it, i) => it.classList.toggle('sel', i === sel));
      if (items[sel]) items[sel].scrollIntoView({ block: 'nearest' });
    });
    results.addEventListener('click', e => { const li = e.target.closest('li[data-hash]'); if (li) { location.hash = li.dataset.hash; close(); } });
    pal.addEventListener('click', e => { if (e.target === pal) close(); });
    $('#cmd-open').addEventListener('click', open);
    addEventListener('keydown', e => {
      if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName) && pal.hidden) { e.preventDefault(); open(); }
      else if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); pal.hidden ? open() : close(); }
    });
  }

  // ---------- Theme ----------
  function setupTheme() {
    const saved = localStorage.getItem('statlab.theme');
    if (saved === 'light') document.body.setAttribute('data-theme', 'light');
    const btn = $('#theme-toggle');
    function sync() { btn.textContent = document.body.getAttribute('data-theme') === 'light' ? '☀️' : '🌙'; }
    sync();
    btn.addEventListener('click', () => {
      const light = document.body.getAttribute('data-theme') === 'light';
      if (light) { document.body.removeAttribute('data-theme'); localStorage.setItem('statlab.theme', 'dark'); }
      else { document.body.setAttribute('data-theme', 'light'); localStorage.setItem('statlab.theme', 'light'); }
      sync();
    });
  }

  // ---------- Mobile nav ----------
  function setupNavToggle() {
    $('#menu-toggle').addEventListener('click', () => document.body.classList.toggle('nav-open'));
    $('#scrim').addEventListener('click', () => document.body.classList.remove('nav-open'));
    $('#nav').addEventListener('click', e => { if (e.target.closest('.nav-section')) document.body.classList.remove('nav-open'); });
  }

  // ---------- Boot ----------
  const App = {
    Progress, toast, el, $, $$, renderMath, processCode,
    start() {
      startBackground();
      buildNav();
      setupTheme();
      setupNavToggle();
      setupPalette();
      $('#reset-progress').addEventListener('click', () => {
        if (confirm('Reset all progress? This clears your completed sections.')) {
          Progress.reset(); buildNav(); route(); toast('Progress reset');
        }
      });
      addEventListener('hashchange', route);
      // re-render math once KaTeX finishes loading (CDN may be slightly late)
      let tries = 0; const iv = setInterval(() => {
        if (window.renderMathInElement) { renderMath(view()); clearInterval(iv); }
        else if (++tries > 25) clearInterval(iv);
      }, 200);
      route();
    }
  };
  window.App = App;
})();
