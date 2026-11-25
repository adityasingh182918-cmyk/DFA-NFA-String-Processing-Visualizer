from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from backend.services.analyzer import analyze_string
from backend.services.generator import generate_exact_string_dfa, generate_exact_string_nfa, example_automaton

app = FastAPI(title="DFA/NFA String Processing Visualizer")
ROOT = Path(__file__).resolve().parent.parent
class InputPayload(BaseModel): input: str = ""
class ExamplePayload(BaseModel): example: str; input: str = ""
def build(text, kind):
    try: analyze_string(text)
    except ValueError as exc: raise HTTPException(400, str(exc))
    return generate_exact_string_dfa(text) if kind == "dfa" else generate_exact_string_nfa(text)
@app.get("/api/health")
def health(): return {"status": "ok"}
@app.get("/api/examples")
def examples(): return [{"id":"exact","label":"Exact String DFA/NFA"},{"id":"simple-dfa","label":"Simple DFA (ends in 1)"},{"id":"simple-nfa","label":"Simple NFA (contains ab)"},{"id":"branching-nfa","label":"Branching NFA (ab)"}]
@app.post("/api/analyze")
def analyze(payload: InputPayload):
    try: return analyze_string(payload.input)
    except ValueError as exc: raise HTTPException(400, str(exc))
@app.post("/api/generate/{kind}")
def generate(kind: str, payload: InputPayload):
    if kind not in {"dfa", "nfa"}: raise HTTPException(400, "kind must be dfa or nfa")
    automaton = build(payload.input, kind); return {"analysis": analyze_string(payload.input), "automaton": automaton.to_dict(), "table": automaton.transition_table()}
@app.post("/api/simulate/{kind}")
def simulate(kind: str, payload: InputPayload):
    if kind not in {"dfa", "nfa"}: raise HTTPException(400, "kind must be dfa or nfa")
    automaton = build(payload.input, kind); return {"analysis": analyze_string(payload.input), "automaton": automaton.to_dict(), "table": automaton.transition_table(), **automaton.simulate(payload.input)}
@app.post("/api/example")
def load_example(payload: ExamplePayload):
    try: automaton = example_automaton(payload.example)
    except ValueError as exc: raise HTTPException(400, str(exc))
    return {"analysis": analyze_string(payload.input), "automaton": automaton.to_dict(), "table": automaton.transition_table(), **automaton.simulate(payload.input)}
app.mount("/", StaticFiles(directory=ROOT / "frontend", html=True), name="frontend")
