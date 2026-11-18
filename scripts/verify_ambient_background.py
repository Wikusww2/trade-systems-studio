import os
import time

from playwright.sync_api import sync_playwright

artifact_dir = os.environ.get(
    "ARTIFACT_DIR",
    os.path.join(os.path.dirname(__file__), "..", "docs", "screenshots"),
)

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("Navigating to http://localhost:53828/ ...")
        page.goto("http://localhost:53828/", wait_until="networkidle")
        time.sleep(1.5)

        # Check that canvas exists
        canvas = page.query_selector("canvas")
        assert canvas is not None, "Canvas element not found in DOM!"
        print("Canvas element found successfully.")

        # Capture initial ambient glow state
        screenshot_path_1 = f"{artifact_dir}/antigravity_background_initial.png"
        page.screenshot(path=screenshot_path_1)
        print(f"Captured initial screenshot: {screenshot_path_1}")

        # Simulate pointer movement to excite the electric mint & sapphire spotlight
        print("Moving pointer to trigger interactive spotlight & particle repulsion...")
        for y in range(200, 600, 40):
            page.mouse.move(500, y)
            time.sleep(0.04)
        for x in range(500, 900, 50):
            page.mouse.move(x, 450)
            time.sleep(0.04)

        time.sleep(0.5)

        # Capture interactive hover screenshot
        screenshot_path_2 = f"{artifact_dir}/antigravity_background_hover.png"
        page.screenshot(path=screenshot_path_2)
        print(f"Captured hover screenshot: {screenshot_path_2}")

        # Check whitepaper route
        print("Navigating to whitepaper route...")
        page.goto("http://localhost:53828/whitepaper/", wait_until="networkidle")
        time.sleep(1.0)
        page.mouse.move(700, 350)
        time.sleep(0.4)

        screenshot_path_3 = f"{artifact_dir}/antigravity_whitepaper_ambient.png"
        page.screenshot(path=screenshot_path_3)
        print(f"Captured whitepaper screenshot: {screenshot_path_3}")

        browser.close()
        print("All visual verification checks passed!")

if __name__ == "__main__":
    run()
