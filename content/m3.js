Course.addModule({
  id: 'm3', num: 3, icon: '🔮',
  title: 'Bayes, Random Variables & Distributions',
  subtitle: 'Reason backward from evidence, attach numbers to chance, and learn the named distributions ML lives on.',
  tags: ['Bayes', 'Naïve Bayes', 'expectation', 'binomial/Poisson/Normal'],
  sections: [
    {
      id: 'bayes', title: 'Bayes’ theorem & Naïve Bayes', icon: '🔁',
      search: 'bayes theorem prior likelihood posterior evidence base rate naive bayes classifier conditional independence laplace smoothing MAP spam',
      html: `
<p class="lead">We usually know things <em>forwards</em>: given the cause, how likely is the evidence? But life asks the reverse: given the evidence, how likely is the cause? <strong>Bayes' theorem flips the question around.</strong></p>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">Intuition · the doctor and the test</div><p>A lab measures $P(\\text{positive}\\mid\\text{disease})=99\\%$. But a patient who just tested positive wants $P(\\text{disease}\\mid\\text{positive})$. These are <em>not</em> the same number, and confusing them is a famous, dangerous mistake. Bayes keeps them straight.</p></div>

<div class="callout theorem" data-icon="📜"><div class="callout-title">Bayes' theorem</div>
<div class="formula">$$P(H\\mid E) = \\frac{P(E\\mid H)\\,P(H)}{P(E)}$$</div>
<ul>
<li><b>Prior</b> $P(H)$: belief before the evidence</li>
<li><b>Likelihood</b> $P(E\\mid H)$: how well $H$ predicts the evidence</li>
<li><b>Posterior</b> $P(H\\mid E)$: updated belief after seeing $E$</li>
<li><b>Evidence</b> $P(E)=\\sum_i P(E\\mid H_i)P(H_i)$: the normaliser, by total probability</li>
</ul></div>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">Read it as a belief-updating machine</div><p><strong>new belief ∝ old belief × how well it explains the evidence.</strong> Strong evidence overturns a weak prior; weak evidence barely nudges a strong prior. It's the mathematics of changing your mind by exactly the right amount.</p></div>

<h3>The base-rate trap: the #1 Bayes mistake</h3>
<p>A "99% accurate" test does <em>not</em> mean a positive result is 99% likely real. If the condition is <strong>rare</strong> (low prior), the flood of false positives from the huge healthy majority swamps the few true positives. Play with it:</p>

<div class="viz" data-viz="bayesBaseRate"></div>

<div class="callout example" data-icon="✏️"><div class="callout-title">The base-rate surprise, worked</div><p>Disease in 1% of people. Test catches 99% of true cases, falsely flags 5% of healthy. You test positive. How worried should you be? $P(+) = (0.99)(0.01)+(0.05)(0.99)=0.0594$. $P(\\text{disease}\\mid +)=\\frac{(0.99)(0.01)}{0.0594}\\approx \\mathbf{17\\%}$. Only 17%! Switching to natural frequencies (10 sick of 1000, ~50 false alarms) makes it obvious.</p></div>

<h2>From one feature to many: Naïve Bayes</h2>
<p>Real classifiers use many clues $X_1,\\dots,X_n$ at once. Estimating $P(X_1,\\dots,X_n\\mid C)$ honestly is impossible, because there are too many combinations. So we make one bold assumption.</p>

<div class="callout definition" data-icon="📐"><div class="callout-title">Conditional independence: the "naïve" assumption</div>
<div class="formula">$$P(X_1,\\dots,X_n\\mid C) = \\prod_{i=1}^{n} P(X_i\\mid C)$$</div>
<p>Within a class, each feature casts its own little vote and the votes don't interfere. Decision rule (MAP): pick the class $y_k$ maximising $P(Y=y_k)\\prod_i P(X_i\\mid Y=y_k)$. The shared denominator $P(X)$ is the same for every class, so we ignore it: "most probable class wins."</p></div>

<div class="callout interview" data-icon="💼"><div class="callout-title">Why is it "naïve" yet so good?</div><p>The word "offer" and a suspicious link <em>do</em> co-occur in spam, so they're not really independent. Naïve Bayes ignores that and treats every clue as if it arrived alone. It's "naïve" for assuming this, yet astonishingly effective: like a committee voting independently that still usually reaches the right verdict. It's fast, needs little data, and is a great <strong>baseline</strong> for text classification.</p></div>

<div class="callout pitfall" data-icon="⚠️"><div class="callout-title">The zero-frequency trap & Laplace smoothing</div><p>If a word never appeared in a class during training, its conditional probability is 0, and one zero in a product <em>wipes out the entire score</em>. The fix is <strong>Laplace (add-one) smoothing</strong>: add 1 to every count so nothing is ever exactly zero. It is the gentle admission that "we haven't seen it yet" ≠ "it's impossible." $\\hat{P}(x\\mid c)=\\frac{\\text{count}(x,c)+1}{\\text{count}(c)+V}$.</p></div>

<pre class="code" data-lang="python">from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

texts  = ["win money now", "limited offer click", "team meeting notes", "lunch at noon"]
labels = ["spam", "spam", "ham", "ham"]
X = CountVectorizer().fit_transform(texts)
clf = MultinomialNB(alpha=1.0).fit(X, labels)   # alpha=1.0 -> Laplace smoothing

# Manual base-rate Bayes
def posterior(prior, sens, fpr):
    p_evidence = sens*prior + fpr*(1-prior)
    return sens*prior / p_evidence
print(posterior(0.01, 0.99, 0.05))   # 0.167  -> the 17% surprise</pre>

<div class="callout aiml" data-icon="🤖"><div class="callout-title">Connection · where Bayes shows up</div><p>Bayes is everywhere: <strong>spam filters, medical triage, A/B test analysis, Bayesian optimization</strong> of hyperparameters, and the entire field of <strong>Bayesian deep learning</strong> (priors on weights, uncertainty estimates). Even maximum-likelihood training is "Bayes with a flat prior." The base-rate lesson is a recurring product trap too: a fraud model with 99% recall can still be mostly false alarms if fraud is rare.</p></div>
`
    },
    {
      id: 'randomvars', title: 'Random variables & expectation', icon: '🎰',
      search: 'random variable discrete continuous PMF PDF CDF expectation expected value variance standard deviation law of large numbers joint marginal conditional distribution',
      html: `
<p class="lead">So far outcomes were things like "heads" or "sunny." To do real quantitative work we attach <strong>numbers</strong> to outcomes, and a random variable is exactly that bridge.</p>

<div class="callout definition" data-icon="📐"><div class="callout-title">Random variable</div><p>A <b>random variable</b> $X$ is a function from the sample space to the real numbers, assigning one number to each outcome.</p>
<ul><li><b>Discrete</b>: countable, separated values (# heads, cars in line, defects/hour)</li>
<li><b>Continuous</b>: any value in an interval (height, waiting time, temperature)</li></ul>
<p>Quick test: can you <em>count</em> the possibilities (discrete) or only <em>measure</em> them (continuous)?</p></div>

<h3>How probability is shared out</h3>
<p>A discrete $X$ has a <strong>probability mass function</strong> (PMF) $f(x)=P(X=x)$ with $f(x)\\ge0$ and $\\sum_x f(x)=1$. A continuous $X$ has a <strong>probability density function</strong> (PDF): probability is the <em>area</em> under the curve, $P(x_1<X<x_2)=\\int_{x_1}^{x_2} f(x)\\,dx$, and any single point has probability zero. The <strong>CDF</strong> accumulates: $F(x)=P(X\\le x)$, rising from 0 to 1.</p>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">Intuition · clay on a rod</div><p>Picture probability as modelling clay along a rod. Discrete: the clay sits in neat lumps at points (PMF). Continuous: it's smeared smoothly (PDF), and the "amount" between two marks is an <em>area</em>, never the height at a single point. That's why $P(X=2.000\\dots)=0$ for continuous variables.</p></div>

<div class="callout theorem" data-icon="📜"><div class="callout-title">Expectation, variance, SD</div>
<div class="formula">$$\\mathbb{E}[X]=\\mu=\\sum_x x\\,f(x) \\qquad \\operatorname{Var}(X)=\\sigma^2=\\mathbb{E}[(X-\\mu)^2]=\\mathbb{E}[X^2]-\\mu^2$$</div>
<p>Expectation is the long-run average (the probability-weighted balance point); variance/SD answers "how surprised should I be by a single outcome?"</p></div>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">Law of Large Numbers</div><p>$\\mathbb{E}[X]$ need not be a value $X$ can take (a family can average 2.3 children). Roll a die again and again: the running average wanders, then settles onto 3.5. A single roll is unpredictable; the average of many is almost certain. <strong>This is what makes empirical estimates trustworthy</strong>, and why bigger validation sets give steadier metrics.</p></div>

<div class="callout example" data-icon="✏️"><div class="callout-title">Worked example · is the game fair?</div><p>Roll two dice. Sum 7 → win ₹3; sum 8 → lose ₹2; sum 3 → lose ₹4; else nothing. $\\mathbb{E}[X]=3\\cdot\\frac{6}{36}-2\\cdot\\frac{5}{36}-4\\cdot\\frac{2}{36}=\\frac{18-10-8}{36}=0$. Expected gain zero ⟹ <strong>fair game</strong>. This is exactly how a casino or insurer prices risk: keep their expected gain positive.</p></div>

<h3>Two variables at once: joint, marginal, conditional</h3>
<p>Often two quantities travel together (education & age). Their <strong>joint</strong> $f(x,y)=P(X=x,Y=y)$ gives each pair. Summing out one variable gives the <strong>marginal</strong> (literally the totals written in the margins): $f_X(x)=\\sum_y f(x,y)$. The <strong>conditional</strong> $f_{Y\\mid X}(y)=\\frac{f(x,y)}{f_X(x)}$ is the Module-2 idea applied to variables. And $X,Y$ are independent iff $f(x,y)=f_X(x)f_Y(y)$ for all $x,y$.</p>

<div class="callout aiml" data-icon="🤖"><div class="callout-title">Connection · expectation everywhere</div><p>Expectation defines <strong>every loss function</strong> (we minimise expected loss / risk). Variance is the "V" in the <strong>bias–variance tradeoff</strong>. The joint→marginal→conditional trio is the grammar of probabilistic graphical models, and <strong>marginalising a latent variable</strong> is exactly what generative models and EM (Module 6) do. $\\mathbb{E}[X^2]-\\mu^2$ is the same identity behind the "running variance" used in batch-norm and Adam.</p></div>

<pre class="code" data-lang="python">import numpy as np
# Discrete RV: cars in line at lunch
x = np.array([0,1,2,3,4]); p = np.array([.10,.30,.40,.15,.05])
assert np.isclose(p.sum(), 1)
mu  = (x*p).sum()                       # E[X] = 1.75
var = (x**2*p).sum() - mu**2            # E[X^2] - mu^2 = 0.9875
print(mu, var, np.sqrt(var))            # 1.75 0.9875 0.994
cdf = np.cumsum(p)
print("P(X<=2) =", cdf[2])              # 0.80</pre>
`
    },
    {
      id: 'distributions', title: 'The named distributions', icon: '🔔',
      search: 'binomial poisson normal gaussian distribution bernoulli uniform exponential pmf pdf 68 95 99.7 z-score standardise when to use parameters mean variance',
      html: `
<p class="lead">Identifying which <strong>pattern</strong> your data follows is half of modelling. A handful of named distributions cover most of what you'll meet, and they are deeply connected.</p>

<div class="viz" data-viz="distExplorer"></div>

<h3>Binomial: counting successes in fixed trials</h3>
<p>$n$ independent yes/no trials, each success prob $p$. $X=$ number of successes. $P(X=k)=\\binom{n}{k}p^k(1-p)^{n-k}$, with $\\mathbb{E}[X]=np$, $\\operatorname{Var}=np(1-p)$. (One trial = <strong>Bernoulli</strong>.) Use it for: conversion counts, click-through, defect counts in a batch.</p>

<h3>Poisson: counting rare events over an interval</h3>
<p>Events at average rate $\\lambda$ per interval, independent. $P(X=k)=\\frac{\\lambda^k e^{-\\lambda}}{k!}$, with $\\mathbb{E}[X]=\\operatorname{Var}=\\lambda$. Use it for: arrivals/min, server requests, typos per page, calls to a help desk. (Binomial with large $n$, small $p$ → Poisson with $\\lambda=np$.)</p>

<h3>Normal (Gaussian): the bell curve</h3>
<p>$f(x)=\\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-(x-\\mu)^2/2\\sigma^2}$. Symmetric, defined by $\\mu$ (centre) and $\\sigma$ (spread). The famous appraisal "bell curve." It dominates because of the Central Limit Theorem (Module 4): sums/averages of many small effects become Normal regardless of origin.</p>

<div class="callout theorem" data-icon="📜"><div class="callout-title">The 68–95–99.7 rule & z-scores</div><p>About 68% of a Normal lies within 1σ, 95% within 2σ, 99.7% within 3σ. Standardising $z=\\frac{x-\\mu}{\\sigma}$ converts <em>any</em> Normal to the standard Normal, the master key to tables, p-values and confidence intervals.</p></div>

<div class="viz" data-viz="normalArea"></div>

<div class="tbl-wrap"><table class="data">
<tr><th>Distribution</th><th>Models</th><th>Params</th><th>Mean</th><th>Variance</th></tr>
<tr><td><b>Bernoulli</b></td><td>one yes/no trial</td><td>$p$</td><td>$p$</td><td>$p(1-p)$</td></tr>
<tr><td><b>Binomial</b></td><td># successes in $n$ trials</td><td>$n,p$</td><td>$np$</td><td>$np(1-p)$</td></tr>
<tr><td><b>Poisson</b></td><td># rare events / interval</td><td>$\\lambda$</td><td>$\\lambda$</td><td>$\\lambda$</td></tr>
<tr><td><b>Uniform</b></td><td>all values equally likely</td><td>$a,b$</td><td>$\\frac{a+b}{2}$</td><td>$\\frac{(b-a)^2}{12}$</td></tr>
<tr><td><b>Normal</b></td><td>sums/averages, "natural" spread</td><td>$\\mu,\\sigma$</td><td>$\\mu$</td><td>$\\sigma^2$</td></tr>
<tr><td><b>Exponential</b></td><td>waiting time between events</td><td>$\\lambda$</td><td>$1/\\lambda$</td><td>$1/\\lambda^2$</td></tr>
</table></div>

<div class="callout interview" data-icon="💼"><div class="callout-title">Interview angle · "which distribution would you use?"</div><p>This is a staple. Anchor on the <em>generating process</em>: fixed number of yes/no trials → <strong>Binomial</strong>; rare events at a constant rate → <strong>Poisson</strong>; waiting time until the next event → <strong>Exponential</strong>; sum/average of many effects → <strong>Normal</strong>. Then state mean &amp; variance from memory, which signals fluency.</p></div>

<div class="callout aiml" data-icon="🤖"><div class="callout-title">Connection · distributions in models</div><p>The Normal underpins linear/ridge regression (Gaussian noise = MSE loss), Gaussian Naïve Bayes, GMMs and VAEs. The <strong>softmax</strong> output is a categorical distribution; <strong>logistic regression</strong> models a Bernoulli; count models (Poisson regression) handle event data. Knowing a distribution's mean/variance lets you reason about the scale and noise of model outputs.</p></div>

<pre class="code" data-lang="python">from scipy import stats
# Binomial: P(exactly 3 of 10 conversions at p=0.3)
print(stats.binom.pmf(3, n=10, p=0.3))        # 0.2668
# Poisson: P(>=5 requests/sec when lambda=3)
print(1 - stats.poisson.cdf(4, mu=3))         # 0.185
# Normal: P(160 < height < 180) for N(170, 7)
print(stats.norm.cdf(180,170,7) - stats.norm.cdf(160,170,7))   # ~0.847
# z-score and the 68-95-99.7 rule
print(stats.norm.cdf(1) - stats.norm.cdf(-1)) # 0.6827 (~68% within 1 sigma)</pre>
`
    }
  ],
  cheatsheet: `
<p class="lead">Module 3 recall: Bayes, RVs, and the named distributions.</p>
<div class="formula"><span class="formula-label">Bayes</span>$$P(H\\mid E)=\\frac{P(E\\mid H)P(H)}{P(E)},\\quad P(E)=\\sum_i P(E\\mid H_i)P(H_i)$$</div>
<div class="grid cols-2">
<div class="card"><h4>Naïve Bayes</h4><p>Assume $P(X_1..X_n\\mid C)=\\prod P(X_i\\mid C)$. Pick class maximising $P(C)\\prod P(X_i\\mid C)$. Use Laplace +1 smoothing to dodge zeros.</p></div>
<div class="card"><h4>Base rate</h4><p>Rare condition + imperfect test ⟹ a positive can still be probably wrong. Always weight by the prior.</p></div>
<div class="card"><h4>Expectation/Var</h4><p>$\\mathbb{E}[X]=\\sum x f(x)$; $\\operatorname{Var}=\\mathbb{E}[X^2]-\\mu^2$. LLN: running average → $\\mathbb{E}[X]$.</p></div>
<div class="card"><h4>Joint/marginal/cond</h4><p>Marginal = sum out a variable. Conditional = joint ÷ marginal. Independent ⟺ joint factorises.</p></div>
<div class="card"><h4>Binomial</h4><p>$np$, $np(1-p)$. Fixed $n$ yes/no trials.</p></div>
<div class="card"><h4>Poisson</h4><p>mean = var = $\\lambda$. Rare events at constant rate.</p></div>
<div class="card"><h4>Normal</h4><p>68/95/99.7 within 1/2/3σ; $z=(x-\\mu)/\\sigma$.</p></div>
<div class="card"><h4>Exponential</h4><p>mean $1/\\lambda$. Waiting time; memoryless.</p></div>
</div>
<div class="viz" data-viz="flashcards" data-title="Module 3 rapid recall" data-cards='[
{"q":"Prior, likelihood, posterior?","a":"Prior P(H) = belief before. Likelihood P(E|H) = how well H explains E. Posterior P(H|E) = updated belief."},
{"q":"Why can a 99% test be usually wrong?","a":"Low base rate: false positives from the huge healthy majority outnumber true positives."},
{"q":"The naïve assumption?","a":"Features are conditionally independent given the class: P(X₁..Xₙ|C)=∏P(Xᵢ|C)."},
{"q":"Fix for zero-frequency?","a":"Laplace (add-one) smoothing so no probability is exactly 0."},
{"q":"Mean & variance of Poisson?","a":"Both equal λ."},
{"q":"Binomial mean & variance?","a":"np and np(1−p)."},
{"q":"68–95–99.7 rule?","a":"~68% within 1σ, ~95% within 2σ, ~99.7% within 3σ of the mean."},
{"q":"E[X²] − μ² is…","a":"The variance (computational form). Same identity behind running-variance in Adam/batch-norm."}
]'></div>
`,
  quiz: [
    { q: 'A disease affects 2% of people. A test is 95% sensitive and has a 5% false-positive rate. You test positive. Roughly P(disease)?', opts: ['~95%', '~28%', '~50%', '~2%'], answer: 1, explain: 'P(+)=0.95·0.02 + 0.05·0.98 = 0.019 + 0.049 = 0.068. Posterior = 0.019/0.068 ≈ <b>0.28</b>. The base rate (2%) keeps the posterior far below the 95% sensitivity, the classic base-rate surprise.' },
    { q: 'Why is Naïve Bayes called "naïve"?', opts: ['It uses too little data', 'It assumes features are conditionally independent given the class — usually false', 'It ignores the prior', 'It only works for two classes'], answer: 1, explain: 'It assumes P(X₁,…,Xₙ|C)=∏P(Xᵢ|C), so features don’t interact within a class. That’s usually false (e.g. correlated words), yet the classifier is fast and surprisingly accurate, making it a strong baseline.' },
    { q: 'In Naïve Bayes, a test word never appeared in the "spam" training set. Without smoothing, what happens?', opts: ['Nothing — it is ignored', 'Its P(word|spam)=0 zeroes out the entire spam score', 'It defaults to 0.5', 'The classifier crashes'], answer: 1, explain: 'A single zero factor makes the whole product zero, so any document with that word can never be spam, which is clearly wrong. Laplace (add-one) smoothing gives every word a tiny non-zero probability.' },
    { q: 'For a Poisson distribution with λ=4, what are the mean and variance?', opts: ['mean 4, variance 2', 'mean 4, variance 4', 'mean 2, variance 4', 'mean 4, variance 16'], answer: 1, explain: 'A defining feature of Poisson: <b>mean = variance = λ = 4</b>. If your count data has variance much larger than the mean, that’s "overdispersion" and Poisson may be the wrong model.' },
    { q: 'Heights are N(170, 7²) cm. About what fraction are between 156 and 184 cm?', opts: ['~68%', '~95%', '~99.7%', '~50%'], answer: 1, explain: '156 and 184 are exactly 170 ± 2σ (σ=7). By the 68–95–99.7 rule, about <b>95%</b> lie within 2 standard deviations of the mean.' },
    { q: 'A fair game has expected gain 0. A casino game is profitable for the house when…', opts: ['The variance is high', 'The player’s expected gain is negative', 'The game is fast', 'Outcomes are independent'], answer: 1, explain: 'Expectation prices risk. The house ensures E[player gain] < 0, so over many rounds it profits — even though any single round is uncertain. Same logic insurers use.' },
    { q: 'You count independent rare server errors per minute at a steady average rate. Which distribution?', opts: ['Binomial', 'Poisson', 'Normal', 'Uniform'], answer: 1, explain: 'Rare, independent events at a constant rate over an interval → <b>Poisson</b> with that rate λ. (Fixed number of yes/no trials would be Binomial; a sum/average of many effects would tend to Normal.)' },
    { q: 'Which identity is the computational form of variance?', opts: ['Var = E[X] − μ', 'Var = E[X²] − (E[X])²', 'Var = E[X]² − E[X²]', 'Var = μ² − E[X²]'], answer: 1, explain: 'Var(X) = E[X²] − μ². It’s faster (one pass for E[X] and E[X²]) and is the same trick behind running-variance updates in optimizers and batch-norm.' }
  ]
});
