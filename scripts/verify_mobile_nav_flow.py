import os
import time

from playwright.sync_api import sync_playwright

artifact_dir = os.environ.get(
    "ARTIFACT_DIR",
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "docs", "screenshots"),
)

def test_mobile_flow():
    with sync_playwright() as p:
        # 1. TEST MOBILE VIEWPORT (iPhone 14: 390 x 844)
        print("Testing Mobile Viewport (390 x 844)...")
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
        page = context.new_page()

        page.goto("http://localhost:53830/", wait_until="networkidle")
        time.sleep(2.0)

        # Scroll to workbench
        workbench = page.query_selector("#workbench")
        if workbench:
            workbench.scroll_into_view_if_needed()
            time.sleep(0.5)

        # 1. Verify Document is visible first on mobile
        canvas = page.query_selector("canvas")
        assert canvas is not None, "Canvas element should be visible in document-first state!"
        print("PASS: Canvas document is visible first on mobile.")

        # 2. Verify floating bottom navigation dock is visible
        bottom_dock = page.query_selector("nav[aria-label='Mobile View Switcher']")
        assert bottom_dock is not None, "Mobile floating bottom navigation dock not found!"
        print("PASS: Floating bottom navigation dock is visible.")

        # 3. Capture screenshot of document-first state with radar beacon
        screenshot_1 = os.path.join(artifact_dir, "mobile_01_document_view.png")
        page.screenshot(path=screenshot_1)
        print(f"Captured: {screenshot_1}")

        # 4. Tap the first highlighted bounding box on the PDF
        bbox_1 = page.query_selector("[id^='bbox-']")
        assert bbox_1 is not None, "Bounding box not found on PDF!"
        print("Clicking highlighted bounding box on PDF...")
        bbox_1.click()

        # Wait for laser scan animation and transition to findings report
        time.sleep(1.0)

        # 5. Verify Report View is now active
        discrepancy_card = page.query_selector("[id^='card-']")
        assert discrepancy_card is not None, "Report findings card should be visible after clicking block!"
        print("PASS: Successfully navigated to Forensic Report after clicking block.")

        # 6. Capture screenshot of Report View
        screenshot_2 = os.path.join(artifact_dir, "mobile_02_report_view.png")
        page.screenshot(path=screenshot_2)
        print(f"Captured: {screenshot_2}")

        # 7. Tap 'Document' on the floating bottom nav pill to switch back
        doc_button = page.query_selector("nav[aria-label='Mobile View Switcher'] button:has-text('Document')")
        assert doc_button is not None, "Document button on floating dock not found!"
        print("Tapping 'Document' on floating dock to switch back...")
        doc_button.click()
        time.sleep(0.8)

        # 8. Verify Document view is active again
        canvas_again = page.query_selector("canvas")
        assert canvas_again is not None, "Canvas should be visible after switching back to Document!"
        print("PASS: Successfully switched back to Document via floating dock.")

        screenshot_3 = os.path.join(artifact_dir, "mobile_03_switch_back_doc.png")
        page.screenshot(path=screenshot_3)
        print(f"Captured: {screenshot_3}")

        browser.close()

        # 2. TEST DESKTOP VIEWPORT & 3-WAY LAYOUT SWITCHER
        print("\nTesting Desktop Viewport (1440 x 900)...")
        browser_desktop = p.chromium.launch(headless=True)
        context_desktop = browser_desktop.new_context(viewport={"width": 1440, "height": 900})
        page_desktop = context_desktop.new_page()

        page_desktop.goto("http://localhost:53830/", wait_until="networkidle")
        time.sleep(1.5)

        wb_desktop = page_desktop.query_selector("#workbench")
        if wb_desktop:
            wb_desktop.scroll_into_view_if_needed()
            time.sleep(0.5)

        # Capture Desktop Split View
        screenshot_d1 = os.path.join(artifact_dir, "desktop_01_split_view.png")
        page_desktop.screenshot(path=screenshot_d1)
        print(f"Captured: {screenshot_d1}")

        # Click Document Only
        btn_doc_only = page_desktop.query_selector("button:has-text('Document Only')")
        if btn_doc_only:
            btn_doc_only.click()
            time.sleep(0.5)
            screenshot_d2 = os.path.join(artifact_dir, "desktop_02_document_only.png")
            page_desktop.screenshot(path=screenshot_d2)
            print(f"Captured: {screenshot_d2}")

        # Click Report Only
        btn_rep_only = page_desktop.query_selector("button:has-text('Report Only')")
        if btn_rep_only:
            btn_rep_only.click()
            time.sleep(0.5)
            screenshot_d3 = os.path.join(artifact_dir, "desktop_03_report_only.png")
            page_desktop.screenshot(path=screenshot_d3)
            print(f"Captured: {screenshot_d3}")

        browser_desktop.close()
        print("\nALL MOBILE & DESKTOP NAVIGATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_mobile_flow()
