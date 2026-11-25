from .automaton import Automaton

class NFA(Automaton):
    def __init__(self, *, transitions_map, **kwargs):
        super().__init__(**kwargs); self.transitions_map = transitions_map
    def targets(self, state, symbol): return sorted(self.transitions_map.get((state, symbol), set()))
    def simulate(self, text):
        """Union all possible target states on each input character."""
        current = {self.start_state}
        history = [{"step": 0, "read": None, "from": None, "to": None, "active_states": sorted(current), "remaining": text}]
        for number, symbol in enumerate(text, 1):
            if symbol not in self.alphabet: return self._result(history, current, False, f"Invalid input symbol: {symbol!r}.")
            next_states, edges = set(), []
            for state in current:
                for target in self.transitions_map.get((state, symbol), set()):
                    next_states.add(target); edges.append({"from": state, "to": target})
            history.append({"step": number, "read": symbol, "from": None, "to": None, "active_states": sorted(next_states), "edges": edges, "remaining": text[number:]})
            current = next_states
        accepted = bool(current & self.final_states)
        return self._result(history, current, accepted, "At least one active state is accepting." if accepted else "No accepting state was reached.")
    def _result(self, history, states, accepted, reason):
        return {"result": "accepted" if accepted else "rejected", "accepted": accepted, "final_state": None, "active_states": sorted(states), "reason": reason, "computation_path": history}
