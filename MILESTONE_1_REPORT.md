# Milestone 1 Report — DFA/NFA String Processing Visualizer

**Course evaluation:** Milestone 1 · **Total:** 5 marks · **Prepared:** 26 November 2026

## A. Problem Definition and Automata Specification (1 mark)

### Problem and objectives

Finite-automata execution can be difficult to follow from transition rules alone. This project provides a browser-based learning visualizer that analyzes a string, constructs or selects a finite automaton, simulates it in Python, and displays the transition graph, table, computation path, and accept/reject result.

### Input and output

Input is a string of zero through 100 characters. For exact-string mode, its distinct characters form the automaton alphabet, and the generated machine recognizes precisely the singleton language containing that same string. Fixed demo machines permit acceptance and rejection experiments with other inputs. Output includes input statistics, automaton structure and table, per-symbol history, and final decision.

### Formal models

- **DFA:** `M_D = (Q, Σ, δ, q₀, F)`, with finite `Q, Σ`, initial state `q₀ ∈ Q`, accepting set `F ⊆ Q`, and total transition function `δ: Q × Σ → Q`.
- **NFA:** `M_N = (Q, Σ, δ, q₀, F)`, with transition function `δ: Q × Σ → 2^Q`. An input is accepted if some state reachable after consuming all input is in `F`. This implementation has no epsilon transitions.

These are mathematical computational models; the project does not use trained AI or machine-learning models.

## B. Existing Tools and Feasibility (1 mark)

| Tool | Verified scope | Difference from this project |
|---|---|---|
| [JFLAP](https://jflap.org/whatis.html) | Official materials describe graphical creation and experiments with DFA/NFA and other formal-language models, including conversions; official tutorials show constructing and running finite automata. | Broader authoring and theory package. This project has a narrower, input-driven exact-string generator plus three fixed demos and a focused step visualizer. |
| [Automata Tutor](https://automata-tutor.live-lab.fi.muni.cz/try_it) | Current public try-it page lists DFA and NFA construction alongside regex, grammar, and PDA exercises; the page also says some functions are still being implemented. | Exercise-focused web platform listing automata and formal-language tasks. This project is a local single-user simulator; problem authoring and coursework workflows are not implemented here. |
| This visualizer | Source implements string analysis; exact-string DFA/NFA generation; three fixed example machines; simulation histories; SVG graph, table and playback controls. | Does not offer free-form automaton editing, conversions, minimization, epsilon transitions or account-based coursework. The demo labelled “contains `ab`” has a transition-map gap (no initial-state `b` transition), so it does not implement the full labelled language; see the technical limitations. |

### Feasibility

- **Technical:** Feasible as implemented using Python, FastAPI/Pydantic, Uvicorn, browser-native HTML/CSS/JavaScript/SVG, and Pytest. The frontend and API are served from one origin. The verified installed versions and unpinned dependency ranges are listed in [technical documentation](PROJECT_DOCUMENTATION.md#3-technologies-tools-and-versions).
- **Operational:** The repository documents a local Windows PowerShell setup, and the application was observed running at `http://127.0.0.1:8000/` during preparation. It can be used in a modern browser after starting the ASGI server.
- **Economic:** The tracked project has no declared paid service, database, or external automata-library dependency. It uses standard Python packages and browser facilities; hosting, hardware, and deployment costs have not been measured. Review package licenses before redistribution.

## C. Simulator Design and Methodology (2 marks)

### Architecture and workflow

The browser sends same-origin JSON requests to FastAPI. The backend validates/analyzes the input, constructs or selects a machine, runs its simulator, and returns the machine, table, result and history. JavaScript renders this returned data as SVG and text; the playback controls traverse the returned history.

See [PROJECT_ARCHITECTURE.md](PROJECT_ARCHITECTURE.md) for architecture and workflow diagrams, modules, and DFA/NFA processing flows. See [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) for endpoint details and implementation scope, including an observed gap in the fixed NFA example labelled “contains `ab`”.

### Actual interface

During source inspection, the running interface displayed input `101`, the exact-string NFA, statistics (length 3, alphabet `{0,1}`, 4 states), a state diagram, path, and transition table. A live UI screenshot was captured for inspection in the accompanying session, but no screenshot image file is currently included in the repository. Add an image captured from the running browser here before final submission if a portable screenshot is required.

### Core interaction

1. Choose a string and exact-string DFA/NFA or a built-in machine.
2. Submit JSON through the frontend's `fetch` helper.
3. Analyze, generate/select, and simulate on the backend.
4. Return JSON containing model and computation path.
5. Render SVG, table, path and decision; step through the history.

The frontend uses `POST /api/simulate/{kind}` for exact-string mode and `POST /api/example` for fixed examples. Additional routes are documented in [the API section](PROJECT_DOCUMENTATION.md#4-backend-and-api).

## D. Algorithm Selection and Correctness (1 mark)

### DFA pseudocode

```text
state ← q₀
for each symbol c in input:
    if δ(state, c) is undefined: reject with invalid-symbol reason
    state ← δ(state, c)
    append state and transition to computation history
accept iff state ∈ F
```

For a generated exact-string DFA, each state/symbol pair in its alphabet has a transition; unexpected chain symbols go to `D`, and `D` loops to itself.

### NFA pseudocode

```text
active ← {q₀}
for each symbol c in input:
    next ← ∅
    for each state q in active:
        next ← next ∪ δ(q, c)
    active ← next
    append active states and traversed edges to history
accept iff active ∩ F ≠ ∅
```

### Selection and correctness rationale

The DFA algorithm follows exactly one transition per symbol; the NFA algorithm preserves all possible runs by maintaining the union of reachable states. The final-state membership test directly implements the definitions above. These algorithms are appropriate for small finite-state demonstrations and directly produce histories for step-by-step visualization.

### Manually solved validation example

Use the implemented **Branching NFA** on input `ab`. Initially active `{q0}`. On `a`, its two transitions reach `{q1,q2}`. On `b`, both branches reach `{q3}`. Since `q3` is final, the expected result is **accepted**. This trace follows the transition map and final-state set in `backend/services/generator.py`; the existing tests also assert that both `q1` and `q2` are active after the first symbol. The final verification run is reported separately in the completion message.

## Sources and scope note

- JFLAP official feature overview: [jflap.org/whatis.html](https://jflap.org/whatis.html); official tutorial index: [jflap.org/tutorial/frameindex.html](https://jflap.org/tutorial/frameindex.html).
- Automata Tutor current public exercises page: [automata-tutor.live-lab.fi.muni.cz/try_it](https://automata-tutor.live-lab.fi.muni.cz/try_it).
- Comparative statements above describe only features listed on those public pages. Project statements were checked against the tracked source and tests. External pages were consulted on 26 November 2026.

## Confirmation needed

The responsibility assignments in [TEAM_WORK_DISTRIBUTION.md](TEAM_WORK_DISTRIBUTION.md) are proposals because the available Git history has a single initial commit and cannot establish each person's work. The team should confirm individual contributions and add a portable UI screenshot before handing in the report.
