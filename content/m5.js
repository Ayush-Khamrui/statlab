Course.addModule({
  id: 'm5', num: 5, icon: '📈',
  title: 'Prediction & Forecasting',
  subtitle: 'Fit a line to the world, learn it by gradient descent, and forecast the future from time series.',
  tags: ['regression', 'OLS', 'gradient descent', 'time series', 'ARIMA'],
  sections: [
    {
      id: 'regression', title: 'Linear regression & least squares', icon: '📉',
      search: 'linear regression ordinary least squares OLS residual r squared mse coefficient correlation causation assumptions multicollinearity',
      html: `
<p class="lead">Regression answers "given $x$, what's my best guess for $y$?" — the workhorse of prediction and the foundation under most of supervised ML.</p>

<div class="callout definition" data-icon="📐"><div class="callout-title">The model</div>
<div class="formula">$$\\hat{y} = \\beta_0 + \\beta_1 x \\qquad\\text{(simple)} \\qquad \\hat{y} = \\beta_0 + \\beta_1 x_1 + \\dots + \\beta_p x_p \\qquad\\text{(multiple)}$$</div>
<p>$\\beta_1$ = "how much $y$ changes per unit $x$, holding other features fixed." $\\beta_0$ = intercept.</p></div>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">Intuition · the line that minimises squared misses</div><p>Of all possible lines, <strong>Ordinary Least Squares</strong> picks the one making the sum of squared vertical <em>residuals</em> $\\sum(y_i-\\hat{y}_i)^2$ as small as possible. Squared (not absolute) so the math is smooth and big misses are punished more — the same reasoning as variance in Module 1.</p></div>

<div class="viz" data-viz="regression"></div>

<h3>How good is the fit?</h3>
<div class="formula"><span class="formula-label">R² — fraction of variance explained</span>$$R^2 = 1 - \\frac{\\sum(y_i-\\hat{y}_i)^2}{\\sum(y_i-\\bar{y})^2} = 1 - \\frac{\\text{SS}_{res}}{\\text{SS}_{tot}}$$</div>
<p>$R^2=1$ → perfect; $R^2=0$ → no better than predicting the mean. <strong>MSE</strong> $=\\frac1n\\sum(y_i-\\hat{y}_i)^2$ is the average squared error in the target's own units²; RMSE brings it back to original units.</p>

<div class="callout interview" data-icon="💼"><div class="callout-title">Interview classic · correlation ≠ causation</div><p>Regression finds <em>association</em>, not cause. Ice-cream sales "predict" drownings — both driven by summer (a confounder). To claim causation you need a randomised experiment or careful causal inference (controls, instrumental variables, diff-in-diff). Saying this unprompted signals seniority.</p></div>

<div class="callout pitfall" data-icon="⚠️"><div class="callout-title">Assumptions & their ML cousins</div><p>OLS assumes <strong>linearity</strong>, <strong>independent</strong> errors, <strong>constant variance</strong> (homoscedasticity), and roughly <strong>Normal</strong> residuals. Violations: a curved residual plot ⟹ add features/transform; fanning residuals ⟹ heteroscedasticity; <strong>multicollinearity</strong> (correlated predictors) makes coefficients unstable — the reason for ridge regression.</p></div>

<h2>Learning it by gradient descent</h2>
<p>Simple regression has a closed-form solution, but the same loss can be minimised iteratively — and that iteration scales to models with millions of parameters where no formula exists.</p>

<div class="viz" data-viz="gradientDescent"></div>

<div class="callout aiml" data-icon="🤖"><div class="callout-title">AI/ML connection</div><p>Linear regression <em>is</em> a one-layer neural net with identity activation and MSE loss. Gradient descent here is the exact algorithm training every deep network. <strong>Regularisation</strong> — Ridge (L2, $+\\lambda\\sum\\beta_j^2$) and Lasso (L1, $+\\lambda\\sum|\\beta_j|$, which zeros out weak features) — controls the bias–variance trade-off and prevents overfitting. The learning-rate lesson from the demo (too big → diverge, too small → crawl) is the #1 practical hyperparameter in deep learning.</p></div>

<pre class="code" data-lang="python">import numpy as np
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import mean_squared_error, r2_score

X = np.array([[1],[2],[3],[4],[5],[6]]); y = np.array([2.1,3.9,6.2,7.8,10.1,12.2])
lr = LinearRegression().fit(X, y)
print("slope", lr.coef_[0], "intercept", lr.intercept_)
pred = lr.predict(X)
print("R2", r2_score(y, pred), "RMSE", mean_squared_error(y, pred, squared=False))

# Ridge (L2) shrinks coefficients -> handles multicollinearity / overfitting
ridge = Ridge(alpha=1.0).fit(X, y)
print("ridge slope", ridge.coef_[0])</pre>
`
    },
    {
      id: 'timeseries', title: 'Time series & forecasting', icon: '⏳',
      search: 'time series trend seasonality noise stationarity moving average autocorrelation AR MA ARIMA forecasting train test split backtesting exponential smoothing',
      html: `
<p class="lead">A time series is data indexed by time, where <strong>order matters</strong> and today depends on yesterday. Forecasting is prediction with memory.</p>

<div class="callout definition" data-icon="📐"><div class="callout-title">The three components</div><p>Most series decompose into <b>Trend</b> (long-run direction) + <b>Seasonality</b> (repeating cycles — daily, weekly, yearly) + <b>Noise</b> (irregular residual). Decomposition can be additive ($y=T+S+N$) or multiplicative ($y=T\\times S\\times N$).</p></div>

<div class="viz" data-viz="timeSeries"></div>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">Intuition · smoothing reveals the signal</div><p>A <strong>moving average</strong> averages a sliding window to cancel noise and expose the trend — wider window = smoother but laggier. This is the seed idea of forecasting: separate the predictable signal (trend + seasonality) from the unpredictable noise, then project the signal forward.</p></div>

<h3>Stationarity — the key prerequisite</h3>
<p>A series is <strong>stationary</strong> if its statistical properties (mean, variance, autocorrelation) don't change over time. Most forecasting models (ARMA) assume it. Tame a non-stationary series by <strong>differencing</strong> ($y_t - y_{t-1}$ removes a trend) and seasonal differencing — that's the "I" (Integrated) in ARIMA.</p>

<div class="callout theorem" data-icon="📜"><div class="callout-title">ARIMA(p, d, q)</div>
<ul>
<li><b>AR(p)</b> — Auto-Regressive: today is a weighted sum of the last $p$ values. $y_t = c + \\sum_{i=1}^{p}\\phi_i y_{t-i} + \\varepsilon_t$.</li>
<li><b>I(d)</b> — Integrated: difference $d$ times to reach stationarity.</li>
<li><b>MA(q)</b> — Moving-Average: today depends on the last $q$ forecast <em>errors</em>.</li>
</ul>
<p>SARIMA adds seasonal terms. The <strong>ACF/PACF</strong> plots help choose $p$ and $q$.</p></div>

<div class="callout pitfall" data-icon="⚠️"><div class="callout-title">Pitfall · never shuffle a time series</div><p>You must split <strong>chronologically</strong> — train on the past, test on the future. Random train/test splits leak the future into training and give fantasy accuracy. Evaluate with <strong>rolling/expanding-window backtesting</strong>, and watch for <strong>data leakage</strong> from look-ahead features.</p></div>

<div class="callout interview" data-icon="💼"><div class="callout-title">Interview angle</div><p>"How is forecasting different from ordinary regression?" — Observations aren't independent (autocorrelation), order matters, you must respect time in validation, and errors compound over the horizon. Mention baselines: a good forecast must beat <strong>naïve</strong> ("tomorrow = today") and <strong>seasonal-naïve</strong> ("this hour next week = same hour last week"). Metrics: MAE, RMSE, MAPE, and sMAPE.</p></div>

<div class="callout aiml" data-icon="🤖"><div class="callout-title">AI/ML connection</div><p>Classical ARIMA/ETS and exponential smoothing are strong, interpretable baselines that frequently rival deep models on small data. Modern stacks add <strong>Prophet</strong>, gradient-boosted trees on lag features, and sequence models (RNN/LSTM, Temporal Fusion Transformers). The autoregressive "today depends on the past" structure is exactly the chain-rule factorisation behind language models (Module 2).</p></div>

<pre class="code" data-lang="python">import numpy as np, pandas as pd
from statsmodels.tsa.arima.model import ARIMA

# synthetic monthly series with trend + seasonality
t = np.arange(120)
y = 10 + 0.3*t + 5*np.sin(2*np.pi*t/12) + np.random.normal(0, 1, 120)
s = pd.Series(y)

train, test = s[:108], s[108:]                       # chronological split!
model = ARIMA(train, order=(2,1,2)).fit()            # ARIMA(p=2, d=1, q=2)
fc = model.forecast(steps=12)
mae = np.mean(np.abs(fc.values - test.values))

# always compare to a naive baseline
naive = np.full(12, train.iloc[-1])
print("ARIMA MAE", round(mae,2), "| naive MAE", round(np.mean(np.abs(naive-test.values)),2))</pre>
`
    }
  ],
  cheatsheet: `
<p class="lead">Module 5 recall — prediction & forecasting.</p>
<div class="grid cols-2">
<div class="card"><h4>OLS</h4><p>Minimise $\\sum(y_i-\\hat y_i)^2$. $\\hat y=\\beta_0+\\beta_1x$. Smooth, punishes big misses.</p></div>
<div class="card"><h4>Fit quality</h4><p>$R^2=1-\\text{SS}_{res}/\\text{SS}_{tot}$. MSE in units²; RMSE in original units.</p></div>
<div class="card"><h4>Assumptions</h4><p>Linear, independent errors, constant variance, ~Normal residuals. Watch multicollinearity.</p></div>
<div class="card"><h4>Regularisation</h4><p>Ridge (L2) shrinks; Lasso (L1) zeros weak features. Tunes bias–variance.</p></div>
<div class="card"><h4>TS components</h4><p>Trend + Seasonality + Noise. Smooth with moving average / exponential smoothing.</p></div>
<div class="card"><h4>ARIMA(p,d,q)</h4><p>AR (past values) + I (differencing for stationarity) + MA (past errors). SARIMA adds seasonality.</p></div>
</div>
<div class="callout interview" data-icon="💼"><div class="callout-title">Two reflexes</div><ul>
<li>Correlation ≠ causation — regression gives association; causation needs experiments/causal design.</li>
<li>Never shuffle a time series — split chronologically; beat the naïve &amp; seasonal-naïve baselines.</li>
</ul></div>
<div class="viz" data-viz="flashcards" data-title="Module 5 rapid recall" data-cards='[
{"q":"What does OLS minimise?","a":"The sum of squared vertical residuals Σ(yᵢ−ŷᵢ)²."},
{"q":"Interpret R²=0.","a":"The model is no better than predicting the mean ȳ for everything."},
{"q":"Ridge vs Lasso?","a":"Ridge (L2) shrinks all coefficients; Lasso (L1) can drive some to exactly 0 (feature selection)."},
{"q":"Correlation vs causation?","a":"Regression shows association only. Causation needs randomised experiments or causal inference."},
{"q":"What is stationarity?","a":"Constant mean/variance/autocorrelation over time. Achieve via differencing — the I in ARIMA."},
{"q":"Meaning of ARIMA(p,d,q)?","a":"AR(p): p past values; I(d): d differences; MA(q): q past errors."},
{"q":"How to validate a forecast?","a":"Chronological split + rolling-window backtesting. Never shuffle. Beat the naïve baseline."},
{"q":"Gradient descent diverged — why?","a":"Learning rate too large; it overshoots the minimum. Lower it."}
]'></div>
`,
  quiz: [
    { q: 'Ordinary Least Squares chooses the line that minimises…', opts: ['The sum of vertical residuals', 'The sum of squared vertical residuals', 'The maximum residual', 'The number of points off the line'], answer: 1, explain: 'OLS minimises Σ(yᵢ−ŷᵢ)² — squared so it’s smooth/differentiable and penalises large errors more. Minimising absolute residuals instead gives a different (robust) fit related to the median.' },
    { q: 'A model has R² = 0.0. What does that mean?', opts: ['Perfect fit', 'The model predicts no better than always guessing the mean ȳ', 'All residuals are zero', 'The slope is infinite'], answer: 1, explain: 'R² = 1 − SSres/SStot. R²=0 means SSres = SStot — the model explains none of the variance, equivalent to predicting the average for every point.' },
    { q: 'Ice cream sales correlate strongly with drownings. The best conclusion is:', opts: ['Ice cream causes drowning', 'A confounder (hot weather) drives both — correlation isn’t causation', 'Drowning causes ice cream sales', 'The correlation must be a computational error'], answer: 1, explain: 'Classic confounding: summer heat raises both. Regression/correlation reveal association only; establishing causation needs randomised experiments or causal-inference techniques that control for confounders.' },
    { q: 'In gradient descent, the loss explodes to huge values each step. The most likely cause?', opts: ['Learning rate too small', 'Learning rate too large (overshooting)', 'Too few iterations', 'The data is standardised'], answer: 1, explain: 'A learning rate that’s too large overshoots the minimum and diverges. Lower it (or standardise features). Too small merely makes convergence slow, not explosive.' },
    { q: 'Which preprocessing makes a non-stationary, trending series suitable for ARMA modelling?', opts: ['Shuffling the observations', 'Differencing (yₜ − yₜ₋₁)', 'Squaring the values', 'Removing the first observation'], answer: 1, explain: 'Differencing removes a trend and helps achieve stationarity — that’s the "I" (Integrated, order d) in ARIMA(p,d,q). Shuffling destroys the temporal structure entirely.' },
    { q: 'Why must you NOT use a random train/test split for forecasting?', opts: ['It is slower', 'It leaks future information into training, giving over-optimistic accuracy', 'Random splits need more memory', 'It changes the seasonality'], answer: 1, explain: 'Time series have order and autocorrelation. A random split lets the model "see the future" during training (look-ahead leakage). Always split chronologically and backtest with rolling windows.' },
    { q: 'Lasso (L1) regularisation is often preferred over Ridge (L2) when you want to…', opts: ['Keep all features but shrink them', 'Perform automatic feature selection by zeroing out weak coefficients', 'Increase the learning rate', 'Guarantee a unique closed-form solution'], answer: 1, explain: 'L1’s geometry drives some coefficients to exactly 0, effectively selecting features. Ridge (L2) shrinks all coefficients toward 0 but rarely makes them exactly 0.' },
    { q: 'A forecasting model must, at minimum, beat which baseline to be worth deploying?', opts: ['A deep neural network', 'The naïve forecast ("tomorrow = today") and seasonal-naïve', 'A random number generator', 'The training mean'], answer: 1, explain: 'Naïve and seasonal-naïve are the standard sanity baselines. A complex model that can’t beat "tomorrow = today" or "same hour last week" adds cost without value — a key Tech-Lead check.' }
  ]
});
