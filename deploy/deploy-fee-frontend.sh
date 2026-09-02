#!/bin/sh
set -e

SRC="/volume1/homes/jd0472/macbook_air_m1/fee-calculator-web"
DEST="/volume1/Make-App-fee/fee-calculator-web/build"

echo "=== fee 프론트 배포 시작 ==="

cd "$SRC"

echo "=== 빌드 (VITE_BASE=/) ==="
VITE_BASE=/ npm run build

echo "=== 빌드 결과 복사 ==="
mkdir -p "$DEST"
rm -rf "$DEST"/*
cp -r dist/* "$DEST"/

echo "=== 권한 설정 (nginx 읽기 가능하도록) ==="
chmod -R 755 "$DEST"

echo "=== nginx 재시작 (정적파일 즉시 반영) ==="
docker restart fee-calculator-frontend

echo "✅ 프론트 배포 완료 → http://devforin.mooo.com:3001"
