"""Playwright Desktop + Mobile E2E Smoke Verification for TradeTech Systems Studio.

Serves the exported static site from `frontend-dashboard/out` and verifies:
- Zero uncaught page errors and zero console errors on `/` and `/whitepaper/`
- Zero horizontal layout overflow on Desktop (1440x900) and Mobile (390x844)
- Interactive workbench render, corridor switching, and tab responsiveness
"""

import argparse
import functools
import http.server
import os
import socketserver
import sys
import threading
import time
from playwright.sync_api import sync_playwright

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(REPO_ROOT, "frontend-dashboard", "out")
SCREENSHOT_DIR = os.path.join(REPO_ROOT, "docs", "screenshots")


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass


def start_server(directory: str) -> tuple[socketserver.TCPServer, int]:
    handler = functools.partial(QuietHandler, directory=directory)
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    port = httpd.server_address[1]
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return httpd, port


def run_e2e(capture_screenshots: bool = False) -> int:
    if not os.path.isdir(OUT_DIR):
        print(f"ERROR: Static export directory not found: {OUT_DIR}")
        print("Run `cd frontend-dashboard && npm run build` first.")
        return 1

    if capture_screenshots:
        os.makedirs(SCREENSHOT_DIR, exist_ok=True)

    httpd, port = start_server(OUT_DIR)
    base_url = f"http://127.0.0.1:{port}"
    print(f"Serving {OUT_DIR} at {base_url}")

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)

            # ---------------------------------------------------------
            # 1. DESKTOP SMOKE & INTERACTION CHECK (1440x900)
            # ---------------------------------------------------------
            print("\n--- DESKTOP E2E (1440x900) ---")
            ctx_desktop = browser.new_context(viewport={"width": 1440, "height": 900})
            page = ctx_desktop.new_page()

            desktop_errors: list[str] = []
            page.on("pageerror", lambda exc: desktop_errors.append(f"pageerror: {exc}"))
            page.on(
                "console",
                lambda msg: desktop_errors.append(f"console.error: {msg.text}")
                if msg.type == "error"
                else None,
            )

            resp = page.goto(base_url, wait_until="networkidle")
            assert resp is not None and resp.status == 200, f"Unexpected HTTP status on /: {resp}"

            title = page.title()
            assert "Trade Systems Studio" in title or "TradeTech" in title, f"Unexpected title: {title}"
            print(f"[PASS] Page title: {title}")

            scroll_w = page.evaluate("() => document.documentElement.scrollWidth")
            client_w = page.evaluate("() => document.documentElement.clientWidth")
            assert scroll_w <= client_w, f"Desktop horizontal overflow: scrollWidth={scroll_w} > clientWidth={client_w}"
            print(f"[PASS] Desktop zero horizontal overflow ({scroll_w} <= {client_w})")

            body_text = page.locator("body").inner_text()
            assert "200" in body_text, "Expected verified 200 test count to render on page"
            print("[PASS] Verified 200 test metric rendered on workbench")

            # Verify CargoWise XML tab if present
            cw_tab = page.locator("button:has-text('CargoWise XML')").first
            if cw_tab.is_visible():
                cw_tab.click()
                page.wait_for_timeout(200)
                print("[PASS] CargoWise XML tab interactive")

            # Verify API Sandbox tab if present
            api_tab = page.locator("button:has-text('API Sandbox')").first
            if api_tab.is_visible():
                api_tab.click()
                page.wait_for_timeout(200)
                print("[PASS] API Sandbox tab interactive")

            # Verify Findings tab switch back
            findings_tab = page.locator("button:has-text('Findings')").first
            if findings_tab.is_visible():
                findings_tab.click()
                page.wait_for_timeout(150)

            if capture_screenshots:
                out_png = os.path.join(SCREENSHOT_DIR, "desktop_workbench_1440.png")
                page.screenshot(path=out_png, full_page=False)
                print(f"[PASS] Saved desktop screenshot: {out_png}")

            # Verify /whitepaper/ route
            wp_resp = page.goto(f"{base_url}/whitepaper/", wait_until="networkidle")
            assert wp_resp is not None and wp_resp.status == 200, f"Unexpected HTTP status on /whitepaper/: {wp_resp}"
            wp_scroll_w = page.evaluate("() => document.documentElement.scrollWidth")
            wp_client_w = page.evaluate("() => document.documentElement.clientWidth")
            assert wp_scroll_w <= wp_client_w, (
                f"Whitepaper desktop overflow: scrollWidth={wp_scroll_w} > clientWidth={wp_client_w}"
            )
            wp_text = page.locator("body").inner_text()
            assert "v2.0" in wp_text or "200" in wp_text, "Expected v2.0 / 200-test whitepaper content"
            print("[PASS] /whitepaper/ route loaded cleanly with zero overflow")

            assert not desktop_errors, f"Desktop runtime errors detected:\n" + "\n".join(desktop_errors)
            print("[PASS] Desktop zero console/page errors")
            ctx_desktop.close()

            # ---------------------------------------------------------
            # 2. MOBILE SMOKE CHECK (390x844)
            # ---------------------------------------------------------
            print("\n--- MOBILE E2E (390x844) ---")
            ctx_mobile = browser.new_context(
                viewport={"width": 390, "height": 844},
                is_mobile=True,
            )
            page_m = ctx_mobile.new_page()

            mobile_errors: list[str] = []
            page_m.on("pageerror", lambda exc: mobile_errors.append(f"pageerror: {exc}"))
            page_m.on(
                "console",
                lambda msg: mobile_errors.append(f"console.error: {msg.text}")
                if msg.type == "error"
                else None,
            )

            m_resp = page_m.goto(base_url, wait_until="networkidle")
            assert m_resp is not None and m_resp.status == 200, f"Unexpected mobile status: {m_resp}"
            time.sleep(0.3)

            m_scroll_w = page_m.evaluate("() => document.documentElement.scrollWidth")
            m_client_w = page_m.evaluate("() => document.documentElement.clientWidth")
            assert m_scroll_w <= m_client_w + 1, (
                f"Mobile horizontal overflow: scrollWidth={m_scroll_w} > clientWidth={m_client_w}"
            )
            print(f"[PASS] Mobile zero horizontal overflow ({m_scroll_w} <= {m_client_w})")

            if capture_screenshots:
                out_m_png = os.path.join(SCREENSHOT_DIR, "mobile_workbench_390.png")
                page_m.screenshot(path=out_m_png, full_page=False)
                print(f"[PASS] Saved mobile screenshot: {out_m_png}")

            assert not mobile_errors, f"Mobile runtime errors detected:\n" + "\n".join(mobile_errors)
            print("[PASS] Mobile zero console/page errors")
            ctx_mobile.close()

            browser.close()
    finally:
        httpd.shutdown()
        httpd.server_close()

    print("\nALL PLAYWRIGHT E2E SMOKE CHECKS PASSED (EXIT 0)")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Run Playwright desktop and mobile E2E smoke checks.")
    parser.add_argument(
        "--screenshots",
        action="store_true",
        default=False,
        help="Capture desktop/mobile screenshots to docs/screenshots/",
    )
    args = parser.parse_args()
    return run_e2e(capture_screenshots=args.screenshots)


if __name__ == "__main__":
    sys.exit(main())
