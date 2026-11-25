def analyze_string(text: str) -> dict:
    if text is None:
        raise ValueError("Input is required.")
    if len(text) > 100:
        raise ValueError("Please use at most 100 characters for a readable diagram.")
    return {"input": text, "length": len(text), "alphabet": sorted(set(text)), "unique_symbols": len(set(text)), "symbols": sorted(set(text))}
