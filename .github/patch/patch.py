#!/usr/bin/env python3
"""One-shot patch: favicon + Salesforce logo badge. Each edit must match exactly once."""
import sys


def rd(p):
    return open(p, "rb").read().decode("utf-8")


def wr(p, s):
    open(p, "wb").write(s.encode("utf-8"))


def sub1(s, old, new, label):
    n = s.count(old)
    if n != 1:
        sys.exit("ABORT %s: expected 1 match, found %d" % (label, n))
    return s.replace(old, new)


h = rd("index.html")
h = sub1(
    h,
    '<link rel="icon" href="assets/favicon.png" type="image/png">',
    '<link rel="icon" href="assets/favicon.ico?v=2" sizes="16x16 32x32 48x48">\n'
    '<link rel="shortcut icon" href="assets/favicon.ico?v=2">',
    "favicon",
)
h = sub1(
    h,
    '<span class="co-logo co-mono" aria-hidden="true">S</span>',
    '<span class="co-logo co-sf"><img src="assets/salesforce-with-type-logo.svg" '
    'alt="Salesforce logo" width="56" height="56" loading="lazy"></span>',
    "salesforce-badge",
)
wr("index.html", h)

c = rd("css/v2.css")
c = c.rstrip("\n") + (
    "\n\n/* Salesforce cloud logo is wider than tall: give it more room in the tile */\n"
    ".co-logo.co-sf img{padding:3px}\n"
)
wr("css/v2.css", c)
print("patched OK")
