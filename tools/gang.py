"""Generates the layered perspective 'gang' (alley) illustration used in the opening
and in the Import The Cats street. Run: python3 tools/gang.py  -> writes tools/out/gang_layers.json
Each layer is an SVG <g> string in a 1600x1600 viewBox, vanishing point (800,820)."""
import math, random, json, os
rng = random.Random(7)
VPX, VPY, F = 800, 820, 800
YG = 0.975
INK = '#3B46D9'
def P(X, Y, z): return (VPX + X * F / z, VPY + Y * F / z)
def pts(arr): return ' '.join(f'{x:.1f},{y:.1f}' for x, y in arr)
def poly(arr, fill, extra=''): return f'<polygon points="{pts(arr)}" fill="{fill}" {extra}/>'
def line(a, b, w, col=INK, extra=''):
    return f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="{col}" stroke-width="{w:.2f}" stroke-linecap="round" {extra}/>'
def sw(z, base=2.4): return max(0.6, base * 1.6 / z)   # stroke width by depth
WALLS = ['#F6E3C6', '#CFE3D3', '#F3C9BC', '#D6DEF6', '#F7EFA9', '#E9D1E8', '#F2D5A8']
def shade(hexc, f):
    r, g, b = [int(hexc[i:i+2], 16) for i in (1, 3, 5)]
    return '#%02x%02x%02x' % tuple(max(0, min(255, int(v * f))) for v in (r, g, b))
LAYERS = {'far': [], 'mid': [], 'near': [], 'front': []}
def layer_of(z):
    return 'front' if z < 1.45 else 'near' if z < 2.5 else 'mid' if z < 4.5 else 'far'
def wall_rect(X, z0, z1, Y0, Y1): return [P(X, Y0, z0), P(X, Y0, z1), P(X, Y1, z1), P(X, Y1, z0)]

