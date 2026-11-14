#!/usr/bin/env bash
# prep-page.sh <slug> <path> [--meta K=V]... : fetch source images, rehost to DA media/<dir>, convert plain → content/<path>.html
set -euo pipefail
slug=$1; path=$2; shift 2
dir=$(dirname "$path"); dir=${dir#/}; scope=${dir:-root}
work=stardust/.work/rollout/archetype/$slug; mkdir -p "$work/media"
plain=stardust/current/source/plain/$slug.html
srcbase="https://new.frescopa.coffee/${dir:+$dir/}"
names=$(grep -o 'src="\./media_[^"?]*' "$plain" | sed 's/src="\.\///' | sort -u || true)
extra=(); metas=()
while [ $# -gt 0 ]; do case $1 in --meta) metas+=(--meta "$2"); shift 2;; --extra) extra+=("$2"); shift 2;; esac; done
all="$names ${extra[*]:-}"
{ echo '['; sep=''; for n in $all; do printf '%s{"file":"%s/media/%s","source":"%s%s"}\n' "$sep" "$work" "$n" "$srcbase" "$n"; sep=','; done; echo ']'; } > "$work/manifest.json"
[ -n "${all// /}" ] && node stardust/scripts/deploy/da-media-upload.mjs --org aemcoder --repo 7c29ab64 --scope "$scope" --manifest "$work/manifest.json" --token-file "$ADOBE_IMS_TOKEN_FILE" | tail -3 || true
imgs=(); for n in $names; do imgs+=(--img "./$n=https://content.da.live/aemcoder/7c29ab64/media/$scope/$n"); done
mkdir -p "content/$dir"
node stardust/.work/rollout/probes/plain-to-da.mjs "$plain" "content/${path#/}.html" "${imgs[@]}" "${metas[@]}"
