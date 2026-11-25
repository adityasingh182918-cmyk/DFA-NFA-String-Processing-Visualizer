from backend.models import DFA, NFA, Transition

def generate_exact_string_dfa(text: str) -> DFA:
    """This isolated construction can be swapped for another language rule later."""
    alphabet, states, dead = sorted(set(text)), [f"q{i}" for i in range(len(text) + 1)], "D"
    all_states, mapping, transitions = states + [dead], {}, []
    for index, symbol in enumerate(text): mapping[(f"q{index}", symbol)] = f"q{index + 1}"
    # Dead state makes the transition function total for every state-symbol pair.
    for state in all_states:
        for symbol in alphabet:
            target = mapping.get((state, symbol), dead); mapping[(state, symbol)] = target
            transitions.append(Transition(state, symbol, target))
    return DFA(name="Exact String DFA", states=all_states, alphabet=alphabet, start_state="q0", final_states={f"q{len(text)}"}, transitions=transitions, transitions_map=mapping)

def generate_exact_string_nfa(text: str) -> NFA:
    alphabet, states, mapping, transitions = sorted(set(text)), [f"q{i}" for i in range(len(text) + 1)], {}, []
    for index, symbol in enumerate(text):
        source, target = f"q{index}", f"q{index + 1}"; mapping.setdefault((source, symbol), set()).add(target); transitions.append(Transition(source, symbol, target))
    return NFA(name="Exact String NFA", states=states, alphabet=alphabet, start_state="q0", final_states={f"q{len(text)}"}, transitions=transitions, transitions_map=mapping)

def example_automaton(key: str):
    if key == "simple-dfa":
        mapping = {("q0", "0"): "q0", ("q0", "1"): "q1", ("q1", "0"): "q0", ("q1", "1"): "q1"}
        return DFA(name="Simple DFA (ends in 1)", states=["q0", "q1"], alphabet=["0", "1"], start_state="q0", final_states={"q1"}, transitions=[Transition(a,b,c) for (a,b),c in mapping.items()], transitions_map=mapping)
    if key == "simple-nfa":
        mapping = {("q0", "a"): {"q0", "q1"}, ("q1", "b"): {"q2"}, ("q2", "a"): {"q2"}, ("q2", "b"): {"q2"}}
        return NFA(name="Simple NFA (contains ab)", states=["q0", "q1", "q2"], alphabet=["a", "b"], start_state="q0", final_states={"q2"}, transitions=[Transition(a,b,c) for (a,b),cs in mapping.items() for c in cs], transitions_map=mapping)
    if key == "branching-nfa":
        mapping = {("q0", "a"): {"q1", "q2"}, ("q1", "b"): {"q3"}, ("q2", "b"): {"q3"}}
        return NFA(name="Branching NFA (ab)", states=["q0", "q1", "q2", "q3"], alphabet=["a", "b"], start_state="q0", final_states={"q3"}, transitions=[Transition(a,b,c) for (a,b),cs in mapping.items() for c in cs], transitions_map=mapping)
    raise ValueError("Unknown example.")