def segment(X, z0, z1, kind, col, height):
    s = 1 if X > 0 else -1
    L = LAYERS[layer_of((z0 + z1) / 2)]
    wcol = col if s > 0 else shade(col, 0.93)
    ytop = YG - height
    zl = z1 - z0
    w = sw(z0)
    L.append(poly(wall_rect(X, z0, z1, YG, ytop), wcol, f'stroke="{INK}" stroke-width="{w:.2f}" stroke-linejoin="round"'))
    # halftone shadow under the eave
    L.append(poly(wall_rect(X, z0, z1, ytop + 0.32, ytop), 'url(#ht)', 'opacity=".55"'))
    # plinth
    L.append(poly(wall_rect(X, z0, z1, YG, YG - 0.12), shade(wcol, 0.82)))
    if kind in ('fence', 'gate'):
        top = YG - 0.62
        L.append(poly(wall_rect(X, z0 + 0.05 * zl, z1 - 0.05 * zl, YG - 0.12, top), shade(wcol, 0.9), f'stroke="{INK}" stroke-width="{w*0.7:.2f}"'))
        n = max(4, int(zl * 7))
        for i in range(n + 1):
            zz = z0 + 0.05 * zl + (0.9 * zl) * i / n
            L.append(line(P(X, YG - 0.14, zz), P(X, top, zz), w * 0.6, '#2F5E4E'))
        L.append(line(P(X, top, z0 + 0.05 * zl), P(X, top, z1 - 0.05 * zl), w * 1.1, '#2F5E4E'))
        L.append(line(P(X, top + 0.2, z0 + 0.05 * zl), P(X, top + 0.2, z1 - 0.05 * zl), w * 0.7, '#2F5E4E'))
    elif kind == 'door':
        za, zb = z0 + 0.25 * zl, z0 + 0.55 * zl
        L.append(poly(wall_rect(X, za, zb, YG - 0.12, YG - 1.05), '#8C5A3C', f'stroke="{INK}" stroke-width="{w*0.8:.2f}"'))
        L.append(poly(wall_rect(X, za + 0.03 * zl, zb - 0.03 * zl, YG - 0.55, YG - 0.98), 'url(#ht)', 'opacity=".5"'))
        zc, zd = z0 + 0.65 * zl, z0 + 0.92 * zl
        L.append(poly(wall_rect(X, zc, zd, YG - 0.45, YG - 0.95), '#CFE0FF', f'stroke="{INK}" stroke-width="{w*0.8:.2f}"'))
        L.append(line(P(X, YG - 0.70, zc), P(X, YG - 0.70, zd), w * 0.6))
        L.append(line(P(X, YG - 0.45, (zc + zd) / 2), P(X, YG - 0.95, (zc + zd) / 2), w * 0.6))
    elif kind == 'shop':
        za, zb = z0 + 0.1 * zl, z0 + 0.9 * zl
        L.append(poly(wall_rect(X, za, zb, YG - 0.12, YG - 0.95), '#BFC6D9', f'stroke="{INK}" stroke-width="{w*0.8:.2f}"'))
        for i in range(1, 9):
            yy = YG - 0.12 - 0.83 * i / 9
            L.append(line(P(X, yy, za), P(X, yy, zb), w * 0.45, '#7D86A6'))
        L.append(poly(wall_rect(X, za - 0.02 * zl, zb + 0.02 * zl, YG - 0.95, YG - 1.12), '#E8893A', f'stroke="{INK}" stroke-width="{w*0.6:.2f}"'))
    if height > 2.1:
        # upper floor windows
        for (fa, fb) in ((0.15, 0.42), (0.58, 0.85)):
            za, zb = z0 + fa * zl, z0 + fb * zl
            y1, y2 = ytop + 0.45, ytop + 1.05
            L.append(poly(wall_rect(X, za, zb, y2, y1), '#D7E4FF', f'stroke="{INK}" stroke-width="{w*0.8:.2f}"'))
            L.append(poly(wall_rect(X, za, zb, (y1 + y2) / 2, y1), 'url(#ht)', 'opacity=".45"'))
            L.append(line(P(X, y1, (za + zb) / 2), P(X, y2, (za + zb) / 2), w * 0.6))
            L.append(line(P(X, (y1 + y2) / 2, za), P(X, (y1 + y2) / 2, zb), w * 0.5))
        if rng.random() < 0.5:   # AC unit
            za = z0 + 0.45 * zl; zb = za + 0.12 * zl
            L.append(poly(wall_rect(X, za, za + min(0.35, 0.18 * zl), ytop + 1.45, ytop + 1.2), '#F4F4F2', f'stroke="{INK}" stroke-width="{w*0.6:.2f}"'))
    # eave (underside seen from below)
    Xi = X - s * 0.24
    L.append(poly([P(X, ytop, z0), P(X, ytop, z1), P(Xi, ytop, z1), P(Xi, ytop, z0)], '#9C4F2E', f'stroke="{INK}" stroke-width="{w*0.7:.2f}"'))
    L.append(poly([P(Xi, ytop, z0), P(Xi, ytop, z1), P(Xi, ytop - 0.09, z1), P(Xi, ytop - 0.09, z0)], '#D2723F', f'stroke="{INK}" stroke-width="{w*0.5:.2f}"'))
    return ytop

def plant(X, z, scale=1.0):
    L = LAYERS[layer_of(z)]
    x, y = P(X, YG, z); s = 0.2 * F / z * scale
    g = f'<g transform="translate({x:.1f} {y:.1f}) scale({s/100:.3f})">'
    g += f'<path d="M-40,0 L-48,-55 L48,-55 L40,0 Z" fill="#C46A3D" stroke="{INK}" stroke-width="3"/>'
    g += f'<path d="M-48,-55 L48,-55 L46,-66 L-46,-66 Z" fill="#D9844F" stroke="{INK}" stroke-width="3"/>'
    for (dx, dy, rx, ry, c) in ((-30, -100, 34, 46, '#3F7A3A'), (28, -105, 36, 48, '#5E9B4A'), (0, -140, 40, 52, '#6FB25A'), (-48, -78, 24, 30, '#5E9B4A'), (50, -80, 24, 30, '#3F7A3A')):
        g += f'<ellipse cx="{dx}" cy="{dy}" rx="{rx}" ry="{ry}" fill="{c}" stroke="{INK}" stroke-width="3" transform="rotate({rng.randint(-25,25)} {dx} {dy})"/>'
    g += '</g>'
    L.append(g)

def cable(a, b, sag, z, w=1.6):
    L = LAYERS[layer_of(z)]
    mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + sag
    L.append(f'<path d="M{a[0]:.1f},{a[1]:.1f} Q{mx:.1f},{my:.1f} {b[0]:.1f},{b[1]:.1f}" fill="none" stroke="#2A2633" stroke-width="{w:.2f}" stroke-linecap="round"/>')

