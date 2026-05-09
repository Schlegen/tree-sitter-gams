#!/usr/bin/env bash
# End-to-end parse tests: parse each .gms file and assert no ERROR/MISSING nodes.
# Usage: bash test/e2e/run.sh [file.gms ...]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ "$#" -gt 0 ]; then
  FILES=("$@")
else
  FILES=("$SCRIPT_DIR"/*.gms)
fi

PASS=0
FAIL=0

for f in "${FILES[@]}"; do
  result=$(tree-sitter parse "$f" 2>/dev/null)
  errors=$(echo "$result" | grep -cE "ERROR|MISSING" || true)
  if [ "$errors" -gt 0 ]; then
    echo "FAIL: $f"
    echo "$result" | grep -E "ERROR|MISSING" | sed 's/^/       /'
    FAIL=$((FAIL + 1))
  else
    echo "PASS: $f"
    PASS=$((PASS + 1))
  fi
done

echo ""
echo "$PASS passed, $FAIL failed."
[ "$FAIL" -eq 0 ]
