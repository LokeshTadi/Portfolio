#!/usr/bin/env python3
"""One-shot patch for LokeshTadi/Portfolio. Run from the repo root.
Every text edit asserts it matches exactly once; any mismatch aborts with no write.
"""
import re, sys

MQ = "@media (hover:hover) and (pointer:fine)"


def rd(p):
    return open(p, "rb").read().decode("utf-8")


def wr(p, s):
    open(p, "wb").write(s.encode("utf-8"))


def sub1(s, old, new, label):
    n = s.count(old)
    if n != 1:
        sys.exit("ABORT %s: expected 1 match, found %d" % (label, n))
    return s.replace(old, new)


def split_top(sel):
    parts, d, cur = [], 0, ""
    for ch in sel:
        if ch in "([":
            d += 1
        elif ch in ")]":
            d -= 1
        if ch == "," and d == 0:
            parts.append(cur)
            cur = ""
        else:
            cur += ch
    parts.append(cur)
    return parts


def wrap_hover(css):
    """Move every :hover selector into a hover-capable-pointer media query,
    in place, so the cascade order and desktop look are unchanged."""
    out, i, n = [], 0, len(css)
    while i < n:
        j = css.find("{", i)
        if j < 0:
            out.append(css[i:])
            break
        d, k = 1, j + 1
        while d and k < n:
            d += (css[k] == "{") - (css[k] == "}")
            k += 1
        pre, body = css[i:j], css[j + 1:k - 1]
        m = re.match(r"^(\s*(?:/\*.*?\*/\s*)*)(.*)$", pre, re.S)
        lead, sel = m.group(1), m.group(2)
        if sel.lstrip().startswith("@") or ":hover" not in sel:
            out.append(css[i:k])
        else:
            sels = split_top(sel)
            hov = [x.strip() for x in sels if ":hover" in x]
            rest = [x.strip() for x in sels if ":hover" not in x]
            out.append(lead)
            if rest:
                out.append(",".join(rest) + "{" + body + "}")
            out.append(MQ + "{" + ",".join(hov) + "{" + body + "}}")
        i = k
    return "".join(out)


# ---- 1. CSS: root-cause click fix + hover styles only on devices that hover ---
for f in ("css/style.css", "css/v2.css"):
    s = rd(f)
    if f.endswith("v2.css"):
        # ROOT CAUSE: the closed WhatsApp widget (.wa) is a fixed 340x500 box that
        # still receives pointer events, so it swallows taps over the page.
        s = sub1(
            s,
            "align-items:flex-end;gap:.8rem}",
            "align-items:flex-end;gap:.8rem;pointer-events:none}\n"
            ".wa-fab,.wa.open .wa-pop{pointer-events:auto}",
            "wa-pointer-events",
        )
    s = wrap_hover(s)
    if f.endswith("v2.css"):
        s = s.rstrip("\n") + (
            "\n\n/* touch: remove double-tap delay on controls (no visual change) */\n"
            "a,button,.f,.more-btn,.wa-fab{touch-action:manipulation}\n"
        )
    wr(f, s)

# ---- 2. JS: WhatsApp popup must not auto-open over content on touch screens
j = rd("js/main.js")
j = sub1(
    j,
    "if (!sessionStorage.getItem('waShown')",
    "if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !sessionStorage.getItem('waShown')",
    "wa-nudge",
)
wr("js/main.js", j)

# ---- 3. Content ------------------------------------------------------------
h = rd("index.html")
h = sub1(h, "<b>Hi-Tech City, Hyderabad</b>", "<b>Hyderabad, India</b>", "location-fact")
h = sub1(h, "\U0001F4CD Hi-Tech City, Hyderabad, 500081", "\U0001F4CD Hyderabad, India", "location-footer")
h = sub1(h, "<b>Agile / Scrum</b>", "<b>Agile/Waterfall</b>", "methods-fact")
h = sub1(h, "<span>Agile / Scrum</span><span>Waterfall</span>", "<span>Agile</span><span>Waterfall</span>", "methods-tags")
h = sub1(
    h,
    "<span>CRM</span><span>Catalyst</span><span>Billing</span>",
    "<span>CRM</span><span>Zoho CRM Client Script</span><span>Catalyst</span><span>Billing</span>",
    "skill-crm-client-script",
)
wr("index.html", h)
print("patched OK")
