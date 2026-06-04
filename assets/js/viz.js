/* ============================================================
   StatLab viz — interactive canvas visualizations
   Each Viz.name(node) builds controls + animated canvas.
   ============================================================ */
(function () {
  'use strict';
  const Viz = {};
  window.Viz = Viz;

  // ---------- color + math utils ----------
  const cs = () => getComputedStyle(document.body);
  const col = n => cs().getPropertyValue(n).trim() || '#888';
  const COL = () => ({
    accent: col('--accent'), accent2: col('--accent-2'), accent3: col('--accent-3'), gold: col('--gold'),
    green: col('--green'), red: col('--red'), blue: col('--blue'),
    text: col('--text'), dim: col('--text-dim'), faint: col('--text-faint'),
    border: col('--border-strong'), panel: col('--panel-2')
  });
  const SQRT2 = Math.SQRT2, SQRT2PI = Math.sqrt(2 * Math.PI);
  function lgamma(x) {
    const g = [76.18009172947146, -86.50532032941677, 24.01409824083091,
      -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    let xx = x, y = x, t = x + 5.5; t -= (x + 0.5) * Math.log(t);
    let s = 1.000000000190015; for (let j = 0; j < 6; j++) s += g[j] / ++y;
    return -t + Math.log(2.5066282746310005 * s / xx);
  }
  function combLog(n, k) { return lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1); }
  function binomPmf(k, n, p) { if (k < 0 || k > n) return 0; if (p <= 0) return k === 0 ? 1 : 0; if (p >= 1) return k === n ? 1 : 0; return Math.exp(combLog(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p)); }
  function poissonPmf(k, l) { if (k < 0) return 0; return Math.exp(k * Math.log(l) - l - lgamma(k + 1)); }
  function normPdf(x, mu, s) { const z = (x - mu) / s; return Math.exp(-0.5 * z * z) / (s * SQRT2PI); }
  function erf(x) { const s = x < 0 ? -1 : 1; x = Math.abs(x); const t = 1 / (1 + 0.3275911 * x); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return s * y; }
  function normCdf(x, mu, s) { return 0.5 * (1 + erf((x - mu) / (s * SQRT2))); }
  function randn() { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function mean(a) { return a.reduce((s, x) => s + x, 0) / a.length; }
  function variance(a, samp) { const m = mean(a); return a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - (samp ? 1 : 0)); }
  function median(a) { const b = [...a].sort((x, y) => x - y); const n = b.length, h = n >> 1; return n % 2 ? b[h] : (b[h - 1] + b[h]) / 2; }
  function quantile(sorted, q) { const pos = (sorted.length - 1) * q, base = Math.floor(pos), rest = pos - base; return sorted[base + 1] !== undefined ? sorted[base] + rest * (sorted[base + 1] - sorted[base]) : sorted[base]; }
  const Z95 = 1.959964;

  // ---------- scaffold + hi-dpi canvas ----------
  function scaffold(node, opt) {
    node.innerHTML = '';
    if (opt.title) { const t = document.createElement('div'); t.className = 'viz-title'; t.innerHTML = '<span class="badge">LIVE</span> ' + opt.title; node.appendChild(t); }
    if (opt.desc) { const d = document.createElement('div'); d.className = 'viz-desc'; d.innerHTML = opt.desc; node.appendChild(d); }
    const canvas = document.createElement('canvas'); node.appendChild(canvas);
    const controls = document.createElement('div'); controls.className = 'viz-controls'; node.appendChild(controls);
    const readout = document.createElement('div'); readout.className = 'viz-readout'; node.appendChild(readout);
    const ctx = canvas.getContext('2d');
    const state = { canvas, ctx, controls, readout, h: opt.height || 280, w: 600 };
    function size() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || node.clientWidth - 36 || 600;
      state.w = w; canvas.width = w * dpr; canvas.height = state.h * dpr;
      canvas.style.height = state.h + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    canvas.style.width = '100%';
    state.size = size; size();
    let raf; state.redrawHook = null;
    state.onResize = () => { size(); if (state.redrawHook) state.redrawHook(); };
    try { new ResizeObserver(() => state.onResize()).observe(canvas); } catch (e) { addEventListener('resize', state.onResize); }
    return state;
  }
  function addSlider(controls, o, onChange) {
    const wrap = document.createElement('div'); wrap.className = 'ctrl';
    const lab = document.createElement('label');
    const fmt = o.fmt || (v => v);
    lab.innerHTML = o.label + ' <b>' + fmt(o.value) + '</b>';
    const inp = document.createElement('input'); inp.type = 'range';
    inp.min = o.min; inp.max = o.max; inp.step = o.step; inp.value = o.value;
    inp.addEventListener('input', () => { lab.querySelector('b').textContent = fmt(+inp.value); onChange(+inp.value); });
    wrap.appendChild(lab); wrap.appendChild(inp); controls.appendChild(wrap);
    return inp;
  }
  function addBtn(controls, label, cls, onClick) {
    const b = document.createElement('button'); b.className = 'viz-btn ' + (cls || ''); b.textContent = label;
    b.addEventListener('click', onClick); controls.appendChild(b); return b;
  }
  function addSeg(controls, options, value, onChange) {
    const seg = document.createElement('div'); seg.className = 'seg';
    options.forEach(o => {
      const b = document.createElement('button'); b.textContent = o.label; b.dataset.v = o.value;
      if (o.value === value) b.classList.add('active');
      b.addEventListener('click', () => { seg.querySelectorAll('button').forEach(x => x.classList.remove('active')); b.classList.add('active'); onChange(o.value); });
      seg.appendChild(b);
    });
    controls.appendChild(seg); return seg;
  }

  // generic axis helper -> returns mapping fns
  function frame(ctx, w, h, pad) {
    const c = COL();
    pad = Object.assign({ l: 42, r: 16, t: 14, b: 30 }, pad || {});
    return {
      pad, iw: w - pad.l - pad.r, ih: h - pad.t - pad.b,
      X(t, x0, x1) { return pad.l + (t - x0) / (x1 - x0) * (w - pad.l - pad.r); },
      Y(t, y0, y1) { return h - pad.b - (t - y0) / (y1 - y0) * (h - pad.t - pad.b); },
      clear() { ctx.clearRect(0, 0, w, h); },
      axes(x0, x1, y0, y1, xlab, ylab) {
        ctx.strokeStyle = c.border; ctx.lineWidth = 1; ctx.fillStyle = c.faint; ctx.font = '11px Inter, sans-serif';
        ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b); ctx.stroke();
        if (xlab) { ctx.textAlign = 'center'; ctx.fillText(xlab, pad.l + this.iw / 2, h - 4); }
        if (ylab) { ctx.save(); ctx.translate(11, pad.t + this.ih / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText(ylab, 0, 0); ctx.restore(); }
      }
    };
  }

  /* =========================================================
     MODULE 1 — Descriptive statistics
     ========================================================= */

  // Central tendency: drag an outlier, watch mean vs median
  Viz.centralTendency = function (node) {
    const s = scaffold(node, { title: 'Mean vs Median: the tug of an outlier', desc: 'Drag the <b style="color:' + COL().red + '">red point</b> far to the right. Watch the <b style="color:' + COL().gold + '">mean</b> chase it while the <b style="color:' + COL().accent2 + '">median</b> barely moves.', height: 220 });
    let base = [12, 15, 16, 18, 19, 20, 22, 24, 25];
    let outlier = 28; let dragging = false;
    const x0 = 0, x1 = 100;
    function data() { return base.concat([outlier]); }
    function draw() {
      const c = COL(), ctx = s.ctx, w = s.w, h = s.h; const f = frame(ctx, w, h, { b: 44, t: 30 });
      f.clear();
      const yLine = h - 60;
      ctx.strokeStyle = c.border; ctx.beginPath(); ctx.moveTo(f.pad.l, yLine); ctx.lineTo(w - f.pad.r, yLine); ctx.stroke();
      // ticks
      ctx.fillStyle = c.faint; ctx.font = '10px Inter'; ctx.textAlign = 'center';
      for (let t = 0; t <= 100; t += 20) { const px = f.X(t, x0, x1); ctx.fillText(t, px, yLine + 16); ctx.strokeStyle = c.border; ctx.beginPath(); ctx.moveTo(px, yLine - 3); ctx.lineTo(px, yLine + 3); ctx.stroke(); }
      // points
      base.forEach(v => { const px = f.X(v, x0, x1); ctx.fillStyle = c.accent2; ctx.beginPath(); ctx.arc(px, yLine, 7, 0, 7); ctx.fill(); });
      const opx = f.X(outlier, x0, x1); ctx.fillStyle = c.red; ctx.beginPath(); ctx.arc(opx, yLine, 9, 0, 7); ctx.fill();
      ctx.strokeStyle = '#fff3'; ctx.stroke();
      const d = data(); const mn = mean(d), md = median(d);
      // markers
      function marker(val, color, label, up) {
        const px = f.X(val, x0, x1); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(px, yLine - 14); ctx.lineTo(px, up ? 24 : yLine + 24); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = color; ctx.font = '600 12px Inter'; ctx.textAlign = 'center';
        ctx.fillText(label + ' ' + val.toFixed(1), px, up ? 16 : yLine + 38);
      }
      marker(mn, c.gold, 'mean', true);
      marker(md, c.accent2, 'median', false);
      s.readout.innerHTML = 'mean = <b>' + mn.toFixed(2) + '</b> &nbsp;·&nbsp; median = <b>' + md.toFixed(2) + '</b> &nbsp;·&nbsp; gap = <b>' + (mn - md).toFixed(2) + '</b> → ' + (mn - md > 2 ? 'right-skewed by the outlier' : 'roughly symmetric');
    }
    s.redrawHook = draw;
    function pos(e) { const r = s.canvas.getBoundingClientRect(); const cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left; const f = frame(s.ctx, s.w, s.h, { b: 44, t: 30 }); return Math.max(0, Math.min(100, (cx - f.pad.l) / f.iw * 100)); }
    s.canvas.addEventListener('mousedown', () => dragging = true);
    addEventListener('mouseup', () => dragging = false);
    s.canvas.addEventListener('mousemove', e => { if (dragging) { outlier = pos(e); draw(); } });
    s.canvas.addEventListener('touchstart', e => { dragging = true; outlier = pos(e); draw(); });
    s.canvas.addEventListener('touchmove', e => { if (dragging) { e.preventDefault(); outlier = pos(e); draw(); } }, { passive: false });
    s.canvas.addEventListener('touchend', () => dragging = false);
    addBtn(s.controls, '↺ Reset outlier', 'ghost', () => { outlier = 28; draw(); });
    draw();
  };

  // Box plot + five-number summary
  Viz.boxplot = function (node) {
    const s = scaffold(node, { title: 'Box plot & the 1.5×IQR outlier fence', desc: 'Adjust spread and add an extreme value. Points beyond the dashed <b>fences</b> are flagged as outliers — exactly what software draws.', height: 200 });
    let spread = 8, extreme = 0;
    function build() {
      const data = [];
      for (let i = 0; i < 30; i++) data.push(50 + randn() * spread);
      if (extreme > 0) data.push(50 + extreme);
      return data.sort((a, b) => a - b);
    }
    let data = build();
    function draw() {
      const c = COL(), ctx = s.ctx, w = s.w, h = s.h, f = frame(ctx, w, h, { b: 36, t: 20 });
      f.clear();
      const lo = 20, hi = 100; const yMid = h / 2 - 4;
      const q1 = quantile(data, .25), q2 = quantile(data, .5), q3 = quantile(data, .75), iqr = q3 - q1;
      const lf = q1 - 1.5 * iqr, uf = q3 + 1.5 * iqr;
      const inl = data.filter(v => v >= lf && v <= uf);
      const wMin = Math.min(...inl), wMax = Math.max(...inl);
      // axis
      ctx.fillStyle = c.faint; ctx.font = '10px Inter'; ctx.textAlign = 'center';
      for (let t = lo; t <= hi; t += 20) { const px = f.X(t, lo, hi); ctx.fillText(t, px, h - 12); }
      // fences
      [lf, uf].forEach(v => { const px = f.X(v, lo, hi); ctx.strokeStyle = c.red; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(px, 16); ctx.lineTo(px, yMid + 50); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = c.red; ctx.fillText('fence', px, 12); });
      // whiskers
      const bx1 = f.X(q1, lo, hi), bx3 = f.X(q3, lo, hi), bx2 = f.X(q2, lo, hi);
      const wpx1 = f.X(wMin, lo, hi), wpx2 = f.X(wMax, lo, hi);
      ctx.strokeStyle = c.dim; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(wpx1, yMid); ctx.lineTo(bx1, yMid); ctx.moveTo(bx3, yMid); ctx.lineTo(wpx2, yMid); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(wpx1, yMid - 10); ctx.lineTo(wpx1, yMid + 10); ctx.moveTo(wpx2, yMid - 10); ctx.lineTo(wpx2, yMid + 10); ctx.stroke();
      // box
      const grad = ctx.createLinearGradient(bx1, 0, bx3, 0); grad.addColorStop(0, c.accent); grad.addColorStop(1, c.accent2);
      ctx.fillStyle = grad; ctx.globalAlpha = .35; ctx.fillRect(bx1, yMid - 26, bx3 - bx1, 52); ctx.globalAlpha = 1;
      ctx.strokeStyle = c.accent2; ctx.lineWidth = 2; ctx.strokeRect(bx1, yMid - 26, bx3 - bx1, 52);
      ctx.strokeStyle = c.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx2, yMid - 26); ctx.lineTo(bx2, yMid + 26); ctx.stroke();
      // outliers
      data.filter(v => v < lf || v > uf).forEach(v => { const px = f.X(v, lo, hi); ctx.fillStyle = c.red; ctx.beginPath(); ctx.arc(px, yMid, 6, 0, 7); ctx.fill(); });
      const nOut = data.filter(v => v < lf || v > uf).length;
      s.readout.innerHTML = 'Q1=<b>' + q1.toFixed(1) + '</b> · median=<b>' + q2.toFixed(1) + '</b> · Q3=<b>' + q3.toFixed(1) + '</b> · IQR=<b>' + iqr.toFixed(1) + '</b> · fences=[<b>' + lf.toFixed(1) + '</b>, <b>' + uf.toFixed(1) + '</b>] · outliers flagged: <b>' + nOut + '</b>';
    }
    s.redrawHook = draw;
    addSlider(s.controls, { label: 'Spread (σ)', min: 2, max: 16, step: 1, value: spread }, v => { spread = v; data = build(); draw(); });
    addSlider(s.controls, { label: 'Add extreme value (+)', min: 0, max: 50, step: 1, value: extreme }, v => { extreme = v; data = build(); draw(); });
    addBtn(s.controls, '🎲 Resample', 'ghost', () => { data = build(); draw(); });
    draw();
  };

  // Skewness morph
  Viz.skewness = function (node) {
    const s = scaffold(node, { title: 'Shape & skew: where mean, median, mode land', desc: 'Slide from left-skew to right-skew. The <b style="color:' + COL().gold + '">mean</b> always leans toward the long tail; the <b style="color:' + COL().accent3 + '">mode</b> sits at the peak.', height: 240 });
    let skew = 0; // -1..1
    function draw() {
      const c = COL(), ctx = s.ctx, w = s.w, h = s.h, f = frame(ctx, w, h, { b: 30, t: 16 });
      f.clear();
      // skew-normal-ish via two half gaussians
      const N = 240, xs = [], ys = []; let ymax = 0;
      const a = skew * 4;
      for (let i = 0; i <= N; i++) { const x = -4 + 8 * i / N; const y = 2 * normPdf(x, 0, 1) * normCdf(a * x, 0, 1); xs.push(x); ys.push(y); if (y > ymax) ymax = y; }
      // moments (numeric)
      let m0 = 0, m1 = 0; const dx = 8 / N;
      for (let i = 0; i <= N; i++) { m0 += ys[i] * dx; m1 += xs[i] * ys[i] * dx; }
      const mu = m1 / m0;
      // mode
      let modeX = xs[ys.indexOf(ymax)];
      // median (cdf)
      let cum = 0, medX = 0; for (let i = 0; i <= N; i++) { cum += ys[i] * dx / m0; if (cum >= .5) { medX = xs[i]; break; } }
      ctx.beginPath();
      for (let i = 0; i <= N; i++) { const px = f.X(xs[i], -4, 4), py = f.Y(ys[i], 0, ymax * 1.12); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.lineTo(f.X(4, -4, 4), f.Y(0, 0, ymax * 1.12)); ctx.lineTo(f.X(-4, -4, 4), f.Y(0, 0, ymax * 1.12)); ctx.closePath();
      const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, c.accent + '88'); g.addColorStop(1, c.accent + '11');
      ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = c.accent; ctx.lineWidth = 2; ctx.stroke();
      function vline(x, color, label, dy) { const px = f.X(x, -4, 4); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(px, f.Y(0, 0, ymax * 1.12)); ctx.lineTo(px, 30 + dy); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = color; ctx.font = '600 11px Inter'; ctx.textAlign = 'center'; ctx.fillText(label, px, 22 + dy); }
      vline(modeX, c.accent3, 'mode', 0); vline(medX, c.accent2, 'median', 16); vline(mu, c.gold, 'mean', 32);
      const lbl = skew < -0.1 ? 'Left (negative) skew → mean < median < mode' : skew > 0.1 ? 'Right (positive) skew → mode < median < mean' : 'Symmetric → mean ≈ median ≈ mode';
      s.readout.innerHTML = lbl;
    }
    s.redrawHook = draw;
    addSlider(s.controls, { label: 'Skew', min: -1, max: 1, step: 0.05, value: 0, fmt: v => v.toFixed(2) }, v => { skew = v; draw(); });
    draw();
  };

  /* =========================================================
     MACHINE LEARNING — Foundations
     ========================================================= */

  Viz.mlProblemMap = function (node) {
    const s = scaffold(node, { title: 'ML problem map: choose the task before the model', desc: 'Move between common AI/ML problem framings. The model family follows the decision, labels, and feedback loop.', height: 280 });
    const states = {
      supervised: { label: 'Supervised', color: '--accent-2', nodes: [['Features X', .18, .52], ['Labels y', .18, .24], ['Train model', .48, .38], ['Predict future', .78, .38], ['Metric', .78, .68]], lines: [[0, 2], [1, 2], [2, 3], [3, 4]] },
      unsupervised: { label: 'Unsupervised', color: '--gold', nodes: [['Raw data X', .18, .42], ['Representation', .43, .26], ['Clusters', .68, .28], ['Anomalies', .68, .56], ['Human naming', .43, .72]], lines: [[0, 1], [1, 2], [1, 3], [2, 4], [3, 4]] },
      ranking: { label: 'Ranking', color: '--green', nodes: [['User/context', .18, .30], ['Items', .18, .62], ['Scoring model', .48, .46], ['Ordered list', .76, .34], ['Clicks / value', .76, .66]], lines: [[0, 2], [1, 2], [2, 3], [3, 4]] },
      rl: { label: 'Reinforcement', color: '--red', nodes: [['State', .18, .48], ['Policy', .42, .28], ['Action', .66, .48], ['Reward', .42, .72], ['Environment', .82, .72]], lines: [[0, 1], [1, 2], [2, 4], [4, 3], [3, 1]] }
    };
    let mode = 'supervised';
    function draw() {
      const ctx = s.ctx, w = s.w, h = s.h, c = COL(), m = states[mode], color = col(m.color);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = c.panel; ctx.fillRect(22, 20, w - 44, h - 44);
      ctx.strokeStyle = c.border; ctx.strokeRect(22, 20, w - 44, h - 44);
      const pts = m.nodes.map(n => ({ text: n[0], x: n[1] * w, y: n[2] * h }));
      ctx.lineWidth = 2;
      m.lines.forEach(([a, b]) => {
        const A = pts[a], B = pts[b];
        ctx.strokeStyle = color + 'aa';
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
        const ang = Math.atan2(B.y - A.y, B.x - A.x), ax = B.x - Math.cos(ang) * 58, ay = B.y - Math.sin(ang) * 25;
        ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax - 8 * Math.cos(ang - .5), ay - 8 * Math.sin(ang - .5)); ctx.lineTo(ax - 8 * Math.cos(ang + .5), ay - 8 * Math.sin(ang + .5)); ctx.closePath(); ctx.fill();
      });
      pts.forEach(p => {
        const bw = Math.min(150, Math.max(92, p.text.length * 8 + 24)), bh = 38;
        ctx.fillStyle = '#0b0e17cc'; ctx.strokeStyle = color; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(p.x - bw / 2, p.y - bh / 2, bw, bh, 10); ctx.fill(); ctx.stroke();
        ctx.fillStyle = c.text; ctx.font = '700 12px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.text, p.x, p.y);
      });
      s.readout.innerHTML = '<b>' + m.label + '</b> framing: ' + (
        mode === 'supervised' ? 'you have labelled examples; optimize predictive performance on unseen data.' :
        mode === 'unsupervised' ? 'you discover structure, then validate the story with domain evidence.' :
        mode === 'ranking' ? 'you optimize ordering and user/business value, not just point prediction.' :
        'you learn actions from delayed rewards; use only when feedback is sequential and interactive.'
      );
    }
    addSeg(s.controls, [
      { label: 'Supervised', value: 'supervised' },
      { label: 'Unsupervised', value: 'unsupervised' },
      { label: 'Ranking', value: 'ranking' },
      { label: 'RL', value: 'rl' }
    ], mode, v => { mode = v; draw(); });
    s.redrawHook = draw; draw();
  };

  Viz.biasVariance = function (node) {
    const s = scaffold(node, { title: 'Bias–variance: model complexity vs validation error', desc: 'Increase complexity. Training error keeps falling, but validation error bottoms out and then rises when the model starts memorising noise.', height: 260 });
    let complexity = 4;
    function draw() {
      const ctx = s.ctx, w = s.w, h = s.h, c = COL(), f = frame(ctx, w, h, { l: 46, r: 20, t: 18, b: 42 });
      f.clear(); f.axes(0, 10, 0, 1, 'model complexity', 'error');
      function train(x) { return .78 * Math.exp(-x / 3.2) + .08; }
      function valid(x) { return .2 + .42 * Math.exp(-x / 2.2) + .024 * (x - 5.2) ** 2; }
      function curve(fn, color) {
        ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath();
        for (let i = 0; i <= 120; i++) { const x = i / 12, y = fn(x); const px = f.X(x, 0, 10), py = f.Y(y, 0, 1); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
        ctx.stroke();
      }
      curve(train, c.accent2); curve(valid, c.gold);
      const x = complexity, tr = train(x), va = valid(x), px = f.X(x, 0, 10);
      ctx.strokeStyle = c.red; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(px, f.pad.t); ctx.lineTo(px, h - f.pad.b); ctx.stroke(); ctx.setLineDash([]);
      [['train', tr, c.accent2], ['validation', va, c.gold]].forEach(([lab, y, color], i) => {
        ctx.fillStyle = color; ctx.beginPath(); ctx.arc(px, f.Y(y, 0, 1), 6, 0, 7); ctx.fill();
        ctx.font = '700 12px Inter'; ctx.textAlign = 'left'; ctx.fillText(lab, f.pad.l + 12, f.pad.t + 18 + i * 18);
      });
      const zone = x < 3 ? 'underfitting: high bias' : x > 7 ? 'overfitting: high variance' : 'healthy range: useful signal without memorising too much';
      s.readout.innerHTML = 'Complexity <b>' + x.toFixed(1) + '</b> → train error <b>' + tr.toFixed(2) + '</b>, validation error <b>' + va.toFixed(2) + '</b>. Diagnosis: <b>' + zone + '</b>.';
    }
    s.redrawHook = draw;
    addSlider(s.controls, { label: 'Complexity', min: 0, max: 10, step: .1, value: complexity, fmt: v => v.toFixed(1) }, v => { complexity = v; draw(); });
    draw();
  };

  Viz.mlGradientDescent = function (node) {
    const s = scaffold(node, { title: 'Gradient descent: learning rate as step size', desc: 'A tiny learning rate crawls. A reasonable one descends. A large one bounces around or diverges.', height: 260 });
    let lr = .18, iter = 0, x = -2.8, path = [];
    function loss(t) { return .12 * (t + 2.2) ** 2 * (t - 1.8) ** 2 + .18 * (t + .2) ** 2 + .4; }
    function grad(t) { const e = 1e-4; return (loss(t + e) - loss(t - e)) / (2 * e); }
    function reset() { iter = 0; x = -2.8; path = [x]; draw(); }
    function step() { x = Math.max(-3.4, Math.min(3.4, x - lr * grad(x))); path.push(x); iter++; draw(); }
    function draw() {
      const ctx = s.ctx, w = s.w, h = s.h, c = COL(), f = frame(ctx, w, h, { l: 42, r: 18, t: 16, b: 35 });
      f.clear(); f.axes(-3.5, 3.5, 0, 6, 'parameter θ', 'loss');
      ctx.strokeStyle = c.accent; ctx.lineWidth = 3; ctx.beginPath();
      for (let i = 0; i <= 220; i++) { const tx = -3.5 + 7 * i / 220, y = loss(tx); const px = f.X(tx, -3.5, 3.5), py = f.Y(y, 0, 6); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke();
      ctx.strokeStyle = c.gold; ctx.lineWidth = 1.5; ctx.beginPath();
      path.forEach((tx, i) => { const px = f.X(tx, -3.5, 3.5), py = f.Y(loss(tx), 0, 6); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
      ctx.stroke();
      ctx.fillStyle = c.red; ctx.beginPath(); ctx.arc(f.X(x, -3.5, 3.5), f.Y(loss(x), 0, 6), 7, 0, 7); ctx.fill();
      s.readout.innerHTML = 'iteration <b>' + iter + '</b> · θ=<b>' + x.toFixed(3) + '</b> · loss=<b>' + loss(x).toFixed(3) + '</b> · learning rate=<b>' + lr.toFixed(2) + '</b>';
    }
    s.redrawHook = draw;
    addSlider(s.controls, { label: 'Learning rate η', min: .02, max: .8, step: .02, value: lr, fmt: v => v.toFixed(2) }, v => { lr = v; draw(); });
    addBtn(s.controls, 'Step', '', step);
    addBtn(s.controls, 'Run 10', 'ghost', () => { for (let i = 0; i < 10; i++) step(); });
    addBtn(s.controls, 'Reset', 'ghost', reset);
    reset();
  };

  Viz.classificationThreshold = function (node) {
    const s = scaffold(node, { title: 'Threshold tuning: precision vs recall', desc: 'Move the threshold on predicted probabilities. Lower thresholds catch more positives; higher thresholds reduce false alarms.', height: 250 });
    let threshold = .5;
    const scores = [];
    for (let i = 0; i < 120; i++) scores.push({ y: 0, p: Math.max(0.02, Math.min(.98, .18 + Math.random() * .45 + randn() * .08)) });
    for (let i = 0; i < 36; i++) scores.push({ y: 1, p: Math.max(0.02, Math.min(.98, .48 + Math.random() * .42 + randn() * .08)) });
    function draw() {
      const ctx = s.ctx, w = s.w, h = s.h, c = COL(), f = frame(ctx, w, h, { l: 42, r: 18, t: 18, b: 38 });
      f.clear(); f.axes(0, 1, 0, 1, 'predicted probability', '');
      const bins = Array.from({ length: 20 }, () => ({ p: 0, n: 0 }));
      scores.forEach(r => { const b = Math.min(19, Math.floor(r.p * 20)); r.y ? bins[b].p++ : bins[b].n++; });
      const maxb = Math.max(...bins.map(b => b.p + b.n), 1);
      bins.forEach((b, i) => {
        const x = i / 20, bw = f.iw / 22, base = h - f.pad.b, hp = b.p / maxb * f.ih, hn = b.n / maxb * f.ih;
        ctx.fillStyle = c.red + '88'; ctx.fillRect(f.X(x, 0, 1), base - hn, bw, hn);
        ctx.fillStyle = c.green + 'aa'; ctx.fillRect(f.X(x, 0, 1), base - hn - hp, bw, hp);
      });
      const tx = f.X(threshold, 0, 1);
      ctx.strokeStyle = c.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tx, f.pad.t); ctx.lineTo(tx, h - f.pad.b); ctx.stroke();
      let tp = 0, fp = 0, tn = 0, fn = 0;
      scores.forEach(r => { const pred = r.p >= threshold; if (pred && r.y) tp++; else if (pred) fp++; else if (r.y) fn++; else tn++; });
      const precision = tp / Math.max(1, tp + fp), recall = tp / Math.max(1, tp + fn), f1 = 2 * precision * recall / Math.max(1e-9, precision + recall);
      s.readout.innerHTML = 'threshold=<b>' + threshold.toFixed(2) + '</b> · TP=<b>' + tp + '</b> FP=<b>' + fp + '</b> FN=<b>' + fn + '</b> TN=<b>' + tn + '</b> · precision=<b>' + precision.toFixed(2) + '</b> recall=<b>' + recall.toFixed(2) + '</b> F1=<b>' + f1.toFixed(2) + '</b>';
    }
    s.redrawHook = draw;
    addSlider(s.controls, { label: 'Threshold', min: .05, max: .95, step: .01, value: threshold, fmt: v => v.toFixed(2) }, v => { threshold = v; draw(); });
    draw();
  };

  Viz.decisionTreeSplit = function (node) {
    const s = scaffold(node, { title: 'Decision tree split: reduce impurity with one question', desc: 'Move the vertical split. A useful split separates classes and makes child nodes purer.', height: 270 });
    let split = .52;
    const pts = [];
    for (let i = 0; i < 90; i++) { const x = Math.random(), y = Math.random(); pts.push({ x, y, cls: (x + .35 * y + randn() * .12 > .62) ? 1 : 0 }); }
    function gini(a) { if (!a.length) return 0; const p = a.filter(v => v.cls).length / a.length; return 1 - p * p - (1 - p) * (1 - p); }
    function draw() {
      const ctx = s.ctx, w = s.w, h = s.h, c = COL(), pad = { l: 28, r: 18, t: 18, b: 28 }, iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = c.border; ctx.strokeRect(pad.l, pad.t, iw, ih);
      pts.forEach(p => { ctx.fillStyle = p.cls ? c.green : c.red; ctx.beginPath(); ctx.arc(pad.l + p.x * iw, pad.t + (1 - p.y) * ih, 5, 0, 7); ctx.fill(); });
      const sx = pad.l + split * iw; ctx.strokeStyle = c.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx, pad.t); ctx.lineTo(sx, pad.t + ih); ctx.stroke();
      const left = pts.filter(p => p.x < split), right = pts.filter(p => p.x >= split);
      const weighted = (left.length * gini(left) + right.length * gini(right)) / pts.length;
      ctx.fillStyle = c.text; ctx.font = '700 12px Inter'; ctx.textAlign = 'center'; ctx.fillText('x < ' + split.toFixed(2) + '?', sx, 14);
      s.readout.innerHTML = 'parent gini=<b>' + gini(pts).toFixed(3) + '</b> · left gini=<b>' + gini(left).toFixed(3) + '</b> · right gini=<b>' + gini(right).toFixed(3) + '</b> · weighted child impurity=<b>' + weighted.toFixed(3) + '</b>';
    }
    s.redrawHook = draw;
    addSlider(s.controls, { label: 'Split position', min: .1, max: .9, step: .01, value: split, fmt: v => v.toFixed(2) }, v => { split = v; draw(); });
    draw();
  };

  Viz.kmeansPlayground = function (node) {
    const s = scaffold(node, { title: 'K-means: assign points, move centroids, repeat', desc: 'Run one iteration at a time. Assignments depend on distance, so feature scaling matters in real datasets.', height: 280 });
    let K = 3, iter = 0, pts = [], centers = [];
    const colors = ['--accent-2', '--gold', '--red', '--green', '--blue'];
    function init() {
      pts = [];
      const blobs = [[.24, .28], [.72, .36], [.5, .75]];
      blobs.forEach(([cx, cy]) => { for (let i = 0; i < 34; i++) pts.push({ x: Math.max(.04, Math.min(.96, cx + randn() * .08)), y: Math.max(.04, Math.min(.96, cy + randn() * .08)), k: 0 }); });
      centers = Array.from({ length: K }, () => ({ x: .15 + Math.random() * .7, y: .15 + Math.random() * .7 }));
      iter = 0; assign(); draw();
    }
    function assign() {
      pts.forEach(p => {
        let best = 0, bd = Infinity;
        centers.forEach((c, k) => { const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2; if (d < bd) { bd = d; best = k; } });
        p.k = best;
      });
    }
    function move() {
      centers.forEach((c, k) => {
        const ps = pts.filter(p => p.k === k);
        if (ps.length) { c.x = mean(ps.map(p => p.x)); c.y = mean(ps.map(p => p.y)); }
      });
      assign(); iter++;
    }
    function draw() {
      const ctx = s.ctx, w = s.w, h = s.h, c = COL(), pad = 24, iw = w - pad * 2, ih = h - pad * 2;
      ctx.clearRect(0, 0, w, h); ctx.strokeStyle = c.border; ctx.strokeRect(pad, pad, iw, ih);
      pts.forEach(p => { ctx.fillStyle = col(colors[p.k % colors.length]) + 'bb'; ctx.beginPath(); ctx.arc(pad + p.x * iw, pad + (1 - p.y) * ih, 4, 0, 7); ctx.fill(); });
      centers.forEach((ctr, k) => {
        const x = pad + ctr.x * iw, y = pad + (1 - ctr.y) * ih;
        ctx.fillStyle = col(colors[k % colors.length]); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, y - 10); ctx.lineTo(x + 10, y); ctx.lineTo(x, y + 10); ctx.lineTo(x - 10, y); ctx.closePath(); ctx.fill(); ctx.stroke();
      });
      const inertia = pts.reduce((sum, p) => { const ctr = centers[p.k]; return sum + (p.x - ctr.x) ** 2 + (p.y - ctr.y) ** 2; }, 0);
      s.readout.innerHTML = 'iteration=<b>' + iter + '</b> · K=<b>' + K + '</b> · within-cluster SSE=<b>' + inertia.toFixed(3) + '</b>';
    }
    s.redrawHook = draw;
    addSlider(s.controls, { label: 'K', min: 2, max: 5, step: 1, value: K }, v => { K = v; init(); });
    addBtn(s.controls, 'One iteration', '', () => { move(); draw(); });
    addBtn(s.controls, 'Run 5', 'ghost', () => { for (let i = 0; i < 5; i++) move(); draw(); });
    addBtn(s.controls, 'Reseed', 'ghost', init);
    init();
  };

  Viz.neuralNetworkPlayground = function (node) {
    const s = scaffold(node, { title: 'Neural network decision boundary', desc: 'Change hidden units and non-linearity. More hidden units create a more flexible boundary, but flexibility needs regularisation and data.', height: 280 });
    let hidden = 4, act = 'relu';
    const pts = [];
    for (let i = 0; i < 180; i++) { const x = Math.random() * 2 - 1, y = Math.random() * 2 - 1; pts.push({ x, y, cls: (x * x + y * y + randn() * .08 < .42) ? 1 : 0 }); }
    function score(x, y) {
      let z = 0;
      for (let k = 0; k < hidden; k++) {
        const a = 2 * Math.PI * k / hidden, p = Math.cos(a) * x + Math.sin(a) * y - .35;
        z += act === 'tanh' ? Math.tanh(4 * p) : Math.max(0, 3 * p);
      }
      return z / hidden;
    }
    function draw() {
      const ctx = s.ctx, w = s.w, h = s.h, c = COL(), pad = 24, iw = w - 2 * pad, ih = h - 2 * pad;
      ctx.clearRect(0, 0, w, h);
      const cells = 44;
      for (let i = 0; i < cells; i++) for (let j = 0; j < cells; j++) {
        const x = i / (cells - 1) * 2 - 1, y = j / (cells - 1) * 2 - 1, on = score(x, y) > .18;
        ctx.fillStyle = on ? c.green + '22' : c.red + '22';
        ctx.fillRect(pad + i * iw / cells, pad + (cells - 1 - j) * ih / cells, iw / cells + 1, ih / cells + 1);
      }
      ctx.strokeStyle = c.border; ctx.strokeRect(pad, pad, iw, ih);
      pts.forEach(p => { ctx.fillStyle = p.cls ? c.green : c.red; ctx.beginPath(); ctx.arc(pad + (p.x + 1) / 2 * iw, pad + (1 - (p.y + 1) / 2) * ih, 4, 0, 7); ctx.fill(); });
      s.readout.innerHTML = 'Hidden units=<b>' + hidden + '</b> · activation=<b>' + act + '</b> · boundary complexity grows with representation capacity.';
    }
    s.redrawHook = draw;
    addSlider(s.controls, { label: 'Hidden units', min: 1, max: 12, step: 1, value: hidden }, v => { hidden = v; draw(); });
    addSeg(s.controls, [{ label: 'ReLU', value: 'relu' }, { label: 'tanh', value: 'tanh' }], act, v => { act = v; draw(); });
    draw();
  };

  Viz.activationExplorer = function (node) {
    const s = scaffold(node, { title: 'Activation functions and gradient flow', desc: 'Compare sigmoid, tanh, ReLU and GELU-like curves. Saturating activations can make gradients tiny.', height: 250 });
    let mode = 'relu';
    function fn(x) {
      if (mode === 'sigmoid') return 1 / (1 + Math.exp(-x));
      if (mode === 'tanh') return Math.tanh(x);
      if (mode === 'gelu') return 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3)));
      return Math.max(0, x);
    }
    function draw() {
      const ctx = s.ctx, w = s.w, h = s.h, c = COL(), f = frame(ctx, w, h, { l: 42, r: 18, t: 18, b: 35 });
      f.clear(); f.axes(-5, 5, -1.5, 5, 'input z', 'activation φ(z)');
      ctx.strokeStyle = c.accent2; ctx.lineWidth = 3; ctx.beginPath();
      for (let i = 0; i <= 220; i++) { const x = -5 + 10 * i / 220, y = fn(x), px = f.X(x, -5, 5), py = f.Y(y, -1.5, 5); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke();
      s.readout.innerHTML = '<b>' + mode + '</b>: ' + (
        mode === 'relu' ? 'simple, sparse, avoids saturation on positive side; common default.' :
        mode === 'sigmoid' ? 'squashes to 0..1 but saturates, causing tiny gradients for large |z|.' :
        mode === 'tanh' ? 'zero-centered sigmoid-like curve; still saturates.' :
        'smooth ReLU-like activation used in many transformer-style networks.'
      );
    }
    addSeg(s.controls, [{ label: 'ReLU', value: 'relu' }, { label: 'Sigmoid', value: 'sigmoid' }, { label: 'tanh', value: 'tanh' }, { label: 'GELU', value: 'gelu' }], mode, v => { mode = v; draw(); });
    s.redrawHook = draw; draw();
  };

  Viz.cnnKernel = function (node) {
    const s = scaffold(node, { title: 'Convolution filter scanning an image', desc: 'A 3×3 edge detector slides over the grid. Bright output means the local patch matches the filter.', height: 290 });
    let pos = 1;
    const grid = [
      [0,0,0,1,1,1,1],
      [0,0,0,1,1,1,1],
      [0,0,0,1,1,1,1],
      [0,0,0,1,1,1,1],
      [0,0,0,1,1,1,1],
      [0,0,0,1,1,1,1],
      [0,0,0,1,1,1,1]
    ];
    const K = [[-1,0,1],[-1,0,1],[-1,0,1]];
    function convAt(x, y) { let v = 0; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) v += grid[y + r][x + c] * K[r][c]; return v; }
    function draw() {
      const ctx = s.ctx, w = s.w, h = s.h, c = COL(); ctx.clearRect(0,0,w,h);
      const size = Math.min(34, (w - 80) / 11), ox = 34, oy = 30;
      for (let r = 0; r < 7; r++) for (let colm = 0; colm < 7; colm++) {
        const v = grid[r][colm]; ctx.fillStyle = v ? c.accent2 : c.panel; ctx.fillRect(ox + colm * size, oy + r * size, size - 2, size - 2);
      }
      const x = pos % 5, y = Math.floor(pos / 5);
      ctx.strokeStyle = c.gold; ctx.lineWidth = 3; ctx.strokeRect(ox + x * size - 1, oy + y * size - 1, size * 3 - 1, size * 3 - 1);
      const outX = ox + 8 * size + 30, outY = oy;
      for (let r = 0; r < 5; r++) for (let colm = 0; colm < 5; colm++) {
        const v = Math.max(0, Math.min(1, (convAt(colm,r) + 3) / 6)); ctx.fillStyle = 'rgba(255,206,92,' + (.15 + .8 * v) + ')';
        ctx.fillRect(outX + colm * size, outY + r * size, size - 2, size - 2);
      }
      ctx.fillStyle = c.text; ctx.font = '700 12px Inter'; ctx.textAlign = 'center'; ctx.fillText('input', ox + 3.5 * size, oy - 10); ctx.fillText('feature map', outX + 2.5 * size, outY - 10);
      s.readout.innerHTML = 'Current patch response=<b>' + convAt(x,y).toFixed(1) + '</b>. This vertical-edge filter activates strongly near the boundary.';
    }
    addSlider(s.controls, { label: 'Kernel position', min: 0, max: 24, step: 1, value: pos }, v => { pos = v; draw(); });
    s.redrawHook = draw; draw();
  };

  Viz.attentionHeatmap = function (node) {
    const s = scaffold(node, { title: 'Self-attention heatmap', desc: 'Select a query token. Brighter cells are tokens it attends to more strongly.', height: 270 });
    const toks = ['The','model','retrieves','relevant','context','before','answering'];
    let q = 1;
    function weight(i,j) {
      const semantic = (i === 1 && [2,6].includes(j)) || (i === 6 && [2,4].includes(j)) || (i === 4 && [3,5].includes(j)) ? 2.2 : 0;
      return Math.exp(1.3 - Math.abs(i-j)*.45 + semantic + (i===j ? .9 : 0));
    }
    function draw() {
      const ctx=s.ctx,w=s.w,h=s.h,c=COL(); ctx.clearRect(0,0,w,h);
      const n=toks.length, size=Math.min(44,(w-100)/n), ox=70, oy=30;
      for(let i=0;i<n;i++){ let row=[]; for(let j=0;j<n;j++) row.push(weight(i,j)); const sum=row.reduce((a,b)=>a+b,0);
        for(let j=0;j<n;j++){ const v=row[j]/sum, alpha=.12+Math.min(.88,v*5); ctx.fillStyle='rgba(124,92,255,'+alpha+')'; ctx.fillRect(ox+j*size,oy+i*size,size-2,size-2);
          if(i===q){ ctx.strokeStyle=c.gold; ctx.lineWidth=2; ctx.strokeRect(ox+j*size,oy+i*size,size-2,size-2); }
        }
      }
      ctx.fillStyle=c.text; ctx.font='11px Inter'; ctx.textAlign='right'; toks.forEach((t,i)=>ctx.fillText(t,ox-8,oy+i*size+size*.62));
      ctx.save(); ctx.translate(ox,oy-8); ctx.textAlign='left'; toks.forEach((t,i)=>{ctx.save();ctx.translate(i*size+5,0);ctx.rotate(-.55);ctx.fillText(t,0,0);ctx.restore();}); ctx.restore();
      const vals=toks.map((t,j)=>({t,v:weight(q,j)})); const total=vals.reduce((a,b)=>a+b.v,0); vals.sort((a,b)=>b.v-a.v);
      s.readout.innerHTML='Query token <b>'+toks[q]+'</b> attends most to <b>'+vals.slice(0,3).map(x=>x.t+' '+(x.v/total*100).toFixed(0)+'%').join(', ')+'</b>.';
    }
    addSlider(s.controls,{label:'Query token',min:0,max:toks.length-1,step:1,value:q,fmt:v=>toks[v]},v=>{q=v;draw();});
    s.redrawHook=draw; draw();
  };

  Viz.recommenderFlow = function(node) {
    const s=scaffold(node,{title:'Recommender system pipeline',desc:'A practical recommender is a multi-stage system, not one model.',height:250});
    let stage=1;
    function draw(){const ctx=s.ctx,w=s.w,h=s.h,c=COL();ctx.clearRect(0,0,w,h);const labels=['User signals','Candidate generation','Ranking model','Re-ranking rules','Feedback logs'];const xs=labels.map((_,i)=>60+i*(w-120)/(labels.length-1));const y=h/2-10;
      for(let i=0;i<labels.length-1;i++){ctx.strokeStyle=c.border;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(xs[i]+55,y);ctx.lineTo(xs[i+1]-55,y);ctx.stroke();}
      labels.forEach((lab,i)=>{ctx.fillStyle=i<=stage?c.accent2:c.panel;ctx.strokeStyle=i===stage?c.gold:c.border;ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(xs[i]-58,y-28,116,56,12);ctx.fill();ctx.stroke();ctx.fillStyle=i<=stage?'#061b1a':c.text;ctx.font='700 11px Inter';ctx.textAlign='center';lab.split(' ').forEach((p,k)=>ctx.fillText(p,xs[i],y-4+k*14));});
      s.readout.innerHTML='Stage <b>'+labels[stage]+'</b>: '+['collect context, history, item views, purchases, skips','quickly retrieve maybe-relevant items','score candidates with richer features','apply diversity, safety, business and freshness constraints','log impressions and outcomes for learning'][stage]+'.';
    }
    addSlider(s.controls,{label:'Pipeline stage',min:0,max:4,step:1,value:stage,fmt:v=>String(+v+1)},v=>{stage=v;draw();});s.redrawHook=draw;draw();
  };

  Viz.ragPipeline = function(node) {
    const s=scaffold(node,{title:'RAG pipeline: retrieval before generation',desc:'Click through the path from documents to grounded answer.',height:250});
    let step=2;
    function draw(){const ctx=s.ctx,w=s.w,h=s.h,c=COL();ctx.clearRect(0,0,w,h);const labels=['Docs','Chunks','Embeddings','Vector search','Rerank','LLM answer'];const xs=labels.map((_,i)=>50+i*(w-100)/(labels.length-1));const y=h/2-5;
      labels.forEach((lab,i)=>{if(i){ctx.strokeStyle=i<=step?c.accent:c.border;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(xs[i-1]+36,y);ctx.lineTo(xs[i]-36,y);ctx.stroke();}ctx.fillStyle=i<=step?c.accent+'44':c.panel;ctx.strokeStyle=i===step?c.gold:c.border;ctx.beginPath();ctx.roundRect(xs[i]-38,y-30,76,60,12);ctx.fill();ctx.stroke();ctx.fillStyle=c.text;ctx.font='700 10px Inter';ctx.textAlign='center';lab.split(' ').forEach((p,k)=>ctx.fillText(p,xs[i],y-4+k*13));});
      s.readout.innerHTML='Current step: <b>'+labels[step]+'</b>. '+['Source knowledge base.','Split content into retrievable units.','Map text to semantic vectors.','Find likely relevant context.','Improve precision before prompt.','Generate answer grounded in retrieved context.'][step];
    }
    addSlider(s.controls,{label:'RAG step',min:0,max:5,step:1,value:step,fmt:v=>String(+v+1)},v=>{step=v;draw();});s.redrawHook=draw;draw();
  };

  Viz.mlLifecycle = function(node) {
    const s=scaffold(node,{title:'Production ML lifecycle',desc:'A production model is a loop: data, train, validate, deploy, monitor, improve.',height:260});
    let active=0; const labels=['Data','Features','Train','Validate','Deploy','Monitor'];
    function draw(){const ctx=s.ctx,w=s.w,h=s.h,c=COL();ctx.clearRect(0,0,w,h);const cx=w/2,cy=h/2,r=Math.min(w,h)*.34;labels.forEach((lab,i)=>{const a=-Math.PI/2+i*2*Math.PI/labels.length,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;ctx.strokeStyle=c.border;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);ctx.stroke();ctx.fillStyle=i===active?c.gold:c.accent2;ctx.beginPath();ctx.arc(x,y,35,0,7);ctx.fill();ctx.fillStyle=i===active?'#211700':'#061b1a';ctx.font='700 11px Inter';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(lab,x,y);});ctx.fillStyle=c.panel;ctx.strokeStyle=c.border;ctx.beginPath();ctx.arc(cx,cy,42,0,7);ctx.fill();ctx.stroke();ctx.fillStyle=c.text;ctx.font='800 12px Inter';ctx.fillText('ML',cx,cy);s.readout.innerHTML='<b>'+labels[active]+'</b>: '+['quality, labels, lineage, privacy','consistent training/serving transformations','reproducible experiment and artifact','offline metrics, slices, calibration','serving, fallback, rollback','drift, latency, cost, outcomes'][active]+'.';}
    addSlider(s.controls,{label:'Lifecycle step',min:0,max:5,step:1,value:active,fmt:v=>labels[v]},v=>{active=v;draw();});s.redrawHook=draw;draw();
  };

  Viz.driftMonitor = function(node) {
    const s=scaffold(node,{title:'Drift monitor: live data moves away from training',desc:'Shift the live distribution. Alerts fire when the mean moves several training standard deviations.',height:250});
    let shift=0;
    function draw(){const ctx=s.ctx,w=s.w,h=s.h,c=COL(),f=frame(ctx,w,h,{l:40,r:18,t:18,b:35});f.clear();f.axes(-4,6,0,.45,'feature value','density');function curve(mu,color){ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<=220;i++){const x=-4+10*i/220,y=normPdf(x,mu,1);const px=f.X(x,-4,6),py=f.Y(y,0,.45);i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();}curve(0,c.accent2);curve(shift,c.gold);const z=Math.abs(shift);s.readout.innerHTML='Training mean=<b>0</b>, live mean=<b>'+shift.toFixed(1)+'</b>, drift z-score=<b>'+z.toFixed(1)+'</b> · status: <b style="color:'+(z>3?c.red:z>2?c.gold:c.green)+'">'+(z>3?'alert':z>2?'watch':'normal')+'</b>.';}
    addSlider(s.controls,{label:'Live distribution shift',min:-1,max:5,step:.1,value:shift,fmt:v=>v.toFixed(1)},v=>{shift=v;draw();});s.redrawHook=draw;draw();
  };

  /* =========================================================
     MODULE 2 — Probability
     ========================================================= */

  // Venn diagram with addition rule
  Viz.venn = function (node) {
    const s = scaffold(node, { title: 'Venn diagram & the addition rule', desc: 'Drag the circles or use sliders. Watch <span style="font-family:var(--mono)">P(A∪B) = P(A) + P(B) − P(A∩B)</span> stay balanced.', height: 260 });
    let pa = 0.5, pb = 0.4, overlap = 0.18;
    function draw() {
      const c = COL(), ctx = s.ctx, w = s.w, h = s.h; ctx.clearRect(0, 0, w, h);
      const cy = h / 2, R = Math.min(h, w) * 0.32;
      // place circles so overlap roughly reflects ratio
      const ov = Math.min(overlap, Math.min(pa, pb) - 0.001);
      const sep = R * (2 - 1.4 * (ov / Math.min(pa, pb)));
      const ax = w / 2 - sep / 2, bx = w / 2 + sep / 2;
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = c.accent + '55'; ctx.beginPath(); ctx.arc(ax, cy, R, 0, 7); ctx.fill();
      ctx.fillStyle = c.accent2 + '55'; ctx.beginPath(); ctx.arc(bx, cy, R, 0, 7); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = 2; ctx.strokeStyle = c.accent; ctx.beginPath(); ctx.arc(ax, cy, R, 0, 7); ctx.stroke();
      ctx.strokeStyle = c.accent2; ctx.beginPath(); ctx.arc(bx, cy, R, 0, 7); ctx.stroke();
      ctx.fillStyle = c.text; ctx.font = '700 18px Inter'; ctx.textAlign = 'center';
      ctx.fillText('A', ax - R * 0.5, cy - R * 0.6); ctx.fillText('B', bx + R * 0.5, cy - R * 0.6);
      ctx.font = '600 13px Inter'; ctx.fillStyle = c.dim;
      ctx.fillText('P(A)=' + (pa - ov).toFixed(2), ax - R * 0.35, cy);
      ctx.fillText('P(B)=' + (pb - ov).toFixed(2), bx + R * 0.35, cy);
      ctx.fillStyle = c.gold; ctx.fillText('∩ ' + ov.toFixed(2), w / 2, cy);
      const uni = pa + pb - ov;
      s.readout.innerHTML = 'P(A∪B) = ' + pa.toFixed(2) + ' + ' + pb.toFixed(2) + ' − ' + ov.toFixed(2) + ' = <b>' + uni.toFixed(2) + '</b>' + (uni > 1 ? ' ⚠ exceeds 1 — lower a probability' : '') + ' &nbsp;·&nbsp; P(neither)=<b>' + Math.max(0, 1 - uni).toFixed(2) + '</b>';
    }
    s.redrawHook = draw;
    addSlider(s.controls, { label: 'P(A)', min: 0.1, max: 0.9, step: 0.02, value: pa, fmt: v => v.toFixed(2) }, v => { pa = v; overlap = Math.min(overlap, pa, pb); draw(); });
    addSlider(s.controls, { label: 'P(B)', min: 0.1, max: 0.9, step: 0.02, value: pb, fmt: v => v.toFixed(2) }, v => { pb = v; overlap = Math.min(overlap, pa, pb); draw(); });
    addSlider(s.controls, { label: 'P(A∩B)', min: 0, max: 0.5, step: 0.02, value: overlap, fmt: v => v.toFixed(2) }, v => { overlap = Math.min(v, pa, pb); draw(); });
    draw();
  };

  // Dice sum distribution
  Viz.diceSum = function (node) {
    const s = scaffold(node, { title: 'Counting your way to probability: sum of two dice', desc: 'All 36 equally-likely outcomes grouped by sum. Roll thousands of times and watch the empirical bars converge to the theoretical triangle.', height: 240 });
    const counts = {}; let total = 0;
    function theo(k) { return (6 - Math.abs(7 - k)) / 36; }
    function draw() {
      const c = COL(), ctx = s.ctx, w = s.w, h = s.h, f = frame(ctx, w, h, { b: 30, t: 14 });
      f.clear(); f.axes(1.5, 12.5, 0, 0.19, 'sum of two dice', null);
      const sums = []; for (let k = 2; k <= 12; k++) sums.push(k);
      const bw = f.iw / 11 * 0.7;
      sums.forEach(k => {
        const cx = f.X(k, 1.5, 12.5);
        // theoretical outline
        const ty = f.Y(theo(k), 0, 0.19);
        ctx.strokeStyle = c.gold; ctx.lineWidth = 1.5; ctx.strokeRect(cx - bw / 2, ty, bw, f.Y(0, 0, 0.19) - ty);
        // empirical
        const emp = total ? (counts[k] || 0) / total : 0;
        const ey = f.Y(emp, 0, 0.19);
        ctx.fillStyle = c.accent2 + 'cc'; ctx.fillRect(cx - bw / 2, ey, bw, f.Y(0, 0, 0.19) - ey);
        ctx.fillStyle = c.faint; ctx.font = '10px Inter'; ctx.textAlign = 'center'; ctx.fillText(k, cx, h - 16);
      });
      ctx.fillStyle = c.gold; ctx.font = '11px Inter'; ctx.textAlign = 'right'; ctx.fillText('▭ theoretical', w - 20, 16);
      ctx.fillStyle = c.accent2; ctx.fillText('▮ empirical', w - 20, 30);
      s.readout.innerHTML = 'rolls: <b>' + total + '</b> · most likely sum is <b>7</b> (P=6/36≈0.167) — the sum with the most ways to occur';
    }
    s.redrawHook = draw;
    function roll(n) { for (let i = 0; i < n; i++) { const k = (1 + (Math.random() * 6 | 0)) + (1 + (Math.random() * 6 | 0)); counts[k] = (counts[k] || 0) + 1; total++; } draw(); }
    let auto = null;
    addBtn(s.controls, 'Roll ×100', '', () => roll(100));
    addBtn(s.controls, 'Roll ×1000', '', () => roll(1000));
    const ab = addBtn(s.controls, '▶ Auto-roll', 'ghost', function () { if (auto) { clearInterval(auto); auto = null; this.textContent = '▶ Auto-roll'; } else { auto = setInterval(() => roll(50), 60); this.textContent = '⏸ Stop'; } });
    addBtn(s.controls, '↺ Reset', 'ghost', () => { for (const k in counts) delete counts[k]; total = 0; draw(); });
    draw();
  };

  /* =========================================================
     MODULE 3 — Bayes & distributions
     ========================================================= */

  // Bayes base-rate: 1000 people grid
  Viz.bayesBaseRate = function (node) {
    const s = scaffold(node, { title: 'The base-rate trap: why a 99% test can be usually wrong', desc: 'Each square is a person among 1000. Red = has disease. Gold ring = tests positive. Posterior P(disease | positive) is the share of rings that are red.', height: 300 });
    let prev = 0.01, sens = 0.99, fpr = 0.05;
    function draw() {
      const c = COL(), ctx = s.ctx, w = s.w, h = s.h; ctx.clearRect(0, 0, w, h);
      const N = 1000, cols = 50, rows = 20; const cell = Math.min((w - 20) / cols, (h - 60) / rows); const gx = (w - cell * cols) / 2, gy = 8;
      const sick = Math.round(N * prev);
      let tpRing = 0, fpRing = 0;
      for (let i = 0; i < N; i++) {
        const r = Math.floor(i / cols), cc = i % cols; const x = gx + cc * cell, y = gy + r * cell;
        const isSick = i < sick;
        const pos = isSick ? (Math.random() < sens) : (Math.random() < fpr);
        // deterministic-ish: use index thresholds for stability
        const posDet = isSick ? (i < sick * sens) : ((i - sick) < (N - sick) * fpr);
        ctx.fillStyle = isSick ? c.red : c.green + '99';
        ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
        if (posDet) { ctx.strokeStyle = c.gold; ctx.lineWidth = 1.8; ctx.strokeRect(x + 1, y + 1, cell - 2, cell - 2); if (isSick) tpRing++; else fpRing++; }
      }
      const post = tpRing + fpRing > 0 ? tpRing / (tpRing + fpRing) : 0;
      const pAlg = (sens * prev) / (sens * prev + fpr * (1 - prev));
      s.readout.innerHTML = 'sick: <b>' + sick + '</b> · true positives: <b>' + tpRing + '</b> · false positives: <b>' + fpRing + '</b> &nbsp;⟹&nbsp; P(disease | +) = ' + tpRing + '/' + (tpRing + fpRing) + ' ≈ <b>' + (post * 100).toFixed(0) + '%</b> (Bayes: ' + (pAlg * 100).toFixed(0) + '%)';
    }
    s.redrawHook = draw;
    addSlider(s.controls, { label: 'Prevalence (base rate)', min: 0.005, max: 0.5, step: 0.005, value: prev, fmt: v => (v * 100).toFixed(1) + '%' }, v => { prev = v; draw(); });
    addSlider(s.controls, { label: 'Sensitivity P(+|D)', min: 0.5, max: 1, step: 0.01, value: sens, fmt: v => (v * 100).toFixed(0) + '%' }, v => { sens = v; draw(); });
    addSlider(s.controls, { label: 'False-positive P(+|¬D)', min: 0, max: 0.3, step: 0.01, value: fpr, fmt: v => (v * 100).toFixed(0) + '%' }, v => { fpr = v; draw(); });
    draw();
  };

  // Distribution explorer: binomial / poisson / normal
  Viz.distExplorer = function (node) {
    const s = scaffold(node, { title: 'Distribution explorer', desc: 'Switch families and drag parameters. See the PMF/PDF (bars/curve) and how Binomial → Poisson → Normal as n grows.', height: 270 });
    let kind = 'binomial', n = 20, p = 0.3, lam = 4, mu = 0, sig = 1;
    const ctrlBox = document.createElement('div'); ctrlBox.className = 'viz-controls'; s.controls.parentNode.insertBefore(ctrlBox, s.controls);
    function rebuild() {
      s.controls.innerHTML = '';
      if (kind === 'binomial') {
        addSlider(s.controls, { label: 'n (trials)', min: 1, max: 60, step: 1, value: n }, v => { n = v; draw(); });
        addSlider(s.controls, { label: 'p (success)', min: 0.02, max: 0.98, step: 0.02, value: p, fmt: v => v.toFixed(2) }, v => { p = v; draw(); });
      } else if (kind === 'poisson') {
        addSlider(s.controls, { label: 'λ (rate)', min: 0.5, max: 25, step: 0.5, value: lam, fmt: v => v.toFixed(1) }, v => { lam = v; draw(); });
      } else {
        addSlider(s.controls, { label: 'μ (mean)', min: -3, max: 3, step: 0.1, value: mu, fmt: v => v.toFixed(1) }, v => { mu = v; draw(); });
        addSlider(s.controls, { label: 'σ (std dev)', min: 0.4, max: 2.5, step: 0.1, value: sig, fmt: v => v.toFixed(1) }, v => { sig = v; draw(); });
      }
      draw();
    }
    function draw() {
      const c = COL(), ctx = s.ctx, w = s.w, h = s.h, f = frame(ctx, w, h, { b: 30, t: 14 });
      f.clear();
      if (kind === 'normal') {
        const x0 = -5, x1 = 5; let ymax = normPdf(mu, mu, sig) * 1.15;
        f.axes(x0, x1, 0, ymax, 'x', 'density');
        ctx.beginPath();
        for (let i = 0; i <= 300; i++) { const x = x0 + (x1 - x0) * i / 300; const y = normPdf(x, mu, sig); const px = f.X(x, x0, x1), py = f.Y(y, 0, ymax); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
        ctx.lineTo(f.X(x1, x0, x1), f.Y(0, 0, ymax)); ctx.lineTo(f.X(x0, x0, x1), f.Y(0, 0, ymax)); ctx.closePath();
        const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, c.accent + '88'); g.addColorStop(1, c.accent + '11'); ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = c.accent; ctx.lineWidth = 2; ctx.stroke();
        s.readout.innerHTML = 'Normal(μ=' + mu.toFixed(1) + ', σ=' + sig.toFixed(1) + ') · mean=<b>' + mu.toFixed(2) + '</b> · var=<b>' + (sig * sig).toFixed(2) + '</b> · ~68% within 1σ, ~95% within 2σ';
        return;
      }
      // discrete
      const kmax = kind === 'binomial' ? n : Math.max(12, Math.ceil(lam + 4 * Math.sqrt(lam)));
      const pmf = []; let ymax = 0;
      for (let k = 0; k <= kmax; k++) { const pr = kind === 'binomial' ? binomPmf(k, n, p) : poissonPmf(k, lam); pmf.push(pr); if (pr > ymax) ymax = pr; }
      ymax *= 1.15;
      f.axes(-0.5, kmax + 0.5, 0, ymax, 'k', 'P(X=k)');
      const bw = f.iw / (kmax + 1) * 0.78;
      const m = kind === 'binomial' ? n * p : lam; const vv = kind === 'binomial' ? n * p * (1 - p) : lam;
      pmf.forEach((pr, k) => {
        const cx = f.X(k, -0.5, kmax + 0.5); const py = f.Y(pr, 0, ymax);
        ctx.fillStyle = c.accent2 + 'cc'; ctx.fillRect(cx - bw / 2, py, bw, f.Y(0, 0, ymax) - py);
      });
      // normal approx overlay
      ctx.strokeStyle = c.gold; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.beginPath();
      for (let i = 0; i <= 200; i++) { const x = i / 200 * kmax; const y = normPdf(x, m, Math.sqrt(vv)); const px = f.X(x, -0.5, kmax + 0.5), py = f.Y(y, 0, ymax); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke(); ctx.setLineDash([]);
      s.readout.innerHTML = (kind === 'binomial' ? 'Binomial(n=' + n + ', p=' + p.toFixed(2) + ')' : 'Poisson(λ=' + lam.toFixed(1) + ')') + ' · mean=<b>' + m.toFixed(2) + '</b> · var=<b>' + vv.toFixed(2) + '</b> · gold = Normal approximation';
    }
    addSeg(ctrlBox, [{ label: 'Binomial', value: 'binomial' }, { label: 'Poisson', value: 'poisson' }, { label: 'Normal', value: 'normal' }], kind, v => { kind = v; rebuild(); });
    s.redrawHook = draw; rebuild();
  };

  // Normal area / z-score
  Viz.normalArea = function (node) {
    const s = scaffold(node, { title: 'The 68–95–99.7 rule & z-scores', desc: 'Shade the area (= probability) between two z-scores. Standardising any normal to <i>z</i> is the master key to tables, p-values and CIs.', height: 240 });
    let a = -1, b = 1;
    function draw() {
      const c = COL(), ctx = s.ctx, w = s.w, h = s.h, f = frame(ctx, w, h, { b: 30, t: 14 });
      f.clear(); const x0 = -4, x1 = 4, ymax = 0.45;
      f.axes(x0, x1, 0, ymax, 'z (standard deviations from mean)', null);
      // shaded region
      ctx.beginPath(); const lo = Math.min(a, b), hi = Math.max(a, b);
      ctx.moveTo(f.X(lo, x0, x1), f.Y(0, 0, ymax));
      for (let x = lo; x <= hi; x += 0.02) ctx.lineTo(f.X(x, x0, x1), f.Y(normPdf(x, 0, 1), 0, ymax));
      ctx.lineTo(f.X(hi, x0, x1), f.Y(0, 0, ymax)); ctx.closePath();
      ctx.fillStyle = c.gold + '55'; ctx.fill();
      // curve
      ctx.beginPath(); for (let i = 0; i <= 300; i++) { const x = x0 + 8 * i / 300; const px = f.X(x, x0, x1), py = f.Y(normPdf(x, 0, 1), 0, ymax); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.strokeStyle = c.accent; ctx.lineWidth = 2; ctx.stroke();
      [a, b].forEach(v => { const px = f.X(v, x0, x1); ctx.strokeStyle = c.gold; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(px, f.Y(0, 0, ymax)); ctx.lineTo(px, 30); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = c.gold; ctx.font = '600 11px Inter'; ctx.textAlign = 'center'; ctx.fillText('z=' + v.toFixed(2), px, 22); });
      const area = normCdf(hi, 0, 1) - normCdf(lo, 0, 1);
      s.readout.innerHTML = 'P(' + lo.toFixed(2) + ' < Z < ' + hi.toFixed(2) + ') = <b>' + (area * 100).toFixed(1) + '%</b> of the area';
    }
    s.redrawHook = draw;
    const inpA = addSlider(s.controls, { label: 'left z', min: -4, max: 4, step: 0.1, value: a, fmt: v => v.toFixed(1) }, v => { a = v; draw(); });
    const inpB = addSlider(s.controls, { label: 'right z', min: -4, max: 4, step: 0.1, value: b, fmt: v => v.toFixed(1) }, v => { b = v; draw(); });
    function preset(la, lb) { inpA.value = la; inpB.value = lb; inpA.dispatchEvent(new Event('input')); inpB.dispatchEvent(new Event('input')); }
    addBtn(s.controls, '±1σ (68%)', 'ghost', () => preset(-1, 1));
    addBtn(s.controls, '±2σ (95%)', 'ghost', () => preset(-2, 2));
    addBtn(s.controls, '±3σ (99.7%)', 'ghost', () => preset(-3, 3));
    draw();
  };

  /* =========================================================
     MODULE 4 — Sampling & hypothesis testing
     ========================================================= */

  // Central Limit Theorem
  Viz.clt = function (node) {
    const s = scaffold(node, { title: 'The Central Limit Theorem, live', desc: 'Pick a wild population, then repeatedly draw samples of size n and plot their <b>means</b>. No matter the population shape, the means pile up into a bell — narrower as n grows.', height: 300 });
    let pop = 'exponential', nSize = 30; let means = [];
    function sampleOne() {
      let x;
      if (pop === 'uniform') x = Math.random();
      else if (pop === 'exponential') x = -Math.log(1 - Math.random());
      else if (pop === 'bimodal') x = Math.random() < .5 ? randn() * .12 + .25 : randn() * .12 + .75;
      else x = Math.random() < .85 ? Math.random() * .3 : .7 + Math.random() * .3; // skewed-spiky
      return x;
    }
    function drawMean() { let sm = 0; for (let i = 0; i < nSize; i++) sm += sampleOne(); return sm / nSize; }
    function draw() {
      const c = COL(), ctx = s.ctx, w = s.w, h = s.h; ctx.clearRect(0, 0, w, h);
      const topH = h * 0.34, botY = topH + 18;
      // population sketch (top)
      const fp = frame(ctx, w, topH, { b: 18, t: 12, l: 30, r: 14 });
      ctx.fillStyle = c.faint; ctx.font = '11px Inter'; ctx.textAlign = 'left'; ctx.fillText('Population (draw from here)', 36, 14);
      const bins = 40, hist = new Array(bins).fill(0); const NP = 4000; let lo = Infinity, hi = -Infinity; const buf = [];
      for (let i = 0; i < NP; i++) { const x = sampleOne(); buf.push(x); if (x < lo) lo = x; if (x > hi) hi = x; }
      buf.forEach(x => { let b = Math.floor((x - lo) / (hi - lo) * bins); if (b >= bins) b = bins - 1; if (b < 0) b = 0; hist[b]++; });
      const hmax = Math.max(...hist);
      const bw = (w - 44) / bins;
      hist.forEach((v, i) => { const ph = v / hmax * (topH - 30); ctx.fillStyle = c.accent + '99'; ctx.fillRect(30 + i * bw, topH - 16 - ph, bw - 1, ph); });
      // sampling distribution (bottom)
      ctx.fillStyle = c.faint; ctx.fillText('Distribution of the sample MEAN (n=' + nSize + ')', 36, botY + 2);
      const fb = frame(ctx, w, h, { b: 28, t: botY + 8, l: 30, r: 14 });
      if (means.length) {
        const mlo = Math.min(...means), mhi = Math.max(...means); const range = (mhi - mlo) || 1;
        const mb = 46, mh = new Array(mb).fill(0);
        means.forEach(m => { let b = Math.floor((m - mlo) / range * mb); if (b >= mb) b = mb - 1; if (b < 0) b = 0; mh[b]++; });
        const mmax = Math.max(...mh); const mbw = fb.iw / mb;
        mh.forEach((v, i) => { const ph = v / mmax * fb.ih; ctx.fillStyle = c.accent2 + 'cc'; ctx.fillRect(fb.pad.l + i * mbw, h - fb.pad.b - ph, mbw - 1, ph); });
        // overlay normal
        const mm = mean(means), sd = Math.sqrt(variance(means));
        ctx.strokeStyle = c.gold; ctx.lineWidth = 2; ctx.beginPath();
        for (let i = 0; i <= 120; i++) { const x = mlo + range * i / 120; const y = normPdf(x, mm, sd); const px = fb.X(x, mlo, mhi), py = h - fb.pad.b - y / (1 / (sd * SQRT2PI)) * fb.ih; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
        ctx.stroke();
        s.readout.innerHTML = 'samples drawn: <b>' + means.length + '</b> · mean of means = <b>' + mm.toFixed(3) + '</b> · SE (spread) = <b>' + sd.toFixed(3) + '</b> → shrinks like σ/√n (gold = fitted Normal)';
      } else s.readout.innerHTML = 'Click “Draw” to start sampling.';
    }
    s.redrawHook = draw;
    addSeg(s.controls, [{ label: 'Exponential', value: 'exponential' }, { label: 'Uniform', value: 'uniform' }, { label: 'Bimodal', value: 'bimodal' }, { label: 'Skewed', value: 'skewed' }], pop, v => { pop = v; means = []; draw(); });
    addSlider(s.controls, { label: 'sample size n', min: 1, max: 100, step: 1, value: nSize }, v => { nSize = v; means = []; draw(); });
    addBtn(s.controls, 'Draw ×1', '', () => { means.push(drawMean()); draw(); });
    addBtn(s.controls, 'Draw ×500', '', () => { for (let i = 0; i < 500; i++) means.push(drawMean()); draw(); });
    let auto = null;
    addBtn(s.controls, '▶ Auto', 'ghost', function () { if (auto) { clearInterval(auto); auto = null; this.textContent = '▶ Auto'; } else { auto = setInterval(() => { for (let i = 0; i < 15; i++) means.push(drawMean()); draw(); }, 50); this.textContent = '⏸ Stop'; } });
    addBtn(s.controls, '↺', 'ghost', () => { means = []; draw(); });
    draw();
  };

  // Type I / II errors & power
  Viz.errorsPower = function (node) {
    const s = scaffold(node, { title: 'Type I vs Type II errors & statistical power', desc: 'Two worlds: H₀ (no effect, left) and H₁ (real effect, right). Move the decision threshold and effect size. <b style="color:' + COL().red + '">α</b> = false alarm, <b style="color:' + COL().blue + '">β</b> = missed effect, power = 1−β.', height: 260 });
    let effect = 2.2, thresh = 1.645;
    function draw() {
      const c = COL(), ctx = s.ctx, w = s.w, h = s.h, f = frame(ctx, w, h, { b: 30, t: 14 });
      f.clear(); const x0 = -4, x1 = 4 + effect, ymax = 0.45;
      // shaded alpha (right of thresh under H0)
      function fillCurve(mu, color, from, to) { ctx.beginPath(); ctx.moveTo(f.X(from, x0, x1), f.Y(0, 0, ymax)); for (let x = from; x <= to; x += 0.02) ctx.lineTo(f.X(x, x0, x1), f.Y(normPdf(x, mu, 1), 0, ymax)); ctx.lineTo(f.X(to, x0, x1), f.Y(0, 0, ymax)); ctx.closePath(); ctx.fillStyle = color; ctx.fill(); }
      fillCurve(0, c.red + '66', thresh, x1);        // alpha
      fillCurve(effect, c.blue + '66', x0, thresh);   // beta
      fillCurve(effect, c.green + '44', thresh, x1);  // power
      function curve(mu, color) { ctx.beginPath(); for (let i = 0; i <= 300; i++) { const x = x0 + (x1 - x0) * i / 300; const px = f.X(x, x0, x1), py = f.Y(normPdf(x, mu, 1), 0, ymax); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); }
      curve(0, c.dim); curve(effect, c.accent2);
      const px = f.X(thresh, x0, x1); ctx.strokeStyle = c.gold; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(px, f.Y(0, 0, ymax)); ctx.lineTo(px, 20); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = c.gold; ctx.font = '600 11px Inter'; ctx.textAlign = 'center'; ctx.fillText('decision threshold', px, 14);
      ctx.fillStyle = c.dim; ctx.textAlign = 'left'; ctx.fillText('H₀', f.X(0, x0, x1) - 6, f.Y(ymax * 0.95, 0, ymax)); ctx.fillStyle = c.accent2; ctx.fillText('H₁', f.X(effect, x0, x1) - 6, f.Y(ymax * 0.95, 0, ymax));
      const alpha = 1 - normCdf(thresh, 0, 1), beta = normCdf(thresh, effect, 1), power = 1 - beta;
      s.readout.innerHTML = '<b style="color:' + c.red + '">α</b> (Type I) = ' + (alpha * 100).toFixed(1) + '% · <b style="color:' + c.blue + '">β</b> (Type II) = ' + (beta * 100).toFixed(1) + '% · <b style="color:' + c.green + '">power</b> = ' + (power * 100).toFixed(1) + '%';
    }
    s.redrawHook = draw;
    addSlider(s.controls, { label: 'effect size (H₁ shift)', min: 0.3, max: 4, step: 0.1, value: effect, fmt: v => v.toFixed(1) }, v => { effect = v; draw(); });
    addSlider(s.controls, { label: 'threshold', min: -1, max: 5, step: 0.05, value: thresh, fmt: v => v.toFixed(2) }, v => { thresh = v; draw(); });
    draw();
  };

  // Confidence interval coverage
  Viz.confidenceInterval = function (node) {
    const s = scaffold(node, { title: 'What “95% confidence” really means', desc: 'The true mean is the gold line. Each horizontal bar is one sample’s 95% CI. About 95% of them cover the truth — the <b style="color:' + COL().red + '">red</b> ones miss. Confidence is a property of the <i>procedure</i>, not any one interval.', height: 290 });
    let conf = 0.95, nSize = 30; const TRUE = 50, SD = 10; let intervals = [];
    function gen(n) {
      const z = conf === 0.90 ? 1.645 : conf === 0.99 ? 2.576 : 1.96;
      for (let i = 0; i < n; i++) { const samp = []; for (let j = 0; j < nSize; j++) samp.push(TRUE + randn() * SD); const m = mean(samp), se = Math.sqrt(variance(samp, true) / nSize); intervals.push({ m, lo: m - z * se, hi: m + z * se }); }
      if (intervals.length > 40) intervals = intervals.slice(-40);
    }
    function draw() {
      const c = COL(), ctx = s.ctx, w = s.w, h = s.h; ctx.clearRect(0, 0, w, h);
      const lo = 40, hi = 60, padL = 30, padR = 14;
      function X(v) { return padL + (v - lo) / (hi - lo) * (w - padL - padR); }
      const tx = X(TRUE); ctx.strokeStyle = c.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(tx, 6); ctx.lineTo(tx, h - 18); ctx.stroke();
      ctx.fillStyle = c.gold; ctx.font = '11px Inter'; ctx.textAlign = 'center'; ctx.fillText('true μ=' + TRUE, tx, h - 4);
      const rowH = (h - 28) / Math.max(intervals.length, 1); let miss = 0;
      intervals.forEach((iv, i) => {
        const y = 8 + i * rowH; const covers = iv.lo <= TRUE && iv.hi >= TRUE; if (!covers) miss++;
        ctx.strokeStyle = covers ? c.accent2 : c.red; ctx.lineWidth = Math.min(rowH * 0.5, 3);
        ctx.beginPath(); ctx.moveTo(X(iv.lo), y); ctx.lineTo(X(iv.hi), y); ctx.stroke();
        ctx.fillStyle = covers ? c.accent2 : c.red; ctx.beginPath(); ctx.arc(X(iv.m), y, Math.min(rowH * 0.3, 2.5), 0, 7); ctx.fill();
      });
      const cover = intervals.length ? (1 - miss / intervals.length) * 100 : 0;
      s.readout.innerHTML = 'showing <b>' + intervals.length + '</b> intervals · covered the truth: <b>' + (intervals.length - miss) + '</b> (' + cover.toFixed(0) + '%) · missed: <b style="color:' + c.red + '">' + miss + '</b> · target ≈ ' + (conf * 100) + '%';
    }
    s.redrawHook = draw;
    addSeg(s.controls, [{ label: '90%', value: 0.90 }, { label: '95%', value: 0.95 }, { label: '99%', value: 0.99 }], conf, v => { conf = +v; intervals = []; gen(25); draw(); });
    addSlider(s.controls, { label: 'sample size n', min: 5, max: 100, step: 5, value: nSize }, v => { nSize = v; intervals = []; gen(25); draw(); });
    addBtn(s.controls, '+25 samples', '', () => { gen(25); draw(); });
    addBtn(s.controls, '↺', 'ghost', () => { intervals = []; draw(); });
    gen(25); draw();
  };

  /* =========================================================
     MODULE 5 — Prediction & forecasting
     ========================================================= */

  // Linear regression with residuals
  Viz.regression = function (node) {
    const s = scaffold(node, { title: 'Least-squares regression: minimising squared residuals', desc: 'Add noise or scatter the data. The <b style="color:' + COL().gold + '">OLS line</b> is the unique line that makes the sum of squared <b style="color:' + COL().red + '">residuals</b> (vertical errors) as small as possible.', height: 280 });
    let noise = 1.2, slope = 1.4, n = 40; let pts = [];
    function build() { pts = []; for (let i = 0; i < n; i++) { const x = Math.random() * 10; const y = 2 + slope * x + randn() * noise * 2; pts.push({ x, y }); } }
    function fit() { const mx = mean(pts.map(p => p.x)), my = mean(pts.map(p => p.y)); let num = 0, den = 0; pts.forEach(p => { num += (p.x - mx) * (p.y - my); den += (p.x - mx) ** 2; }); const b = num / den, a = my - b * mx; return { a, b }; }
    function draw() {
      const c = COL(), ctx = s.ctx, w = s.w, h = s.h, f = frame(ctx, w, h, { b: 30, t: 14 });
      f.clear(); const x0 = 0, x1 = 10, y0 = -2, y1 = 22; f.axes(x0, x1, y0, y1, 'x (feature)', 'y (target)');
      const { a, b } = fit();
      // residuals
      pts.forEach(p => { const yhat = a + b * p.x; ctx.strokeStyle = c.red + '88'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(f.X(p.x, x0, x1), f.Y(p.y, y0, y1)); ctx.lineTo(f.X(p.x, x0, x1), f.Y(yhat, y0, y1)); ctx.stroke(); });
      // line
      ctx.strokeStyle = c.gold; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(f.X(x0, x0, x1), f.Y(a + b * x0, y0, y1)); ctx.lineTo(f.X(x1, x0, x1), f.Y(a + b * x1, y0, y1)); ctx.stroke();
      // points
      pts.forEach(p => { ctx.fillStyle = c.accent2; ctx.beginPath(); ctx.arc(f.X(p.x, x0, x1), f.Y(p.y, y0, y1), 4, 0, 7); ctx.fill(); });
      // metrics
      const my = mean(pts.map(p => p.y)); let ssr = 0, sst = 0; pts.forEach(p => { const yh = a + b * p.x; ssr += (p.y - yh) ** 2; sst += (p.y - my) ** 2; }); const r2 = 1 - ssr / sst, mse = ssr / pts.length;
      s.readout.innerHTML = 'ŷ = <b>' + a.toFixed(2) + '</b> + <b>' + b.toFixed(2) + '</b>·x · R² = <b>' + r2.toFixed(3) + '</b> · MSE = <b>' + mse.toFixed(2) + '</b>';
    }
    s.redrawHook = draw;
    addSlider(s.controls, { label: 'true slope', min: -2, max: 3, step: 0.1, value: slope, fmt: v => v.toFixed(1) }, v => { slope = v; build(); draw(); });
    addSlider(s.controls, { label: 'noise', min: 0, max: 4, step: 0.1, value: noise, fmt: v => v.toFixed(1) }, v => { noise = v; build(); draw(); });
    addBtn(s.controls, '🎲 Resample', 'ghost', () => { build(); draw(); });
    build(); draw();
  };

  // Gradient descent on MSE bowl
  Viz.gradientDescent = function (node) {
    const s = scaffold(node, { title: 'Gradient descent rolling down the loss bowl', desc: 'Fitting a slope by gradient descent. Big learning rate → fast but can overshoot/diverge; small → safe but slow. This is how almost every ML model trains.', height: 260 });
    let lr = 0.05, w0 = 4.5; const TRUE_W = 1.8; const xs = [], ys = [];
    for (let i = 0; i < 30; i++) { const x = Math.random() * 4; xs.push(x); ys.push(TRUE_W * x + randn() * 0.4); }
    function loss(wv) { let l = 0; for (let i = 0; i < xs.length; i++) l += (wv * xs[i] - ys[i]) ** 2; return l / xs.length; }
    function grad(wv) { let g = 0; for (let i = 0; i < xs.length; i++) g += 2 * (wv * xs[i] - ys[i]) * xs[i]; return g / xs.length; }
    let path = [w0]; let timer = null;
    function reset() { path = [w0]; }
    function step() { const wv = path[path.length - 1]; const nw = wv - lr * grad(wv); path.push(nw); if (path.length > 200) path.shift(); }
    function draw() {
      const c = COL(), ctx = s.ctx, w = s.w, h = s.h, f = frame(ctx, w, h, { b: 30, t: 14 });
      f.clear(); const x0 = -1, x1 = 6; let ymax = Math.max(loss(x0), loss(x1)) * 1.05;
      f.axes(x0, x1, 0, ymax, 'weight w', 'loss (MSE)');
      ctx.beginPath(); for (let i = 0; i <= 200; i++) { const wv = x0 + (x1 - x0) * i / 200; const px = f.X(wv, x0, x1), py = f.Y(loss(wv), 0, ymax); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.strokeStyle = c.accent; ctx.lineWidth = 2; ctx.stroke();
      // path
      path.forEach((wv, i) => { const px = f.X(wv, x0, x1), py = f.Y(loss(wv), 0, ymax); ctx.fillStyle = i === path.length - 1 ? c.gold : c.accent2 + '99'; ctx.beginPath(); ctx.arc(px, py, i === path.length - 1 ? 6 : 3, 0, 7); ctx.fill(); });
      const cur = path[path.length - 1];
      s.readout.innerHTML = 'step <b>' + (path.length - 1) + '</b> · w = <b>' + cur.toFixed(3) + '</b> (true ' + TRUE_W + ') · loss = <b>' + loss(cur).toFixed(3) + '</b>' + (Math.abs(cur) > 50 ? ' — 💥 diverging! lower the learning rate' : '');
    }
    s.redrawHook = draw;
    addSlider(s.controls, { label: 'learning rate', min: 0.005, max: 0.45, step: 0.005, value: lr, fmt: v => v.toFixed(3) }, v => { lr = v; });
    addSlider(s.controls, { label: 'start w', min: -1, max: 6, step: 0.1, value: w0, fmt: v => v.toFixed(1) }, v => { w0 = v; reset(); draw(); });
    addBtn(s.controls, 'Step', '', () => { step(); draw(); });
    addBtn(s.controls, '▶ Run', 'ghost', function () { if (timer) { clearInterval(timer); timer = null; this.textContent = '▶ Run'; } else { timer = setInterval(() => { step(); draw(); }, 120); this.textContent = '⏸ Stop'; } });
    addBtn(s.controls, '↺', 'ghost', () => { reset(); draw(); });
    draw();
  };

  // Time series: trend + seasonality + noise, with moving average
  Viz.timeSeries = function (node) {
    const s = scaffold(node, { title: 'Anatomy of a time series: trend + seasonality + noise', desc: 'Dial each component. A <b style="color:' + COL().gold + '">moving average</b> smooths noise to reveal the signal — the intuition behind forecasting and ARIMA.', height: 260 });
    let trend = 0.4, season = 5, noise = 1.5, ma = 7; const N = 120; let data = [];
    function build() { data = []; for (let t = 0; t < N; t++) data.push(10 + trend * t + season * Math.sin(t / 6) + randn() * noise); }
    function draw() {
      const c = COL(), ctx = s.ctx, w = s.w, h = s.h, f = frame(ctx, w, h, { b: 30, t: 14 });
      f.clear(); const lo = Math.min(...data) - 2, hi = Math.max(...data) + 2; f.axes(0, N, lo, hi, 'time', 'value');
      ctx.strokeStyle = c.accent2 + '88'; ctx.lineWidth = 1.2; ctx.beginPath(); data.forEach((v, t) => { const px = f.X(t, 0, N), py = f.Y(v, lo, hi); t ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.stroke();
      // moving average
      ctx.strokeStyle = c.gold; ctx.lineWidth = 2.5; ctx.beginPath(); let started = false;
      for (let t = 0; t < N; t++) { if (t < ma) continue; let sm = 0; for (let k = 0; k < ma; k++) sm += data[t - k]; const v = sm / ma; const px = f.X(t, 0, N), py = f.Y(v, lo, hi); started ? ctx.lineTo(px, py) : (ctx.moveTo(px, py), started = true); } ctx.stroke();
      s.readout.innerHTML = 'gold = ' + ma + '-point moving average · trend slope <b>' + trend.toFixed(2) + '</b>/step · seasonal amp <b>' + season + '</b> · noise σ <b>' + noise.toFixed(1) + '</b>';
    }
    s.redrawHook = draw;
    addSlider(s.controls, { label: 'trend', min: -0.5, max: 1, step: 0.05, value: trend, fmt: v => v.toFixed(2) }, v => { trend = v; build(); draw(); });
    addSlider(s.controls, { label: 'seasonality', min: 0, max: 12, step: 0.5, value: season, fmt: v => v.toFixed(1) }, v => { season = v; build(); draw(); });
    addSlider(s.controls, { label: 'noise', min: 0, max: 5, step: 0.2, value: noise, fmt: v => v.toFixed(1) }, v => { noise = v; build(); draw(); });
    addSlider(s.controls, { label: 'MA window', min: 1, max: 24, step: 1, value: ma }, v => { ma = v; draw(); });
    addBtn(s.controls, '🎲 Resample', 'ghost', () => { build(); draw(); });
    build(); draw();
  };

  /* =========================================================
     MODULE 6 — GMM & EM
     ========================================================= */

  // 1D Gaussian Mixture with EM iterations
  Viz.gmmEM = function (node) {
    const s = scaffold(node, { title: 'Expectation–Maximization fitting a Gaussian mixture', desc: 'Two true clusters generate the points. EM alternates: <b>E-step</b> assigns soft responsibilities (colour blend), <b>M-step</b> moves each Gaussian to fit its points. Step through and watch it lock on.', height: 280 });
    const TRUE = [{ mu: 30, sig: 6 }, { mu: 62, sig: 8 }]; let data = [];
    let params, iter = 0; let timer = null;
    function build() { data = []; for (let i = 0; i < 200; i++) { const k = Math.random() < 0.45 ? 0 : 1; data.push(TRUE[k].mu + randn() * TRUE[k].sig); } init(); }
    function init() { params = { mu: [40, 55], sig: [10, 10], w: [0.5, 0.5] }; iter = 0; }
    function estep() { return data.map(x => { const r0 = params.w[0] * normPdf(x, params.mu[0], params.sig[0]); const r1 = params.w[1] * normPdf(x, params.mu[1], params.sig[1]); const s = r0 + r1 || 1e-9; return [r0 / s, r1 / s]; }); }
    function step() { const R = estep(); for (let k = 0; k < 2; k++) { let nk = 0, sm = 0; R.forEach((r, i) => { nk += r[k]; sm += r[k] * data[i]; }); const mu = sm / nk; let vv = 0; R.forEach((r, i) => vv += r[k] * (data[i] - mu) ** 2); params.mu[k] = mu; params.sig[k] = Math.max(2, Math.sqrt(vv / nk)); params.w[k] = nk / data.length; } iter++; }
    function draw() {
      const c = COL(), ctx = s.ctx, w = s.w, h = s.h, f = frame(ctx, w, h, { b: 30, t: 14 });
      f.clear(); const x0 = 0, x1 = 100, ymax = 0.05; f.axes(x0, x1, 0, ymax, 'x', 'density');
      const R = estep();
      // points colored by responsibility
      data.forEach((x, i) => { const r = R[i][1]; const px = f.X(x, x0, x1); const y = h - f.pad.b - 6 - (i % 7) * 3; const cr = Math.round(41 + r * (255 - 41)), cg = Math.round(211 - r * 90), cb = Math.round(194 + r * 10); ctx.fillStyle = 'rgba(' + cr + ',' + cg + ',' + cb + ',0.8)'; ctx.beginPath(); ctx.arc(px, y, 2.6, 0, 7); ctx.fill(); });
      // gaussians
      [c.accent2, c.accent3].forEach((color, k) => { ctx.strokeStyle = color; ctx.lineWidth = 2.4; ctx.beginPath(); for (let i = 0; i <= 200; i++) { const x = x0 + (x1 - x0) * i / 200; const y = params.w[k] * normPdf(x, params.mu[k], params.sig[k]); const px = f.X(x, x0, x1), py = f.Y(y, 0, ymax); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); });
      s.readout.innerHTML = 'iteration <b>' + iter + '</b> · μ = [<b>' + params.mu[0].toFixed(1) + '</b>, <b>' + params.mu[1].toFixed(1) + '</b>] (true 30, 62) · weights = [' + params.w[0].toFixed(2) + ', ' + params.w[1].toFixed(2) + ']';
    }
    s.redrawHook = draw;
    addBtn(s.controls, 'E + M step', '', () => { step(); draw(); });
    addBtn(s.controls, '▶ Run EM', 'ghost', function () { if (timer) { clearInterval(timer); timer = null; this.textContent = '▶ Run EM'; } else { timer = setInterval(() => { step(); draw(); if (iter > 40) { clearInterval(timer); timer = null; this.textContent = '▶ Run EM'; } }, 350); this.textContent = '⏸ Stop'; } });
    addBtn(s.controls, '↺ Restart', 'ghost', () => { init(); draw(); });
    addBtn(s.controls, '🎲 New data', 'ghost', () => { build(); draw(); });
    build(); draw();
  };

})();
