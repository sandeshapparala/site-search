import requests

def fetch_html(url: str) -> str:
    resp = requests.get(url, timeout=10, headers={"user-agent": "SiteSearchBot/1.0"})
    resp.raise_for_status()
    return resp.text