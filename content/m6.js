Course.addModule({
  id: 'm6', num: 6, icon: '🌀',
  title: 'Gaussian Mixtures & EM',
  subtitle: 'Model data as a blend of hidden clusters, and learn the hidden labels with Expectation–Maximization.',
  tags: ['GMM', 'EM', 'latent variables', 'soft clustering'],
  sections: [
    {
      id: 'gmm', title: 'Gaussian Mixture Models', icon: '🎨',
      search: 'gaussian mixture model GMM latent variable cluster soft clustering responsibility mixture weights multimodal density estimation kmeans',
      html: `
<p class="lead">A single Gaussian can't describe data that clusters into several groups. A <strong>Gaussian Mixture Model</strong> says: the data is a <em>blend</em> of several Gaussians, each a hidden sub-population.</p>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">Intuition · heights in a mixed crowd</div><p>Plot the heights of a room mixing adults and children — you see <em>two</em> humps, not one bell. Neither a single mean nor a single SD describes it well. A GMM models it as "45% drawn from a child-Gaussian + 55% from an adult-Gaussian." The hidden "which group?" label is a <strong>latent variable</strong>.</p></div>

<div class="callout definition" data-icon="📐"><div class="callout-title">The model</div>
<div class="formula">$$p(x) = \\sum_{k=1}^{K} \\pi_k \\,\\mathcal{N}(x \\mid \\mu_k, \\Sigma_k), \\qquad \\sum_k \\pi_k = 1$$</div>
<p>$\\pi_k$ = <b>mixing weight</b> (size of cluster $k$), $\\mu_k,\\Sigma_k$ = its mean and covariance. To <em>generate</em> a point: first pick a cluster with prob $\\pi_k$ (a categorical draw — Module 3), then draw from that Gaussian.</p></div>

<h3>Soft assignment: responsibilities</h3>
<p>Unlike hard clustering, a GMM gives each point a <strong>responsibility</strong> — the posterior probability it belongs to each cluster (straight from Bayes!):</p>
<div class="formula"><span class="formula-label">Responsibility of cluster k for point x</span>$$\\gamma_k(x) = \\frac{\\pi_k\\,\\mathcal{N}(x\\mid\\mu_k,\\Sigma_k)}{\\sum_j \\pi_j\\,\\mathcal{N}(x\\mid\\mu_j,\\Sigma_j)}$$</div>
<p>A point between two clusters might be 60% cluster A, 40% cluster B — richer than a hard label.</p>

<div class="callout interview" data-icon="💼"><div class="callout-title">Interview angle · GMM vs K-means</div><p>K-means is essentially a GMM with <em>hard</em> assignments and spherical, equal-size clusters. GMM adds: (1) <strong>soft</strong> probabilistic membership, (2) clusters of different <strong>shapes/sizes</strong> via full covariance, (3) a genuine <strong>density model</strong> $p(x)$ you can sample from and score new points with. The catch: more parameters, can overfit, sensitive to initialisation, and you still must choose $K$ (via BIC/AIC).</p></div>

<div class="callout aiml" data-icon="🤖"><div class="callout-title">AI/ML connection</div><p>GMMs power <strong>soft clustering</strong>, <strong>density estimation</strong>, <strong>anomaly detection</strong> (low $p(x)$ = outlier), speaker/image segmentation, and the background-modelling in classic computer vision. They're the conceptual ancestor of <strong>VAEs</strong> and other latent-variable generative models, and the bridge from "fit a curve" to "model how the data was generated."</p></div>
`
    },
    {
      id: 'em', title: 'Expectation–Maximization', icon: '🔄',
      search: 'expectation maximization EM algorithm E-step M-step latent variable log likelihood convergence local optimum initialization chicken and egg responsibilities',
      html: `
<p class="lead">Here's the chicken-and-egg problem: if we knew which cluster each point came from, fitting the Gaussians would be easy. If we knew the Gaussians, assigning points would be easy. We know neither. <strong>EM breaks the loop by alternating.</strong></p>

<div class="callout theorem" data-icon="📜"><div class="callout-title">The EM algorithm</div>
<ol>
<li><b>Initialise</b> the parameters $\\{\\pi_k,\\mu_k,\\Sigma_k\\}$ (often via K-means).</li>
<li><b>E-step</b> — given current parameters, compute each point's <em>responsibilities</em> $\\gamma_k(x)$ (soft cluster assignments).</li>
<li><b>M-step</b> — given those soft assignments, re-estimate each Gaussian's $\\mu_k,\\Sigma_k,\\pi_k$ as responsibility-weighted averages.</li>
<li><b>Repeat</b> E and M until the log-likelihood stops improving.</li>
</ol></div>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">Intuition · two people drawing a boundary in fog</div><p>Each round: "given where I think the clusters are, how much does each point belong to each?" (E), then "given those soft memberships, where should each cluster actually sit?" (M). Each step can only <em>increase</em> (never decrease) the likelihood, so it climbs steadily to a peak. Watch it lock on:</p></div>

<div class="viz" data-viz="gmmEM"></div>

<div class="callout pitfall" data-icon="⚠️"><div class="callout-title">Pitfalls</div><p>EM finds a <strong>local</strong> optimum, not the global one — so <strong>initialisation matters</strong> (run several restarts, keep the best likelihood). A Gaussian can <strong>collapse</strong> onto a single point (variance → 0, likelihood → ∞); regularise the covariance to prevent it. And EM never tells you $K$ — choose it with <strong>BIC/AIC</strong> or domain knowledge.</p></div>

<div class="callout interview" data-icon="💼"><div class="callout-title">Interview angle · "why does EM work?"</div><p>EM maximises a hard likelihood $\\log p(x\\mid\\theta)=\\log\\sum_z p(x,z\\mid\\theta)$ where the sum over the latent $z$ blocks a direct solution. EM instead repeatedly maximises a tractable <strong>lower bound</strong> (the ELBO): the E-step makes the bound tight at the current $\\theta$; the M-step pushes the bound up. Because each step doesn't decrease the true likelihood, it converges. This ELBO idea is exactly what reappears in <strong>variational inference and VAEs</strong> — a great senior-level connection to draw.</p></div>

<div class="callout aiml" data-icon="🤖"><div class="callout-title">AI/ML connection · EM is a pattern, not just a GMM trick</div><p>The "fill in the missing thing (E), then optimise (M)" loop powers <strong>K-means</strong> (hard-assignment EM), <strong>Hidden Markov Models</strong> (Baum–Welch), missing-data imputation, topic models, and semi-supervised learning. Whenever there's a hidden/latent variable, think EM.</p></div>

<pre class="code" data-lang="python">import numpy as np
from sklearn.mixture import GaussianMixture

# Two hidden clusters
rng = np.random.default_rng(0)
X = np.concatenate([rng.normal(30, 6, 120), rng.normal(62, 8, 160)]).reshape(-1,1)

gmm = GaussianMixture(n_components=2, n_init=10, random_state=0).fit(X)  # n_init = restarts
print("means   ", gmm.means_.ravel())      # ~[30, 62]
print("weights ", gmm.weights_)            # ~[0.43, 0.57]

resp = gmm.predict_proba([[46]])           # soft assignment for a borderline point
print("responsibilities at x=46:", resp.round(2))

# Choose K with BIC (lower is better)
bics = [GaussianMixture(k, n_init=5).fit(X).bic(X) for k in range(1,6)]
print("best K by BIC:", np.argmin(bics)+1)</pre>

<div class="callout aiml" data-icon="🎓"><div class="callout-title">You've reached the summit</div><p>You've now travelled the full arc: <strong>describe</strong> data (M1) → reason about <strong>chance</strong> (M2) → <strong>update beliefs</strong> &amp; model variables (M3) → <strong>infer</strong> from samples (M4) → <strong>predict &amp; forecast</strong> (M5) → <strong>model hidden structure</strong> (M6). The story of <em>describing</em> data has become the story of <em>modelling</em> it — exactly the journey from analyst to AI Tech Lead. Run the Practice Quiz to lock it in. 🚀</p></div>
`
    }
  ],
  cheatsheet: `
<p class="lead">Module 6 recall — mixtures &amp; EM.</p>
<div class="formula"><span class="formula-label">Gaussian Mixture</span>$$p(x)=\\sum_{k=1}^{K}\\pi_k\\,\\mathcal{N}(x\\mid\\mu_k,\\Sigma_k),\\quad \\sum_k\\pi_k=1$$</div>
<div class="grid cols-2">
<div class="card"><h4>Responsibility</h4><p>$\\gamma_k(x)=\\dfrac{\\pi_k\\mathcal N(x\\mid\\mu_k,\\Sigma_k)}{\\sum_j\\pi_j\\mathcal N(x\\mid\\mu_j,\\Sigma_j)}$ — Bayes posterior over clusters (soft label).</p></div>
<div class="card"><h4>EM loop</h4><p>E: compute responsibilities. M: update $\\mu,\\Sigma,\\pi$ as weighted averages. Repeat until log-likelihood plateaus.</p></div>
<div class="card"><h4>GMM vs K-means</h4><p>GMM = soft, any shape/size, a density $p(x)$. K-means = hard, spherical, equal-size (≈ EM with hard E-step).</p></div>
<div class="card"><h4>Gotchas</h4><p>Local optima → restarts. Variance collapse → regularise Σ. Choose K via BIC/AIC.</p></div>
</div>
<div class="callout interview" data-icon="💼"><div class="callout-title">Senior soundbite</div><p>EM repeatedly tightens and lifts a lower bound (the ELBO) on the log-likelihood; each step can't decrease it, so it converges to a local optimum. The same ELBO idea powers variational inference and VAEs.</p></div>
<div class="viz" data-viz="flashcards" data-title="Module 6 rapid recall" data-cards='[
{"q":"What is a GMM?","a":"A weighted sum of K Gaussians: p(x)=Σ πₖ 𝒩(x|μₖ,Σₖ). Models multimodal data as a blend of hidden clusters."},
{"q":"What is a responsibility?","a":"The posterior probability (via Bayes) that point x belongs to cluster k — a soft assignment."},
{"q":"E-step vs M-step?","a":"E: compute responsibilities from current params. M: re-estimate μ, Σ, π from responsibility-weighted data."},
{"q":"GMM vs K-means?","a":"GMM = soft, arbitrary covariance, full density p(x). K-means = hard, spherical, equal-size clusters."},
{"q":"Why does EM converge?","a":"Each E+M step cannot decrease the log-likelihood (it lifts a lower bound, the ELBO) → climbs to a local optimum."},
{"q":"Two EM pitfalls?","a":"Local optima (use restarts) and variance collapse onto a point (regularise the covariance)."},
{"q":"How to choose K?","a":"BIC/AIC (lower is better) or domain knowledge — EM itself does not choose K."},
{"q":"Where else does the EM pattern appear?","a":"K-means, HMMs (Baum–Welch), missing-data imputation, topic models, VAEs (via the ELBO)."}
]'></div>
`,
  quiz: [
    { q: 'What fundamental problem does EM solve for a GMM?', opts: ['Choosing the number of clusters K', 'The chicken-and-egg of needing labels to fit Gaussians and Gaussians to assign labels', 'Computing the mean of one Gaussian', 'Removing outliers'], answer: 1, explain: 'If we knew each point’s cluster, fitting Gaussians is easy; if we knew the Gaussians, assigning points is easy. We know neither. EM alternates E (assign softly) and M (refit) to break the deadlock. It does NOT choose K — that’s BIC/AIC.' },
    { q: 'A "responsibility" γₖ(x) in a GMM is:', opts: ['The mixing weight πₖ', 'The posterior probability that point x came from cluster k', 'The variance of cluster k', 'The number of points in cluster k'], answer: 1, explain: 'γₖ(x) = πₖ𝒩(x|μₖ,Σₖ) / Σⱼ πⱼ𝒩(x|μⱼ,Σⱼ) — a Bayes posterior over which cluster generated x. It’s the soft assignment that makes GMM richer than hard clustering.' },
    { q: 'Which statement about GMM vs K-means is correct?', opts: ['K-means gives soft probabilistic memberships; GMM gives hard ones', 'GMM gives soft memberships and can model elliptical clusters of different sizes', 'They always give identical results', 'GMM cannot model cluster sizes'], answer: 1, explain: 'GMM yields soft (probabilistic) assignments and, with full covariances, elliptical clusters of varying shape/size, plus a density p(x). K-means is the special case with hard assignments and spherical, equal-size clusters.' },
    { q: 'In the M-step of EM for a GMM, the new cluster mean μₖ is computed as…', opts: ['The unweighted average of all points', 'The responsibility-weighted average of the points', 'The median of the points', 'A random point'], answer: 1, explain: 'M-step uses soft counts: μₖ = Σᵢ γₖ(xᵢ)xᵢ / Σᵢ γₖ(xᵢ). Each point contributes in proportion to how much cluster k is "responsible" for it. The variance and weight πₖ are updated the same weighted way.' },
    { q: 'Why run EM with several random initialisations (n_init > 1)?', opts: ['To speed it up', 'Because EM converges only to a local optimum, so restarts find a better one', 'To choose K automatically', 'To avoid computing responsibilities'], answer: 1, explain: 'EM’s likelihood surface is non-convex; it climbs to whatever local optimum is nearest the start. Multiple restarts (keep the highest log-likelihood) guard against a poor initialisation.' },
    { q: 'A GMM’s log-likelihood shoots to +∞ during training. The likely cause?', opts: ['Too many data points', 'A Gaussian collapsing onto a single point (variance → 0)', 'The learning rate is too high', 'K is too small'], answer: 1, explain: 'If one component centres on a single point and its variance shrinks to 0, the density at that point blows up. The fix is to regularise/floor the covariance (e.g. reg_covar in sklearn).' },
    { q: 'The EM pattern of "infer hidden variable, then optimise" also underlies which of these?', opts: ['Sorting algorithms', 'K-means, Hidden Markov Models (Baum–Welch), and VAEs', 'Linear regression closed-form solution', 'The chi-square test'], answer: 1, explain: 'Whenever there’s a latent/hidden variable, the E-then-M loop applies: K-means (hard EM), HMMs via Baum–Welch, missing-data imputation, topic models, and — via the same ELBO bound — variational autoencoders.' },
    { q: 'How should you choose the number of components K for a GMM?', opts: ['Always use K=2', 'Pick K by minimising BIC/AIC or using domain knowledge', 'Use the K with the highest training likelihood', 'EM outputs K automatically'], answer: 1, explain: 'Training likelihood always improves with more components (overfitting), so you can’t use it to pick K. BIC/AIC penalise complexity — choose the K that minimises them, balanced with what the domain suggests.' }
  ]
});
