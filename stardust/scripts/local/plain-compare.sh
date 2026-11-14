#!/usr/bin/env bash
# plain-compare.sh <path>... : diff delivered .plain.html (preview host) vs source, media names normalised
norm() { sed -E 's#(src|srcset|href)="[^"]*/?(media_[0-9a-f]+)\.([a-z]+)[^"]*"#\1="\2.\3"#g; s#\./(media_)#\1#g' | sed -E 's#(media_[0-9a-f]+\.[a-z]+)\?[^ "]*#\1#g' | tr -s ' \n' | sed 's/> *</>\n</g'; }
for p in "$@"; do
  a=$(curl -s "https://new.frescopa.coffee$p.plain.html" | norm)
  b=$(curl -s "https://main--7c29ab64--aemcoder.aem.page$p.plain.html" | norm)
  if [ "$a" = "$b" ]; then echo "SAME $p"; else echo "DIFF $p"; diff <(echo "$a") <(echo "$b") | head -12; fi
done
