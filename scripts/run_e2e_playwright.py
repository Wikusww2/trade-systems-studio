import os
import sys
import time
import threading
import http.server
import socketserver
from playwright.sync_api import sync_playwright

PORT = 8765
OUT_DIR = os.path.abspath("trade-systems-studio/frontend-dashboard/out")
SCREENSHOT_DIR = os.path.abspath("trade-systems-studio/docs/screenshots")
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=OUT_DIR, **kwargs)
    def log_message(self, format, *args):
        pass # Silence logs

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()

def main():
    print(f"Starting static web server for {OUT_DIR} on port {PORT}...")
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(1.0) # Wait for server

    base_url = f"http://127.0.0.1:{PORT}"
    print(f"Connecting Playwright to {base_url}...")

    results = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # -------------------------------------------------------------
        # DESKTOP TEST SUITE (1440x900)
        # -------------------------------------------------------------
        print("\n--- RUNNING DESKTOP E2E TEST (1440x900) ---")
        context_desktop = browser.new_context(
            viewport={"width": 1440, "height": 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
        )
        page = context_desktop.new_page()
        page.goto(base_url, wait_until="networkidle")

        # 1. Desktop Title & Header Verification
        title = page.title()
        assert "TradeTech Systems Studio" in title, f"Unexpected title: {title}"
        print(f"[PASS] Page title: {title}")

        # Check for zero horizontal overflow on Desktop
        scroll_width = page.evaluate("() => document.documentElement.scrollWidth")
        client_width = page.evaluate("() => document.documentElement.clientWidth")
        assert scroll_width <= client_width, f"Horizontal scroll detected on Desktop: scrollWidth={scroll_width}, clientWidth={client_width}"
        print(f"[PASS] Desktop horizontal layout integrity (scrollWidth {scroll_width} <= clientWidth {client_width})")

        # 2. Corridor Switching Verification
        print("Testing Corridor Switching...")
        t0 = time.time()
        # Click Corridor 2: Trans-Pacific Long Beach
        corridor_2 = page.locator("text=Trans-Pacific to Long Beach Lithium Batteries").first
        corridor_2.click()
        page.wait_for_timeout(100) # Allow animation
        t_switch_1 = (time.time() - t0) * 1000
        assert page.locator("text=CARRIER OVERBILLING").first.is_visible()
        print(f"[PASS] Switched to Corridor 2 (Long Beach) in {t_switch_1:.1f}ms")

        t0 = time.time()
        # Click Corridor 3: Cross-Border Steel Drawback
        corridor_3 = page.locator("text=Cross-Border Steel Assembly Drawback").first
        corridor_3.click()
        page.wait_for_timeout(100)
        t_switch_2 = (time.time() - t0) * 1000
        assert page.locator("text=99% CASH REFUND").first.is_visible()
        print(f"[PASS] Switched to Corridor 3 (Steel Drawback) in {t_switch_2:.1f}ms")

        # Switch back to Durban
        corridor_1 = page.locator("text=Port of Durban to Rotterdam Electronics").first
        corridor_1.click()
        page.wait_for_timeout(100)
        print("[PASS] Switched back to Corridor 1 (Durban to Rotterdam)")

        # 3. Disruption Mode Chaos Verification
        print("Testing Disruption Mode Chaos Simulation...")
        shock_btn = page.locator("button:has-text('SIMULATE SUPPLY CHAIN SHOCK')")
        assert shock_btn.is_visible(), "Shock simulation button not found"
        shock_btn.click()
        page.wait_for_timeout(200)

        assert page.locator("text=DISRUPTION MODE: ON").is_visible(), "Disruption Mode ON badge not visible"
        assert page.locator("text=CHAOS ACTIVE:").first.is_visible(), "Chaos alert text not visible"
        print("[PASS] Disruption Mode toggled ON. Chaos alert active.")

        # Test selecting bunker fuel vector
        fuel_btn = page.locator("button:has-text('Bunker Fuel Spike')")
        if fuel_btn.is_visible():
            fuel_btn.click()
            page.wait_for_timeout(150)
            print("[PASS] Disruption vector 'Bunker Fuel Spike' selected.")

        # Toggle Disruption Mode OFF
        page.locator("button:has-text('DISRUPTION MODE: ON')").click()
        page.wait_for_timeout(150)
        assert page.locator("button:has-text('SIMULATE SUPPLY CHAIN SHOCK')").is_visible()
        print("[PASS] Disruption Mode toggled back to baseline.")

        # 4. CargoWise XML Drawer & Diff Verification
        print("Testing CargoWise XML Terminal Tab...")
        cw_tab = page.locator("button:has-text('CargoWise XML')")
        assert cw_tab.is_visible(), "CargoWise XML tab not found"
        cw_tab.click()
        page.wait_for_timeout(200)

        # Check that CargoWise XML Viewer rendered
        assert page.locator("text=UniversalInterchange").first.is_visible(), "UniversalInterchange XML node not visible"
        assert page.locator("text=READY FOR INGESTION").first.is_visible(), "Ingestion status badge not visible"
        print("[PASS] CargoWise XML rendered with UniversalInterchange schema.")

        # Toggle Raw vs Reconciled XML
        raw_toggle = page.locator("button:has-text('View Raw Unaudited XML')")
        if raw_toggle.is_visible():
            raw_toggle.click()
            page.wait_for_timeout(150)
            assert page.locator("text=COMPLIANCE HOLD").first.is_visible()
            print("[PASS] Toggled to Raw Unaudited XML (Status: COMPLIANCE HOLD).")

            reconciled_toggle = page.locator("button:has-text('View Reconciled Lawful XML')")
            reconciled_toggle.click()
            page.wait_for_timeout(150)
            assert page.locator("text=READY FOR INGESTION").first.is_visible()
            print("[PASS] Toggled back to Reconciled Lawful XML (Status: READY FOR INGESTION).")

        # 5. Developer API Sandbox Verification
        print("Testing Developer API Sandbox Tab...")
        api_tab = page.locator("button:has-text('API Sandbox')")
        assert api_tab.is_visible(), "API Sandbox tab not found"
        api_tab.click()
        page.wait_for_timeout(200)

        assert page.locator("text=curl -X POST").first.is_visible(), "curl command not rendered"
        assert page.locator("text=38ms").first.is_visible(), "Sub-50ms latency badge not visible"
        print("[PASS] Developer API Sandbox renders curl command and sub-50ms latency badge.")

        # Switch back to Findings tab
        findings_tab = page.locator("button:has-text('Findings')").first
        findings_tab.click()
        page.wait_for_timeout(150)

        # 6. Capture Desktop Full-Page Screenshot
        desktop_screenshot = os.path.join(SCREENSHOT_DIR, "desktop_workbench_1440.png")
        page.screenshot(path=desktop_screenshot, full_page=False)
        print(f"[PASS] Desktop screenshot captured: {desktop_screenshot}")
        context_desktop.close()

        # -------------------------------------------------------------
        # MOBILE TEST SUITE (390x844 - iPhone 14 / modern smartphone)
        # -------------------------------------------------------------
        print("\n--- RUNNING MOBILE E2E TEST (390x844) ---")
        context_mobile = browser.new_context(
            viewport={"width": 390, "height": 844},
            is_mobile=True,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148"
        )
        page_mobile = context_mobile.new_page()
        page_mobile.goto(base_url, wait_until="networkidle")

        # Mobile horizontal scroll check
        m_scroll_width = page_mobile.evaluate("() => document.documentElement.scrollWidth")
        m_client_width = page_mobile.evaluate("() => document.documentElement.clientWidth")
        assert m_scroll_width <= m_client_width + 1, f"Horizontal scroll detected on Mobile: scrollWidth={m_scroll_width}, clientWidth={m_client_width}"
        print(f"[PASS] Mobile horizontal layout integrity (scrollWidth {m_scroll_width} <= clientWidth {m_client_width})")

        # Mobile Corridor Pill Tap
        mobile_corridor_2 = page_mobile.locator("text=Trans-Pacific to Long Beach").first
        if mobile_corridor_2.is_visible():
            mobile_corridor_2.click()
            page_mobile.wait_for_timeout(100)
            print("[PASS] Mobile corridor tap responsive.")

        # Capture Mobile Screenshot
        mobile_screenshot = os.path.join(SCREENSHOT_DIR, "mobile_workbench_390.png")
        page_mobile.screenshot(path=mobile_screenshot, full_page=False)
        print(f"[PASS] Mobile screenshot captured: {mobile_screenshot}")
        context_mobile.close()

        browser.close()

    print("\nALL PLAYWRIGHT E2E TESTS PASSED WITH EXIT CODE 0!")

if __name__ == "__main__":
    main()
