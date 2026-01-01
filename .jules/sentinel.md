# Sentinel Journal

## 2024-05-20 - Initial Scan
**Vulnerability:** Missing Content Security Policy (CSP)
**Learning:** Single Page Applications (SPAs) often neglect CSP, relying on framework protections, but this leaves them vulnerable to XSS if an injection point is found (e.g. via dangerouslySetInnerHTML or third-party scripts).
**Prevention:** Implement a strict CSP in index.html to restrict sources of scripts, styles, and connections.
