from bs4 import BeautifulSoup

SAFE_TAGS = {"p","div","span","a","li","ul","ol","strong","em","code","pre","blockquote","h1","h2","h3","h4","h5","h6","br"}
SAFE_ATTRIBUTES = { "href", "title", "class", "id", "style" }

def clean_html(raw_html:str) -> tuple[str, str]:
    soup = BeautifulSoup(raw_html, "lxml")

    for tag in soup (["script", "style", "noscript", "iframe"]):
        tag.decompose()

    body = soup.body if soup.body else soup

    text = body.get_text(separator="\n", strip=True)

    for tag in body.find_all(True):
        if tag.name not in SAFE_TAGS:
            tag.unwrap()
        else:
            tag.attrs = {}

    safe_html = str(body)

    return text, safe_html