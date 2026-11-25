# DFA/NFA String Processing Visualizer

**Technical documentation**  
Prepared for university Milestone 1 review · 26 November 2026

## 1. Project overview

The application demonstrates how deterministic and nondeterministic finite automata process finite strings. A user can generate an automaton for the exact input string or run one of three fixed teaching examples, then inspect the transition graph, table, result, and step history.

The project uses formal automata models. **It does not use trained machine-learning or AI models.** The input string is processed by explicit transition functions implemented in Python.

## 2. Project scope and behavior

### Objective

- Analyze a string by length and distinct-symbol alphabet.
- Construct a DFA or NFA recognizing the singleton language containing the submitted string.
- Simulate the input and return acceptance, rejection, and a per-symbol computation history.
- Provide fixed DFA/NFA examples and a browser visualization of their transitions.

### Input and output

The request input is a string of at most 100 Python Unicode characters; the empty string is allowed. There is no fixed binary-only restriction: the generated machine alphabet consists of the distinct characters in the input. The examples have their own fixed alphabets.

For the exact-string generator, the model is built from the same string that is simulated. Consequently, that submitted string is accepted by construction. To demonstrate rejection with a different string, select a fixed example (for example, the simple DFA that accepts binary strings ending in `1`).

Successful API operations return JSON. Simulation responses include the analysis, automaton (states, alphabet, start and final states, transitions), transition table, acceptance fields, reason, active states, and computation path. The browser presents these values in a graph, table, status panel, and path list.

### Implemented examples

| Example ID | Implemented behavior |
|---|---|
| `simple-dfa` | DFA over `{0,1}` accepting strings whose last symbol is `1`. |
| `simple-nfa` | NFA example labelled “contains `ab`”; the current transition map branches from `q0` on `a`, enters final `q2` on `b` from `q1`, and loops in `q2`. It has no `q0` transition on `b`, so it does not recognize all strings containing `ab` (for example, `bab` is rejected). |
| `branching-nfa` | NFA with two paths after reading `a`; both lead to the final state on `b`, so `ab` is accepted. |

`exact` in the frontend selects the exact-string generation endpoint; it is not a separately stored machine.

## 3. Technologies, tools, and versions

| Technology/tool | Evidence and role | Version status |
|---|---|---|
| Python | Backend source and automata algorithms | Active virtual environment: **3.13.17**; existing README documents Python 3.10+. |
| FastAPI | HTTP API and static frontend hosting (`backend/main.py`) | Installed environment: **0.141.1**; requirements allow `>=0.115,<1.0`, so this is not a project pin. |
| Pydantic | `BaseModel` request payload schemas | Installed: **2.13.5**; transitive dependency through FastAPI, no separate requirement pin. |
| Uvicorn | ASGI server used to run the app | Installed: **0.53.0**; requirements allow `>=0.30,<1.0`. |
| Starlette | FastAPI's installed ASGI/web dependency | Installed: **1.6.0**; transitive dependency. |
| HTML | Page and controls in `frontend/index.html` | No library/framework used. |
| CSS | Layout, responsive styling and SVG state/edge styles in `frontend/css/style.css` | No library/framework used. |
| JavaScript | Fetch requests, DOM rendering, SVG generation and animation in `frontend/js/app.js` | Vanilla browser JavaScript; no frontend framework or package manifest. |
| SVG | Automaton nodes, transition arrows, labels and visual step highlighting | Inline SVG assembled by the frontend. |
| Pytest | Tests in `backend/tests/test_automata.py` | Installed: **8.4.2**; requirements allow `>=8.0,<9.0`. |
| Python standard library | `dataclasses`, `pathlib`, `typing` and built-in collections | No separately installed package versions. |

The observed environment is Windows with a project-local `.venv`, PowerShell run instructions, Visual Studio Code available as the editor, and Chrome displaying the app. The precise Windows build, VS Code version, and Chrome version were not recorded. `requirements.txt` uses compatible ranges rather than a lock file; installed versions above describe the inspected environment only.

## 4. Backend and API

`backend/main.py` creates a FastAPI application, declares Pydantic request models, maps route requests to analyzer/generator/model functions, converts invalid input into HTTP 400 responses, and mounts `frontend/` at `/`. Since the API and UI share an origin, the frontend uses ordinary same-origin `fetch` requests; no CORS setup is present.

| Method and route | Request | Purpose |
|---|---|---|
| `GET /api/health` | — | Returns `{"status":"ok"}`. |
| `GET /api/examples` | — | Lists the four frontend example choices. |
| `POST /api/analyze` | `{"input":"10101"}` | Returns input, length, sorted alphabet, and unique-symbol count. |
| `POST /api/generate/dfa` | `{"input":"10101"}` | Returns analysis, generated DFA, and transition table. |
| `POST /api/generate/nfa` | `{"input":"10101"}` | Returns analysis, generated NFA, and transition table. |
| `POST /api/simulate/dfa` | `{"input":"10101"}` | Generates and simulates the exact-string DFA. |
| `POST /api/simulate/nfa` | `{"input":"10101"}` | Generates and simulates the exact-string NFA. |
| `POST /api/example` | `{"example":"branching-nfa","input":"ab"}` | Simulates a named fixed example on the supplied input. |

Unknown generation kinds and example IDs are handled as HTTP 400. Payload validation is also provided by Pydantic; the source does not customize Pydantic's default validation status. The analyzer rejects inputs longer than 100 characters with a readable validation message.

## 5. Computational models and algorithms

### DFA

A deterministic finite automaton is a 5-tuple

\[
M_D=(Q,\Sigma,\delta,q_0,F),\quad \delta:Q\times\Sigma\to Q,
\]

