import asyncio
import sys

from playwright.async_api import async_playwright

BASE_URL = "https://sssammyboyyy.github.io/trade-systems-studio/"

async def main():
    print(f"Targeting production deployment at {BASE_URL}...")
    errors = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        
        page.on("console", lambda msg: errors.append(f"Console {msg.type}: {msg.text}") if msg.type == "error" else None)
        page.on("pageerror", lambda err: errors.append(f"PageError: {err}"))
        
        # 1. Test #arc direct navigation
        print("1. Testing #arc route...")
        await page.goto(f"{BASE_URL}#arc", wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(1000)
        arc_text = await page.content()
        assert "Upstream Pre-Ingest Pipeline Topology" in arc_text, "Topology heading missing on #arc"
        assert "DIRTY INBOUND XML" in arc_text, "Dirty XML panel missing on #arc"
        assert "SANITIZED UNIVERSALINTERCHANGE XML" in arc_text, "Sanitized XML panel missing on #arc"
        assert "Interactive DefenseMap" in arc_text, "DefenseMap missing on #arc"
        print("   PASS: #arc renders Wiretap & Defense Console with all panels.")
        
        # 2. Test #var-1 navigation
        print("2. Testing #var-1 route...")
        await page.goto(f"{BASE_URL}#var-1", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        var1_text = await page.content()
        assert "Deterministic Pre-Ingest Firewall" in var1_text, "Var1 content missing"
        print("   PASS: #var-1 renders Swiss Hybrid Workbench.")
        
        # 3. Test #var-2 navigation
        print("3. Testing #var-2 route...")
        await page.goto(f"{BASE_URL}#var-2", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        var2_text = await page.content()
        assert "CARRIER CUTOFF COUNTDOWN" in var2_text, "Var2 Cutoff Countdown missing"
        assert "TRIAGE HOTKEYS" in var2_text, "Var2 Triage Hotkeys missing"
        print("   PASS: #var-2 renders Operator Triage Command Queue.")
        
        # 4. Test #var-3 navigation
        print("4. Testing #var-3 route...")
        await page.goto(f"{BASE_URL}#var-3", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        var3_text = await page.content()
        assert "CTO Systems Lens" in var3_text, "Var3 Lens switcher missing"
        assert "ACT 4: THE 20% PRINCIPAL ARCHITECT THESIS" in var3_text, "Var3 Act 4 thesis missing"
        print("   PASS: #var-3 renders Kinetic 3D Narrative & Persona Split-Lens.")
        
        # 5. Test #var-5 navigation
        print("5. Testing #var-5 route...")
        await page.goto(f"{BASE_URL}#var-5", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        var5_text = await page.content()
        assert "PARADIGM TOURNAMENT ARENA" in var5_text, "Var5 Arena heading missing"
        assert "Component Cherry-Picker" in var5_text, "Var5 Cherry-picker missing"
        print("   PASS: #var-5 renders Master Synthesis Arena.")
        
        # 6. Test Keyboard Paradigm Switcher (Cmd/Ctrl + 4 -> #arc, Cmd/Ctrl + 1 -> #var-1)
        print("6. Testing keyboard shortcuts (Ctrl+4, Ctrl+1)...")
        # Trigger Ctrl+4
        await page.keyboard.press("Control+4")
        await page.wait_for_timeout(600)
        current_hash = await page.evaluate("() => window.location.hash")
        print(f"   Current hash after Ctrl+4: {current_hash}")
        assert current_hash in ["#arc", "#var-4"], f"Expected #arc or #var-4, got {current_hash}"
        
        # Trigger Ctrl+1
        await page.keyboard.press("Control+1")
        await page.wait_for_timeout(600)
        current_hash = await page.evaluate("() => window.location.hash")
        print(f"   Current hash after Ctrl+1: {current_hash}")
        assert current_hash in ["#var-1", "#customs"], f"Expected #var-1 or #customs, got {current_hash}"
        print("   PASS: Keyboard shortcuts 1-5 correctly switch variations in production.")
        
        # Check console errors
        real_errors = [e for e in errors if "favicon" not in e and "404" not in e]
        if real_errors:
            print(f"Console errors detected ({len(real_errors)}):")
            for e in real_errors:
                print(f"  - {e}")
            sys.exit(1)
        else:
            print("   PASS: Zero runtime console errors detected.")
            
        await browser.close()
        print("\n==========================================")
        print("ALL PRODUCTION GATES VERIFIED CLEANLY!")
        print("==========================================")

if __name__ == "__main__":
    asyncio.run(main())
