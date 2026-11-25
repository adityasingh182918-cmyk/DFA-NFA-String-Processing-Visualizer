from dataclasses import dataclass, field
from typing import List, Set

@dataclass(frozen=True)
class State:
    name: str

@dataclass(frozen=True)
class Transition:
    source: str
    symbol: str
    target: str

@dataclass
class Automaton:
    """Formal model M = (Q, Sigma, delta, q0, F)."""
    states: List[str]
    alphabet: List[str]
    start_state: str
    final_states: Set[str]
    transitions: List[Transition] = field(default_factory=list)
    name: str = "Automaton"
    def to_dict(self):
        return {"name": self.name, "states": self.states, "alphabet": self.alphabet, "start_state": self.start_state, "final_states": sorted(self.final_states), "transitions": [t.__dict__ for t in self.transitions]}
    def transition_table(self):
        table = []
        for state in self.states:
            row = {"state": state, "start": state == self.start_state, "final": state in self.final_states}
            for symbol in self.alphabet: row[symbol] = self.targets(state, symbol)
            table.append(row)
        return table
    def targets(self, state, symbol): raise NotImplementedError