where `Q` is a finite state set, `Σ` is the finite alphabet, `q0 ∈ Q` is the start state, and `F ⊆ Q` is the accepting-state set. For every state and alphabet symbol, exactly one next state is defined.

The exact-string DFA for `w = a₁…aₙ` has chain states `q0…qn`, with `q0` initial and `qn` final. Its alphabet is the sorted set of characters in `w`. For each `i < n`, the transition on `aᵢ₊₁` goes from `qi` to `qᵢ₊₁`; every other state/alphabet-symbol pair goes to `D`, which loops to itself. Thus its transition function is total over its alphabet. The empty-string DFA has `q0` as its final state and an empty alphabet; the generated state list also includes `D`.

Simulation begins at `q0`, follows the single mapped transition for each character, and accepts if the final state after all characters belongs to `F`. For an input character outside the automaton's alphabet (or a missing transition in a fixed example), the simulator returns a rejection with an invalid-symbol reason.

### NFA

A nondeterministic finite automaton is a 5-tuple

\[
M_N=(Q,\Sigma,\delta,q_0,F),\quad \delta:Q\times\Sigma\to 2^Q,
\]

with the same state, alphabet, initial-state, and final-state meanings. A transition can lead to zero, one, or multiple states. This implementation has **no epsilon transitions**. In the exact-string NFA, the generated transitions form only the chain `q0…qn`; no dead state is added.

Simulation starts with active set `{q0}`. For every symbol, it unions the target sets of all active states. A missing transition can therefore produce the empty active set. The NFA accepts after input ends exactly when at least one active state belongs to `F`.

### Complexity

For input length `n`, the DFA simulator performs one dictionary lookup and one history append per character: `O(n)` time and `O(n)` history space. NFA work is proportional to the input length plus the outgoing transitions examined from active states at each step; the recorded history also uses `O(n)` records. Exact-string construction creates `n+1` chain states and `O(n·|Σ|)` DFA transition records (including the dead state), versus `n` chain transitions for the NFA.

## 6. Frontend visualization and animation

The frontend presents input, machine type and demo selectors; input statistics; the machine diagram; playback controls; a computation path; a transition table; and short theory text. It requests a full simulation response, then renders the returned model and precomputed computation history. JavaScript does not decide acceptance independently.

SVG uses circles for states, double rings for accepting states, an incoming arrow for the start state, labelled directed edges for transitions, and a visible `D` dead state where applicable. The selected history record highlights active states and traversed edges. Controls support start, pause, next step, reset, and slow/normal/fast timing. Long diagrams use horizontal scrolling; CSS includes narrower-screen layout rules.

The exact-string and branching-NFA examples have explicit frontend positioning logic. Other machine states are placed in a horizontal row, with the dead state on a lower row. The diagram is an SVG view in the page rather than a server-generated image.

## 7. Source tree

| Path | Responsibility |
|---|---|
| `backend/main.py` | FastAPI app, request models, routes, error translation, static-file mount. |
| `backend/models/automaton.py` | Shared automaton data, serialization, transition-table construction. |
| `backend/models/dfa.py` | Deterministic transition lookup, simulation, result/history. |
| `backend/models/nfa.py` | Active-state set simulation and result/history. |
| `backend/services/analyzer.py` | String length and alphabet analysis; length validation. |
| `backend/services/generator.py` | Exact-string DFA/NFA constructors and fixed examples. |
| `backend/tests/test_automata.py` | Pytest tests for generated machines, examples, analysis, and length validation. |
| `frontend/index.html` | UI structure, controls, and page content. |
| `frontend/css/style.css` | Visual design, SVG styles, and responsive layout. |
| `frontend/js/app.js` | API requests, table/path/graph rendering, SVG and playback controls. |
| `requirements.txt` | Version ranges for FastAPI, Uvicorn, and Pytest. |
| `README.md` | Setup, run, feature, API, and project notes. |

No frontend package manager configuration, database, authentication subsystem, or external automata library is present in the tracked project files.

## 8. Tests and observed verification

`backend/tests/test_automata.py` contains parameterized acceptance and rejection checks for exact-string DFA construction, exact-string NFA checks, a branching-state check, a fixed NFA example check, alphabet analysis, and the 100-character validation. The exact test result from the final verification is recorded in the project handoff/final message; do not interpret the test suite as proof of untested browser or deployment behavior.

For a manually traceable example, the branching NFA on `ab` begins in `{q0}`. Reading `a` reaches `{q1,q2}`; reading `b` reaches `{q3}`; `q3` is final, so the expected result is acceptance. The model's transitions and final-state definition in `backend/services/generator.py` support this trace.

## 9. Limitations and future scope

- Exact-string generation builds a recognizer from the same input that it then simulates. It is not an arbitrary machine editor or arbitrary-language builder.
- The implemented NFA has no epsilon closure or epsilon transitions.
- Only DFA and NFA models are implemented; no PDA or Turing-machine behavior is present.
- Input length is capped at 100 for readability.
- The NFA transition-table display uses `—` for no target; no equivalence checking, minimization, or NFA-to-DFA conversion is implemented.
- The fixed NFA demo labelled “contains `ab`” lacks a transition from its initial state on `b`, so its implemented language is narrower than that label suggests (for example, `bab` is rejected). This documentation records the observed map; application behavior was left untouched.
- The frontend sends the whole string to the backend for each selected simulation; there is no persistence, database, or user account layer in the tracked implementation.
- Dependency ranges are not fully reproducible without a generated lock file.

## 10. Further project documents

- [Milestone 1 report](MILESTONE_1_REPORT.md) — concise evaluation-ready sections.
- [Project architecture](PROJECT_ARCHITECTURE.md) — component and workflow diagrams.
- [Team work distribution](TEAM_WORK_DISTRIBUTION.md) — proposed assignments, pending team confirmation.
- [README](README.md) — setup and quick project orientation.
