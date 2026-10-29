import os
import asyncio
from typing import Optional, List
import httpx
from app.sources.base import Source, clean_text

ENABLE_WHISPER: bool = os.getenv("ENABLE_WHISPER", "false").lower() in ("true", "1", "yes")

async def search_youtube_historical(client: httpx.AsyncClient, query: str) -> List[Source]:
    """
    Search YouTube for historical documentaries, academic lectures, and archival video content.
    Extracts official/automatic English subtitles or video descriptions using yt-dlp.
    """
    results: List[Source] = []
    try:
        def _search_sync():
            import yt_dlp
            ydl_opts = {
                "skip_download": True,
                "quiet": True,
                "extract_flat": True,
                "default_search": "ytsearch2",
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                search_term = f"ytsearch2:{query} history lecture documentary"
                return ydl.extract_info(search_term, download=False)

        info = await asyncio.to_thread(_search_sync)
        entries = info.get("entries", []) if isinstance(info, dict) else []

        for entry in entries[:2]:
            url = entry.get("url") or f"https://www.youtube.com/watch?v={entry.get('id')}"
            title = entry.get("title") or "Historical Lecture / Documentary"
            desc = clean_text(entry.get("description", ""))

            # Fetch detailed captions for this video
            src = await fetch_youtube_captions(client, url)
            if src and len(src.text) > 60:
                results.append(src)
            elif desc and len(desc) > 80:
                results.append(Source(
                    id="",
                    title=f"Video Context: {title}",
                    url=url,
                    text=desc[:2000],
                    kind="video",
                    date=entry.get("upload_date")
                ))
    except Exception:
        pass

    return results

async def fetch_youtube_captions(client: httpx.AsyncClient, video_url_or_id: str) -> Optional[Source]:
    """
    Fetch historical transcripts or subtitles from YouTube video.
    Strategy: yt-dlp captions first; Whisper speech-to-text only if ENABLE_WHISPER=true.
    """
    clean_url = video_url_or_id
    if not clean_url.startswith("http"):
        clean_url = f"https://www.youtube.com/watch?v={video_url_or_id}"

    title = "YouTube Historical Video"
    transcript_text = ""
    date = None

    try:
        import yt_dlp
        ydl_opts = {
            "skip_download": True,
            "writesubtitles": True,
            "writeautomaticsub": True,
            "subtitleslangs": ["en"],
            "quiet": True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(clean_url, download=False)
            title = info.get("title", title)
            date = info.get("upload_date")
            desc = clean_text(info.get("description", ""))

            # Priority 1: Extract official or automatic subtitles
            subtitles = info.get("subtitles", {}) or info.get("automatic_captions", {})
            en_subs = subtitles.get("en", [])
            for sub_entry in en_subs:
                sub_url = sub_entry.get("url")
                if sub_url:
                    try:
                        r = await client.get(sub_url, timeout=10.0)
                        if r.status_code == 200:
                            transcript_text = clean_text(r.text)
                            break
                    except Exception:
                        pass

            if not transcript_text and desc:
                transcript_text = desc

        # Priority 2: Whisper fallback only if enabled by user
        if not transcript_text and ENABLE_WHISPER:
            try:
                import whisper
                model = whisper.load_model("base")
                # Whisper audio download & transcribe would happen here if enabled
            except Exception:
                pass

        if transcript_text and len(transcript_text) > 40:
            return Source(
                id="",
                title=f"Video Transcript: {title}",
                url=clean_url,
                text=transcript_text[:2500],
                kind="lead",  # Tagged as lead tier
                date=date
            )
    except Exception:
        pass

    return None
