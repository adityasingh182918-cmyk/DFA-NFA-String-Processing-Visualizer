from .automaton import Automaton

class DFA(Automaton):
    def __init__(self, *, transitions_map, **kwargs):
        super().__init__(**kwargs); self.transitions_map = transitions_map
    def targets(self, state, symbol): return self.transitions_map.get((state, symbol), "D")
    def simulate(self, text):
        """Follow exactly one transition for each symbol."""
        current = self.start_state
        history = [{"step": 0, "read": None, "from": None, "to": current, "active_states": [current], "remaining": text}]
        for number, symbol in enumerate(text, 1):
            target = self.transitions_map.get((current, symbol))
            if target is None: return self._result(history, current, False, f"Invalid input symbol: {symbol!r}.")
            history.append({"step": number, "read": symbol, "from": current, "to": target, "active_states": [target], "remaining": text[number:]})
            current = target
        accepted = current in self.final_states
        return self._result(history, current, accepted, f"{current} is {'an' if accepted else 'not an'} accepting state.")
    def _result(self, history, state, accepted, reason):
        return {"result": "accepted" if accepted else "rejected", "accepted": accepted, "final_state": state, "active_states": [state], "reason": reason, "computation_path": history}
