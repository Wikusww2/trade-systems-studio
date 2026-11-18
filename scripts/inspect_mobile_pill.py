import asyncio

from playwright.async_api import async_playwright


async def inspect():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Test on mobile 390x844
        page = await browser.new_page(viewport={"width": 390, "height": 844})
        await page.goto("https://sssammyboyyy.github.io/trade-systems-studio/", wait_until="networkidle")
        await page.locator("#workbench-viewport").scroll_into_view_if_needed()
        await page.wait_for_timeout(1000)
        
        await page.screenshot(path="docs/screenshots/mobile_pill_debug.png")
        print("Captured docs/screenshots/mobile_pill_debug.png")
        
        pill = page.locator("nav[aria-label='Document and Report View Switcher']")
        box = await pill.bounding_box()
        print("Pill bounding box:", box)
        
        # Check what elements are positioned at or over the right side of the pill
        if box:
            right_x = box["x"] + box["width"] - 20
            center_y = box["y"] + box["height"] / 2
            element_at_point = await page.evaluate(f"""() => {{
                const el = document.elementFromPoint({right_x}, {center_y});
                return el ? {{
                    tag: el.tagName,
                    id: el.id,
                    className: el.className,
                    text: el.textContent ? el.textContent.substring(0, 50) : ""
                }} : null;
            }}""")
            print("Element at right of pill:", element_at_point)
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(inspect())
