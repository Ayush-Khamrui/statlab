# StatLab — Statistical Methods for AI/ML

An interactive course companion for **Introduction to Statistical Methods (AIMLCZC418)**, built from your lecture transcripts and ISM session notes. Intuition-first notes, animated live demos, Python you can copy-run, and interview angles aimed at a **Tech Lead AI/ML** move.

## How to run

No build step, no install. Just open the app in a browser:

```bash
open "index.html"          # macOS
```

Or, if your browser blocks local file access for some features, serve it:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

> Math renders via KaTeX (loaded from CDN when online). Offline, a built-in fallback renders the formulas in plain HTML, so the app is fully usable without internet. Everything else — graphs, quizzes, progress — works completely offline.

## What's inside

| Module | Topic | Live demos |
|---|---|---|
| 1 | Descriptive Statistics | mean-vs-median outlier drag, box plot & IQR fence, skewness morph |
| 2 | Probability & Conditional Probability | Venn / addition rule, dice-sum convergence |
| 3 | Bayes, Random Variables & Distributions | base-rate trap, distribution explorer, normal area / z-score |
| 4 | Sampling & Hypothesis Testing | Central Limit Theorem, Type I/II & power, confidence-interval coverage |
| 5 | Prediction & Forecasting | least-squares regression, gradient descent, time-series decomposition |
| 6 | Gaussian Mixtures & EM | live EM fitting a 2-cluster GMM |

- **29 sections**, **46 quiz questions**, **16 interactive widgets**, flashcard decks, per-module cheat sheets.
- Every concept carries three lenses: 🧠 **Intuition**, 💼 **Interview**, ⚠️ **Pitfall**, plus 🤖 **AI/ML connection**.

## Using it

- **Sidebar**: modules expand into sections; checkmarks track what you've completed.
- **Mark complete** at the bottom of each section to fill your progress rings (saved in your browser via `localStorage`).
- **Press `/`** (or click the search pill) for a command palette to jump to any topic.
- **Theme toggle** (🌙 / ☀️) top-right. **🎲 Surprise me** on the home page jumps to a random topic.
- **Practice Quiz** per module gives exam- and interview-style questions with full explanations; your best score is saved.

## Project structure

```
index.html            App shell; loads scripts in order
assets/css/app.css    Design system, animations, math fallback styles
assets/js/core.js     Registry, router, nav, progress, code highlighter, math rendering
assets/js/viz.js      16 reusable canvas visualizations
assets/js/quiz.js     Quiz + flashcard engines
content/m1..m6.js     Module content (each calls Course.addModule)
```

## Extending it

Add or edit a module by editing `content/mN.js`:

```js
Course.addModule({
  id: 'm7', num: 7, icon: '✨', title: '…', subtitle: '…',
  sections: [{ id: 'intro', title: '…', html: `…` }],
  cheatsheet: `…`,
  quiz: [{ q: '…', opts: ['…','…'], answer: 1, explain: '…' }]
});
```

Inside `html`, you can use:
- `$inline$` and `$$display$$` math
- callouts: `<div class="callout intuition" data-icon="🧠"><div class="callout-title">…</div><p>…</p></div>` (types: `intuition`, `interview`, `pitfall`, `definition`, `theorem`, `example`, `aiml`)
- code: `<pre class="code" data-lang="python">…</pre>`
- a live demo: `<div class="viz" data-viz="clt"></div>` (any widget name from `viz.js`)
- flashcards: `<div class="viz" data-viz="flashcards" data-title="…" data-cards='[{"q":"…","a":"…"}]'></div>`
