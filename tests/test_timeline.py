import pytest
from app.agents.timeline import (
    parse_year,
    format_date_display,
    sort_chronologically,
    parse_date_span,
    detect_date_conflicts
)

def test_parse_year_bce():
    assert parse_year("2500 BCE") == -2500
    assert parse_year("1900 BC") == -1900
    assert parse_year("c. 3300 b.c.e.") == -3300
    assert parse_year("-1900") == -1900
    assert parse_year(-1900) == -1900

def test_parse_date_span_range():
    span = parse_date_span("c. 1900-1300 BCE")
    assert span.is_range is True
    assert span.is_circa is True
    assert span.year_start == -1900
    assert span.year_end == -1300
    assert span.era == "BCE"

def test_parse_date_span_mixed_era():
    span = parse_date_span("27 BCE - 14 CE")
    assert span.is_range is True
    assert span.year_start == -27
    assert span.year_end == 14
    assert span.era == "mixed"

def test_parse_century():
    assert parse_year("3rd century BCE") == -250
    assert parse_year("1st century CE") == 50

def test_parse_year_ce():
    assert parse_year("1947") == 1947
    assert parse_year("44 BCE") == -44
    assert parse_year("476 CE") == 476
    assert parse_year("AD 1066") == 1066

def test_parse_invalid_or_none():
    assert parse_year(None) is None
    assert parse_year("") is None
    assert parse_year("Unknown date era") is None

def test_format_date_display():
    assert format_date_display(-2500) == "2500 BCE"
    assert format_date_display(1947) == "1947"
    assert format_date_display(None) == "n.d."
    assert format_date_display(-2500, "circa 2500 BCE") == "circa 2500 BCE"

def test_sort_chronologically():
    claims = [
        {"claim": "Event C", "year": 1947},
        {"claim": "Event A", "year": -2500},
        {"claim": "Event D", "year": None},
        {"claim": "Event B", "year": -1900},
    ]
    sorted_claims = sort_chronologically(claims)
    assert [c["claim"] for c in sorted_claims] == ["Event A", "Event B", "Event C", "Event D"]

def test_detect_date_conflicts():
    claims = [
        {"id": "C1", "claim": "Mohenjo-daro abandoned in 1900 BCE", "year": -1900, "entities": ["Mohenjo-daro"]},
        {"id": "C2", "claim": "Mohenjo-daro destroyed in 1500 BCE", "year": -1500, "entities": ["Mohenjo-daro"]},
    ]
    conflicts = detect_date_conflicts(claims, tolerance_years=150)
    assert len(conflicts) == 1
    assert conflicts[0]["delta"] == 400
    assert "Mohenjo-daro" in conflicts[0]["shared_entities"]
