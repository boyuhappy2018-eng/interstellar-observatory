#!/usr/bin/env bash
set -euo pipefail
artifact_dir="${1:?Pass the artifact directory}"
dmg_file="$(find "$artifact_dir" -type f -name '*.dmg' -print -quit)"
test -n "$dmg_file"
mount_dir="$(mktemp -d)"
app_pid=''
cleanup() {
  if [ -n "$app_pid" ]; then kill "$app_pid" 2>/dev/null || true; fi
  hdiutil detach "$mount_dir" >/dev/null 2>&1 || true
  rmdir "$mount_dir" 2>/dev/null || true
}
trap cleanup EXIT
hdiutil attach "$dmg_file" -readonly -nobrowse -mountpoint "$mount_dir"
app_dir="$(find "$mount_dir" -maxdepth 1 -name '*.app' -type d -print -quit)"
test -n "$app_dir"
codesign --verify --deep --strict --verbose=2 "$app_dir"
executable_name=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleExecutable' "$app_dir/Contents/Info.plist")
executable_path="$app_dir/Contents/MacOS/$executable_name"
architectures="$(lipo -archs "$executable_path")"
[[ "$architectures" == *arm64* && "$architectures" == *x86_64* ]]
"$executable_path" >"$RUNNER_TEMP/interstellar-launch.log" 2>&1 &
app_pid=$!
for _ in 1 2 3 4 5 6 7 8; do
  sleep 1
  if ! kill -0 "$app_pid" 2>/dev/null; then
    cat "$RUNNER_TEMP/interstellar-launch.log"
    echo 'The macOS application exited during launch.' >&2
    exit 1
  fi
done
echo "DMG mounted, ad-hoc signature verified, both architectures present, app stayed running."
echo "This is a launch smoke test; it does not certify notarization, GPU visuals or signed updates."