# ---- sky + far end
LAYERS['far'].append('<rect x="0" y="0" width="1600" height="1600" fill="url(#sky)"/>')
for i in range(5):  # soft clouds
    cx, cy = rng.uniform(500, 1100), rng.uniform(120, 520)
    LAYERS['far'].append(f'<ellipse cx="{cx:.0f}" cy="{cy:.0f}" rx="{rng.uniform(60,120):.0f}" ry="{rng.uniform(16,26):.0f}" fill="#FFFFFF" opacity=".75"/>')
ZEND = 9.0
# ground
LAYERS['far'].append(poly([P(-1, YG, 0.55), P(1, YG, 0.55), P(1, YG, ZEND), P(-1, YG, ZEND)], '#D9D1C0'))
LAYERS['far'].append(poly([P(-1, YG, 0.55), P(1, YG, 0.55), P(1, YG, ZEND), P(-1, YG, ZEND)], 'url(#htg)', 'opacity=".35"'))
z = 0.6
while z < ZEND:
    LAYERS['far'].append(line(P(-0.88, YG, z), P(0.88, YG, z), sw(z, 1.2), '#B7AE9C'))
    z += 0.7
LAYERS['far'].append(line(P(0, YG, 0.6), P(0, YG, ZEND), 1.0, '#C3BBA9'))
for s in (-1, 1):
    LAYERS['far'].append(poly([P(s * 0.86, YG, 0.55), P(s * 1, YG, 0.55), P(s * 1, YG, ZEND), P(s * 0.86, YG, ZEND)], '#77736A'))
    LAYERS['far'].append(line(P(s * 0.86, YG, 0.55), P(s * 0.86, YG, ZEND), 1.4, INK))
# far house facing camera
fx0, fy0 = P(-1, YG, ZEND); fx1, fy1 = P(1, YG - 2.5, ZEND)
LAYERS['far'].append(f'<rect x="{fx0:.1f}" y="{fy1:.1f}" width="{fx1-fx0:.1f}" height="{fy0-fy1:.1f}" fill="#F3C9BC" stroke="{INK}" stroke-width="1.2"/>')
dx0, dy0 = P(-0.25, YG, ZEND); dx1, dy1 = P(0.25, YG - 1.0, ZEND)
LAYERS['far'].append(f'<rect x="{dx0:.1f}" y="{dy1:.1f}" width="{dx1-dx0:.1f}" height="{dy0-dy1:.1f}" fill="#8C5A3C" stroke="{INK}" stroke-width="1"/>')
for wx in (-0.75, 0.45):
    a = P(wx, YG - 2.0, ZEND); b = P(wx + 0.3, YG - 1.5, ZEND)
    LAYERS['far'].append(f'<rect x="{a[0]:.1f}" y="{a[1]:.1f}" width="{b[0]-a[0]:.1f}" height="{b[1]-a[1]:.1f}" fill="#D7E4FF" stroke="{INK}" stroke-width="1"/>')
ea, eb = P(-1.15, YG - 2.5, ZEND), P(1.15, YG - 2.62, ZEND)
LAYERS['far'].append(f'<rect x="{ea[0]:.1f}" y="{eb[1]:.1f}" width="{eb[0]-ea[0]:.1f}" height="{ea[1]-eb[1]:.1f}" fill="#C9673F" stroke="{INK}" stroke-width="1"/>')

# ---- walls (far to near so painter order inside each layer works)
leftZ = [0.55, 1.45, 2.5, 3.5, 4.5, 5.8, 7.2, ZEND]
rightZ = [0.55, 1.45, 2.0, 2.5, 3.4, 4.5, 5.6, 7.0, ZEND]
kinds = ['fence', 'door', 'shop', 'gate', 'door', 'fence']
tops = {}
for X, zs in ((-1, leftZ), (1, rightZ)):
    segs = list(zip(zs[:-1], zs[1:]))
    for i, (z0, z1) in reversed(list(enumerate(segs))):
        h = rng.choice([2.7, 3.0, 2.85, 1.75, 2.9]) if i > 0 else 3.1
        k = kinds[(i + (0 if X < 0 else 2)) % len(kinds)]
        tops[(X, i)] = segment(X, z0, z1, k, WALLS[(i * 2 + (0 if X < 0 else 1)) % len(WALLS)], h)
