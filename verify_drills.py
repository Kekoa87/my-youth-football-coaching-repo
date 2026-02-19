import asyncio
from playwright.async_api import async_playwright
import os

async def capture_screenshots():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Ensure verification directory exists
        os.makedirs('/home/jules/verification', exist_ok=True)

        # Start local server
        process = await asyncio.create_subprocess_shell(
            "python3 -m http.server 8000 --directory website",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        await asyncio.sleep(2)  # Wait for server to start

        try:
            # Desktop view
            await page.set_viewport_size({"width": 1280, "height": 800})
            await page.goto("http://localhost:8000/pages/drills/offense/qbDrills.html")
            await page.screenshot(path="/home/jules/verification/qb_drills_desktop.png", full_page=True)

            # Mobile view
            await page.set_viewport_size({"width": 375, "height": 667})
            await page.screenshot(path="/home/jules/verification/qb_drills_mobile.png", full_page=True)

            # Filtered view (Footwork)
            await page.set_viewport_size({"width": 1280, "height": 800})
            await page.click("button.filter-btn:has-text('Footwork')")
            await asyncio.sleep(0.5) # Wait for fade effect
            await page.screenshot(path="/home/jules/verification/qb_drills_filtered_footwork.png", full_page=True)

        finally:
            process.terminate()
            await process.wait()
            await browser.close()

if __name__ == "__main__":
    asyncio.run(capture_screenshots())
