# DFA/NFA String Processing Visualizer

A local Automata Theory learning application. Enter a string, construct a DFA or NFA for its exact-string language, and step through the computation in an SVG diagram.

## Problem statement and objective

The application demonstrates how a finite automaton processes symbols and decides whether an input belongs to a language. It analyzes a supplied string, generates an automaton from a documented construction rule, simulates the input in Python, and presents the returned model and computation history in the browser.

## Mathematical construction

For a string `w = a₁a₂...aₙ`, the generated automaton recognizes the singleton language `{w}`. Its states are `q0` through `qn`; `q0` is the start state, `qn` is the only accepting state, and each `qi` has a transition on `aᵢ₊₁` to `qᵢ₊₁`. Any other DFA transition goes to dead state `D`, whose transitions loop to itself. Thus the DFA transition function is total over the string's alphabet. The NFA uses the same chain without a dead state.

The exact-string generator is isolated in `backend/services/generator.py`. This makes it possible to replace the language construction without changing the frontend. The active input is also the string used to generate the automaton, so that generated machine accepts it by construction. Use a built-in example to try other strings and observe rejection (for example, the simple DFA accepts binary strings ending in `1`).

The formal machine is `M = (Q, Σ, δ, q0, F)`: states, alphabet, transition function, start state, and accepting states. The exact-string NFA has no epsilon transitions.

## Features

- Input analysis: length, sorted alphabet, and number of distinct symbols.
- Generated exact-string DFA and NFA, including a total DFA with a dead state.
- Built-in DFA, NFA, and branching-NFA demonstrations.
- Python computation histories, transition tables, and acceptance results.
- SVG states, directed transitions, start marker, double-circle final states, and active-state/edge highlighting.
- Start, pause, next-step, reset, and slow/normal/fast playback controls.
- Input validation (maximum 100 Unicode characters) and API error messages.
- Responsive cards and a horizontally scrollable diagram for long inputs.

## Technologies and architecture

- **Backend/model:** Python 3.10+, FastAPI, Pydantic. Automata algorithms are implemented in this project; no automata library is used.
- **Frontend:** HTML, CSS, vanilla JavaScript, and SVG.
- **Transport:** JSON over HTTP. FastAPI serves both the API and static frontend at the same origin, so CORS configuration is unnecessary.

`backend/models/` contains the formal model classes. `backend/services/analyzer.py` analyzes input, while `backend/services/generator.py` owns automaton construction and examples. `backend/main.py` exposes the API. The browser requests the model and actual Python simulation history, then renders and animates those returned steps; it does not calculate acceptance itself.

## Algorithms

### DFA

Start at `q0`. For each input symbol, look up the unique transition, move to its target, and append a history record. When input ends, accept exactly when the current state is in `F`. The generated DFA's missing transitions lead to `D`; an input symbol outside the automaton alphabet is rejected with a useful reason.

### NFA

Start with the set `{q0}`. For each symbol, compute the union of all targets reachable from every active state on that symbol. Record the resulting active set and traversed edges. At the end, accept if the active set intersects `F`. This is genuine set-based nondeterministic simulation and supports multiple active states.

### Visualization and animation

The backend returns states, transitions, alphabet, transition table, and a path whose first record is step 0. JavaScript draws that returned graph as SVG and highlights the active states and traversed edges for the selected history record. The animation controls only move through this precomputed, actual simulation history; they do not skip or invent transitions. State spacing remains readable, with horizontal scrolling for larger diagrams.

## API

All request and response bodies use JSON. Input strings are limited to 100 characters.

| Method | Route | Request | Purpose |
|---|---|---|---|
| `GET` | `/api/health` | — | Health status |
| `GET` | `/api/examples` | — | Available example IDs and labels |
| `POST` | `/api/analyze` | `{"input":"10101"}` | Input, length, alphabet, unique-symbol count |
| `POST` | `/api/generate/dfa` | `{"input":"10101"}` | Analysis, generated model, transition table |
| `POST` | `/api/generate/nfa` | `{"input":"10101"}` | Analysis, generated model, transition table |
| `POST` | `/api/simulate/dfa` | `{"input":"10101"}` | Model/table plus DFA history and result |
| `POST` | `/api/simulate/nfa` | `{"input":"10101"}` | Model/table plus NFA history and result |
| `POST` | `/api/example` | `{"example":"branching-nfa","input":"ab"}` | Simulate a built-in machine on the supplied input |

Simulation responses include `result` (`accepted` or `rejected`), `accepted`, `reason`, `active_states`, and `computation_path`. Each history item records its step, symbol, transition(s), active states, and remaining input. Invalid request data returns an HTTP 400 JSON detail.

## Installation and run (Windows PowerShell)

From the project directory:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn backend.main:app --reload
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000). The interactive API documentation is at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs). To run the app without activating the virtual environment, use `\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload`.

## Example

For input `10101`, the DFA chain is `q0 --1--> q1 --0--> q2 --1--> q3 --0--> q4 --1--> q5`. `q0` is initial and `q5` is final. The generated exact-string DFA accepts `10101`; a shorter, longer, or different string does not reach `q5` after consuming all input. The NFA simulation reaches `{q5}` on the same input and accepts because that set contains a final state.

Choose **Simple DFA — ends in 1** to simulate a separate machine (for instance, `10101` accepts and `10100` rejects). Choose **Branching NFA — ab** and input `ab` to see both `q1` and `q2` active after the first symbol.

## Testing

The automated suite covers empty, single-symbol, repeated-symbol, and binary strings; exact-string DFA/NFA acceptance and rejection; alphabet analysis; length validation; example machines; and a branching NFA with multiple active states.

```powershell
python -m pytest backend/tests -q
```

## Limitations and future enhancements

- The exact-string rule constructs a machine from the same string it processes; a separate machine-definition input would be useful for arbitrary trial strings.
- The NFA example supports symbol transitions but not epsilon transitions.
- The 100-character limit favors legible classroom diagrams over very large machines.
- Possible extensions include user-selectable language rules, epsilon closure, exportable diagrams, and a separate target-string field.
