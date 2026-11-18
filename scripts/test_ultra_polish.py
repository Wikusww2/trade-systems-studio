import asyncio
import http.server
import os
import socketserver
import threading

from playwright.async_api import async_playwright

PORT = 3456
DIRECTORY = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend-dashboard", "out")

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    def log_message(self, format, *args):
        pass

class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True

def start_server():
    httpd = ThreadedTCPServer(("", PORT), Handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return httpd

async def run_visual_verification():
    httpd = start_server()
    print(f"Local static test server running on port {PORT} serving {DIRECTORY}")

    os.makedirs("docs/screenshots", exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        # 1. MOBILE VERIFICATION (390 x 844)
        print("\n--- Gate 1: Mobile Viewport (390x844) ---")
        mobile_page = await browser.new_page(viewport={"width": 390, "height": 844})
        await mobile_page.goto(f"http://localhost:{PORT}/", wait_until="domcontentloaded")
        await mobile_page.wait_for_timeout(1000)

        # Scroll to workbench to trigger contextual floating pill
        workbench = mobile_page.locator("#workbench-viewport")
        await workbench.scroll_into_view_if_needed()
        await mobile_page.wait_for_timeout(800)

        # Verify floating pill visibility and centering on the inner pill element
        pill = mobile_page.locator("nav[aria-label='Document and Report View Switcher'] > div")
        is_visible = await pill.is_visible()
        assert is_visible, "Floating nav pill must be visible when workbench is in view"

        box = await pill.bounding_box()
        assert box is not None, "Pill bounding box must not be null"
        print(f"Mobile Pill Bounding Box: x={box['x']:.2f}, width={box['width']:.2f}, right={(box['x'] + box['width']):.2f}")

        # Assert no cut off (must fit inside 390px viewport with comfortable margin)
        assert box['x'] >= 8, f"Pill x ({box['x']}) must have margin from left screen edge"
        assert box['x'] + box['width'] <= 382, f"Pill right edge ({box['x'] + box['width']}) must be <= 382px"

        # Assert centering: center_x should be mathematically 195.0px (390/2)
        center_x = box['x'] + box['width'] / 2
        print(f"Mobile Pill Horizontal Center: {center_x:.2f}px (Target: 195.00px)")
        assert abs(center_x - 195.0) < 2.0, f"Pill must be centered within 2px of 195px (got {center_x})"

        # Verify 2-Way Paradigm Switcher contains only 2 paradigms (Workbench and Triage Desk)
        visible_switcher_buttons = mobile_page.locator("button:has-text('Workbench'):visible, button:has-text('Triage Desk'):visible")
        btn_count = await visible_switcher_buttons.count()
        print(f"Visible Paradigm Switcher buttons detected on mobile: {btn_count}")
        assert btn_count == 2, f"Visible Paradigm Switcher must have exactly 2 buttons (got {btn_count})"

        # Assert Variations 3, 4, 5 are NOT anywhere on the page
        var3_buttons = mobile_page.locator("button:has-text('Kinetic 3D'), button:has-text('Wiretap #arc'), button:has-text('Synthesis')")
        var3_count = await var3_buttons.count()
        assert var3_count == 0, f"Variations 3, 4, 5 must be pruned from switcher (found {var3_count})"

        # Switch to Triage Desk (var-2)
        triage_btn = mobile_page.locator("button:has-text('Triage Desk'):visible").first
        await triage_btn.click()
        await mobile_page.wait_for_timeout(800)

        # Verify Triage Table renders without column overlap
        triage_header = mobile_page.locator("text=CARRIER CUTOFF COUNTDOWN")
        assert await triage_header.is_visible(), "Carrier Cutoff Countdown must be visible in Triage Desk"

        search_input = mobile_page.locator("input[placeholder*='Search 500 invoices']")
        assert await search_input.is_visible(), "Search 500 invoices input must be visible"

        # Capture mobile screenshot
        await mobile_page.screenshot(path="docs/screenshots/ultra_polish_mobile.png")
        print("Captured docs/screenshots/ultra_polish_mobile.png")

        # 2. DESKTOP VERIFICATION (1440 x 900)
        print("\n--- Gate 2: Desktop Viewport (1440x900) ---")
        desktop_page = await browser.new_page(viewport={"width": 1440, "height": 900})
        await desktop_page.goto(f"http://localhost:{PORT}/#workbench", wait_until="domcontentloaded")
        await desktop_page.wait_for_timeout(1000)

        # Verify clean header
        identity = desktop_page.get_by_text("SAMUEL", exact=True)
        assert await identity.is_visible(), "Samuel identity must be visible"

        architecture_link = desktop_page.locator("button:has-text('Architecture & Dossier'):visible")
        assert await architecture_link.is_visible(), "Architecture & Dossier button must be visible in header"

        cta = desktop_page.locator("button:has-text('Schedule Architecture Review'):visible").first
        assert await cta.is_visible(), "Schedule Architecture Review CTA must be visible"

        # Test Architecture & Dossier modal trigger
        await architecture_link.click()
        await desktop_page.wait_for_timeout(600)
        modal_header = desktop_page.locator("text=System Architecture & Test Verification")
        assert await modal_header.is_visible(), "Architecture modal must open upon clicking Architecture & Dossier"

        # Close modal
        close_btn = desktop_page.locator("button:has(svg.lucide-x):visible").first
        await close_btn.click()
        await desktop_page.wait_for_timeout(400)

        # Verify Penalty Exposure Ladder is mounted in its own section above thesis
        penalty_section = desktop_page.locator("#penalty-ladder")
        assert await penalty_section.is_visible(), "Statutory Culpability & Penalty Ladder section must be present"

        thesis_section = desktop_page.locator("#architect-thesis")
        assert await thesis_section.is_visible(), "Architect Thesis section must be present"

        # Capture desktop screenshot
        await desktop_page.screenshot(path="docs/screenshots/ultra_polish_desktop.png")
        print("Captured docs/screenshots/ultra_polish_desktop.png")

        await browser.close()
        httpd.shutdown()
        print("\nALL PLAYWRIGHT VERIFICATION GATES PASSED CLEANLY!")

if __name__ == "__main__":
    asyncio.run(run_visual_verification())
