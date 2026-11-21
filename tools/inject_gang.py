"""Re-inject the generated gang layers into index.html (between <!-- GANG:x --> markers).
Usage: python3 tools/gang.py && python3 tools/inject_gang.py"""
import json, re, os
here = os.path.dirname(__file__)
data = json.load(open(os.path.join(here, 'out', 'gang_layers.json')))
p = os.path.join(here, '..', 'index.html')
html = open(p).read()
for k in ('defs', 'far', 'mid', 'near', 'front'):
    html = re.sub(rf'<!-- GANG:{k} -->.*?<!-- /GANG:{k} -->', lambda m: f'<!-- GANG:{k} -->{data[k]}<!-- /GANG:{k} -->', html, flags=re.S)
open(p, 'w').write(html)
print('injected', {k: len(v) // 1024 for k, v in data.items()}, 'KB')
