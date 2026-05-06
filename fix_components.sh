#!/bin/bash
echo "コンポーネントを修正中..."

# 各ファイルをPythonで書き出す
python3 << 'PYEOF'
import os

files = {}

files['components/MainScreen.tsx'] = open('components/MainScreen.tsx').read() if os.path.exists('components/MainScreen.tsx') else ''

print("現在のMainScreen.tsxの行数:", len(files['components/MainScreen.tsx'].splitlines()))
PYEOF

echo "完了"