# plants & props
for X, z, sc in ((-0.8, 6.3, 1), (0.8, 5.0, 1.1), (-0.8, 3.9, 1.1), (0.8, 2.9, 1.2), (-0.8, 2.15, 1.25), (0.82, 1.62, 1.3), (-0.82, 1.2, 1.3)):
    plant(X, z, sc)
# laundry line across at z=3.0
zl = 3.0
a, b = P(-1, YG - 2.05, zl), P(1, YG - 2.0, zl)
cable(a, b, 26, zl, 1.4)
for i, c in enumerate(['#E8893A', '#4B53E6', '#FFFFFF', '#F3C9BC', '#2B2B2B']):
    t = 0.18 + i * 0.15
    x = a[0] + (b[0] - a[0]) * t; y = a[1] + (b[1] - a[1]) * t + 26 * 4 * t * (1 - t) * 0.5
    wv, hv = 40 + (i % 2) * 14, 60 + (i % 3) * 16
    LAYERS['mid'].append(f'<path d="M{x-wv/2:.1f},{y:.1f} h{wv} l-4,{hv} h{-(wv-8)} Z" fill="{c}" stroke="{INK}" stroke-width="1.6" stroke-linejoin="round"/>')
# cables between eaves and along the alley
for z0 in (1.2, 2.2, 3.8, 5.2, 6.5):
    a = P(-0.8, YG - 2.6, z0); b = P(0.8, YG - 2.7, z0 + 0.35)
    cable(a, b, 40 / z0 * 2, z0, sw(z0, 1.8))
for (X0, Y0, X1, Y1, sag) in ((-0.78, -1.75, -0.6, -1.55, 50), (-0.7, -1.62, -0.55, -1.45, 70), (0.76, -1.8, 0.6, -1.55, 60)):
    p = [P(X0 + (X1 - X0) * t, Y0 + (Y1 - Y0) * t, 0.75 + t * 7.5) for t in [i / 30 for i in range(31)]]
    d = 'M' + ' L'.join(f'{x:.1f},{y + sag * math.sin(math.pi * i / 30) * 0.4:.1f}' for i, (x, y) in enumerate(p))
    LAYERS['front'].append(f'<path d="{d}" fill="none" stroke="#2A2633" stroke-width="2.2" stroke-linecap="round"/>')
# street sign "GG. KUCING"
zs = 2.3; X = -0.8
pb = P(X, YG, zs); pt = P(X, YG - 1.35, zs)
s = F / zs
LAYERS['near'].append(line(pb, pt, 0.035 * s, '#6E7787'))
sx, sy = pt[0] - 0.02 * s, pt[1] - 0.06 * s
LAYERS['near'].append(f'<g transform="translate({sx:.1f} {sy:.1f}) scale({s/400:.3f})"><rect x="0" y="0" width="230" height="74" rx="6" fill="#2F7A4F" stroke="#FFFFFF" stroke-width="6"/><text x="115" y="54" text-anchor="middle" font-family="Londrina Solid, sans-serif" font-weight="900" font-size="48" fill="#FFFFFF" textLength="196" lengthAdjust="spacingAndGlyphs">GG. KUCING</text></g>')

defs = f'''<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DCE6FF"/><stop offset=".6" stop-color="#F4EBDA"/></linearGradient>
<pattern id="ht" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="4.5" cy="4.5" r="2" fill="{INK}"/></pattern>
<pattern id="htg" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="3.5" cy="3.5" r="1.4" fill="#6D655A"/></pattern>
</defs>'''
os.makedirs(os.path.join(os.path.dirname(__file__), 'out'), exist_ok=True)
json.dump({'defs': defs, **{k: ''.join(v) for k, v in LAYERS.items()}}, open(os.path.join(os.path.dirname(__file__), 'out', 'gang_layers.json'), 'w'))
full = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1600" width="1600" height="1600">{defs}' + ''.join(f'<g id="{k}">{"".join(LAYERS[k])}</g>' for k in ('far', 'mid', 'near', 'front')) + '</svg>'
open(os.path.join(os.path.dirname(__file__), 'out', 'gang_full.svg'), 'w').write(full)
print({k: len(''.join(v)) // 1024 for k, v in LAYERS.items()}, 'KB')
