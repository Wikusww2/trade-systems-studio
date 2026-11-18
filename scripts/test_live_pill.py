import asyncio

from playwright.async_api import async_playwright


async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 390, "height": 844})
        await page.goto("https://sssammyboyyy.github.io/trade-systems-studio/", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        
        initial = await page.query_selector("nav[aria-label='Document and Report View Switcher']")
        print("Live Production Mobile Pill at scrollY:0 exists?", initial is not None)
        
        await page.locator("#workbench-viewport").scroll_into_view_if_needed()
        await page.wait_for_timeout(1000)
        scrolled = await page.query_selector("nav[aria-label='Document and Report View Switcher']")
        print("Live Production Mobile Pill when scrolled to workbench exists?", scrolled is not None)
        if scrolled:
            box = await scrolled.bounding_box()
            print("Live Pill bounding box:", box)
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
