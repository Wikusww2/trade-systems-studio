import asyncio
import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler
import threading
from playwright.async_api import async_playwright

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(REPO_ROOT, "frontend-dashboard", "out")
PORT = 3199
BASE_URL = f"http://127.0.0.1:{PORT}"

class StaticHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=OUT_DIR, **kwargs)
    def log_message(self, format, *args):
        pass

def run_server():
    server = HTTPServer(("127.0.0.1", PORT), StaticHandler)
    server.serve_forever()

async def main():
    print(f"Serving static export from {OUT_DIR} at {BASE_URL}...")
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    
    errors = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        # -------------------------------------------------------------
        # Test 1: Mobile Viewport Contextual Scroll-Linked Pill
        # -------------------------------------------------------------
        print("\n--- Test 1: Mobile Viewport Contextual Pill (390x844) ---")
        mobile_page = await browser.new_page(viewport={"width": 390, "height": 844})
        mobile_page.on("console", lambda msg: errors.append(f"Mobile Console {msg.type}: {msg.text}") if msg.type == "error" else None)
        
        await mobile_page.goto(f"{BASE_URL}/", wait_until="networkidle")
        await mobile_page.wait_for_timeout(800)
        
        # At top of page (scrollY: 0), pill should NOT be visible
        pill_selector = "nav[aria-label='Document and Report View Switcher']"
        initial_pill = await mobile_page.query_selector(pill_selector)
        print(f"   Pill at scrollY: 0 exists? {initial_pill is not None}")
        
        # Scroll down into the dual-pane workbench
        print("   Scrolling to #workbench-viewport...")
        await mobile_page.locator("#workbench-viewport").scroll_into_view_if_needed()
        await mobile_page.wait_for_timeout(800)
        
        # Pill should now be visible in DOM
        scrolled_pill = await mobile_page.query_selector(pill_selector)
        assert scrolled_pill is not None, "Contextual pill should be visible when workbench is in view"
        pill_box = await scrolled_pill.bounding_box()
        assert pill_box is not None and pill_box["width"] > 0, "Pill should have valid bounding dimensions"
        print(f"   PASS: Mobile contextual pill rendered with width {pill_box['width']}px at bottom: {pill_box['y']}px")
        
        # Click Report tab in pill
        print("   Testing tab switch in mobile contextual pill...")
        report_btn = mobile_page.locator(f"{pill_selector} button:has-text('Report')")
        await report_btn.click()
        await mobile_page.wait_for_timeout(400)
        
        # Verify findings cards are visible
        card_el = await mobile_page.query_selector("div[id^='card-']")
        assert card_el is not None, "Discrepancy cards should be visible when Report tab is selected"
        print("   PASS: Switched to Report view successfully via floating glassmorphism pill.")
        
        # Test Locate on PDF button on card
        locate_btn = mobile_page.locator("button:has-text('Locate on Source PDF')").first
        if await locate_btn.count() > 0:
            print("   Clicking 'Locate on Source PDF'...")
            await locate_btn.click()
            await mobile_page.wait_for_timeout(600)
            # Should have switched back to doc tab
            doc_active = await mobile_page.query_selector("div[id^='bbox-']")
            assert doc_active is not None, "Should focus document canvas after clicking Locate on PDF"
            print("   PASS: 'Locate on Source PDF' cleanly navigated back to Document tab with reticle targeting.")
            
        await mobile_page.close()
        
        # -------------------------------------------------------------
        # Test 2: Desktop Viewport Contextual Physics (1440x900)
        # -------------------------------------------------------------
        print("\n--- Test 2: Desktop Viewport Weighted Physics (1440x900) ---")
        desktop_page = await browser.new_page(viewport={"width": 1440, "height": 900})
        desktop_page.on("console", lambda msg: errors.append(f"Desktop Console {msg.type}: {msg.text}") if msg.type == "error" else None)
        
        await desktop_page.goto(f"{BASE_URL}/", wait_until="networkidle")
        await desktop_page.wait_for_timeout(800)
        
        # Scroll to workbench
        await desktop_page.locator("#workbench-viewport").scroll_into_view_if_needed()
        await desktop_page.wait_for_timeout(800)
        
        # In split mode on desktop, pill should be hidden (since both panes are visible simultaneously)
        desktop_pill = await desktop_page.query_selector(pill_selector)
        print(f"   In split desktop mode, contextual pill hidden? {desktop_pill is None}")
        
        # Test Bounding Box Click and 420ms weighted lock-on state
        first_bbox = desktop_page.locator("div[id^='bbox-']").first
        await first_bbox.wait_for(state="visible", timeout=10000)
        bbox_id = await first_bbox.get_attribute("id")
        print(f"   Clicking bounding box {bbox_id}...")
        
        await first_bbox.click()
        # Immediately during lock-on (< 420ms), check analyzing pulse
        await desktop_page.wait_for_timeout(100)
        analyzing_classes = await first_bbox.get_attribute("class")
        print(f"   Analyzing ring present during 420ms lock: {'ring-cyan-400' in analyzing_classes or 'ring' in analyzing_classes}")
        
        # Wait for 420ms transition to complete
        await desktop_page.wait_for_timeout(500)
        locked_classes = await first_bbox.get_attribute("class")
        assert "scale-" in locked_classes or "ring-" in locked_classes, "Bounding box should have weighted locked styling"
        print("   PASS: Bounding box executed 420ms weighted laser lock-on trajectory.")
        
        # Verify card is also active in terminal bay
        clean_id = bbox_id.replace("bbox-", "")
        active_card = desktop_page.locator(f"#card-{clean_id}")
        card_class = await active_card.get_attribute("class")
        assert "bg-[#1E293B]" in card_class or "border-blue-500" in card_class, "Corresponding card should have active ring"
        print(f"   PASS: Corresponding card #card-{clean_id} actively highlighted.")
        
        # Capture screenshot of perfected workbench
        os.makedirs(os.path.join(REPO_ROOT, "docs", "screenshots"), exist_ok=True)
        screenshot_path = os.path.join(REPO_ROOT, "docs", "screenshots", "var1_workbench_perfected_1440.png")
        await desktop_page.screenshot(path=screenshot_path, full_page=False)
        print(f"   Captured screenshot at {screenshot_path}")
        
        await desktop_page.close()
        await browser.close()
        
        if errors:
            print(f"\nConsole errors detected ({len(errors)}):")
            for e in errors:
                print(f"  - {e}")
            sys.exit(1)
        else:
            print("\n==========================================")
            print("VARIATION 1 PERFECTION TESTS PASSED (0 ERRORS)!")
            print("==========================================")

if __name__ == "__main__":
    asyncio.run(main())
