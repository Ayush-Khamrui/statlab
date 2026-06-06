Course.addModule({
  id: 'ml2', num: 'ML2', icon: '🧹',
  title: 'Data & Pre-processing',
  subtitle: 'The ML workflow, attribute types, data quality, outliers, sampling, class imbalance, and feature engineering: the unglamorous work that decides whether a model can succeed.',
  tags: ['ML workflow', 'attribute types', 'data quality', 'outliers', 'sampling', 'imbalance', 'feature scaling', 'feature engineering'],
  sections: [
    {
      id: 'workflow', title: 'The ML workflow & attribute types', icon: '🔄',
      search: 'machine learning workflow pipeline data representation parameter optimization model selection nominal ordinal interval ratio attributes dimensionality sparsity resolution size discrete continuous',
      html: `
<p class="lead">ML in a nutshell is <strong>data representation + parameter optimisation + model selection</strong>. The starting point is always the data, and crucially, you iterate on the model, <em>not</em> on the data, so the data must be finalised carefully first.</p>

<div class="callout definition" data-icon="📐"><div class="callout-title">The workflow</div>
<ol>
<li>Should this even be solved with ML? Is there a pattern, enough data?</li>
<li>Gather, clean, visualise and <b>pre-process</b> the data.</li>
<li>Split into train / test; choose a model and loss function.</li>
<li>Optimise parameters; search hyperparameters.</li>
<li>Analyse performance & errors → iterate on the <b>model</b> (steps 3–5), not the data.</li>
</ol></div>

<div class="callout pitfall" data-icon="⚠️"><div class="callout-title">Finalise data before modelling</div><p>The iteration loop goes back only to the model steps. You can fine-tune a model, but you do not keep going back to re-engineer the data mid-iteration, so organise and pre-process it thoughtfully up front.</p></div>

<h2>What is "data" in ML?</h2>
<p>A collection of objects and their attributes. <b>Rows</b> = data points / instances. <b>Columns</b> = features / attributes / predictors. Together they form the vectors/matrices the model computes on.</p>

<h2>Types of attributes</h2>
<div class="tbl-wrap"><table class="data">
<tr><th>Type</th><th>Kind</th><th>Meaning</th><th>Example</th></tr>
<tr><td>Nominal</td><td>Categorical (discrete)</td><td>Names/labels, no order</td><td>Gender, card type, name</td></tr>
<tr><td>Ordinal</td><td>Categorical (discrete)</td><td>Categories with a meaningful order</td><td>Service rating 1–10, income level low/mid/high</td></tr>
<tr><td>Interval</td><td>Numerical (continuous)</td><td>Differences meaningful, <b>no true zero</b></td><td>Temperature in °C / °F, calendar dates</td></tr>
<tr><td>Ratio</td><td>Numerical (continuous)</td><td>Has a <b>meaningful zero</b>; ratios make sense</td><td>Temperature in Kelvin, length, credit score</td></tr>
</table></div>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">Interval vs ratio: the zero test</div><p>Ask: is the <b>zero meaningful</b>? 0 °C is not "no temperature" (interval). 0 K is true absence of heat (ratio). Mnemonic: °C/°F → interval; Kelvin → ratio. Why it matters: not all models handle categorical the same as numerical, so you may need to convert between them.</p></div>

<h2>Characteristics of data</h2>
<div class="grid cols-2">
<div class="card"><h4>Dimensionality</h4><p>Number of columns/features. High-dimensional data causes overfitting and is hard to visualise, so prefer fewer, meaningful dimensions (dimensionality reduction).</p></div>
<div class="card"><h4>Sparsity</h4><p>Few meaningful values among rows (e.g. Netflix ratings: most cells blank). Only present values count.</p></div>
<div class="card"><h4>Resolution</h4><p>The scale at which data is captured (city vs block vs state level).</p></div>
<div class="card"><h4>Size</h4><p>Volume: how many data points you have for the experiment.</p></div>
</div>
`
    },
    {
      id: 'quality', title: 'Data quality: noise & outliers', icon: '🔎',
      search: 'data quality noise outliers IQR interquartile range three sigma rule z-score normal distribution skewed missing values duplicate inconsistent correct consistent interpretable complete trustable',
      html: `
<p class="lead">Even the most powerful algorithm fails on bad input. Good data is <strong>correct, consistent, interpretable, usable, complete, and trustable</strong>. Don't chase quantity over quality.</p>

<h2>Noise vs outliers</h2>
<div class="grid cols-2">
<div class="card"><h4>Noise</h4><p>Random error or distortion: values an attribute simply cannot take (age 150, marks 500/100). Wrong values; usually removed.</p></div>
<div class="card"><h4>Outliers</h4><p>Points far from the rest. <b>Two kinds</b>: (1) noisy outliers → remove; (2) <b>meaningful</b> outliers that are the point of the analysis → keep.</p></div>
</div>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">A meaningful outlier</div><p>If average class marks are 500 and one student scores 100, that's not noise; it's a real, informative outlier. In fraud detection the rare fraudulent transactions <em>are</em> the outliers we want. So: noise → remove; meaningful outlier → keep. It depends on the question you are answering.</p></div>

<div class="viz" data-viz="boxplot"></div>

<h2>Detecting outliers mathematically</h2>
<div class="grid cols-2">
<div class="card"><h4>IQR method (any distribution)</h4><p>Compute $Q_1$, $Q_3$, $IQR=Q_3-Q_1$. Bounds: $[\\,Q_1-1.5\\,IQR,\\; Q_3+1.5\\,IQR\\,]$. Anything outside is an outlier. Works even on <b>skewed</b> data.</p></div>
<div class="card"><h4>Three-sigma rule (normal data)</h4><p>For (approximately) normal data, ~68% lies within $\\mu\\pm\\sigma$, ~95% within $\\mu\\pm2\\sigma$, ~99.7% within $\\mu\\pm3\\sigma$. Anything beyond $\\mu\\pm3\\sigma$ is an outlier.</p></div>
</div>

<div class="callout pitfall" data-icon="⚠️"><div class="callout-title">Which method?</div><p>If the data is <b>skewed</b>, use <b>IQR</b>; the 3-sigma rule assumes a normal bell curve. If unsure whether the data is normal, default to IQR. And remember: detecting an outlier does <em>not</em> automatically mean delete it, since that depends on whether it is noise or meaningful.</p></div>

<h2>Other quality problems</h2>
<ul>
<li><b>Missing values</b>: handle them (see next section), don't ignore.</li>
<li><b>Duplicate</b>: for exact duplicates, drop one. For partial duplicates (differing in one column) you cannot tell which is right, so drop both or remove the ambiguous record.</li>
<li><b>Inconsistent</b>: e.g. gender recorded as "M", "male", "1". Standardise or remove the row.</li>
<li><b>Intentional</b>: e.g. all DOBs masked to Jan 1 for privacy, so drop that column from analysis.</li>
</ul>
`
    },
    {
      id: 'engineering', title: 'Data engineering: cleaning, missing values, aggregation', icon: '🧰',
      search: 'data engineering pre-processing aggregation group by data cleansing missing values imputation mean median mode interpolation drop column row instance selection',
      html: `
<p class="lead">Pre-processing splits into <strong>data engineering</strong> (work on the <em>rows</em> / data points) and <strong>feature engineering</strong> (work on the <em>columns</em> / features). This section is the row-level work.</p>

<h2>Data aggregation</h2>
<p>"Zoom out." A transaction log across many stores and days is huge and pattern-less at row level. Aggregate (like SQL <code>GROUP BY</code>) store-wise / date-wise / product-wise to reduce size and surface meaningful patterns. Aggregate only if your question needs it.</p>

<h2>Data cleansing</h2>
<p>Correct mistakes case-by-case. Drop a <b>column</b> with too many missing/intentional-masked values; drop a <b>row</b> missing many fields or that is a duplicate. Keep only meaningful, clean data, but there is no universal rulebook; take justified decisions.</p>

<h2>Handling missing values</h2>
<div class="tbl-wrap"><table class="data">
<tr><th>Strategy</th><th>When it makes sense</th></tr>
<tr><td>Insert the missing record</td><td>Sequence data (e.g. a missing month in a series)</td></tr>
<tr><td>Replace with 0</td><td>When 0 is genuinely meaningful</td></tr>
<tr><td>Last known value</td><td>Carry-forward in ordered data</td></tr>
<tr><td>Mean / median / mode</td><td>Central-tendency imputation for numerical data</td></tr>
<tr><td>Interpolation</td><td>Estimate the best-fit value for the column</td></tr>
<tr><td>Omit the record</td><td>Safest option when nothing else is justified (e.g. ambiguous categorical)</td></tr>
</table></div>

<div class="callout pitfall" data-icon="⚠️"><div class="callout-title">Don't work with ambiguous data</div><p>If no imputation is justifiable, <b>omit the record</b>. Filling a categorical gap by guessing (P50 vs P70 with no guideline) injects error. Better to lose a row than to corrupt the data.</p></div>

<div class="callout aiml" data-icon="🤖"><div class="callout-title">Instance selection</div><p>Your training sample must <b>represent the population</b>. Too few points, or an unrepresentative subset, breaks the whole training process, like preparing a student for a Hindi exam using English text. Selection and partitioning of instances is itself a pre-processing step.</p></div>
`
    },
    {
      id: 'sampling', title: 'Sampling & class imbalance', icon: '⚖️',
      search: 'sampling simple random stratified cluster sampling class imbalance under sampling over sampling SMOTE synthetic minority oversampling class weights rare class representative',
      html: `
<p class="lead">Your training data must mirror the population. The wrong sampling can secretly introduce class imbalance; the wrong response to imbalance can wreck the model.</p>

<h2>Sampling methods</h2>
<div class="grid cols-3">
<div class="card"><h4>Simple random</h4><p>Pick rows at random. Easiest, but can unintentionally skew class ratios (e.g. uneven Setosa/Versicolor/Virginica in Iris).</p></div>
<div class="card"><h4>Stratified</h4><p>Sample the same proportion (or count) from <b>each class</b>. Keeps the training set representative; the fix for simple-sampling skew.</p></div>
<div class="card"><h4>Cluster</h4><p>For data naturally grouped (schools, cities, zones). Select whole clusters, or stratify within clusters (e.g. zone-wise weather sampling).</p></div>
</div>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">Same percentage or same count?</div><p>Stratified sampling can take the same <b>percentage</b> from each class (keeps the original distribution) or the same <b>count</b> (deliberately balances). Both are valid design choices.</p></div>

<h2>Handling imbalanced data</h2>
<p>Real datasets are often skewed, for example 980 healthy vs 20 diseased, where the 20 are the class of interest. Options:</p>
<div class="grid cols-2">
<div class="card"><h4>Under-sample the majority</h4><p>Randomly drop majority-class rows to balance (e.g. keep 20 healthy + 20 diseased). Simplest, easiest to justify.</p></div>
<div class="card"><h4>Over-sample the minority</h4><p>Generate more minority points. <b>SMOTE</b> (Synthetic Minority Over-sampling) creates new, representative points from the same distribution, not noise and not duplicates.</p></div>
</div>

<div class="callout pitfall" data-icon="⚠️"><div class="callout-title">Over-sampling pitfalls</div><p>Naïve resampling-with-replacement adds <b>duplicates</b>; SMOTE adds <b>synthetic</b> points. Done carelessly, over-sampling can inject noise. <b>Class weights</b> (higher weight on the rare class) are another option, but harder to justify. Why generate data at all? More representative data → a more generalised model → less overfitting.</p></div>
`
    },
    {
      id: 'features', title: 'Feature engineering: scaling & transformations', icon: '🛠️',
      search: 'feature engineering feature scaling normalization standardization min max z-score gaussian feature extraction PCA feature selection correlation feature construction feature transformation discretization binning equal width equal frequency binarization',
      html: `
<p class="lead">Feature engineering is the column-level pre-processing: rescale features fairly, and extract / select / construct / transform them so the model sees only meaningful inputs.</p>

<h2>Feature scaling, and why it matters</h2>
<p>If age ranges 20–60 and income ranges 10k–1 lakh, the model may treat income as more important <em>just because its numbers are bigger</em>. Scaling puts all features on the same footing so the model starts treating them equally and learns true importance.</p>

<div class="grid cols-2">
<div class="card"><h4>Normalisation (min–max)</h4><p>Rescale to a fixed range, usually [0,1]: $v'=\\dfrac{v-\\min}{\\max-\\min}\\,(\\text{new}_{\\max}-\\text{new}_{\\min})+\\text{new}_{\\min}$. The general default; no distribution assumed.</p></div>
<div class="card"><h4>Standardisation (z-score)</h4><p>Centre to mean 0, std 1: $v'=\\dfrac{v-\\mu}{\\sigma}$. Use when the feature is (assumed) <b>Gaussian</b>; required by algorithms that assume normality (e.g. Gaussian Naïve Bayes).</p></div>
</div>

<div class="callout pitfall" data-icon="⚠️"><div class="callout-title">Fit the scaler on TRAIN only</div><p>Compute min/max/μ/σ from the <b>training</b> set, then apply those same values to the test set. Never recompute scaling from the test data; the model must not peek at it. Scale every feature individually.</p></div>

<h2>Four feature-engineering techniques</h2>
<div class="grid cols-2">
<div class="card"><h4>Extraction</h4><p>Combine many features into fewer, more relevant ones via dimensionality reduction (e.g. <b>PCA</b>). Nothing is dropped manually; the algorithm extracts the important directions.</p></div>
<div class="card"><h4>Selection</h4><p><b>You</b> pick the meaningful features: drop irrelevant ones (name won't predict graduation) and redundant ones (age vs DOB). Use correlation analysis to spot redundancy.</p></div>
<div class="card"><h4>Construction</h4><p>Build new features from existing ones (first + last purchase date → customer lifetime).</p></div>
<div class="card"><h4>Transformation</h4><p>Change a feature's form (total marks → GPA, or → pass/fail). Includes discretisation and binarisation below.</p></div>
</div>

<h2>Discretisation (binning) & binarisation</h2>
<p>Some algorithms work better on categories. Convert numeric age into groups:</p>
<div class="grid cols-2">
<div class="card"><h4>Equal-width binning</h4><p>Equal-size ranges (0–20, 21–40, …). Simple; good for roughly uniform data.</p></div>
<div class="card"><h4>Equal-frequency binning</h4><p>Bins chosen so each holds a similar <b>count</b> of points. Better for <b>skewed</b> data.</p></div>
</div>
<p><b>Binarisation</b> turns a multi-valued feature into yes/no flags (fuel = petrol/diesel/gas → separate 0/1 columns; pass/fail). Every choice here is driven by the <b>question you want to answer</b>.</p>

<div class="callout interview" data-icon="💼"><div class="callout-title">Engineer's checklist for a feature</div><p>Will it be available at prediction time? Is it relevant or redundant? Does it need scaling? Would binning or transformation make it more useful? Feature engineering is still model design.</p></div>
`
    }
  ],
  cheatsheet: `
<p class="lead">Data &amp; Pre-processing: one-page recall.</p>
<div class="grid cols-2">
<div class="card"><h4>Workflow</h4><p>Pre-process data → split → model + loss → optimise → evaluate → iterate on the <b>model</b>, not the data.</p></div>
<div class="card"><h4>Attributes</h4><p>Nominal (labels), ordinal (ordered labels), interval (no true zero, °C), ratio (true zero, Kelvin).</p></div>
<div class="card"><h4>Outliers</h4><p>IQR: outside $Q_1-1.5\\,IQR$ … $Q_3+1.5\\,IQR$ (any data). 3-sigma: beyond $\\mu\\pm3\\sigma$ (normal data only).</p></div>
<div class="card"><h4>Noise vs outlier</h4><p>Noise = impossible value → remove. Outlier may be meaningful (fraud) → keep.</p></div>
<div class="card"><h4>Missing values</h4><p>Impute (mean/median/mode/interpolate) or omit if no justification.</p></div>
<div class="card"><h4>Sampling</h4><p>Simple random, stratified (per-class, representative), cluster (grouped data).</p></div>
<div class="card"><h4>Imbalance</h4><p>Under-sample majority, over-sample minority (SMOTE = synthetic), or class weights.</p></div>
<div class="card"><h4>Scaling</h4><p>Normalise (min–max [0,1]) or standardise (z-score, Gaussian). Fit on <b>train only</b>, per feature.</p></div>
</div>
<div class="callout interview" data-icon="💼"><div class="callout-title">Feature engineering 4</div><ul>
<li><b>Extraction</b>: PCA / dimensionality reduction.</li>
<li><b>Selection</b>: drop irrelevant + redundant (correlation).</li>
<li><b>Construction</b>: build new features from existing.</li>
<li><b>Transformation</b>: discretise (equal-width / equal-frequency) or binarise.</li>
</ul></div>
<div class="viz" data-viz="flashcards" data-title="Data & Pre-processing rapid recall" data-cards='[
{"q":"Interval vs ratio attribute?","a":"Both numerical. Interval has no true zero (Celsius). Ratio has a meaningful zero (Kelvin), so ratios make sense."},
{"q":"IQR vs 3-sigma for outliers?","a":"IQR works for any distribution (use on skewed data). 3-sigma assumes a normal bell curve."},
{"q":"Noise vs outlier?","a":"Noise is an impossible/wrong value, remove it. An outlier can be meaningful (fraud) and worth keeping."},
{"q":"Normalisation vs standardisation?","a":"Normalisation = min-max scaling to a range like [0,1]. Standardisation = z-score (mean 0, std 1) for Gaussian features."},
{"q":"Why fit the scaler only on training data?","a":"So the model never peeks at the test set. Compute min/max/mean/std on train and apply them to test."},
{"q":"What is SMOTE?","a":"Synthetic Minority Over-sampling: generates new representative minority points (not duplicates, not noise) to balance classes."},
{"q":"Equal-width vs equal-frequency binning?","a":"Equal-width = equal-size ranges. Equal-frequency = each bin holds a similar count, better for skewed data."}
]'></div>
`,
  quiz: [
    { q: 'Temperature in Celsius is which attribute type?', opts: ['Nominal', 'Ordinal', 'Interval', 'Ratio'], answer: 2, explain: '0 °C is not "no temperature", so there is no true zero, making it interval. Kelvin would be ratio.' },
    { q: 'Your data is heavily skewed. Which outlier method is appropriate?', opts: ['Three-sigma rule', 'IQR method', 'Min–max scaling', 'One-hot encoding'], answer: 1, explain: 'IQR makes no normality assumption, so it suits skewed data. The 3-sigma rule assumes a normal distribution.' },
    { q: 'In fraud detection, the rare fraudulent transactions are:', opts: ['Noise to be removed', 'Meaningful outliers to keep', 'Duplicates', 'Missing values'], answer: 1, explain: 'They are the class of interest: meaningful outliers, not errors.' },
    { q: 'Why must the feature scaler be fit only on the training set?', opts: ['To save memory', 'To prevent the model peeking at test data', 'Because test data has no features', 'To make training slower'], answer: 1, explain: 'Computing min/max/μ/σ from test data leaks information. Fit on train, apply those values to test.' },
    { q: 'SMOTE addresses class imbalance by:', opts: ['Deleting minority points', 'Duplicating minority points exactly', 'Generating synthetic minority points from the distribution', 'Changing the loss function'], answer: 2, explain: 'SMOTE creates new synthetic minority examples drawn from the same distribution, not duplicates and not noise.' },
    { q: 'Which feature-engineering technique uses PCA?', opts: ['Feature selection', 'Feature construction', 'Feature extraction', 'Binarisation'], answer: 2, explain: 'PCA is dimensionality reduction, i.e. feature extraction. Selection is manually choosing features; construction builds new ones.' },
    { q: 'Equal-frequency binning is preferred over equal-width when:', opts: ['Data is uniform', 'Data is skewed', 'There are no numeric features', 'The target is categorical'], answer: 1, explain: 'Equal-frequency bins each hold a similar count, giving balanced representation on skewed data.' }
  ]
});
