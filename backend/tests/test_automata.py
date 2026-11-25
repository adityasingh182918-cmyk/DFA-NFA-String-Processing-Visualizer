import pytest
from backend.services.analyzer import analyze_string
from backend.services.generator import generate_exact_string_dfa, generate_exact_string_nfa, example_automaton

@pytest.mark.parametrize("text", ["", "0", "10101", "aaaa", "010101"])
def test_generated_dfa_accepts_its_string(text): assert generate_exact_string_dfa(text).simulate(text)["accepted"]
@pytest.mark.parametrize("source,trial", [("101","10"),("101","1011"),("101","001"),("aa","a")])
def test_generated_dfa_rejects_different_string(source, trial): assert not generate_exact_string_dfa(source).simulate(trial)["accepted"]
def test_nfa_acceptance(): assert generate_exact_string_nfa("abab").simulate("abab")["accepted"]
def test_nfa_rejection(): assert not generate_exact_string_nfa("abab").simulate("aba")["accepted"]
def test_branching_has_two_active_states(): assert example_automaton("branching-nfa").simulate("ab")["computation_path"][1]["active_states"] == ["q1", "q2"]
def test_simple_nfa_accepts(): assert example_automaton("simple-nfa").simulate("aab")["accepted"]
def test_analyzer_alphabet(): assert analyze_string("10101")["alphabet"] == ["0", "1"]
def test_long_input_is_rejected():
    with pytest.raises(ValueError): analyze_string("x" * 101)
