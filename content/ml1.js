Course.addModule({
  id: 'ml1', num: 'ML1', icon: '🧠',
  title: 'Introduction to Machine Learning',
  subtitle: 'What ML is, where it fits inside AI, the P–T–E framework, the types of learning, and how to tell classification from regression.',
  tags: ['what is ML', 'AI vs ML vs DS', 'P–T–E', 'supervised', 'unsupervised', 'reinforcement', 'classification vs regression'],
  sections: [
    {
      id: 'what-is-ml', title: 'What is ML & where it fits', icon: '🧭',
      search: 'artificial intelligence machine learning data science traditional programming structured data IID independent identically distributed definition Tom Mitchell',
      html: `
<p class="lead">Machine learning is the field of study that gives computers the ability to <strong>learn from data without being explicitly programmed</strong>. We do not spoon-feed the rules; the machine discovers them from patterns in the data.</p>

<div class="callout definition" data-icon="📐"><div class="callout-title">AI ⊃ ML, and where Data Science sits</div>
<ul>
<li><b>Artificial Intelligence</b>: the broadest umbrella, building systems that simulate human intelligence (understand, learn, reason, decide).</li>
<li><b>Machine Learning</b>: a subfield of AI that teaches machines to learn from data using supervised, unsupervised, and reinforcement techniques.</li>
<li><b>Data Science</b>: two valid views. (1) A superset that wraps AI/ML with statistics, data engineering and domain knowledge to drive decisions. (2) An overlapping field that also includes work needing <em>no</em> ML at all (e.g. a business analyst doing trend analysis in Excel).</li>
</ul></div>

<div class="viz" data-viz="mlProblemMap"></div>

<h2>Traditional programming vs machine learning</h2>
<p>The inputs are swapped. In traditional programming we hand the computer <em>data + rules</em> and it returns output. In machine learning we hand it <em>data + desired output</em> and it returns the <em>rules</em> (the program/model).</p>

<div class="grid cols-2">
<div class="card"><h4>Traditional</h4><p>You study the problem and write explicit rules (if/else, loops). To keep a spam filter accurate you must keep editing code by hand, and the rule list grows long, complex and unmaintainable.</p></div>
<div class="card"><h4>Machine learning</h4><p>You give labelled emails and let the model learn which words/phrases indicate spam. New data can be folded in continuously (continuous / incremental learning) without rewriting rules.</p></div>
</div>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">Intuition · teaching a child to swim</div><p>Traditional = give the child a fixed rulebook ("do A, then B"). ML = put the child in the pool and let them learn by trying, evaluating the error, and correcting, round after round. The machine can monitor its own performance, so a human-in-the-loop is not always required.</p></div>

<h2>The two assumptions of this course</h2>
<div class="grid cols-2">
<div class="card"><h4>Structured data only</h4><p>Highly organised, tabular/relational data (CSV, spreadsheets, databases). Unstructured data (raw text, images) and deep learning are covered in other courses.</p></div>
<div class="card"><h4>Data is IID</h4><p><b>Independent</b>: one data point's outcome does not affect another (like fair coin tosses). <b>Identically distributed</b>: all points are drawn from the same underlying distribution. Time-series data is <em>not</em> IID (today depends on yesterday) and is out of scope here.</p></div>
</div>

<div class="callout interview" data-icon="💼"><div class="callout-title">Exam framing</div><p>"Machine learning is a subfield of AI where models <b>improve performance P at a task T with experience E</b>, learning the rules from data instead of being explicitly programmed. This course works only on <b>structured, IID</b> data."</p></div>
`
    },
    {
      id: 'pte', title: 'The P–T–E framework & when to use ML', icon: '🎯',
      search: 'PTE task performance experience well-posed learning problem handwriting recognition spam playing checkers when to use machine learning Mars personalized medicine payroll',
      html: `
<p class="lead">A learning problem is defined by the triplet <strong>P, T, E</strong>: a program learns from experience <em>E</em> with respect to a task <em>T</em> and a performance measure <em>P</em>, if its performance at <em>T</em>, measured by <em>P</em>, improves with <em>E</em>.</p>

<div class="callout definition" data-icon="📐"><div class="callout-title">The triplet</div>
<ul>
<li><b>Task (T)</b>: the question you are trying to answer (recognise a digit, flag spam, win a game). The single most important thing to nail down.</li>
<li><b>Performance (P)</b>: how you measure success (e.g. accuracy of prediction).</li>
<li><b>Experience (E)</b>: the data you give the model to learn from.</li>
</ul></div>

<h2>Worked examples</h2>
<div class="tbl-wrap"><table class="data">
<tr><th>Problem</th><th>Task (T)</th><th>Experience (E)</th><th>Performance (P)</th></tr>
<tr><td>Handwriting recognition</td><td>Recognise handwritten digits/words</td><td>A set of labelled handwritten samples</td><td>% correctly classified</td></tr>
<tr><td>Spam filtering</td><td>Label email spam / not-spam</td><td>A mailbox of spam and legitimate emails</td><td>% correctly identified</td></tr>
<tr><td>Playing checkers</td><td>Win a game of checkers</td><td>Transcripts of many games played</td><td>Games won against an opponent</td></tr>
</table></div>

<div class="callout pitfall" data-icon="⚠️"><div class="callout-title">We never give rules</div><p>If you hand the model rules, you are back to traditional programming. You provide only the <b>experience</b>; the model must learn the rules itself. For spam you give labelled emails, both spam <em>and</em> legitimate, so it can learn the patterns of each.</p></div>

<h2>When TO use ML</h2>
<div class="grid cols-3">
<div class="card"><h4>No human expertise exists</h4><p>e.g. navigating a robot on Mars, where we have never been, so we cannot write the rules.</p></div>
<div class="card"><h4>Humans can't explain their skill</h4><p>e.g. recognising a friend's face or speech: you can do it but cannot write down the rules.</p></div>
<div class="card"><h4>Solutions must be personalised</h4><p>e.g. personalised medicine: every patient differs, so a one-size-fits-all rulebook fails.</p></div>
</div>

<div class="callout pitfall" data-icon="⚠️"><div class="callout-title">When NOT to use ML</div><p>When the problem is a fixed, known set of rules with nothing to learn, such as a <b>payroll / taxation</b> system. There is no pattern to discover, so traditional programming is the right tool. ML earns its place only when the machine has <em>scope to learn patterns from data</em>.</p></div>

<div class="callout interview" data-icon="💼"><div class="callout-title">The pilot analogy</div><p>Would you trust a pilot who only knows how to press "autopilot" but not how the plane works? Don't be the autopilot engineer who just runs code and reads output. Know what happens behind the scenes, how to interpret results, and how to detect and correct when something goes wrong.</p></div>
`
    },
    {
      id: 'types', title: 'Types of learning', icon: '🗂️',
      search: 'supervised unsupervised reinforcement semi-supervised learning labeled unlabeled reward penalty feedback clustering agent policy',
      html: `
<p class="lead">All three main types are machine learning, since the machine always learns on its own. What differs is the <strong>setting</strong>: how much help (labels / feedback) we provide.</p>

<div class="grid cols-3">
<div class="card"><h4>Supervised</h4><p>Data has <b>questions and the correct answers</b> (labelled data). The model learns a mapping from features to label and predicts the label for new data. Like a teacher supervising your learning.</p></div>
<div class="card"><h4>Unsupervised</h4><p><b>No labels.</b> The model finds structure on its own, typically groups/clusters. Like being handed the slides and asked to learn with no class.</p></div>
<div class="card"><h4>Reinforcement</h4><p>No labels at every step, but the agent gets <b>feedback</b> (a reward or penalty) and updates its policy iteratively. Like a thumbs-up / thumbs-down while learning to swim, or training a pet.</p></div>
</div>

<div class="callout definition" data-icon="📐"><div class="callout-title">Reinforcement learning loop</div><p>An <b>agent</b> observes its environment → selects an <b>action</b> from its current <b>policy</b> → receives a <b>reward</b> (correct) or <b>penalty</b> (wrong) → updates its policy. It repeats until it finds a good policy. We never give rules, only feedback, which can come from a rule, a human, an SME, or even an LLM in the loop. (Details belong to a dedicated Deep RL course.)</p></div>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">Which is easier?</div><p><b>Supervised is easier</b>: you are told the expected answers and only need to learn the patterns. In unsupervised you must define and solve the task with no help. In reinforcement you get hints (feedback) but not the answer.</p></div>

<h2>Semi-supervised learning</h2>
<p>The middle ground: a <b>few labelled</b> points and <b>many unlabelled</b> points. You cannot fully supervise (too few labels) nor fully ignore the labels you do have. The model uses nearby labelled examples plus the distribution of the unlabelled data to label a new point.</p>

<div class="callout aiml" data-icon="🤖"><div class="callout-title">Where semi-supervised shows up</div><p>A company gets thousands of support emails daily; nobody can label them all. Label a few, leave the rest unlabelled, and still auto-sort new emails into billing / technical / refund. Other examples: Google Photos, or annotating medical scans, anywhere labelling everything is impractical.</p></div>
`
    },
    {
      id: 'class-vs-reg', title: 'Supervised tasks: classification vs regression', icon: '↔️',
      search: 'classification regression categorical numerical target decision boundary threshold hyperplane training testing train test split X y features target',
      html: `
<p class="lead">For supervised problems, look at the <strong>target column</strong>. If it is <b>categorical</b> → classification. If it is <b>numerical (continuous)</b> → regression. That one check decides your whole approach.</p>

<div class="callout definition" data-icon="📐"><div class="callout-title">Vocabulary</div>
<ul>
<li><b>Features / attributes / predictors</b> = the columns (inputs), written $X$.</li>
<li><b>Target</b> = the answer column we predict, written $y$.</li>
<li><b>Data points / instances</b> = the rows.</li>
<li>A model learns a mapping $f(X)=\\hat y$ (read: $\\hat y$, "y-hat", the predicted value).</li>
</ul></div>

<h2>Classification</h2>
<p>The target is a category: cancer malignant/benign, email spam/not-spam, job offered yes/no. The model learns a <b>decision boundary</b> that separates the classes.</p>
<div class="grid cols-3">
<div class="card"><h4>1 feature</h4><p>The boundary is a <b>threshold</b> (a point on the axis). Below → one class, above → the other.</p></div>
<div class="card"><h4>2 features</h4><p>The boundary is a <b>line</b> separating the two classes in the plane.</p></div>
<div class="card"><h4>n features</h4><p>The boundary is a <b>hyperplane</b> in n-dimensional space, which we can only imagine or write out mathematically.</p></div>
</div>

<div class="callout pitfall" data-icon="⚠️"><div class="callout-title">Misclassification is normal</div><p>The model learns the threshold itself; we never hard-code it. With overlapping data a perfect boundary is impossible, so we accept some misclassification and aim for the boundary with <b>minimum error</b>. Multi-class problems are usually broken into binary ones (easier to find a separation).</p></div>

<h2>Regression</h2>
<p>The target is a number: car price, salary, Arctic sea-ice extent. The model finds the <b>best-fitting line/curve</b> through the data and extrapolates it to predict future values. The line need not be straight; a polynomial or curved fit may work better.</p>
<div class="callout intuition" data-icon="🧠"><div class="callout-title">Boundary vs best fit</div><p>Classification asks: <em>which side of the boundary?</em> Regression asks: <em>what value lies on the trend line?</em> Classification minimises misclassification; regression minimises a numeric error such as mean squared error.</p></div>

<h2>The train / test split</h2>
<p>Never give all data to the model; keep some hidden to test honestly. A typical split is <b>80–20</b> or <b>70–30</b> (a hyperparameter you justify). Training: the model learns and self-evaluates. Testing: the developer measures performance on unseen data. The truly unseen production data we cannot test; we must trust the model.</p>

<div class="callout aiml" data-icon="🤖"><div class="callout-title">How much data to hold out?</div><p>It depends on how much you have. With only 100 points an 80–20 split keeps enough to learn. With a million points you don't need 80% to train; a 20–80 split can suffice because patterns are learnable from 20%. "Test data should be huge" is too abstract; <em>both</em> sets must be meaningfully sized.</p></div>
`
    },
    {
      id: 'settings', title: 'Learning settings & the accuracy–interpretability trade-off', icon: '⚙️',
      search: 'batch learning mini batch online incremental learning instance based model based lazy eager learner interpretability accuracy tradeoff random forest hyperparameter parameter',
      html: `
<p class="lead">Beyond the <em>type</em> of learning, we classify ML by <strong>how training data is used</strong> and <strong>how the model represents what it learns</strong>.</p>

<h2>By how training data is fed in</h2>
<div class="grid cols-3">
<div class="card"><h4>Batch learning</h4><p>Use <b>all</b> the data at once. Simplest, but with millions of points it can exceed RAM and slow training.</p></div>
<div class="card"><h4>Mini-batch learning</h4><p>Split data into <b>chunks</b> (e.g. size 32/64/128) and learn iteratively. This is not sampling; the model still sees all data, just in pieces. The practical default.</p></div>
<div class="card"><h4>Online / incremental</h4><p>Learn from <b>one data point at a time</b>, updating continuously. Ideal for live streams: sensor data, stock prices, user clicks.</p></div>
</div>

<div class="callout pitfall" data-icon="⚠️"><div class="callout-title">Mini-batch ≠ sampling</div><p>Sampling gives the model only a subset. Mini-batch eventually shows the model the <b>whole</b> dataset, split for memory/compute reasons. The model updates its learning after each chunk.</p></div>

<h2>By how the model is built</h2>
<div class="grid cols-2">
<div class="card"><h4>Model-based (eager learner)</h4><p>Learns the patterns/rules <b>up front</b> from training data, then predicts fast. Like a student who studies the whole textbook before the exam. Slower to train, fast to predict.</p></div>
<div class="card"><h4>Instance-based (lazy learner)</h4><p>Does nothing until a query arrives, then compares the new point to its <b>nearest neighbours</b> and votes. Like opening the textbook only in the exam hall. Fast to "train", slow to predict, and re-scans data every time.</p></div>
</div>

<div class="callout definition" data-icon="📐"><div class="callout-title">Parameters vs hyperparameters</div><p><b>Parameters</b> are values the model <em>learns</em> (e.g. weights). <b>Hyperparameters</b> are design decisions <em>you</em> set, not learned (e.g. batch size, learning rate, train/test split, k in clustering). You experiment to find good hyperparameters for your data.</p></div>

<h2>The accuracy–interpretability trade-off</h2>
<p>An <b>interpretable</b> model can explain its decision (give you the rules). It is often less powerful. A complex model is more accurate but a black box. As a designer you choose where you sit on this trade-off based on the problem.</p>
<div class="grid cols-2">
<div class="card"><h4>High interpretability</h4><p>Linear / logistic regression, decision trees, naïve Bayes. Easy to explain; sometimes lower accuracy.</p></div>
<div class="card"><h4>Low interpretability</h4><p>kNN / instance-based, SVMs, Gaussian processes, neural networks. Strong accuracy, hard to explain.</p></div>
</div>

<div class="callout interview" data-icon="💼"><div class="callout-title">The sweet spot</div><p><b>Random forest</b> tends to be both reasonably interpretable and highly accurate on classical (structured) datasets, though it is heavy to train and works only on numerical data. For a business decision you'd often prefer interpretability so the model can justify itself; for raw accuracy you may accept a black box. There is no single best model; try several and pick what suits the data.</p></div>
`
    }
  ],
  cheatsheet: `
<p class="lead">Introduction to ML: one-page recall.</p>
<div class="grid cols-2">
<div class="card"><h4>Definition</h4><p>Learn rules from data without explicit programming. ML ⊂ AI. This course = <b>structured, IID</b> data only.</p></div>
<div class="card"><h4>Traditional vs ML</h4><p>Traditional: data + rules → output. ML: data + output → rules (model).</p></div>
<div class="card"><h4>P–T–E</h4><p>Performance improves at Task with Experience. We give experience (data), never rules.</p></div>
<div class="card"><h4>Types</h4><p>Supervised (labels), unsupervised (no labels → clusters), reinforcement (reward/penalty feedback), semi-supervised (few labels).</p></div>
<div class="card"><h4>Class vs reg</h4><p>Categorical target → classification (decision boundary). Numerical target → regression (best-fit line).</p></div>
<div class="card"><h4>Data feed</h4><p>Batch (all), mini-batch (chunks, the default), online (one point, live data).</p></div>
<div class="card"><h4>Model type</h4><p>Model-based = eager (study first, predict fast). Instance-based = lazy (ask neighbours at query time).</p></div>
<div class="card"><h4>Param vs hyperparam</h4><p>Parameters are learned; hyperparameters (learning rate, batch size, k) are designer-set.</p></div>
</div>
<div class="callout interview" data-icon="💼"><div class="callout-title">When to use ML</div><ul>
<li>Human expertise doesn't exist (Mars rover).</li>
<li>Humans can't explain the skill (face/speech recognition).</li>
<li>Solutions must be personalised (personalised medicine).</li>
<li><b>Not</b> for fixed-rule problems like payroll, where there is nothing to learn.</li>
</ul></div>
<div class="viz" data-viz="flashcards" data-title="Intro to ML rapid recall" data-cards='[
{"q":"How does ML differ from traditional programming?","a":"Traditional: data + rules to output. ML: data + output to rules. The model learns the rules from patterns."},
{"q":"What is P-T-E?","a":"A program learns from Experience E at Task T measured by Performance P, if P improves with E."},
{"q":"Supervised vs unsupervised vs reinforcement?","a":"Supervised = labelled data. Unsupervised = no labels, find clusters. Reinforcement = learn from reward/penalty feedback."},
{"q":"Classification or regression?","a":"Categorical target = classification (find decision boundary). Numerical target = regression (find best-fit line)."},
{"q":"Model-based vs instance-based?","a":"Model-based (eager) learns patterns up front, predicts fast. Instance-based (lazy) waits, then asks nearest neighbours."},
{"q":"Parameter vs hyperparameter?","a":"Parameters are learned by the model. Hyperparameters (learning rate, batch size, k) are set by the designer."}
]'></div>
`,
  quiz: [
    { q: 'Which assumption does this course make about the data?', opts: ['Unstructured and time-dependent', 'Structured and IID', 'Always image data', 'Always labelled'], answer: 1, explain: 'The course works only on structured (tabular/relational) data that is Independent and Identically Distributed. Time series is not IID and is out of scope.' },
    { q: 'In the P–T–E framework, what is the "experience"?', opts: ['The accuracy metric', 'The task definition', 'The data given to the model', 'The hyperparameters'], answer: 2, explain: 'Experience E is the data the model learns from. T is the task, P is the performance measure.' },
    { q: 'A target column contains continuous numeric prices. This is a:', opts: ['Classification problem', 'Regression problem', 'Clustering problem', 'Reinforcement problem'], answer: 1, explain: 'Numerical/continuous target → regression. A categorical target would make it classification.' },
    { q: 'Which learning type uses a reward/penalty signal rather than labels?', opts: ['Supervised', 'Unsupervised', 'Reinforcement', 'Semi-supervised'], answer: 2, explain: 'Reinforcement learning updates a policy from feedback (reward/penalty), not from per-example labels.' },
    { q: 'Mini-batch learning differs from sampling because:', opts: ['It only uses a subset of the data', 'It eventually uses all the data, just in chunks', 'It needs no training', 'It is the same as online learning'], answer: 1, explain: 'Mini-batch splits the full dataset into chunks for memory/compute; the model still learns from all of it. Sampling keeps only a subset.' },
    { q: 'An instance-based (lazy) learner is characterised by:', opts: ['Fast prediction, slow training', 'Learning all rules up front', 'Doing nothing until a query, then asking nearest neighbours', 'Being the most interpretable model'], answer: 2, explain: 'Lazy learners defer work to query time, comparing the new point to neighbours. Training is cheap; prediction is expensive.' },
    { q: 'Which problem is NOT a good candidate for machine learning?', opts: ['Recognising faces', 'Navigating a Mars rover', 'A fixed-rule payroll/taxation system', 'Personalised medicine'], answer: 2, explain: 'Payroll is a known fixed-rule problem with nothing to learn, so traditional programming fits better.' }
  ]
});
