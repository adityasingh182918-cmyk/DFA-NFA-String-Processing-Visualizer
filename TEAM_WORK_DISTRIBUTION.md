# Team Work Distribution

**Status: proposed allocation — confirm with all five members before submission.**

## Evidence and attribution

The available Git history contains one commit, `591e0c3` (“Initial upload of DFA NFA Visualizer”), authored by `adityasingh182918-cmyk`. It does not contain task-level commits or evidence attributing the implemented modules to individual members. A single upload author is not sufficient evidence to assign the work to that person, nor to divide historical contributions among the team. The responsibilities below are a forward-looking/proposed allocation for team confirmation, not claims about verified completed work.

## Proposed responsibility table

| Name | Enrollment number | Responsibilities | Technical contribution (proposed) | Related project modules/files |
|---|---|---|---|---|
| Aditya Singh | S24CSEU2200 | Project architecture and integration | Coordinate interface contracts, route/model integration, and end-to-end assembly. Confirm the final project scope and compatibility of frontend and backend. | `backend/main.py`, `backend/models/automaton.py`, `README.md`, `PROJECT_ARCHITECTURE.md` |
| Yuvraj Singh | S24CSEU2182 | DFA algorithm and processing | Review deterministic transition semantics, exact-string DFA construction, dead-state behavior, and expected/actual traces. | `backend/models/dfa.py`, `backend/services/generator.py` (DFA portion) |
| Pratham Garg | S24CSEU2207 | NFA algorithm and processing | Review active-state-set transitions, acceptance condition, branching example, and no-epsilon scope. | `backend/models/nfa.py`, `backend/services/generator.py` (NFA portion) |
| Ronit Jaiswal | S24CSEU2198 | Frontend and SVG visualization | Review input controls, API consumption, SVG layout/state highlighting, playback controls, table and responsive display. | `frontend/index.html`, `frontend/js/app.js`, `frontend/css/style.css` |
| Harsh Singh Chauhan | S24CSEU2218 | Testing, validation and documentation | Review test coverage and input validation; check report claims, API docs, demo results, and source-to-document consistency. | `backend/tests/test_automata.py`, `backend/services/analyzer.py`, `PROJECT_DOCUMENTATION.md`, `MILESTONE_1_REPORT.md` |

## Team confirmation checklist

- Confirm or revise each proposed responsibility with the member concerned.
- Replace proposed technical contributions with actual, agreed work completed by each member.
- If individual historical attribution is needed, add verified evidence such as reviewed PRs, dated work logs, or member-approved statements; do not infer it from the initial upload commit.
