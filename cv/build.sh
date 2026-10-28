#!/bin/sh
set -eu

cv_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cv_build_dir=$(mktemp -d "${TMPDIR:-/tmp}/amirreza-cv.XXXXXX")
trap 'rm -rf "$cv_build_dir"' EXIT HUP INT TERM

tectonic --untrusted --keep-logs --outdir "$cv_build_dir" "$cv_dir/main.tex"
if grep -q 'Overfull' "$cv_build_dir/main.log"; then
  cat "$cv_build_dir/main.log"
  printf '%s\n' 'Layout overflow detected; website PDF was not replaced.' >&2
  exit 1
fi
cp "$cv_build_dir/main.pdf" "$cv_dir/../static/files/Amir-Reza_Negari_CV.pdf"
printf '%s\n' 'Updated static/files/Amir-Reza_Negari_CV.pdf'
