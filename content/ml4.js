Course.addModule({
  id: 'ml4', num: 'ML4', icon: '🚦',
  title: 'Logistic Regression & Classification Evaluation',
  subtitle: 'Turning regression into classification with the sigmoid, the cross-entropy loss, interpreting coefficients, the confusion matrix, precision/recall/F1, ROC–AUC, thresholds, and multi-class strategies.',
  tags: ['logistic regression', 'sigmoid', 'cross-entropy', 'confusion matrix', 'precision/recall', 'ROC–AUC', 'multi-class'],
  sections: [
    {
      id: 'framing', title: 'From regression to classification', icon: '🧭',
      search: 'classification decision boundary discriminant function generative model posterior probability linearly separable least squares outliers why linear regression fails',
      html: `
<p class="lead">For classification we don't fit a best line; we find a <strong>decision boundary</strong> that separates the classes, and we usually express the answer as a <strong>probability</strong>.</p>

<div class="callout definition" data-icon="📐"><div class="callout-title">Two ways to classify</div>
<ul>
<li><b>Discriminative models</b> directly estimate the class / the posterior probability $P(\\text{class}\\mid x)$. Examples: logistic regression, SVM, decision trees, kNN, neural nets.</li>
<li><b>Generative models</b> learn the underlying distribution of each class, then use it to classify <em>and</em> to generate new synthetic data. Examples: Naïve Bayes, Gaussian Mixture Models.</li>
</ul></div>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">Linearly separable or not</div><p>If two classes can be cleanly split, the data is <b>linearly separable</b>, so you can find the line/hyperplane. Real data usually overlaps, so some misclassification is unavoidable; pick the boundary with the <b>lowest probability of error</b>. Whichever posterior probability is larger wins.</p></div>

<h2>Why not just use linear regression?</h2>
<p>You can fit a line and threshold it at $y=0.5$ to classify. It works on clean, separable data, but it is <b>very sensitive to outliers</b>: one extreme point swings the least-squares line and ruins the boundary (because MSE is outlier-sensitive).</p>

<div class="callout pitfall" data-icon="⚠️"><div class="callout-title">The fix: logistic regression</div><p>Logistic regression is <b>robust to outliers</b> and outputs a proper probability in [0,1]. It uses regression machinery (gradient descent) but solves a classification problem, so it is "regression" in name only. For non-linearly-separable data, transform features or move to SVM / neural nets.</p></div>
`
    },
    {
      id: 'sigmoid', title: 'The sigmoid & the hypothesis', icon: '🇸',
      search: 'sigmoid logistic function hypothesis theta transpose x probability log odds ratio decision boundary one by one plus e to the power minus',
      html: `
<p class="lead">Linear regression outputs values in $(-\\infty,\\infty)$. For a probability we need $[0,1]$. The <strong>sigmoid (logistic) function</strong> squashes any real number into that range.</p>

<div class="formula"><span class="formula-label">Sigmoid</span>
$$g(z)=\\frac{1}{1+e^{-z}}\\in(0,1)$$</div>

<p>It is the S-shaped curve: large negative $z\\to0$, large positive $z\\to1$, $z=0\\to0.5$. Feed it the linear score $z=\\theta^T x$:</p>

<div class="formula"><span class="formula-label">Logistic-regression hypothesis</span>
$$h_\\theta(x)=g(\\theta^T x)=\\frac{1}{1+e^{-\\theta^T x}}$$</div>

<div class="callout definition" data-icon="📐"><div class="callout-title">What the output means</div><p>$h_\\theta(x)$ is the probability the point belongs to the <b>positive class</b>. By default, $h_\\theta(x)\\ge 0.5$ → positive, else negative. (Probability of the negative class is $1-h_\\theta(x)$.) The probability is always reported with respect to the positive class.</p></div>

<div class="viz" data-viz="classificationThreshold"></div>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">Log-odds: it's still linear</div><p>Rearranging gives $\\theta^T x=\\ln\\dfrac{p}{1-p}$: the linear score equals the <b>log-odds</b> (log of the odds for vs against). So logistic regression is a <b>linear model</b> of the log-odds; the boundary $\\theta^T x=0$ is a line/hyperplane. The sigmoid just maps that linear score to a probability.</p></div>

<p>To build the hypothesis: count features → $d+1$ parameters → write $\\theta^T x=\\theta_0+\\theta_1x_1+\\dots$ → wrap in the sigmoid. Then solve for $\\theta$ exactly like linear regression: initialise, set learning rate, gradient descent.</p>
`
    },
    {
      id: 'training', title: 'Cross-entropy loss, gradient descent & interpretation', icon: '⚙️',
      search: 'cross entropy loss log loss cost function gradient descent logistic regression coefficient interpretation odds ratio exp regularization',
      html: `
<p class="lead">MSE on the sigmoid gives a non-convex cost full of local minima. So logistic regression uses a different, convex cost: <strong>cross-entropy (log loss)</strong>.</p>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">Designing the cost</div><p>We want: when actual $y=1$, the error is low if $\\hat y\\to1$ and high if $\\hat y\\to0$, which is $-\\log(\\hat y)$. When $y=0$, we want the mirror, which is $-\\log(1-\\hat y)$. Combine them into one equation by switching with $y$ and $(1-y)$:</p></div>

<div class="formula"><span class="formula-label">Cross-entropy (log loss)</span>
$$J(\\theta)=-\\frac{1}{n}\\sum_{i=1}^{n}\\Bigl[y^{(i)}\\log h_\\theta(x^{(i)})+(1-y^{(i)})\\log\\bigl(1-h_\\theta(x^{(i)})\\bigr)\\Bigr]$$</div>

<p>When $y=1$ only the first term is active; when $y=0$ only the second. Together they form a convex curve we can minimise with gradient descent.</p>

<div class="callout definition" data-icon="📐"><div class="callout-title">The surprise: same gradient as linear regression</div><p>Differentiating cross-entropy gives the <b>same</b> update form:
$$\\theta_j\\leftarrow\\theta_j-\\alpha\\frac{1}{n}\\sum\\bigl(h_\\theta(x^{(i)})-y^{(i)}\\bigr)x_j^{(i)}$$
The only difference from linear regression is that $h_\\theta(x)$ is now the sigmoid. Everything else (simultaneous update, $x_0=1$, regularisation) carries over unchanged.</p></div>

<h2>Interpreting the coefficients</h2>
<p>Because $\\theta^T x$ is the log-odds, a coefficient is the change in log-odds per unit change in its feature. Exponentiate to read it as an odds multiplier:</p>
<div class="grid cols-2">
<div class="card"><h4>Positive coefficient</h4><p>e.g. $\\theta_{\\text{CGPA}}=0.3$: each +1 CGPA multiplies the odds by $e^{0.3}\\approx1.35$ (odds up ~35%).</p></div>
<div class="card"><h4>Negative coefficient</h4><p>e.g. $\\theta=-0.45$: odds multiplied by $e^{-0.45}\\approx0.64$ (odds down ~36%).</p></div>
</div>

<div class="callout pitfall" data-icon="⚠️"><div class="callout-title">Regularisation carries over</div><p>Add the same ridge/lasso penalty to the cross-entropy cost; the gradient form is unchanged. In scikit-learn the regularisation strength is $C=1/\\lambda$, so a larger $C$ means weaker regularisation.</p></div>
`
    },
    {
      id: 'confusion', title: 'Confusion matrix, accuracy, precision & recall', icon: '🧩',
      search: 'confusion matrix true positive false positive true negative false negative accuracy precision recall F1 score imbalanced data harmonic mean',
      html: `
<p class="lead">For categorical predictions we evaluate with a <strong>confusion matrix</strong>: a table of actual vs predicted classes from which every classification metric is derived.</p>

<div class="callout definition" data-icon="📐"><div class="callout-title">The four cells</div>
<ul>
<li><b>TP</b> (true positive): positive, predicted positive (correct).</li>
<li><b>TN</b> (true negative): negative, predicted negative (correct).</li>
<li><b>FP</b> (false positive): negative, predicted positive (wrong).</li>
<li><b>FN</b> (false negative): positive, predicted negative (wrong).</li>
</ul><p>Rows = actual class, columns = predicted class. You fill it by matching $y$ with $\\hat y$ and counting.</p></div>

<div class="formula"><span class="formula-label">Accuracy</span>
$$\\text{Accuracy}=\\frac{TP+TN}{TP+TN+FP+FN}$$</div>

<div class="callout pitfall" data-icon="⚠️"><div class="callout-title">Accuracy lies on imbalanced data</div><p>With 10,000 positives and 100 negatives, a model that predicts "positive" for everything scores ~99% accuracy while learning nothing. <b>Accuracy is only safe on balanced data.</b> For imbalanced data, balance it (sampling) or use other metrics.</p></div>

<h2>Precision vs recall</h2>
<div class="grid cols-2">
<div class="card"><h4>Precision = $\\dfrac{TP}{TP+FP}$</h4><p>Of everything predicted positive, how much was truly positive? High precision needs <b>few false positives</b>. Matters when false alarms are costly (e.g. fraud blocking good users).</p></div>
<div class="card"><h4>Recall = $\\dfrac{TP}{TP+FN}$</h4><p>Of all actual positives, how many did we catch? High recall needs <b>few false negatives</b>. Matters when misses are costly (e.g. disease detection).</p></div>
</div>

<h2>F1 score</h2>
<div class="formula"><span class="formula-label">Harmonic mean of precision & recall</span>
$$F_1=\\frac{2PR}{P+R}$$</div>
<p>When you can't decide whether precision or recall matters more (common for imbalanced data), F1 balances both. Higher F1 = better model. All these range 0–1.</p>

<div class="callout interview" data-icon="💼"><div class="callout-title">Pick the metric from the cost of errors</div><p>Decide whether a false positive or a false negative hurts more <em>for your problem</em>. Medical diagnosis → optimise <b>recall</b> (don't miss sick patients). Fraud blocking → care about <b>precision</b> (don't block good users). Unsure → <b>F1</b>.</p></div>
`
    },
    {
      id: 'roc', title: 'ROC curve, AUC & threshold selection', icon: '📊',
      search: 'ROC curve receiver operating characteristic true positive rate false positive rate AUC area under curve threshold selection sensitivity specificity',
      html: `
<p class="lead">The default decision threshold is 0.5, but you can tune it. The <strong>ROC curve</strong> visualises the trade-off across all thresholds and lets you pick the best one.</p>

<div class="callout definition" data-icon="📐"><div class="callout-title">TPR and FPR</div>
<ul>
<li><b>True Positive Rate</b> $=\\dfrac{TP}{TP+FN}$ (this is recall), plotted on the y-axis.</li>
<li><b>False Positive Rate</b> $=\\dfrac{FP}{FP+TN}$, plotted on the x-axis.</li>
</ul><p>We want <b>high TPR, low FPR</b>: the top-left corner $(0,1)$ is the ideal.</p></div>

<h2>Reading the ROC curve</h2>
<div class="grid cols-2">
<div class="card"><h4>The diagonal</h4><p>The 45° line = random guessing (no learning). Your curve should bow <b>above</b> it, towards the top-left.</p></div>
<div class="card"><h4>AUC: area under the curve</h4><p>0.5 = random; 1.0 = perfect. Higher AUC = better model. AUC lets you compare two models when the curves are hard to read by eye.</p></div>
</div>

<h2>Building the ROC curve & choosing a threshold</h2>
<ol>
<li>Sort test points by predicted probability (descending).</li>
<li>Treat each probability as a threshold: $\\hat y=1$ if $p\\ge\\text{threshold}$, else 0.</li>
<li>For each threshold, build the confusion matrix → compute TPR and FPR.</li>
<li>Plot (FPR, TPR) for every threshold and join the points.</li>
<li>Pick the threshold whose point is nearest the top-left (highest TPR, lowest FPR).</li>
</ol>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">Why move off 0.5?</div><p>0.5 is just a default. A higher threshold $T$ on $\\theta^T x$ raises precision (fewer false positives); a lower $T$ raises recall (fewer false negatives). The ROC curve helps you pick $T$ for your problem with justification, or compare classifiers via AUC.</p></div>
`
    },
    {
      id: 'multiclass', title: 'Multi-class classification', icon: '🎛️',
      search: 'multiclass classification one vs rest one vs all one vs one binary classifiers OvR OvO SVM number of classifiers imbalance handling',
      html: `
<p class="lead">Everything so far was binary. For more than two classes we reduce the multi-class problem to several <strong>binary</strong> problems (or use models that handle it natively).</p>

<div class="grid cols-2">
<div class="card"><h4>One-vs-Rest (OvR / one-vs-all)</h4><p>Train one binary classifier per class: that class = positive, all others = negative. For $N$ classes → <b>$N$ classifiers</b>. Each gives a probability; the highest wins. The scikit-learn default for most algorithms.</p></div>
<div class="card"><h4>One-vs-One (OvO)</h4><p>Train a classifier for every <b>pair</b> of classes. For $N$ classes → $\\binom{N}{2}=\\dfrac{N(N-1)}{2}$ classifiers. The highest-voted class wins. The default for <b>SVM</b> in scikit-learn.</p></div>
</div>

<div class="callout definition" data-icon="📐"><div class="callout-title">Worked count</div><p>3 classes (triangle, square, cross): OvR → 3 classifiers (triangle-vs-rest, square-vs-rest, cross-vs-rest). OvO → 3 classifiers (△vs□, △vs✕, □vs✕). For 4 classes: OvR → 4, OvO → 6.</p></div>

<div class="callout aiml" data-icon="🤖"><div class="callout-title">Handling imbalance (recap)</div><p>If the rare class is the class of interest and accuracy is misleading: (1) generate synthetic samples (SMOTE) to balance, (2) switch to a metric robust to imbalance (precision/recall/F1, AUC), or (3) use an algorithm less affected by imbalance. Choose based on the problem and how much data you can collect.</p></div>

<div class="callout interview" data-icon="💼"><div class="callout-title">The pipeline, end to end</div><p>Define the task → pre-process & scale data → split → build hypothesis ($\\theta^T x$ → sigmoid) → gradient descent on cross-entropy (with regularisation) → predict probabilities → choose threshold → evaluate with confusion-matrix metrics & ROC–AUC → for many classes, wrap in OvR/OvO.</p></div>
`
    }
  ],
  cheatsheet: `
<p class="lead">Logistic Regression &amp; Classification Evaluation: one-page recall.</p>
<div class="grid cols-2">
<div class="card"><h4>Sigmoid</h4><p>$h_\\theta(x)=\\dfrac{1}{1+e^{-\\theta^T x}}$ → probability of the positive class. Threshold 0.5 by default.</p></div>
<div class="card"><h4>Log-odds</h4><p>$\\theta^T x=\\ln\\frac{p}{1-p}$. Logistic regression is linear in the log-odds; boundary at $\\theta^T x=0$.</p></div>
<div class="card"><h4>Cost</h4><p>Cross-entropy / log loss (convex). MSE would be non-convex on the sigmoid.</p></div>
<div class="card"><h4>Gradient</h4><p>Same form as linear regression: $\\theta_j\\leftarrow\\theta_j-\\alpha\\frac1n\\sum(\\hat y-y)x_j$, but $h_\\theta$ is the sigmoid.</p></div>
<div class="card"><h4>Coefficients</h4><p>Odds multiplied by $e^{\\theta_j}$ per unit feature change. Positive = odds up; negative = odds down.</p></div>
<div class="card"><h4>Confusion matrix</h4><p>TP, TN, FP, FN. Accuracy $=\\frac{TP+TN}{\\text{all}}$, unsafe on imbalanced data.</p></div>
<div class="card"><h4>Precision / recall / F1</h4><p>P $=\\frac{TP}{TP+FP}$, R $=\\frac{TP}{TP+FN}$, F1 $=\\frac{2PR}{P+R}$. F1 for imbalance.</p></div>
<div class="card"><h4>ROC / AUC</h4><p>TPR vs FPR; aim top-left. AUC 0.5 random, 1.0 perfect. Use for threshold choice & model comparison.</p></div>
</div>
<div class="callout interview" data-icon="💼"><div class="callout-title">Multi-class</div><ul>
<li><b>OvR</b>: $N$ classifiers (class vs rest). scikit-learn default.</li>
<li><b>OvO</b>: $\\binom{N}{2}$ classifiers (pairwise). SVM default.</li>
<li>Highest score/vote wins.</li>
</ul></div>
<div class="viz" data-viz="flashcards" data-title="Logistic & Evaluation rapid recall" data-cards='[
{"q":"Why use the sigmoid in logistic regression?","a":"It squashes the linear score into [0,1], giving the probability of the positive class. Threshold at 0.5 by default."},
{"q":"Why cross-entropy instead of MSE?","a":"MSE on the sigmoid is non-convex with local minima. Cross-entropy (log loss) is convex, so gradient descent works cleanly."},
{"q":"How is the logistic gradient related to linear regression?","a":"Identical update form, theta minus alpha times mean of (y-hat minus y) times x; only h(x) changes to the sigmoid."},
{"q":"Interpret a logistic coefficient of 0.3?","a":"Each unit increase in that feature multiplies the odds by e^0.3 approx 1.35, raising the odds about 35 percent."},
{"q":"Why is accuracy misleading on imbalanced data?","a":"Predicting the majority class always gives high accuracy while learning nothing. Use precision, recall, F1 or AUC instead."},
{"q":"Precision vs recall?","a":"Precision = TP/(TP+FP), few false alarms. Recall = TP/(TP+FN), few misses. F1 is their harmonic mean."},
{"q":"What does the ROC curve plot, and what is AUC?","a":"TPR vs FPR across thresholds; aim for the top-left. AUC is the area under it: 0.5 random, 1.0 perfect, higher is better."},
{"q":"OvR vs OvO classifier counts for N classes?","a":"One-vs-Rest needs N classifiers. One-vs-One needs N(N-1)/2 pairwise classifiers."}
]'></div>
`,
  quiz: [
    { q: 'Logistic regression uses the sigmoid to:', opts: ['Speed up training', 'Map the linear score to a probability in [0,1]', 'Remove outliers', 'Make the cost non-convex'], answer: 1, explain: 'The sigmoid squashes $\\theta^T x$ from $(-\\infty,\\infty)$ into $(0,1)$ so the output is the probability of the positive class.' },
    { q: 'Why is cross-entropy used instead of MSE for logistic regression?', opts: ['It is faster to type', 'MSE on the sigmoid is non-convex with local minima', 'MSE cannot handle two classes', 'Cross-entropy needs no gradient'], answer: 1, explain: 'MSE composed with the sigmoid gives a non-convex cost. Cross-entropy is convex, enabling clean gradient descent.' },
    { q: 'A logistic coefficient of −0.45 means a unit increase in that feature:', opts: ['Adds 0.45 to the probability', 'Multiplies the odds by e^(−0.45) ≈ 0.64', 'Has no effect', 'Sets the probability to 0'], answer: 1, explain: 'Coefficients act on the log-odds; exponentiating gives the odds multiplier, here ~0.64 (about a 36% drop in odds).' },
    { q: 'On a dataset with 99% positives, predicting "positive" always gives ~99% accuracy. The lesson is:', opts: ['Accuracy is always best', 'Accuracy is misleading on imbalanced data', 'Recall equals accuracy', 'The model is excellent'], answer: 1, explain: 'High accuracy can hide a model that learned nothing. Use precision/recall/F1/AUC for imbalanced data.' },
    { q: 'Recall is high when the model has few:', opts: ['False positives', 'False negatives', 'True positives', 'True negatives'], answer: 1, explain: 'Recall = TP/(TP+FN); minimising false negatives (missed positives) raises recall.' },
    { q: 'On an ROC curve, the ideal model sits at:', opts: ['Bottom-right (1,0)', 'Top-left (0,1): high TPR, low FPR', 'On the diagonal', 'The origin'], answer: 1, explain: 'We want maximal true-positive rate with minimal false-positive rate, the top-left corner.' },
    { q: 'An AUC of 0.5 indicates:', opts: ['A perfect classifier', 'A random-guessing classifier', 'An overfit classifier', 'A data leak'], answer: 1, explain: 'AUC 0.5 is the diagonal, no better than chance. 1.0 is perfect; higher is better.' },
    { q: 'For a 4-class problem, One-vs-One trains how many classifiers?', opts: ['4', '6', '8', '16'], answer: 1, explain: 'OvO uses $\\binom{N}{2}=N(N-1)/2$; for N=4 that is 6. OvR would use 4.' }
  ]
});
