import pytest
from app.laya.checks import quote_match, normalize_text

SAMPLE_SOURCE = (
    "The Indus Valley Civilisation was a Bronze Age civilisation in the northwestern regions of South Asia, "
    "lasting from 3300 BCE to 1300 BCE, and in its mature form from 2600 BCE to 1900 BCE. "
    "By 1900 BCE, signs of a gradual decline began to emerge. "
    "Many scholars argue that aridification, shifting monsoon patterns, and drying of the Ghaggar-Hakra river system "
    "led to urban abandonment."
)

def test_exact_quote_match():
    quote = "lasting from 3300 BCE to 1300 BCE, and in its mature form from 2600 BCE to 1900 BCE"
    assert quote_match(quote, SAMPLE_SOURCE) is True

def test_normalized_punctuation_and_case():
    quote = "lasting from 3300 bce to 1300 bce and in its mature form from 2600 bce to 1900 bce"
    assert quote_match(quote, SAMPLE_SOURCE) is True

def test_fuzzy_match_within_threshold():
    # Slightly altered word order or minor transcription variance
    quote = "Many scholars argue that aridification, shifting monsoon patterns and drying of Ghaggar-Hakra system"
    assert quote_match(quote, SAMPLE_SOURCE, threshold=0.85) is True

def test_rejection_of_short_quote():
    short_quote = "Bronze Age"  # < 20 chars
    assert quote_match(short_quote, SAMPLE_SOURCE) is False

def test_rejection_of_fabricated_quote():
    hallucinated = "The entire civilization was abruptly annihilated by extraterrestrial cosmic ray storms"
    assert quote_match(hallucinated, SAMPLE_SOURCE) is False

def test_empty_or_none_inputs():
    assert quote_match("", SAMPLE_SOURCE) is False
    assert quote_match(None, SAMPLE_SOURCE) is False
    assert quote_match("valid quote length test string here", None) is False
    assert quote_match(None, None) is False

def test_normalize_text():
    raw = "  Hello,   World!  123---BCE.  "
    assert normalize_text(raw) == "hello world 123 bce"
