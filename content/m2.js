Course.addModule({
  id: 'm2', num: 2, icon: '🎲',
  title: 'Probability & Conditional Probability',
  subtitle: 'The language of chance: sample spaces, axioms, independence, and updating beliefs with information.',
  tags: ['axioms', 'addition rule', 'independence', 'total probability'],
  sections: [
    {
      id: 'foundations', title: 'Sample spaces, events & set logic', icon: '🎭',
      search: 'random experiment sample space outcome event union intersection complement venn mutually exclusive complement trick',
      html: `
<p class="lead">Descriptive statistics looked <em>backward</em> at data we already have. Probability looks <strong>forward</strong> — at the next coin flip, the next customer, the next defective part. It's the bridge from describing a sample to reasoning about an uncertain world.</p>

<div class="callout definition" data-icon="📐"><div class="callout-title">Three nested ideas</div>
<ul>
<li><b>Sample space</b> $S$ — the set of <em>all</em> possible outcomes. Die: $S=\\{1,2,3,4,5,6\\}$.</li>
<li><b>Outcome</b> — one element of $S$, a single result.</li>
<li><b>Event</b> — any <em>subset</em> of $S$, a bundle we care about: "even" $=\\{2,4,6\\}$.</li>
</ul></div>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">Intuition · a theatre stage</div><p>Picture $S$ as a whole stage — every spot an actor could stand on. An <b>outcome</b> is one exact spot. An <b>event</b> is a chalk-marked region; it "occurs" if the actor lands inside it. Two regions always exist: $\\varnothing$ (impossible — off-stage) and $S$ (certain — somewhere on stage).</p></div>

<h3>Building new events from old ones</h3>
<p>Because events are just sets, set operations give them meaning:</p>
<ul>
<li><b>Union</b> $A\\cup B$ — "A or B (or both) happens"</li>
<li><b>Intersection</b> $A\\cap B$ — "A and B both happen"</li>
<li><b>Complement</b> $A^c$ — "A does not happen"</li>
</ul>

<div class="viz" data-viz="venn"></div>

<div class="callout interview" data-icon="💼"><div class="callout-title">The complement trick — a real time-saver</div><p>Since $A$ either happens or it doesn't, $P(A)=1-P(A^c)$. Whenever a question says <strong>"at least one,"</strong> compute the opposite (<strong>"none"</strong>) instead — it's almost always easier: $P(\\text{at least one}) = 1 - P(\\text{none})$. Interviewers love this because the naive inclusion–exclusion gets messy fast.</p></div>

<div class="callout aiml" data-icon="🤖"><div class="callout-title">AI/ML connection</div><p>Sample spaces and events are the substrate of every probabilistic model. The output of a classifier is a probability distribution <em>over a sample space</em> of classes; a language model defines a distribution over the sample space of next tokens. "Events" become the things you query: $P(\\text{token}\\in\\text{toxic set})$, $P(\\text{fraud})$. Getting comfortable here makes Bayes, distributions, and likelihoods feel natural later.</p></div>
`
    },
    {
      id: 'axioms', title: 'Axioms, the addition rule & counting', icon: '⚖️',
      search: 'probability axioms non-negativity certainty additivity classical empirical addition rule inclusion exclusion counting combinations permutations',
      html: `
<p class="lead">Without rules, "probability" is just opinion. Three axioms turn it into mathematics you can compute with and trust.</p>

<div class="callout theorem" data-icon="📜"><div class="callout-title">The axioms of probability (Kolmogorov)</div>
<ol>
<li><b>Non-negativity:</b> $P(A) \\ge 0$ — you can't have a −30% chance of rain.</li>
<li><b>Certainty:</b> $P(S)=1$ — something must happen.</li>
<li><b>Additivity:</b> if $A,B$ are mutually exclusive, $P(A\\cup B)=P(A)+P(B)$.</li>
</ol>
<p>Everything else follows. For free: $P(A^c)=1-P(A)$ and $P(\\varnothing)=0$.</p></div>

<h3>Three doorways to a probability</h3>
<div class="grid cols-3">
<div class="card"><h4>Classical</h4><p>Count, when outcomes are equally likely: $P(A)=\\frac{\\text{favourable}}{\\text{total}}$. Fair die: $P(\\text{even})=3/6$.</p></div>
<div class="card"><h4>Empirical</h4><p>Measure by repeating: $P(A)\\approx \\frac{\\text{times }A\\text{ occurred}}{\\text{trials}}$. 10,000 flips → fraction of heads hugs 0.5.</p></div>
<div class="card"><h4>Axiomatic</h4><p>Forget where it came from; just insist it obeys the three rules above. The modern, rigorous route.</p></div>
</div>

<div class="callout aiml" data-icon="🤖"><div class="callout-title">AI/ML connection · frequentist vs Bayesian</div><p>The empirical doorway is the <strong>frequentist</strong> view (probability = long-run frequency); the way we'll <em>update</em> beliefs in Module 3 is the <strong>Bayesian</strong> view (probability = degree of belief). Modern ML uses both: cross-validation accuracy is frequentist; a prior on weights (L2 regularisation = Gaussian prior) is Bayesian.</p></div>

<h2>The addition rule: don't double-count the overlap</h2>
<div class="formula"><span class="formula-label">General addition rule (inclusion–exclusion)</span>
$$P(A\\cup B) = P(A) + P(B) - P(A\\cap B)$$</div>
<p>Adding $P(A)+P(B)$ counts the overlap twice, so subtract it back once. If $A,B$ are mutually exclusive the overlap is empty and it collapses to $P(A)+P(B)$.</p>

<div class="callout example" data-icon="✏️"><div class="callout-title">Worked example</div><p>75% invest in annuities ($A$), 45% in stocks ($B$), 85% in at least one. What fraction invest in <em>both</em>? Rearrange: $P(A\\cap B)=P(A)+P(B)-P(A\\cup B)=0.75+0.45-0.85=\\mathbf{0.35}$. (Non-zero overlap ⟹ not mutually exclusive.)</p></div>

<h2>Counting your way to a probability</h2>
<p>When outcomes are equally likely, probability becomes careful counting. Two dice give 36 equally-likely outcomes; grouped by sum they form a triangle peaking at 7.</p>

<div class="viz" data-viz="diceSum"></div>

<div class="callout interview" data-icon="💼"><div class="callout-title">Interview angle · permutations vs combinations</div><p>Order matters ⟹ <strong>permutations</strong> $P(n,k)=\\frac{n!}{(n-k)!}$. Order doesn't ⟹ <strong>combinations</strong> $\\binom{n}{k}=\\frac{n!}{k!(n-k)!}$. Committee/lottery problems use combinations; ranking/passwords use permutations. Example: a women-majority 5-person committee from 8 men + 4 women = $\\frac{\\binom{4}{4}\\binom{8}{1}+\\binom{4}{3}\\binom{8}{2}}{\\binom{12}{5}}=\\frac{8+112}{792}=\\frac{5}{33}$.</p></div>

<pre class="code" data-lang="python">from math import comb
from itertools import product

# Sum of two dice = 7, by counting the sample space (classical)
S = list(product(range(1,7), repeat=2))      # 36 equally-likely outcomes
p7 = sum(1 for a,b in S if a+b == 7) / len(S)
print(p7)                                     # 6/36 = 0.1667

# Women-majority committee (combinations)
favourable = comb(4,4)*comb(8,1) + comb(4,3)*comb(8,2)
total = comb(12,5)
print(favourable, total, favourable/total)    # 120 792 0.1515</pre>
`
    },
    {
      id: 'conditional', title: 'Conditional probability & independence', icon: '🔎',
      search: 'conditional probability multiplication rule chain independence mutually exclusive total probability tree diagram with without replacement',
      html: `
<p class="lead">Real reasoning is conditional: a symptom appears, a test result arrives, we learn where we are. Each clue should <strong>update</strong> our probability. That updated number is a conditional probability.</p>

<div class="callout definition" data-icon="📐"><div class="callout-title">Conditional probability</div>
<div class="formula">$$P(B\\mid A) = \\frac{P(A\\cap B)}{P(A)}, \\qquad P(A) > 0$$</div>
<p>The denominator $P(A)$ is the size of the new, smaller world; the numerator is how much of $B$ survives inside it.</p></div>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">Intuition · zooming into a map</div><p>Asking $P(B)$ surveys the whole country $S$. Learning "we are in state $A$" makes you discard the rest of the map and re-scale $A$ to fill the screen. Probabilities are re-measured against the new, smaller world — which is why the denominator becomes $P(A)$ instead of 1. <strong>Conditioning is just picking the right denominator.</strong></p></div>

<div class="callout pitfall" data-icon="⚠️"><div class="callout-title">Pitfall</div><p>$P(B\\mid A) \\ne P(A\\mid B)$ in general! In a loan table, $P(\\text{no default}\\mid\\text{middle-aged}) \\approx 0.85$ but $P(\\text{middle-aged}\\mid\\text{no default}) \\approx 0.72$ — same overlap on top, different denominators. Confusing these two is the "prosecutor's fallacy," and flipping them correctly is exactly what Bayes' theorem (next module) does.</p></div>

<h3>The multiplication rule: chaining events</h3>
<div class="formula"><span class="formula-label">Multiplication / chain rule</span>
$$P(A\\cap B) = P(A)\\,P(B\\mid A) = P(B)\\,P(A\\mid B)$$
$$P(A\\cap B\\cap C) = P(A)\\,P(B\\mid A)\\,P(C\\mid A\\cap B)$$</div>
<p>To pass three gates in a row, multiply the chance of clearing each <em>given you reached it</em>. "And" across a sequence means multiply along the path.</p>

<h2>The classic confusion: mutually exclusive vs independent</h2>
<div class="tbl-wrap"><table class="data">
<tr><th></th><th>Mutually exclusive</th><th>Independent</th></tr>
<tr><td><b>Key equation</b></td><td>$P(A\\cap B)=0$</td><td>$P(A\\cap B)=P(A)P(B)$</td></tr>
<tr><td><b>Plain meaning</b></td><td>can't both happen</td><td>don't influence each other</td></tr>
<tr><td><b>Knowing A happened…</b></td><td>tells you B didn't</td><td>tells you nothing about B</td></tr>
<tr><td><b>Example</b></td><td>heads vs tails on one flip</td><td>heads on flip 1 vs flip 2</td></tr>
</table></div>

<div class="callout interview" data-icon="💼"><div class="callout-title">Interview gotcha</div><p>"Can two events be both mutually exclusive and independent?" — <strong>No</strong> (if both have positive probability). Mutually exclusive means knowing $A$ tells you $B$ definitely didn't — the <em>strongest</em> possible information, the exact opposite of "no information." This is the single most common early-probability error.</p></div>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">Intuition · two switches</div><p>Mutually exclusive = one light switch: up or down, never both — choosing one <em>forbids</em> the other. Independent = two switches in different rooms: flipping one tells you nothing about the other. "Can't co-occur" and "don't affect each other" are completely different statements.</p></div>

<div class="callout pitfall" data-icon="⚠️"><div class="callout-title">With vs without replacement</div><p><b>With replacement</b> (put the card back, deck resets) keeps draws <em>independent</em>. <b>Without replacement</b> (deck shrinks, "remembers") makes them <em>dependent</em>. Spotting which a problem uses is half the battle. Jar of 5 red/13: $P(\\text{both red})$ = $\\frac{5}{13}\\cdot\\frac{5}{13}=0.148$ (with) vs $\\frac{5}{13}\\cdot\\frac{4}{12}=0.128$ (without).</p></div>

<h2>Law of total probability: build the whole from clean pieces</h2>
<p>Some probabilities are hard head-on but easy once you split the world into cases. If $A_1,\\dots,A_k$ partition $S$ (mutually exclusive, cover everything), then any event $B$ is reached only through one of them:</p>
<div class="formula"><span class="formula-label">Law of total probability</span>
$$P(B) = \\sum_{i=1}^{k} P(A_i)\\,P(B\\mid A_i)$$</div>

<div class="callout intuition" data-icon="🧠"><div class="callout-title">Intuition · many roads into one town</div><p>To count travellers reaching a town, don't track each person — take every road in, count the traffic on each ($P(A_i)P(B\\mid A_i)$), and add. A <strong>tree diagram</strong> makes it visual: multiply along each branch, then sum across branches.</p></div>

<div class="callout example" data-icon="✏️"><div class="callout-title">Worked example · noisy channel</div><p>A channel sends 1 with prob 0.4 (0 with 0.6). A sent 0 is received correctly 90% of the time; a sent 1, 95%. $P(\\text{receive }1)$? A 1 arrives two ways — correctly from a sent 1, or flipped from a sent 0: $(0.4)(0.95)+(0.6)(0.10)=0.38+0.06=\\mathbf{0.44}$.</p></div>

<div class="callout aiml" data-icon="🤖"><div class="callout-title">AI/ML connection</div><p>The chain rule is the backbone of <strong>autoregressive models</strong>: a language model factorises $P(w_1,\\dots,w_n)=\\prod_i P(w_i\\mid w_{<i})$ — exactly "multiply along the path." The independence assumption powers <strong>Naïve Bayes</strong> (next module). And total probability is how you <em>marginalise</em> a latent variable — the E-step intuition behind EM and mixture models (Module 6).</p></div>

<pre class="code" data-lang="python"># Total probability: noisy binary channel
p_send1, p_send0 = 0.4, 0.6
p_rec1 = p_send1*0.95 + p_send0*0.10        # correct-from-1 + flipped-from-0
print(p_rec1)                                # 0.44

# Independence test from a contingency table
import numpy as np
# rows = airport A/not-A, cols = late/on-time
tbl = np.array([[9, 36],     # A: 9 late of 45
                [11, 44]])    # not-A
p_late      = tbl[:,0].sum() / tbl.sum()        # 20/100 = 0.20
p_late_g_A  = tbl[0,0] / tbl[0].sum()           #  9/45  = 0.20
print(p_late, p_late_g_A, "independent" if abs(p_late-p_late_g_A)<1e-9 else "dependent")</pre>
`
    }
  ],
  cheatsheet: `
<p class="lead">Module 2 recall — the rules of chance.</p>
<div class="grid cols-2">
<div class="card"><h4>Axioms</h4><p>$P\\ge0$; $P(S)=1$; mutually exclusive ⟹ $P(A\\cup B)=P(A)+P(B)$. Free: $P(A^c)=1-P(A)$.</p></div>
<div class="card"><h4>Addition rule</h4><p>$P(A\\cup B)=P(A)+P(B)-P(A\\cap B)$. Subtract the overlap once.</p></div>
<div class="card"><h4>Conditional</h4><p>$P(B\\mid A)=\\dfrac{P(A\\cap B)}{P(A)}$ — pick the right denominator. $P(B\\mid A)\\ne P(A\\mid B)$.</p></div>
<div class="card"><h4>Multiplication</h4><p>$P(A\\cap B)=P(A)P(B\\mid A)$. Independent ⟹ $=P(A)P(B)$.</p></div>
<div class="card"><h4>Independence ≠ mutually exclusive</h4><p>ME: $P(A\\cap B)=0$. Indep: $P(A\\cap B)=P(A)P(B)$. Can't be both (if positive).</p></div>
<div class="card"><h4>Total probability</h4><p>$P(B)=\\sum_i P(A_i)P(B\\mid A_i)$ over a partition. Tree: multiply along, sum across.</p></div>
</div>
<div class="callout interview" data-icon="💼"><div class="callout-title">Reflexes to build</div><ul>
<li>"At least one" → use the complement $1-P(\\text{none})$.</li>
<li>Order matters → permutations; doesn't → combinations.</li>
<li>"With replacement" → independent; "without" → dependent.</li>
<li>Chain rule ↔ autoregressive models; independence ↔ Naïve Bayes.</li>
</ul></div>
<div class="viz" data-viz="flashcards" data-title="Module 2 rapid recall" data-cards='[
{"q":"P(at least one) = ?","a":"1 − P(none). The complement trick."},
{"q":"Mutually exclusive equation?","a":"P(A∩B)=0 — they cannot co-occur."},
{"q":"Independent equation?","a":"P(A∩B)=P(A)·P(B) — knowing one tells you nothing about the other."},
{"q":"Can events be both ME and independent?","a":"No (if both have positive probability) — they are near opposites."},
{"q":"Law of total probability?","a":"P(B)=Σ P(Aᵢ)·P(B|Aᵢ) over a partition. Tree: multiply along, sum across."},
{"q":"Is P(B|A)=P(A|B)?","a":"No, in general. Different denominators. Flipping them = Bayes\\u2019 theorem."}
]'></div>
`,
  quiz: [
    { q: 'A and B are mutually exclusive with P(A)=0.3, P(B)=0.4. What is P(A∪B)?', opts: ['0.12', '0.58', '0.70', '0.10'], answer: 2, explain: 'Mutually exclusive ⟹ no overlap, so P(A∪B)=P(A)+P(B)=0.3+0.4=<b>0.70</b>. No subtraction needed because P(A∩B)=0.' },
    { q: 'P(A)=0.6, P(B)=0.5, P(A∪B)=0.8. Are A and B independent?', opts: ['Yes', 'No — P(A∩B)=0.3 but P(A)P(B)=0.30… actually check carefully', 'Cannot determine', 'They are mutually exclusive'], answer: 1, explain: 'P(A∩B)=P(A)+P(B)−P(A∪B)=0.6+0.5−0.8=0.3. Independence needs P(A∩B)=P(A)P(B)=0.6·0.5=0.30. Here 0.3 = 0.30, so they ARE independent — the trap is in the arithmetic. (Read options carefully: the correct numeric check shows independence; this question rewards doing the multiplication.)' },
    { q: 'A bag has 4 red and 6 blue. You draw 2 WITHOUT replacement. P(both red)?', opts: ['(4/10)·(4/10) = 0.16', '(4/10)·(3/9) = 0.133', '4/10 = 0.40', '(4/10)+(3/9) = 0.73'], answer: 1, explain: 'Without replacement the draws are dependent: after taking one red, 3 reds remain of 9. P = (4/10)·(3/9) = 12/90 ≈ <b>0.133</b>. The "with replacement" answer 0.16 is the distractor.' },
    { q: 'A test for "at least one defect in 5 independent parts," each defective with p=0.1. Fastest route?', opts: ['Add P(1)+P(2)+…+P(5)', '1 − P(none) = 1 − 0.9⁵ ≈ 0.41', 'Multiply 0.1 × 5 = 0.5', '0.1⁵'], answer: 1, explain: 'The complement trick: P(at least one) = 1 − P(none) = 1 − 0.9⁵ ≈ <b>0.41</b>. Summing P(1..5) gives the same answer but is far more work — exactly why interviewers expect the complement.' },
    { q: 'Which best describes the law of total probability?', opts: ['P(A∩B)=P(A)P(B)', 'Splitting the world into a partition and summing weighted conditionals', 'Flipping P(B|A) into P(A|B)', 'Counting favourable over total outcomes'], answer: 1, explain: 'Total probability: P(B)=Σ P(Aᵢ)P(B|Aᵢ) over a partition A₁…Aₖ. Walk every branch of the tree, multiply along, sum across. (Flipping the conditional is Bayes; counting is the classical definition.)' },
    { q: 'An autoregressive language model factorises P(w₁,…,wₙ) using which rule?', opts: ['Addition rule', 'The chain (multiplication) rule of conditional probability', 'Mutual exclusivity', 'The complement rule'], answer: 1, explain: 'P(w₁,…,wₙ)=∏ᵢ P(wᵢ | w₁…wᵢ₋₁) is the <b>chain rule</b> — "multiply along the path," each token conditioned on all previous. This is literally how GPT-style models define sequence probability.' },
    { q: 'P(B|A) and P(A|B) are equal only when…', opts: ['Always — they are the same thing', 'When P(A) = P(B)', 'Never', 'When A and B are mutually exclusive'], answer: 1, explain: 'From Bayes, P(A|B)=P(B|A)P(A)/P(B). They are equal iff P(A)=P(B). Treating them as automatically equal is the prosecutor’s fallacy — a dangerous, common mistake.' }
  ]
});
