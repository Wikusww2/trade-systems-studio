import urllib.request
import sys

url = "https://sssammyboyyy.github.io/trade-systems-studio/"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})

try:
    with urllib.request.urlopen(req) as resp:
        print(f"Status: {resp.status}")
        content = resp.read().decode("utf-8")
        print(f"HTML length: {len(content)}")
        has_base = "trade-systems-studio" in content
        print(f"Has base path: {has_base}")
        print(f"Contains title or key elements: {'Nightmare Suite' in content or 'TradeTech' in content}")
except Exception as e:
    print(f"Error fetching live site: {e}")
    sys.exit(1)
