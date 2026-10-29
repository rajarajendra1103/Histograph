from typing import Optional
import httpx
from app.sources.web_extract import extract_web_article

async def render_web_page(client: httpx.AsyncClient, url: str) -> Optional[str]:
    """
    Extract web page text with Playwright dynamic rendering ONLY when
    standard Trafilatura extraction returns less than 500 characters.
    """
    # 1. Try standard lightweight extraction first
    standard_text = await extract_web_article(client, url)
    if standard_text and len(standard_text) >= 500:
        return standard_text

    # 2. If < 500 chars, attempt Playwright rendering if installed
    try:
        from playwright.async_api import async_playwright
        import trafilatura
        from app.sources.base import clean_text

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(url, wait_until="domcontentloaded", timeout=15000)
            content = await page.content()
            await browser.close()
            extracted = trafilatura.extract(content, include_comments=False)
            rendered = clean_text(extracted or "")
            if rendered and len(rendered) > len(standard_text or ""):
                return rendered
    except Exception:
        pass

    return standard_text
