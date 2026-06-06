Course.addModule({
  id: 'm1', num: 1, icon: '📊',
  title: 'Descriptive Statistics',
  subtitle: 'Read the personality of a dataset: centre, spread, shape, and the hunt for outliers.',
  tags: ['EDA', 'mean/median/mode', 'variance', 'box plot'],
  sections: [
    {
      id: 'intro', title: 'Why describe data first?', icon: '🧭',
      search: 'statistics data types nominal ordinal interval ratio categorical numerical discrete continuous EDA',
      html: `
<p class="lead">Before you can <em>predict</em> or <em>decide</em> anything, you must first <strong>describe</strong> what your data looks like. Descriptive statistics is detective work: collect clues, organise them, spot the pattern, and only then draw a conclusion.</p>

<div class="callout aiml" data-icon="🤖"><div class="callout-title">Where this sits in AI/ML</div><p>This is the EDA (exploratory data analysis) step every model starts with. You cannot model or predict data you haven't first understood. A skewed target, a hidden outlier, or a mistyped feature will quietly wreck a model downstream, and no amount of hyperparameter tuning fixes a problem that began in the data.</p></div>

<h2>Step 0: know your data type before you touch it</h2>
<p>Using the wrong tool on the wrong data type is like averaging phone numbers: the arithmetic runs, but the answer is meaningless. Data splits into <strong>categorical</strong> (labels) and <strong>numerical</strong> (quantities); numerical splits again into <strong>discrete</strong> (counted) and <strong>continuous</strong> (measured).</p>

<div class="tbl-wrap"><table class="data">
<tr><th>Level</th><th>Meaning</th><th>Example</th><th>What you may do</th><th>ML encoding</th></tr>
<tr><td><b>Nominal</b></td><td>names, no order</td><td>eye colour, city</td><td>only "same/different", mode</td><td>one-hot</td></tr>
<tr><td><b>Ordinal</b></td><td>ranked, unequal gaps</td><td>grades A/B/C, ratings</td><td>rank, median</td><td>ordinal / label encode</td></tr>
<tr><td><b>Interval</b></td><td>equal gaps, no true zero</td><td>temperature °C</td><td>add, subtract</td><td>scale/standardise</td></tr>
<tr><td><b>Ratio</b></td><td>equal gaps + true zero</td><td>weight, age, salary</td><td>everything, ratios</td><td>scale/log-transform</td></tr>
</table></div>

<div class="callout interview" data-icon="💼"><div class="callout-title">Interview angle</div><p>"Why can't you take the mean of an ordinal feature like a 1 to 5 star rating?" The gaps aren't guaranteed equal: the jump from 4 to 5 may not match 1 to 2, and the mean assumes interval spacing. The safe summary is the <strong>median</strong> or the <strong>mode</strong>. This one distinction is also why we one-hot encode nominal features but can label-encode ordinal ones.</p></div>

<h2>The four questions we always ask</h2>
<div class="grid cols-2">
<div class="card"><h4>1 · Where is the centre?</h4><p>The "typical" value: mean, median, mode.</p></div>
<div class="card"><h4>2 · How spread out is it?</h4><p>Consistency vs chaos: range, variance, SD, IQR.</p></div>
<div class="card"><h4>3 · What is its shape?</h4><p>Lopsided or symmetric: skewness.</p></div>
<div class="card"><h4>4 · Any oddballs?</h4><p>Outliers, caught by the box plot's fences.</p></div>
</div>
<p>The next three sections answer questions 1–4 in turn, each with a live demo you can poke.</p>
`
    },
    {
      id: 'centre', title: 'Centre: mean, median, mode', icon: '🎯',
      search: 'mean median mode central tendency average balance point outlier robust skew empirical rule',
      html: `
<p class="lead">If you had to describe a whole dataset with one number, what would it be? That "typical value" is a <strong>measure of central tendency</strong>, and there are three classic answers, each with its own personality.</p>

<div class="callout definition" data-icon="📐"><div class="callout-title">Definitions</div>
<p>For data $y_1,\\dots,y_n$:</p>
<ul>
<li><b>Mean</b> (average): $\\bar{y} = \\frac{1}{n}\\sum_{i=1}^{n} y_i$. Every value tugs on it.</li>
<li><b>Median</b>: the middle value once sorted (average the two middles if $n$ is even). It cares only about position.</li>
<li><b>Mode</b>: the value that appears most often. The only centre that works for categorical data.</li>
</ul></div>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">Intuition · three ways to find the middle of the room</div><p>The <b>mean</b> is the <em>balance point</em>: if heights were weights on a seesaw, the mean is where it balances, and every person tugs on it. The <b>median</b> is the <em>person in the middle of the queue</em>, half shorter and half taller. The <b>mode</b> is the <em>most common height</em>, the one you'd bump into most.</p></div>

<div class="viz" data-viz="centralTendency"></div>

<h3>Why the median resists outliers</h3>
<p>Because every value pulls the mean's balance point, a single extreme value drags the mean far from where most of the data sits. The median, caring only about position, barely notices. This is exactly why we report <strong>median</strong> incomes and house prices, never mean ones.</p>

<div class="callout aiml" data-icon="🤖"><div class="callout-title">Connection · L1 vs L2 loss</div><p>This same robustness trade-off recurs in model training. <strong>L2 loss</strong> (MSE) is built on the mean, so it is sensitive to outliers. <strong>L1 loss</strong> (MAE) is built on the median, so it stays robust. When a regression seems to be chasing a few extreme points, the reason is exactly this: squared error optimises toward a mean, and the mean follows the tail.</p></div>

<div class="callout example" data-icon="✏️"><div class="callout-title">Worked example</div><p>Morning routine (minutes) over 10 days: 39, 29, 43, 52, 39, 44, 40, 31, 44, 35. Sum = 396 → <b>mean = 39.6</b>. Sorted, the two middle values are 39 and 40 → <b>median = 39.5</b>. They nearly coincide, so the data is roughly symmetric with no extreme outlier, a conclusion reached just by comparing two numbers.</p></div>

<div class="callout pitfall" data-icon="⚠️"><div class="callout-title">Pitfall</div><p>For <em>categorical</em> feedback ("excellent / good / fair / poor"), the mean is meaningless, because you can't average labels. Use the <b>mode</b> (most frequent category). And a handy sanity rule for mildly skewed data: $\\text{Mode} \\approx 3\\,\\text{Median} - 2\\,\\text{Mean}$.</p></div>

<pre class="code" data-lang="python">import numpy as np
from scipy import stats

x = np.array([39, 29, 43, 52, 39, 44, 40, 31, 44, 35])
print("mean  ", x.mean())          # 39.6  -> dragged by extremes
print("median", np.median(x))      # 39.5  -> robust
print("mode  ", stats.mode(x, keepdims=False).mode)  # 39 / 44

# Outlier demo: one billionaire walks in
salaries = [40, 42, 45, 47, 50]
salaries_plus = salaries + [10_000]
print(np.mean(salaries), np.mean(salaries_plus))   # 44.8 -> 1704  (mean lurches)
print(np.median(salaries), np.median(salaries_plus))  # 45  -> 46  (median calm)</pre>
`
    },
    {
      id: 'spread', title: 'Spread: variance, SD & IQR', icon: '📏',
      search: 'range variance standard deviation IQR bessel correction n-1 sum of squares dispersion spread',
      html: `
<p class="lead">The centre is only half the story. Two datasets can share the same mean yet feel completely different: one a sniper's tight cluster, the other a sprayer's chaos. <strong>Spread</strong> is what separates them, and it is often what we care about most, whether that is consistency, risk, or reliability.</p>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">Intuition · two archers, same average</div><p>Both archers average the bullseye. One lands every arrow in a tight cluster; the other sprays them everywhere, the hits happening to average to the centre. Same mean, completely different shooters. The mean tells you <em>where</em>; the spread tells you <em>how much you can trust it</em>.</p></div>

<h3>Building the standard deviation, step by step</h3>
<p>Measure how far each value sits from the mean, the <b>deviations</b> $y_i - \\bar{y}$. But there's a catch: because the mean is the balance point, the deviations <em>always</em> sum to exactly zero. The cure: <strong>square</strong> them (no more cancelling), average, then take a square root to return to the original units.</p>

<div class="formula"><span class="formula-label">Variance & standard deviation</span>
$$\\sigma^2 = \\frac{1}{N}\\sum_{i=1}^{N}(y_i-\\mu)^2 \\quad\\text{(population)}\\qquad s^2 = \\frac{1}{n-1}\\sum_{i=1}^{n}(y_i-\\bar{y})^2 \\quad\\text{(sample)}$$</div>
<p>Read the SD ($\\sigma=\\sqrt{\\sigma^2}$) as <strong>the typical distance of a value from the mean</strong>.</p>

<div class="callout interview" data-icon="💼"><div class="callout-title">Interview classic · why divide by $n-1$?</div><p>A sample hugs its own mean a little too tightly, so dividing by $n$ would <em>under-estimate</em> the true spread. Using $n-1$ (<strong>Bessel's correction</strong>) gently inflates the estimate to remove that bias, a small "honesty tax" for not having seen the whole population. Formally, $\\mathbb{E}[s^2]=\\sigma^2$ only with $n-1$. As for "why square, not absolute value?", squaring is smooth (differentiable everywhere), which makes the calculus behind regression and ML work cleanly, and it punishes big misses more.</p></div>

<div class="callout example" data-icon="✏️"><div class="callout-title">Worked example (fully)</div><p>Values 2, 8, 5, 3, 7, 8, 5, 2, 5. Mean = 45/9 = <b>5</b>. Squared deviations: 9+9+0+4+4+9+0+9+0 = <b>44</b>. As a sample: $s=\\sqrt{44/8}=\\sqrt{5.5}\\approx \\mathbf{2.35}$. So a typical value sits ~2.35 from the mean of 5. The pair $(\\bar{y}, s) = (5, 2.35)$ already paints a surprisingly complete picture.</p></div>

<h2>The robust cousin: IQR and the box plot</h2>
<p>The <strong>range</strong> (max − min) is instant but fooled by one outlier. A far better idea splits the sorted data into four equal groups via <b>quartiles</b> $Q_1, Q_2, Q_3$. The <b>interquartile range</b> $\\text{IQR} = Q_3 - Q_1$ is the spread of the middle 50%, wonderfully resistant to outliers.</p>

<div class="formula"><span class="formula-label">The 1.5×IQR outlier fence</span>
$$\\text{Lower} = Q_1 - 1.5\\,\\text{IQR} \\qquad \\text{Upper} = Q_3 + 1.5\\,\\text{IQR}$$</div>

<div class="viz" data-viz="boxplot"></div>

<div class="callout aiml" data-icon="🤖"><div class="callout-title">Connection · scaling &amp; cleaning</div><p>The 1.5×IQR rule is the standard first pass for <strong>data cleaning</strong> before modelling, and it is exactly what <code>matplotlib</code> and <code>seaborn</code> draw as the dots beyond box-plot whiskers. SD also defines <strong>standardisation</strong> ($z = (x-\\mu)/\\sigma$), the scaling that lets gradient descent converge and that distance-based models (KNN, K-means, SVM) rely on.</p></div>

<pre class="code" data-lang="python">import numpy as np
x = np.array([11, 12, 13, 16, 16, 17, 17, 18, 21, 99])  # 99 is an outlier
q1, q2, q3 = np.percentile(x, [25, 50, 75])
iqr = q3 - q1
low, high = q1 - 1.5*iqr, q3 + 1.5*iqr
outliers = x[(x < low) | (x > high)]
print(f"Q1={q1} median={q2} Q3={q3} IQR={iqr}")
print("fences", low, high, "-> outliers", outliers)   # flags 99

print("population sd", x.std())        # ddof=0  (divide by N)
print("sample sd    ", x.std(ddof=1))  # ddof=1  (Bessel, divide by n-1)</pre>
`
    },
    {
      id: 'shape', title: 'Shape: skewness & symmetry', icon: '🎻',
      search: 'skewness symmetry left right skew tail mean median mode shape kurtosis log transform',
      html: `
<p class="lead">Centre and spread still miss one thing: is the data <strong>lopsided</strong>? Shape tells us where the bulk sits and which way the long "tail" stretches, and crucially, <em>which centre measure to trust</em>.</p>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">Intuition · a comet and its tail</div><p>A skewed distribution is a comet: a bright, dense head (where most values cluster) and a long, faint tail streaming to one side. The tail's direction names the skew. And like a small moon tugging the tide, that thin tail quietly pulls the <b>mean</b> toward itself, while the <b>median</b> keeps a cool head.</p></div>

<div class="viz" data-viz="skewness"></div>

<div class="tbl-wrap"><table class="data">
<tr><th>Shape</th><th>Order of centres</th><th>Everyday example</th></tr>
<tr><td><b>Symmetric</b></td><td>Mean = Median = Mode</td><td>adult heights</td></tr>
<tr><td><b>Right (positive) skew</b></td><td>Mode &lt; Median &lt; <span class="tbl-hl">Mean</span></td><td>incomes, house prices, response times</td></tr>
<tr><td><b>Left (negative) skew</b></td><td><span class="tbl-hl">Mean</span> &lt; Median &lt; Mode</td><td>scores on an easy test</td></tr>
</table></div>

<div class="callout interview" data-icon="💼"><div class="callout-title">Interview angle</div><p>"The gap between mean and median is itself a quick skewness detector." If a recruiter asks how you'd spot skew without plotting: compare mean vs median. Mean &gt; median ⟹ right-skewed. This instantly tells you whether to report the median and whether a <strong>log transform</strong> might help your model.</p></div>

<div class="callout aiml" data-icon="🤖"><div class="callout-title">Connection · the log transform</div><p>Right-skewed features (revenue, counts, durations) often break linear models and inflate error on the tail. Applying $\\log(1+x)$ pulls the tail in, making the feature roughly symmetric and stabilising variance. It is one of the highest-impact feature-engineering moves, and it is why metrics like RMSLE exist. <strong>Kurtosis</strong> (tail-heaviness) is the related idea behind "fat tails" in risk and anomaly detection.</p></div>

<h2>Putting it together: the five-number summary</h2>
<p>A dataset's centre, spread and shape fit into five numbers (<strong>min, $Q_1$, median, $Q_3$, max</strong>) drawn as a box plot that even reveals the oddballs. That is the single most efficient "first look" at any column, and the reason <code>df.describe()</code> exists.</p>

<pre class="code" data-lang="python">import pandas as pd, numpy as np
s = pd.Series([7,8,4,5,16,20,20,24,19,30,23,30,25,19,29,29,30,30,40,56])
print(s.describe())          # count, mean, std, min, 25%, 50%, 75%, max
print("skew:", s.skew())     # > 0  => right-skewed (mean > median)
print("mean", s.mean(), "median", s.median())   # 25.2 vs 24.0 -> right skew

# A common fix for a right-skewed feature before modelling:
s_log = np.log1p(s)
print("skew after log1p:", s_log.skew())   # closer to 0 -> more symmetric</pre>

<div class="callout aiml" data-icon="🧪"><div class="callout-title">Mini-lab</div><p>Open the skewness demo above. Set skew to its extremes and watch the mean/median/mode separate. Now predict: for a right-skewed salary dataset, which would HR quote to look generous, and which to look frugal? (Mean to look generous; median to look frugal. The gap <em>is</em> the spin.)</p></div>
`
    }
  ],
  cheatsheet: `
<p class="lead">One-page recall for Module 1. Skim before the exam; rehearse the interview lines out loud.</p>
<div class="grid cols-2">
<div class="card"><h4>Centre</h4><p>Mean $\\bar{y}=\\frac1n\\sum y_i$ (every value pulls). Median = middle (robust). Mode = most frequent (only one valid for categorical).</p></div>
<div class="card"><h4>Spread</h4><p>Var $s^2=\\frac{1}{n-1}\\sum(y_i-\\bar y)^2$; SD = $\\sqrt{\\text{var}}$ = typical distance. IQR $=Q_3-Q_1$ (robust). Range = max−min (fragile).</p></div>
<div class="card"><h4>Shape</h4><p>Right skew: mode &lt; median &lt; mean. Left skew: reversed. Symmetric: all equal. Mean leans toward the tail.</p></div>
<div class="card"><h4>Outliers</h4><p>Flag if outside $Q_1-1.5\\,\\text{IQR}$ or $Q_3+1.5\\,\\text{IQR}$. The box plot draws exactly this.</p></div>
</div>
<div class="callout interview" data-icon="💼"><div class="callout-title">Three lines worth nailing</div>
<ul>
<li><b>n−1?</b> Bessel's correction makes the sample variance unbiased; samples hug their own mean too tightly.</li>
<li><b>Mean vs median?</b> Mean for symmetric/no-outliers (feeds MSE/L2); median for skewed/outliers (feeds MAE/L1).</li>
<li><b>Skew → action?</b> mean&gt;median ⟹ right skew ⟹ consider log transform before a linear model.</li>
</ul></div>
<div class="formula"><span class="formula-label">Standardisation: the bridge to everything</span>$$z = \\frac{x-\\mu}{\\sigma}$$</div>
<div class="viz" data-viz="flashcards" data-title="Module 1 rapid recall" data-cards='[
{"q":"Which centre is robust to outliers?","a":"The <b>median</b>: it depends on position, not magnitude. (Also the mode.)"},
{"q":"Why divide sample variance by n−1?","a":"Bessel\\u2019s correction → unbiased estimate. Samples cluster too tightly around their own mean."},
{"q":"Mean &gt; Median means…","a":"<b>Right (positive) skew</b>: a long right tail drags the mean up."},
{"q":"1.5×IQR rule?","a":"Outlier if below Q1−1.5·IQR or above Q3+1.5·IQR."},
{"q":"L1 vs L2 loss link?","a":"L2/MSE ↔ mean (outlier-sensitive); L1/MAE ↔ median (robust)."},
{"q":"Fix for a right-skewed feature?","a":"log1p transform → pulls in the tail, stabilises variance."}
]'></div>
`,
  quiz: [
    { q: 'A dataset of house prices has mean ₹95L and median ₹62L. What does this tell you?', opts: ['The data is left-skewed', 'The data is right-skewed (a few mansions pull the mean up)', 'The data is symmetric', 'There is a calculation error'], answer: 1, explain: 'Mean &gt; median ⟹ right (positive) skew. A few very expensive houses stretch the right tail and drag the mean above the median. You would report the <b>median</b> as the typical price.' },
    { q: 'You must summarise a categorical "favourite colour" column. Which is valid?', opts: ['Mean', 'Median', 'Mode', 'Standard deviation'], answer: 2, explain: 'Colours are <b>nominal</b>: no order, no arithmetic. Only the <b>mode</b> (most frequent category) is meaningful. Mean/median/SD all require at least ordinal/interval structure.' },
    { q: 'Why is sample variance divided by (n − 1) rather than n?', opts: ['To make the number larger for safety', 'Bessel’s correction: it removes downward bias so E[s²] = σ²', 'Because n − 1 is faster to compute', 'It is an arbitrary convention'], answer: 1, explain: 'A sample clusters too tightly around its own mean, so dividing by n underestimates the true spread. Dividing by n−1 inflates the estimate just enough to make it <b>unbiased</b>: E[s²]=σ².' },
    { q: 'Data sorted: 3, 5, 6, 7, 8, 9, 28. Using the 1.5×IQR rule, is 28 an outlier? (Q1=5, Q3=9)', opts: ['No, 28 is within range', 'Yes: upper fence is 15, and 28 > 15', 'Cannot tell without the mean', 'Yes: any max value is an outlier'], answer: 1, explain: 'IQR = 9−5 = 4. Upper fence = Q3 + 1.5·IQR = 9 + 6 = 15. Since 28 > 15, it is flagged as an outlier, exactly the dot software draws beyond the right whisker.' },
    { q: 'In ML, which loss corresponds to the median and is robust to outliers?', opts: ['L2 / MSE', 'L1 / MAE', 'Cross-entropy', 'Hinge loss'], answer: 1, explain: 'Minimising <b>L1 (MAE)</b> yields the median and is robust to outliers; minimising <b>L2 (MSE)</b> yields the mean and chases extremes. This is the same robustness story as median vs mean.' },
    { q: 'Two sensor datasets have identical means but very different SDs. What does the larger SD imply?', opts: ['Its values are more spread out / less consistent', 'It has a higher average', 'It has more data points', 'It is more accurate'], answer: 0, explain: 'Same mean, larger SD = the "sprayer" archer: values scatter further from the centre. Spread captures consistency/risk, which the mean alone hides, often the thing you care about most.' },
    { q: 'Which transform most helps a strongly right-skewed positive feature before linear modelling?', opts: ['Squaring it', 'log(1+x)', 'Negating it', 'Multiplying by a constant'], answer: 1, explain: 'log1p pulls in the long right tail, making the feature roughly symmetric and stabilising variance, a top feature-engineering move. Linear scaling/negation does not change skew.' }
  ]
});
