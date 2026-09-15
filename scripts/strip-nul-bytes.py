#!/usr/bin/env python3
"""构建后清洗产物 HTML 中的 NUL 字节。

Docusaurus SSR 在中文文本中偶发注入 U+0000(疑似上游 bug),
NUL 进入 <a href> 会造成 404(如 tag 链接)、进入正文则为隐藏脏字符。
源 markdown 均干净,故在产物层根治:删除 build/**/*.html 里的 NUL。
"""
import os, sys

base = sys.argv[1] if len(sys.argv) > 1 else 'build'
n, pages = 0, 0
for root, _, files in os.walk(base):
    for f in files:
        if not f.endswith('.html'):
            continue
        p = os.path.join(root, f)
        b = open(p, 'rb').read()
        c = b.count(b'\x00')
        if c:
            open(p, 'wb').write(b.replace(b'\x00', b''))
            n += c
            pages += 1
print(f'[strip-nul] removed {n} NUL bytes from {pages} pages under {base}/')
