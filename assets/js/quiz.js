/* ============================================================
   StatLab quiz — interactive practice quiz engine
   ============================================================ */
(function () {
  'use strict';
  const Quiz = {};
  window.Quiz = Quiz;

  function el(t, c, h) { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }
  const LETTERS = ['A', 'B', 'C', 'D', 'E'];

  Quiz.mount = function (node, module) {
    const questions = module.quiz || [];
    if (!questions.length) { node.innerHTML = '<p class="muted">No quiz for this module yet.</p>'; return; }
    let i = 0, correct = 0, answered = false;
    const KEY = 'statlab.quizbest.' + module.id;
    const best = +localStorage.getItem(KEY) || 0;

    node.innerHTML = '';
    const intro = el('div', 'callout interview', '<div class="callout-title">Practice Quiz · ' + questions.length + ' questions</div><p>Exam-style and interview-style mixed. Pick an answer to see a full explanation — these are the exact reasonings to <i>say out loud</i> in an interview. Your best score: <b>' + best + '/' + questions.length + '</b>.</p>');
    intro.dataset.icon = '🎯';
    node.appendChild(intro);
    const card = el('div', 'quiz-card'); node.appendChild(card);

    function renderQ() {
      answered = false;
      const q = questions[i];
      card.innerHTML =
        '<div class="quiz-progress">Question ' + (i + 1) + ' of ' + questions.length + ' · score ' + correct + '</div>' +
        '<div class="quiz-q">' + q.q + '</div>' +
        '<div class="quiz-opts"></div>' +
        '<div class="quiz-explain" style="display:none"></div>' +
        '<div class="quiz-nav"></div>';
      const opts = card.querySelector('.quiz-opts');
      q.opts.forEach((opt, idx) => {
        const b = el('button', 'quiz-opt', '<span class="opt-key">' + LETTERS[idx] + '</span><span>' + opt + '</span>');
        b.addEventListener('click', () => choose(idx, b, opts, q));
        opts.appendChild(b);
      });
      if (window.App) { window.App.renderMath(card); }
    }

    function choose(idx, btn, opts, q) {
      if (answered) return; answered = true;
      const buttons = Array.from(opts.children);
      buttons.forEach((b, k) => { b.disabled = true; if (k === q.answer) b.classList.add('correct'); });
      if (idx === q.answer) { correct++; }
      else { btn.classList.add('wrong'); }
      const ex = card.querySelector('.quiz-explain');
      ex.style.display = 'block';
      ex.innerHTML = (idx === q.answer ? '<b>✓ Correct.</b> ' : '<b>✗ Not quite — answer is ' + LETTERS[q.answer] + '.</b> ') + q.explain;
      const nav = card.querySelector('.quiz-nav');
      nav.innerHTML = '';
      const next = el('button', 'viz-btn', i < questions.length - 1 ? 'Next question →' : 'See results →');
      next.addEventListener('click', () => { i++; if (i < questions.length) renderQ(); else results(); });
      nav.appendChild(next);
      if (window.App) window.App.renderMath(ex);
    }

    function results() {
      const pct = Math.round(correct / questions.length * 100);
      if (correct > best) localStorage.setItem(KEY, correct);
      const msg = pct >= 90 ? 'Outstanding — interview-ready on this module. 🏆' : pct >= 70 ? 'Solid. Revisit the ones you missed and you’re golden. 💪' : pct >= 50 ? 'Good start — re-read the sections above and try again. 📚' : 'Worth another pass through the module. You’ll get it. 🔁';
      card.innerHTML =
        '<div class="quiz-score"><div class="big">' + correct + '/' + questions.length + '</div>' +
        '<p style="font-size:18px;margin:8px 0">' + pct + '% · ' + msg + '</p></div>' +
        '<div class="quiz-nav" style="justify-content:center"></div>';
      const nav = card.querySelector('.quiz-nav');
      const again = el('button', 'viz-btn', '↺ Retry quiz');
      again.addEventListener('click', () => { i = 0; correct = 0; renderQ(); });
      nav.appendChild(again);
      if (window.App) window.App.toast(correct > best ? 'New best score! 🎉' : 'Quiz complete');
    }

    renderQ();
  };

  // Flashcard deck — usable inside any section via Quiz.flashdeck or [data-flash]
  Quiz.flashdeck = function (node, cards) {
    let i = 0;
    node.innerHTML = '';
    const wrap = el('div', 'flashdeck');
    const fc = el('div', 'flashcard');
    fc.innerHTML = '<div class="flashcard-inner"><div class="flash-face"><div class="flash-q"></div><span class="flash-hint">click to flip</span></div><div class="flash-face flash-back"><div class="flash-a"></div><span class="flash-hint">click to flip back</span></div></div>';
    const nav = el('div', 'quiz-nav');
    nav.innerHTML = '<button class="viz-btn ghost" data-act="prev">← Prev</button><span class="quiz-progress" style="margin:0"></span><button class="viz-btn ghost" data-act="next">Next →</button>';
    wrap.appendChild(fc); wrap.appendChild(nav); node.appendChild(wrap);
    function show() {
      fc.classList.remove('flipped');
      fc.querySelector('.flash-q').innerHTML = cards[i].q;
      fc.querySelector('.flash-a').innerHTML = cards[i].a;
      nav.querySelector('.quiz-progress').textContent = (i + 1) + ' / ' + cards.length;
      if (window.App) window.App.renderMath(fc);
    }
    fc.addEventListener('click', () => fc.classList.toggle('flipped'));
    nav.querySelector('[data-act=prev]').addEventListener('click', () => { i = (i - 1 + cards.length) % cards.length; show(); });
    nav.querySelector('[data-act=next]').addEventListener('click', () => { i = (i + 1) % cards.length; show(); });
    show();
  };

  // auto-mount flashcards declared as <div class="viz" data-flash='[...]'></div>
  window.Viz = window.Viz || {};
  window.Viz.flashcards = function (node) {
    let cards = [];
    try { cards = JSON.parse(node.dataset.cards || '[]'); } catch (e) {}
    const title = node.dataset.title || 'Flashcards';
    node.innerHTML = '<div class="viz-title"><span class="badge">FLIP</span> ' + title + '</div><div class="flash-host"></div>';
    Quiz.flashdeck(node.querySelector('.flash-host'), cards);
  };
})();
