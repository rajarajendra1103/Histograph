import pytest
from app.config import detect_provider, PROVIDERS
from app.llm.nvidia import is_chat_model, parse_error_response
from app.agents.extractor import budget_source_texts

def test_detect_provider():
    assert detect_provider("AIzaSyAbc123_xyz") == "gemini"
    assert detect_provider("aizasy_test_key") == "gemini"
    assert detect_provider("gsk_1234567890abcdef") == "groq"
    assert detect_provider("sk-or-v1-abcdef123456") == "openrouter"
    assert detect_provider("nvapi-test1234") == "nvidia"
    assert detect_provider("ollama-local") == "ollama"
    # Explicit provider override takes precedence
    assert detect_provider("gsk_123", specified="gemini") == "gemini"
    assert detect_provider("nvapi-123", specified="groq") == "groq"

def test_chat_model_filtering():
    # Chat & reasoning models should be accepted
    assert is_chat_model("gemini-2.0-flash") is True
    assert is_chat_model("gemini-1.5-pro") is True
    assert is_chat_model("llama-3.3-70b-versatile") is True
    assert is_chat_model("llama-3.1-8b-instant") is True
    assert is_chat_model("nvidia/llama-3.1-nemotron-70b-instruct") is True
    assert is_chat_model("mistralai/mistral-large-2-instruct") is True
    assert is_chat_model("deepseek/deepseek-r1:free") is True

    # Safeguard, moderation, audio, embedding, and non-chat models MUST be rejected
    assert is_chat_model("openai/gpt-oss-safeguard-20b") is False
    assert is_chat_model("meta/llama-guard-3-8b") is False
    assert is_chat_model("whisper-large-v3") is False
    assert is_chat_model("whisper-large-v3-turbo") is False
    assert is_chat_model("text-embedding-004") is False
    assert is_chat_model("bge-base-en-v1.5") is False
    assert is_chat_model("tts-1") is False

def test_budget_source_texts():
    # Simulate 20 heavy sources totaling 100,000 characters
    mock_sources = {}
    for i in range(1, 21):
        mock_sources[f"S{i}"] = {
            "title": f"Historical Source {i}",
            "kind": "academic",
            "text": f"Detailed evidence text for source {i}. " * 300  # ~10,000 chars each
        }

    budgeted = budget_source_texts(mock_sources, max_total_chars=12000)
    assert len(budgeted) <= 13500
    assert "[S1]" in budgeted
    assert "[S2]" in budgeted
    assert "excerpt" in budgeted

def test_token_tracker():
    from app.llm.tracker import TokenTracker
    tt = TokenTracker(total_credits=1000.0, tokens_per_credit=1000)
    assert tt.total_tokens == 0
    assert tt.total_credits == 1000.0

    tt.record_usage(prompt=400, completion=150, model="nvidia/llama-3.1-nemotron-70b-instruct")
    assert tt.prompt_tokens == 400
    assert tt.completion_tokens == 150
    assert tt.total_tokens == 550
    assert tt.total_requests == 1

    stats = tt.get_stats()
    assert stats["credits_used"] == 0.55
    assert stats["credits_remaining"] == 999.45
    assert stats["total_tokens_used"] == 550
    assert "nvapi-" in stats["key_preview"]

    tt.reset()
    assert tt.total_tokens == 0
    assert tt.get_stats()["credits_used"] == 0.0

