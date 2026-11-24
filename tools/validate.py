#!/usr/bin/env python3
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
errs = []
data = {}
for fn in os.listdir(os.path.join(ROOT, 'data')):
    if fn.endswith('.json'):
        try:
            with open(os.path.join(ROOT, 'data', fn), encoding='utf-8') as f: data[fn[:-5]] = json.load(f)
        except Exception as e: errs.append('JSON parse ' + fn + ': ' + str(e))
pages = data.get('pages', [])
ids = [p['id'] for p in pages]
if len(ids) != len(set(ids)): errs.append('Duplicate page IDs')
for p in pages:
    if p['slug'] in ('', 'news/blog/detail', 'community/events/detail'): continue
    if not os.path.exists(os.path.join(ROOT, p['slug'], 'index.html')): errs.append('Missing HTML: ' + p['slug'])
def exists(rel):
    rel = rel.split('?')[0].split('#')[0]
    if not rel or rel.startswith(('http', 'mailto:', 'tel:', '#')): return True
    cand = os.path.join(ROOT, rel)
    return os.path.exists(cand) or os.path.exists(os.path.join(cand, 'index.html'))
linkre = re.compile(r'"(?:url|image|src)"\s*:\s*"([^"]+)"')
for fn, obj in data.items():
    for m in linkre.finditer(json.dumps(obj)):
        u = m.group(1)
        if u and not u.startswith(('http', 'mailto:', 'tel:')) and not exists(u): errs.append(fn + ': broken ' + u)
print('Checked', len(data), 'JSON,', len(pages), 'pages.')
if errs:
    print('ERRORS:')
    for e in errs: print(' -', e)
    sys.exit(1)
print('All checks passed.')
