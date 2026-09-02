#!/bin/sh
set -e

JAR_SRC="/volume1/homes/jd0472/macbook_air_m1/fee-calculator-api/build/libs/fee-calculator-api-0.0.1.jar"
JAR_DEST="/volume1/Make-App-fee/fee-calculator-api-0.0.1.jar"

echo "=== fee 백엔드 배포 시작 ==="

if [ ! -f "$JAR_SRC" ]; then
  echo "❌ jar 파일이 없습니다: $JAR_SRC"
  echo "   맥북에서 ./gradlew bootJar 먼저 실행해주세요"
  exit 1
fi

echo "=== jar 복사 ==="
cp "$JAR_SRC" "$JAR_DEST"
chmod 755 "$JAR_DEST"

echo "=== 컨테이너 재시작 ==="
docker restart fee-calculator-app

echo "=== 기동 대기 ==="
for i in $(seq 1 40); do
  if docker logs fee-calculator-app 2>&1 | tail -8 | grep -q "Started FeeCalculatorApplication"; then
    echo "✅ 백엔드 정상 기동 완료 (${i}초) → http://devforin.mooo.com:3001"
    exit 0
  fi
  sleep 1
done
echo "⚠️  40초 내 기동 확인 실패. 로그 확인: docker logs fee-calculator-app --tail 30"
