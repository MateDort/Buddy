#!/bin/bash
# Signs the debug binary with microphone entitlement so recording works in dev mode.
# Run this AFTER `npm run tauri dev` has finished its first build.
# Usage: npm run setup-mic

BINARY="src-tauri/target/debug/buddy2"
ENTITLEMENTS="src-tauri/entitlements.plist"

if [ ! -f "$BINARY" ]; then
  echo "❌  Binary not found at $BINARY"
  echo "    Run 'npm run tauri dev' first to build, then run this script."
  exit 1
fi

echo "🔐  Signing $BINARY with microphone entitlement..."
codesign --force --sign - --entitlements "$ENTITLEMENTS" "$BINARY"

if [ $? -eq 0 ]; then
  echo "✅  Done! Restart 'npm run tauri dev' — microphone should now work."
else
  echo "❌  codesign failed. Make sure Xcode Command Line Tools are installed:"
  echo "    xcode-select --install"
fi
