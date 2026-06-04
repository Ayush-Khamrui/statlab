Course.addModule({
  id: 'ml3', num: 'ML3', icon: '📉',
  title: 'Linear Regression',
  subtitle: 'The hypothesis and cost function, the closed-form solution, gradient descent and its variants, regression metrics, linear basis functions, bias–variance, and regularisation.',
  tags: ['hypothesis', 'cost function', 'gradient descent', 'normal equation', 'R²', 'basis functions', 'bias–variance', 'regularisation'],
  sections: [
    {
      id: 'setup', title: 'Setup: hypothesis & parameters', icon: '📐',
      search: 'linear regression hypothesis function theta parameters weights bias intercept simple multiple regression feature target best fit line',
      html: `
<p class="lead">Linear regression finds the equation of the line (or hyperplane) that <strong>best fits</strong> a dataset with a numerical target, so we can extrapolate it to predict new values.</p>

<div class="formula"><span class="formula-label">Hypothesis function</span>
$$h_\\theta(x)=\\theta_0+\\theta_1 x_1+\\theta_2 x_2+\\dots+\\theta_d x_d=\\sum_{j=0}^{d}\\theta_j x_j$$</div>

<div class="callout definition" data-icon="📐"><div class="callout-title">The pieces</div>
<ul>
<li>$x_1,\\dots,x_d$ — the $d$ <b>features</b> (known from the data).</li>
<li>$\\theta_1,\\dots,\\theta_d$ — <b>model parameters / weights</b>: the importance of each feature (the slopes). The model learns these.</li>
<li>$\\theta_0$ — the <b>intercept / bias</b>. Without it every line would pass through the origin.</li>
<li>We hard-code $x_0=1$ so the bias fits the same $\\sum\\theta_j x_j$ form.</li>
</ul></div>

<p>For $d$ features there are $d+1$ parameters. <b>Simple</b> linear regression has one feature; <b>multiple</b> linear regression has many. In either case we want the equation of a line that minimises error.</p>

<div class="viz" data-viz="regression"></div>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">What are the weights really?</div><p>Each $\\theta_j$ is the weight/importance the model assigns to feature $x_j$. We don't spoon-feed them — the model learns them. In matrix form the whole hypothesis is $h_\\theta(X)=X\\theta$ (or $\\theta^T X$), which lets us compute all predictions at once. Writing the data as matrices and computing in one shot is called <b>vectorisation</b>.</p></div>
`
    },
    {
      id: 'cost', title: 'Cost function: residuals & MSE', icon: '⛰️',
      search: 'cost function loss residual squared error mean squared error MSE convex optimization parabola global minimum contour plot least squares',
      html: `
<p class="lead">To pick the best line we need to measure how wrong it is. We start with a random guess for $\\theta$, measure the error, and then improve.</p>

<div class="callout definition" data-icon="📐"><div class="callout-title">Residual → squared → mean</div>
<ul>
<li><b>Residual</b> = $\\hat y - y$ (predicted minus actual). Positive above the line, negative below.</li>
<li>We <b>square</b> residuals (not take absolute value) so positives/negatives don't cancel, large errors are penalised more, and the function is differentiable.</li>
<li>Average over all points → mean squared error.</li>
</ul></div>

<div class="formula"><span class="formula-label">Cost function (MSE)</span>
$$J(\\theta)=\\frac{1}{2n}\\sum_{i=1}^{n}\\bigl(h_\\theta(x^{(i)})-y^{(i)}\\bigr)^2$$</div>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">Why the extra $\\tfrac12$?</div><p>It is a mathematical convenience. When we differentiate the squared term in gradient descent the power 2 comes down and cancels the $\\tfrac12$, keeping the gradient clean. It does not change where the minimum is.</p></div>

<h2>A convex bowl with one minimum</h2>
<p>For linear regression with MSE, $J(\\theta)$ is always a <b>convex</b> curve — a parabola in 1-D, a bowl in higher dimensions. That means a <b>single global minimum</b>: no local minima to get stuck in. Setting the derivative to 0 directly gives the best line.</p>

<div class="callout definition" data-icon="📐"><div class="callout-title">Minima, maxima & the general landscape</div><p>For a general ML problem $J(\\theta)$ can be hilly with many <b>local minima</b> and one <b>global minimum</b>; which one you reach depends on initialisation. Linear regression is the easy case — convex, so local minimum = global minimum. In a multivariate view the bowl appears as a <b>contour plot</b> of concentric rings; the centre ring is the minimum (lowest error).</p></div>

<div class="callout interview" data-icon="💼"><div class="callout-title">Least-squares regression</div><p>Minimising the sum of squared residuals is "ordinary least squares". The aim is the parameter set $\\theta$ that minimises $J(\\theta)$ — i.e. minimum error → best-fitting line.</p></div>
`
    },
    {
      id: 'normal', title: 'Closed-form solution (normal equation)', icon: '🧮',
      search: 'closed form solution normal equation matrix theta X transpose X inverse vectorization singular matrix computationally heavy direct solution',
      html: `
<p class="lead">If the dataset is small, we can solve for $\\theta$ in <strong>one shot</strong> with matrix algebra — no iteration needed.</p>

<div class="formula"><span class="formula-label">Normal equation</span>
$$\\theta=(X^TX)^{-1}X^Ty$$</div>

<p>We augment $X$ with a column of 1s (for the bias), write $J(\\theta)$ in matrix form $\\tfrac{1}{2n}(X\\theta-y)^T(X\\theta-y)$, differentiate, set to 0, and solve. We already know $X$ and $y$, so we plug in and compute $\\theta$ directly.</p>

<div class="callout pitfall" data-icon="⚠️"><div class="callout-title">Why it's not the default</div><ul>
<li>$X^TX$ may be <b>singular</b> (no inverse exists).</li>
<li>For large datasets the matrix inversion is <b>computationally heavy</b>.</li>
</ul><p>So the closed form is used only for small datasets where the inverse exists. For everything else we use the general, scalable method: <b>gradient descent</b>.</p></div>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">Closed-form vs gradient descent</div><p>Closed form = exact, one calculation, but limited to small/well-behaved data. Gradient descent = iterative, scales to huge and complex problems. Both aim at the same thing: the $\\theta$ that minimises $J(\\theta)$.</p></div>
`
    },
    {
      id: 'gd', title: 'Gradient descent & its variants', icon: '🏔️',
      search: 'gradient descent learning rate alpha eta update rule simultaneous update convergence epsilon feature scaling convergence batch mini-batch stochastic',
      html: `
<p class="lead">Gradient descent starts anywhere on the cost curve and walks <strong>downhill</strong> to the minimum by repeatedly nudging $\\theta$ in the direction that reduces $J(\\theta)$.</p>

<div class="formula"><span class="formula-label">Update rule (run until convergence)</span>
$$\\theta_j \\leftarrow \\theta_j-\\alpha\\,\\frac{\\partial J}{\\partial\\theta_j}=\\theta_j-\\alpha\\,\\frac{1}{n}\\sum_{i=1}^{n}\\bigl(h_\\theta(x^{(i)})-y^{(i)}\\bigr)x_j^{(i)}$$</div>

<div class="viz" data-viz="mlGradientDescent"></div>

<div class="callout definition" data-icon="📐"><div class="callout-title">Reading the update</div>
<ul>
<li>The <b>minus sign</b> moves us downhill — on a positive slope it lowers $\\theta$, on a negative slope it raises $\\theta$ (the two minuses combine). Either way we head to the minimum.</li>
<li>$\\alpha$ (also written $\\eta$) is the <b>learning rate</b> = step size, a <b>hyperparameter</b> you set.</li>
<li>Each residual is multiplied by its feature $x_j$; for $\\theta_0$ use $x_0=1$.</li>
<li><b>Simultaneous update</b>: compute all new $\\theta$ using the <em>old</em> values, then apply them together. Updating one before the others corrupts $h_\\theta(x)$ in later updates.</li>
</ul></div>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">Convergence</div><p>Far from the minimum the slope is steep → big steps; near it the slope flattens → tiny steps. Stop when updates are tiny: $\\lVert\\theta_{\\text{new}}-\\theta_{\\text{old}}\\rVert < \\epsilon$ (L2 / Euclidean distance), where the tolerance $\\epsilon$ is a hyperparameter. You needn't hit the exact minimum — close enough is fine.</p></div>

<h2>Choosing the learning rate</h2>
<div class="grid cols-2">
<div class="card"><h4>Too small</h4><p>Baby steps → very slow convergence; you may wait forever.</p></div>
<div class="card"><h4>Too large</h4><p>Overshoots the minimum, bounces to the other side, and <b>diverges</b> (error grows). Dangerous.</p></div>
</div>
<p>There is no universal value — try a few (e.g. 0.05, 0.1, 0.2) for a handful of iterations and watch how the error behaves, then pick the best for your data.</p>

<div class="callout pitfall" data-icon="⚠️"><div class="callout-title">Scale your features first</div><p>Unscaled features make the cost contours stretched and convergence slow (still reaches the minimum, just slowly). Scaling makes the bowl rounder → <b>faster convergence</b>. Always scale before gradient descent.</p></div>

<h2>Three variants</h2>
<div class="grid cols-3">
<div class="card"><h4>Batch GD</h4><p>Each update uses <b>all</b> data points (summation over everything). Smoothest path; heavy for huge data.</p></div>
<div class="card"><h4>Mini-batch GD</h4><p>Each update uses a small batch (e.g. 32). A trade-off — a little zig-zag but efficient. The practical default; thetas update after each batch (sequential, not parallel).</p></div>
<div class="card"><h4>Stochastic GD</h4><p>Each update uses <b>one</b> random point (no summation). Very light per step but a noisy, zig-zag path that is slow to converge overall.</p></div>
</div>
`
    },
    {
      id: 'metrics', title: 'Evaluating regression', icon: '📈',
      search: 'regression evaluation metrics mean squared error MSE mean absolute error MAE root mean squared error RMSE R squared coefficient of determination SS residual SS total explained variation',
      html: `
<p class="lead">For a numeric prediction we cannot use accuracy. We measure how far predictions are from actuals, and how much of the variation the model explains.</p>

<div class="tbl-wrap"><table class="data">
<tr><th>Metric</th><th>Formula (idea)</th><th>Notes</th></tr>
<tr><td>MSE</td><td>$\\frac1n\\sum(\\hat y-y)^2$</td><td>Squared error; punishes large misses; large units</td></tr>
<tr><td>MAE</td><td>$\\frac1n\\sum|\\hat y-y|$</td><td>Absolute error; robust, same units as target</td></tr>
<tr><td>RMSE</td><td>$\\sqrt{\\text{MSE}}$</td><td>Back in the target's units; easier to read</td></tr>
</table></div>

<p>Each gradient-descent iteration should lower these. Lower error = better model.</p>

<h2>R² — coefficient of determination</h2>
<div class="formula"><span class="formula-label">Goodness of fit</span>
$$R^2=1-\\frac{SS_{\\text{res}}}{SS_{\\text{tot}}}=1-\\frac{\\sum(y-\\hat y)^2}{\\sum(y-\\bar y)^2}$$</div>

<div class="callout definition" data-icon="📐"><div class="callout-title">What R² measures</div><p>How much of the variation in the target the model <b>explains</b>. $SS_{\\text{res}}=\\sum(y-\\hat y)^2$ is the <b>unexplained</b> error; $SS_{\\text{tot}}=\\sum(y-\\bar y)^2$ is the total variation around the mean $\\bar y$. Small residual variation → $R^2$ near 1 (good fit). Large residual variation → $R^2$ small.</p></div>

<div class="callout interview" data-icon="💼"><div class="callout-title">Why squared, not R?</div><p>Squaring removes sign and penalises larger errors more. Compute one or two metrics from different angles (e.g. MSE and R²) — they tell complementary parts of the same story. You needn't recompute every iteration; an initial vs final reading shows whether the model improved.</p></div>
`
    },
    {
      id: 'basis-reg', title: 'Basis functions, bias–variance & regularisation', icon: '🎚️',
      search: 'linear basis functions polynomial gaussian sigmoidal transformation degree bias variance underfitting overfitting regularization ridge lasso elastic net L1 L2 lambda penalty early stopping',
      html: `
<p class="lead">When a straight line doesn't fit, we transform the features (still using linear-regression machinery), then control the fit with the bias–variance trade-off and regularisation.</p>

<h2>Linear basis functions</h2>
<p>If errors stay high no matter how you tune linear regression, a curve may fit better. Apply a transformation $\\phi(x)$ to the features and keep the same linear-regression solution: $h_\\theta(x)=\\sum_j\\theta_j\\,\\phi_j(x)$. The <em>features</em> change; the <em>method</em> doesn't — that's a linear basis function.</p>
<div class="grid cols-3">
<div class="card"><h4>Polynomial</h4><p>$x, x^2, x^3,\\dots$ A change in $x$ affects the whole curve — <b>global</b> effect. Noise gets amplified by the higher powers.</p></div>
<div class="card"><h4>Gaussian</h4><p>Bell-shaped basis; a change in $x$ mostly affects values near the centre — <b>local</b> effect, robust to noise far away.</p></div>
<div class="card"><h4>Sigmoidal</h4><p>S-shaped basis; also <b>local</b>. Good when a value rises then stabilises (saturates).</p></div>
</div>

<div class="viz" data-viz="biasVariance"></div>

<h2>Bias–variance & over/under-fitting</h2>
<div class="grid cols-2">
<div class="card"><h4>High bias = underfit</h4><p>Model too simple. <b>Both</b> train and test error are high. Fix: richer model / features / higher degree.</p></div>
<div class="card"><h4>High variance = overfit</h4><p>Model too complex; memorises training data. <b>Train error low, test error high.</b> A degree-9 curve hitting every point fails on new data.</p></div>
</div>
<p>You can only tell by comparing <b>training vs test</b> performance — never judge on training alone. We want the trade-off: a generalised model that performs similarly on both.</p>

<div class="callout aiml" data-icon="🤖"><div class="callout-title">Four ways to fight overfitting</div><ol>
<li><b>More data</b> — harder to memorise a larger set.</li>
<li><b>Reduce complexity</b> — lower the model order.</li>
<li><b>Early stopping</b> — stop training when validation error starts rising.</li>
<li><b>Regularisation</b> — penalise large weights.</li>
</ol></div>

<h2>Regularisation</h2>
<p>Large weights signal an overfitting, over-complex model. Regularisation adds a penalty to the cost so the model keeps weights small and focuses on the trend, not the noise.</p>

<div class="formula"><span class="formula-label">Ridge (L2) objective</span>
$$J(\\theta)=\\text{MSE}+\\lambda\\sum_{j=1}^{d}\\theta_j^2$$</div>

<div class="grid cols-3">
<div class="card"><h4>Ridge / L2</h4><p>Penalty $\\lambda\\sum\\theta_j^2$. Shrinks weights smoothly <b>towards</b> 0 (rarely exactly 0). Use when all features matter.</p></div>
<div class="card"><h4>Lasso / L1</h4><p>Penalty $\\lambda\\sum|\\theta_j|$. Drives unimportant weights to <b>exactly 0</b> → automatic <b>feature selection</b>. (Uses sign of $\\theta$ to stay differentiable.)</p></div>
<div class="card"><h4>Elastic net</h4><p>A mix of L1 and L2 (ratio $r$). Use when features are correlated and you're unsure which penalty to pick.</p></div>
</div>

<div class="callout pitfall" data-icon="⚠️"><div class="callout-title">Choosing $\\lambda$</div><p>$\\lambda$ controls penalty strength. Too small → no effect. Too large → drives weights to ~0 (underfit). The penalty is applied to the weights only — <b>not the bias $\\theta_0$</b> (the bias carries no feature noise). Note: scikit-learn's logistic/SVM use $C=1/\\lambda$, so larger $C$ = weaker regularisation.</p></div>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">The over-eager student</div><p>A student who memorises practice papers word-for-word aces practice but fails the real exam (overfit). The teacher's rule "use only useful steps" is a penalty that forces generalisation — exactly what regularisation does to model weights.</p></div>
`
    }
  ],
  cheatsheet: `
<p class="lead">Linear Regression — one-page recall.</p>
<div class="grid cols-2">
<div class="card"><h4>Hypothesis</h4><p>$h_\\theta(x)=\\sum_{j=0}^{d}\\theta_j x_j$, with $x_0=1$. $d$ features → $d+1$ parameters.</p></div>
<div class="card"><h4>Cost (MSE)</h4><p>$J=\\frac{1}{2n}\\sum(\\hat y-y)^2$. Convex → single global minimum. The $\\tfrac12$ cancels the 2 from differentiation.</p></div>
<div class="card"><h4>Normal equation</h4><p>$\\theta=(X^TX)^{-1}X^Ty$. One-shot, small data only (inverse may not exist / be heavy).</p></div>
<div class="card"><h4>Gradient descent</h4><p>$\\theta_j\\leftarrow\\theta_j-\\alpha\\frac1n\\sum(\\hat y-y)x_j$. Simultaneous update; scale features; tune $\\alpha$.</p></div>
<div class="card"><h4>GD variants</h4><p>Batch (all, smooth), mini-batch (chunk, default), stochastic (one point, noisy).</p></div>
<div class="card"><h4>Metrics</h4><p>MSE, MAE, RMSE (same units), $R^2=1-SS_{res}/SS_{tot}$ (closer to 1 = better fit).</p></div>
<div class="card"><h4>Basis functions</h4><p>Polynomial (global), Gaussian/sigmoidal (local). Transform features, keep linear method.</p></div>
<div class="card"><h4>Regularisation</h4><p>Ridge/L2 shrinks; Lasso/L1 zeros (feature selection); elastic net mixes. Penalise weights, not bias.</p></div>
</div>
<div class="callout interview" data-icon="💼"><div class="callout-title">Bias–variance</div><ul>
<li>Underfit = high bias = train & test both bad.</li>
<li>Overfit = high variance = train good, test bad.</li>
<li>Fight overfitting: more data, less complexity, early stopping, regularisation.</li>
</ul></div>
<div class="viz" data-viz="flashcards" data-title="Linear Regression rapid recall" data-cards='[
{"q":"Why square the residuals in the cost?","a":"So positive and negative errors do not cancel, larger errors are penalised more, and the cost is differentiable."},
{"q":"Why is the linear-regression cost easy to optimise?","a":"With MSE it is convex, a bowl with a single global minimum, so there are no local minima to get stuck in."},
{"q":"When use the normal equation vs gradient descent?","a":"Normal equation for small data where the inverse exists. Gradient descent scales to large/complex data."},
{"q":"What does simultaneous update mean?","a":"Compute all new theta from the old values, then apply them together, so later updates use consistent predictions."},
{"q":"Learning rate too large vs too small?","a":"Too large overshoots and diverges. Too small converges very slowly."},
{"q":"What does R-squared tell you?","a":"The fraction of target variation the model explains: 1 minus SS_residual over SS_total. Closer to 1 is better."},
{"q":"Ridge vs Lasso?","a":"Ridge (L2) shrinks weights smoothly toward zero. Lasso (L1) drives weak weights to exactly zero, doing feature selection."},
{"q":"Polynomial vs Gaussian basis effect?","a":"Polynomial changes the whole curve (global) and amplifies noise. Gaussian and sigmoidal are local, more robust to far-away noise."}
]'></div>
`,
  quiz: [
    { q: 'The linear-regression cost with MSE is convex, which means:', opts: ['Many local minima', 'A single global minimum', 'No minimum exists', 'It is non-differentiable'], answer: 1, explain: 'A convex bowl has one global minimum, so gradient descent (or the derivative=0 condition) reaches the best solution.' },
    { q: 'Why does the cost include a factor of ½?', opts: ['To halve the error permanently', 'To cancel the 2 that appears when differentiating', 'To normalise probabilities', 'It is required for convexity'], answer: 1, explain: 'It is a convenience: differentiating the square brings down a 2 that cancels the ½, keeping the gradient clean. It does not move the minimum.' },
    { q: 'A drawback of the normal equation $(X^TX)^{-1}X^Ty$ is:', opts: ['It needs a learning rate', 'It can be uncomputable (singular) or heavy for large data', 'It only works for classification', 'It always overfits'], answer: 1, explain: '$X^TX$ may have no inverse, and inversion is expensive for large datasets — hence gradient descent for scale.' },
    { q: 'If the learning rate is too large, gradient descent will:', opts: ['Converge very slowly', 'Overshoot the minimum and diverge', 'Always reach the global minimum fastest', 'Stop immediately'], answer: 1, explain: 'Big steps jump past the minimum and the error can grow each iteration (divergence).' },
    { q: 'Which metric is reported in the same units as the target?', opts: ['MSE', 'RMSE', 'R²', 'Cross-entropy'], answer: 1, explain: 'RMSE = √MSE brings the error back to the target units; MSE is in squared units and R² is unitless.' },
    { q: 'Train error low, test error high indicates:', opts: ['Underfitting / high bias', 'Overfitting / high variance', 'Perfect generalisation', 'A data leak'], answer: 1, explain: 'That gap is the classic signature of overfitting — the model memorised the training set.' },
    { q: 'Which regularisation performs automatic feature selection?', opts: ['Ridge / L2', 'Lasso / L1', 'No regularisation', 'Standardisation'], answer: 1, explain: 'L1 (Lasso) can drive unimportant weights exactly to 0, effectively dropping those features.' },
    { q: 'Regularisation applies its penalty to:', opts: ['The bias term θ₀ only', 'The feature weights, not the bias', 'The learning rate', 'The target values'], answer: 1, explain: 'We penalise the feature weights (which can carry noise); the bias θ₀ is left unregularised.' }
  ]
});
