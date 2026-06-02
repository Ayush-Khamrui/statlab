Course.addModule({
  id: 'm4', num: 4, icon: '🧪',
  title: 'Sampling & Hypothesis Testing',
  subtitle: 'From a sample to a claim about the world: the CLT, confidence intervals, p-values, and the errors we risk.',
  tags: ['CLT', 'standard error', 'confidence interval', 'p-value', 'power'],
  sections: [
    {
      id: 'sampling', title: 'Sampling & the Central Limit Theorem', icon: '🎯',
      search: 'population sample parameter statistic random stratified cluster systematic sampling bias sampling distribution standard error central limit theorem CLT law large numbers',
      html: `
<p class="lead">We almost never see the whole population — we see a <strong>sample</strong> and must reason about the world from it. This is the heart of inferential statistics, and of every train/validation split in ML.</p>

<div class="callout definition" data-icon="📐"><div class="callout-title">Parameter vs statistic</div><p>A <b>parameter</b> describes the population (true mean $\\mu$, true proportion $p$) — usually unknown. A <b>statistic</b> is computed from the sample ($\\bar{x}$, $\\hat{p}$) and <em>estimates</em> the parameter. Greek = truth, Latin = estimate.</p></div>

<div class="grid cols-2">
<div class="card"><h4>Simple random</h4><p>Everyone equally likely. The gold standard; other methods approximate it.</p></div>
<div class="card"><h4>Stratified</h4><p>Split into groups (strata), sample each. Guarantees representation — like stratified train/test splits.</p></div>
<div class="card"><h4>Cluster</h4><p>Sample whole groups (e.g. random schools). Cheap but higher variance.</p></div>
<div class="card"><h4>Systematic</h4><p>Every $k$-th item. Simple, but dangerous if the list has hidden periodicity.</p></div>
</div>

<div class="callout pitfall" data-icon="⚠️"><div class="callout-title">Sampling bias — the silent killer</div><p>If <em>how</em> you sample correlates with what you measure, no amount of data fixes it. Survivorship bias, self-selection, and label leakage are the ML cousins. A representative sample beats a bigger biased one every time.</p></div>

<h2>The sampling distribution & standard error</h2>
<p>Different samples give different $\\bar{x}$'s. The distribution of $\\bar{x}$ across all possible samples is the <strong>sampling distribution</strong>, and its spread is the <strong>standard error</strong>:</p>
<div class="formula"><span class="formula-label">Standard error of the mean</span>$$\\text{SE} = \\frac{\\sigma}{\\sqrt{n}}$$</div>
<p>Quadruple the sample size to halve the error — diminishing returns that explain why "just collect more data" eventually stops helping much.</p>

<div class="callout theorem" data-icon="📜"><div class="callout-title">Central Limit Theorem (CLT)</div><p>For large $n$, the distribution of the sample mean $\\bar{X}$ is approximately <strong>Normal</strong> with mean $\\mu$ and SD $\\sigma/\\sqrt{n}$ — <em>regardless of the population's shape</em>. Sums and averages of many independent effects become bell-shaped.</p></div>

<div class="viz" data-viz="clt"></div>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">Why the CLT is the most important theorem in stats</div><p>It's the reason the Normal distribution is everywhere, and the reason we can put error bars on almost any average without knowing the population's true shape. It justifies z/t-tests, confidence intervals, and the standard error bars on every metric you report. Pick a wild population in the demo above and watch the bell emerge anyway.</p></div>

<div class="callout aiml" data-icon="🤖"><div class="callout-title">AI/ML connection</div><p>The CLT is why your <strong>validation metric</strong> has a roughly Normal sampling distribution — so you can attach a standard error to accuracy/AUC and decide whether model A really beats model B. It also underlies <strong>bootstrapping</strong> (resampling to estimate uncertainty) and the noise model in mini-batch SGD (batch gradients ≈ true gradient + Normal noise shrinking like $1/\\sqrt{\\text{batch}}$).</p></div>

<pre class="code" data-lang="python">import numpy as np
rng = np.random.default_rng(0)
pop = rng.exponential(scale=1.0, size=1_000_000)   # wildly skewed population

means = [rng.choice(pop, size=30).mean() for _ in range(5000)]
print("pop mean", pop.mean(), "  mean of sample means", np.mean(means))
print("theory SE", pop.std()/np.sqrt(30), "  observed SE", np.std(means))
# The histogram of sample means is bell-shaped even though pop is not -- that is the CLT.</pre>
`
    },
    {
      id: 'estimation', title: 'Confidence intervals', icon: '📐',
      search: 'point estimate interval estimate confidence interval margin of error coverage 95% z t critical value interpretation bootstrap',
      html: `
<p class="lead">A single number ($\\bar{x}=42$) hides its own uncertainty. A <strong>confidence interval</strong> reports a range plus how trustworthy the procedure is.</p>

<div class="formula"><span class="formula-label">CI for a mean (known σ, or large n)</span>$$\\bar{x} \\pm z_{\\alpha/2}\\cdot\\frac{\\sigma}{\\sqrt{n}}$$</div>
<p>For 95%, $z_{\\alpha/2}=1.96$. The $\\pm$ part is the <strong>margin of error</strong>. With unknown σ and small $n$, swap the $z$ for a $t$-value (fatter tails to account for estimating σ).</p>

<div class="callout pitfall" data-icon="⚠️"><div class="callout-title">What "95% confidence" does NOT mean</div><p>It does <em>not</em> mean "95% probability the true mean is in <em>this</em> interval" — the true mean is fixed, not random. It means: <strong>if you repeated the whole procedure many times, ~95% of the intervals would capture the truth.</strong> Confidence is a property of the <em>method</em>, not of one interval.</p></div>

<div class="viz" data-viz="confidenceInterval"></div>

<div class="callout interview" data-icon="💼"><div class="callout-title">Interview angle</div><p>"Wider or narrower CI if I…" — increase $n$ → <strong>narrower</strong> (more info); increase confidence 95%→99% → <strong>wider</strong> (must cover more to be surer); increase variability σ → <strong>wider</strong>. The trade-off between confidence level and precision is the whole game. Bonus: mention the <strong>bootstrap</strong> as a model-free way to get CIs when formulas don't exist.</p></div>

<div class="callout aiml" data-icon="🤖"><div class="callout-title">AI/ML connection</div><p>Report model metrics with CIs, not bare point estimates: "AUC 0.81 ± 0.03." It stops teams from chasing noise. The bootstrap (resample your test set with replacement, recompute the metric many times, take the 2.5/97.5 percentiles) is the practical workhorse for this in ML.</p></div>

<pre class="code" data-lang="python">import numpy as np
from scipy import stats
x = np.array([12, 15, 14, 10, 13, 16, 11, 14, 13, 15])
mean, se = x.mean(), stats.sem(x)            # sem uses sample std / sqrt(n)
ci = stats.t.interval(0.95, df=len(x)-1, loc=mean, scale=se)
print(f"mean={mean:.2f}  95% CI={ci}")       # t-interval (unknown sigma, small n)

# Bootstrap CI for any metric (here, the median)
boot = [np.median(np.random.choice(x, len(x), replace=True)) for _ in range(10000)]
print("bootstrap 95% CI for median:", np.percentile(boot, [2.5, 97.5]))</pre>
`
    },
    {
      id: 'hypothesis', title: 'Hypothesis testing, p-values & errors', icon: '⚔️',
      search: 'null alternative hypothesis test statistic p-value significance level alpha z-test t-test chi-square anova type I type II error power one two tailed multiple testing',
      html: `
<p class="lead">A hypothesis is a claim ("this team member is excellent"; "version B converts better"). To <em>validate</em> it you need data — and a disciplined way to decide whether the data is surprising enough to act on.</p>

<div class="callout definition" data-icon="📐"><div class="callout-title">The setup</div>
<ul>
<li><b>Null $H_0$</b>: the boring default — "no effect," "no difference." We assume it true until the data forces otherwise.</li>
<li><b>Alternative $H_1$</b>: what we suspect — "there is an effect."</li>
<li><b>Test statistic</b>: how far the data sits from $H_0$, in standard-error units (e.g. $z=\\frac{\\bar{x}-\\mu_0}{\\sigma/\\sqrt{n}}$).</li>
<li><b>p-value</b>: assuming $H_0$ is true, the probability of data <em>at least this extreme</em>.</li>
</ul></div>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">Intuition · proof by contradiction with chance</div><p>Assume the null. Compute how weird your data would be under that assumption (the p-value). If it's weird enough (p &lt; α, usually 0.05), you <strong>reject the null</strong> — the assumption strained credulity. It's "innocent until proven guilty": we never <em>prove</em> $H_0$, we just fail to reject it.</p></div>

<div class="callout pitfall" data-icon="⚠️"><div class="callout-title">What a p-value is NOT</div><p>p is <em>not</em> P(null is true), and "p &gt; 0.05" does <em>not</em> prove there's no effect. p &lt; 0.05 isn't "95% sure it's real." A p-value answers only: "<strong>how surprising is this data if the null holds?</strong>" Small effects become "significant" with huge $n$ — always report the <strong>effect size</strong> too.</p></div>

<h3>Picking the test</h3>
<div class="tbl-wrap"><table class="data">
<tr><th>Question</th><th>Test</th></tr>
<tr><td>Mean vs known value, σ known / large n</td><td><b>z-test</b></td></tr>
<tr><td>Mean(s), σ unknown, small n</td><td><b>t-test</b> (one-sample, two-sample, paired)</td></tr>
<tr><td>Association between two categorical variables</td><td><b>χ² test</b></td></tr>
<tr><td>Comparing means of 3+ groups</td><td><b>ANOVA</b> (F-test)</td></tr>
</table></div>

<h2>Two ways to be wrong: Type I & Type II</h2>
<div class="tbl-wrap"><table class="data">
<tr><th></th><th>$H_0$ true</th><th>$H_0$ false</th></tr>
<tr><td><b>Reject $H_0$</b></td><td>Type I error (α) — false alarm</td><td>✓ correct (power = 1−β)</td></tr>
<tr><td><b>Fail to reject</b></td><td>✓ correct</td><td>Type II error (β) — missed effect</td></tr>
</table></div>

<div class="viz" data-viz="errorsPower"></div>

<div class="callout interview" data-icon="💼"><div class="callout-title">Interview angle · the α/β/power triangle</div><p>Lowering α (fewer false alarms) <em>raises</em> β (more misses) for fixed $n$ — you can't shrink both without more data or a bigger effect. <strong>Power</strong> = 1−β = probability of detecting a real effect; you raise it with larger $n$, larger effect size, or lower noise. A spam filter tunes α vs β as precision vs recall; medical screening favours high power (don't miss disease) at the cost of more false alarms.</p></div>

<div class="callout pitfall" data-icon="⚠️"><div class="callout-title">Multiple testing</div><p>Run 20 tests at α=0.05 and you expect ~1 false positive by chance alone — this is p-hacking. Correct with <strong>Bonferroni</strong> (divide α by the number of tests) or <strong>FDR / Benjamini–Hochberg</strong>. Hugely relevant when screening many features or running many A/B variants.</p></div>

<div class="callout aiml" data-icon="🤖"><div class="callout-title">AI/ML connection · A/B testing & model comparison</div><p>Hypothesis testing is how you decide a new model/feature is a real improvement, not noise: $H_0$ = "no lift." Type I = shipping a useless change; Type II = killing a good one. Power analysis tells you how much traffic an A/B test needs. The precision/recall and ROC trade-offs you tune in classifiers are the same α/β dial in disguise.</p></div>

<pre class="code" data-lang="python">from scipy import stats
import numpy as np

# Two-sample t-test: did model B's per-example errors beat model A's?
errA = np.array([0.21,0.25,0.19,0.30,0.22,0.27,0.24])
errB = np.array([0.18,0.20,0.17,0.19,0.21,0.16,0.22])
t, p = stats.ttest_ind(errA, errB, equal_var=False)   # Welch's t-test
print(f"t={t:.2f}, p={p:.4f}", "-> reject H0" if p < 0.05 else "-> cannot reject")

# Chi-square test of independence (e.g. device vs converted)
table = np.array([[30, 70], [45, 55]])
chi2, p, dof, exp = stats.chi2_contingency(table)
print(f"chi2={chi2:.2f}, p={p:.4f}")

# Bonferroni: testing 20 features, keep family-wise alpha = 0.05
alpha_corrected = 0.05 / 20
print("per-test threshold:", alpha_corrected)   # 0.0025</pre>
`
    }
  ],
  cheatsheet: `
<p class="lead">Module 4 recall — from sample to claim.</p>
<div class="grid cols-2">
<div class="card"><h4>SE & CLT</h4><p>$\\text{SE}=\\sigma/\\sqrt{n}$. Sample mean ≈ Normal$(\\mu,\\sigma/\\sqrt{n})$ for large $n$, any population shape.</p></div>
<div class="card"><h4>Confidence interval</h4><p>$\\bar{x}\\pm z_{\\alpha/2}\\,\\sigma/\\sqrt{n}$ (z=1.96 for 95%). Property of the <i>method</i>: ~95% of such intervals cover μ.</p></div>
<div class="card"><h4>p-value</h4><p>P(data this extreme | $H_0$ true). Reject if p &lt; α. Not P(H₀ true); not effect size.</p></div>
<div class="card"><h4>Tests</h4><p>z (σ known), t (σ unknown/small n), χ² (categorical association), ANOVA (3+ means).</p></div>
<div class="card"><h4>Errors</h4><p>Type I (α) = false alarm; Type II (β) = miss; power = 1−β. Trade-off fixed by n &amp; effect size.</p></div>
<div class="card"><h4>Multiple testing</h4><p>Many tests inflate false positives. Bonferroni (α/m) or FDR/BH.</p></div>
</div>
<div class="callout interview" data-icon="💼"><div class="callout-title">A/B test in one breath</div><p>$H_0$: no lift. Pick metric + α + power → compute required sample size. Run, compute p-value &amp; effect size with a CI. Reject only if p &lt; α <em>and</em> effect is practically meaningful. Type I = shipping noise; Type II = killing a winner.</p></div>
<div class="viz" data-viz="flashcards" data-title="Module 4 rapid recall" data-cards='[
{"q":"Standard error of the mean?","a":"SE = σ/√n. Quadruple n to halve the error."},
{"q":"What does the CLT say?","a":"Sample means are ~Normal(μ, σ/√n) for large n, whatever the population shape."},
{"q":"What does 95% confidence mean?","a":"~95% of intervals built this way cover the true μ. A property of the procedure, not one interval."},
{"q":"Define the p-value.","a":"P(data at least this extreme | H₀ true). Small p ⟹ data surprising under H₀."},
{"q":"Type I vs Type II?","a":"Type I (α): reject a true H₀ (false alarm). Type II (β): fail to reject a false H₀ (miss)."},
{"q":"Power?","a":"1 − β = chance of detecting a real effect. Raise with bigger n, bigger effect, less noise."},
{"q":"3+ group means — which test?","a":"ANOVA (F-test). Two means → t-test. Categorical association → χ²."},
{"q":"20 tests at α=0.05?","a":"Expect ~1 false positive by chance. Use Bonferroni (α/20) or FDR control."}
]'></div>
`,
  quiz: [
    { q: 'The Central Limit Theorem guarantees that, for large n, which is approximately Normal?', opts: ['The population itself', 'The individual data values', 'The sampling distribution of the sample mean', 'The variance'], answer: 2, explain: 'The CLT is about the <b>sample mean’s</b> distribution: it tends to Normal(μ, σ/√n) regardless of the population shape. The raw population can be any shape at all.' },
    { q: 'You quadruple your sample size. The standard error of the mean…', opts: ['Quadruples', 'Doubles', 'Halves', 'Is unchanged'], answer: 2, explain: 'SE = σ/√n. Multiplying n by 4 multiplies √n by 2, so SE is <b>halved</b>. Precision improves only with the square root of n — the law of diminishing returns on "more data."' },
    { q: 'A 95% confidence interval for a mean is [40, 46]. Which statement is correct?', opts: ['There is a 95% probability μ is between 40 and 46', '95% of the data lies between 40 and 46', 'If we repeated the procedure, ~95% of such intervals would contain the true μ', 'The sample mean has a 95% chance of being 43'], answer: 2, explain: 'Confidence is a property of the <b>procedure</b>: ~95% of intervals built this way capture the fixed (non-random) μ. Any single interval either contains μ or not — there’s no probability attached to it after the fact.' },
    { q: 'A p-value of 0.03 means:', opts: ['There is a 3% chance the null is true', 'There is a 97% chance the effect is real', 'If the null were true, data this extreme would occur 3% of the time', 'The effect size is 3%'], answer: 2, explain: 'The p-value is P(data at least this extreme | H₀ true) = 0.03. It says nothing directly about P(H₀ true) or the effect size — common misreadings that interviewers probe.' },
    { q: 'For fixed sample size, lowering α (e.g. 0.05 → 0.01) does what to Type II error β?', opts: ['Lowers β too', 'Raises β (and lowers power)', 'No effect on β', 'Eliminates β'], answer: 1, explain: 'There’s a trade-off: making it harder to falsely reject (lower α) makes it easier to miss a real effect (higher β, lower power). To shrink both you need a larger n or a bigger true effect.' },
    { q: 'You want to compare conversion across four landing-page designs. Best test?', opts: ['Four separate t-tests', 'A single ANOVA (F-test)', 'A z-test', 'A correlation'], answer: 1, explain: 'Comparing 3+ group means → <b>ANOVA</b>. Running many pairwise t-tests inflates the Type I error (multiple testing). ANOVA tests "are any means different?" with one controlled test, then you do corrected post-hoc comparisons.' },
    { q: 'In an A/B test, "shipping a change that actually does nothing" corresponds to which error?', opts: ['Type I (false positive)', 'Type II (false negative)', 'Sampling bias', 'Low power'], answer: 0, explain: 'H₀ = "no lift." Rejecting it when it’s true (shipping a useless change) is a <b>Type I error</b>. Killing a genuinely good change is Type II. Framing A/B outcomes in these terms is a Tech-Lead-level answer.' },
    { q: 'Why report a metric like "AUC 0.81 ± 0.03" instead of just "0.81"?', opts: ['It looks more professional', 'The ± is the uncertainty (e.g. bootstrap CI); it stops teams chasing noise', 'It makes the model better', 'It is required by scikit-learn'], answer: 1, explain: 'The interval communicates sampling uncertainty of the estimate. Without it, a 0.81 vs 0.80 "improvement" may be pure noise. Bootstrapping the test set is the standard way to get that ±.' }
  ]
});
