#!/bin/bash
# Chrome Web Store 배포용 ZIP 파일 생성 스크립트

set -e

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}  Veil Extension Build Script${NC}"
echo -e "${BLUE}==================================${NC}"
echo ""

# manifest.json에서 버전 추출
VERSION=$(grep -o '"version": "[^"]*' manifest.json | grep -o '[^"]*$')
echo -e "${GREEN}버전:${NC} $VERSION"

# 빌드 디렉토리 생성
BUILD_DIR="build"
DIST_DIR="dist"
ZIP_NAME="veil-v${VERSION}.zip"

echo -e "${YELLOW}빌드 디렉토리 정리 중...${NC}"
rm -rf "$BUILD_DIR"
rm -rf "$DIST_DIR"
mkdir -p "$BUILD_DIR"
mkdir -p "$DIST_DIR"

# 필요한 파일/폴더 복사
echo -e "${YELLOW}파일 복사 중...${NC}"

# 폴더 복사
cp -r assets "$BUILD_DIR/"
cp -r background "$BUILD_DIR/"
cp -r content "$BUILD_DIR/"
cp -r popup "$BUILD_DIR/"
cp -r shared "$BUILD_DIR/"

# manifest.json 복사
cp manifest.json "$BUILD_DIR/"

# 선택적 파일 복사 (있으면)
[ -f "README.md" ] && cp README.md "$BUILD_DIR/" || echo "README.md 없음 (선택사항)"
[ -f "LICENSE" ] && cp LICENSE "$BUILD_DIR/" || echo "LICENSE 없음 (선택사항)"
[ -f "docs/PRIVACY.md" ] && cp docs/PRIVACY.md "$BUILD_DIR/" || echo "PRIVACY.md 없음 (권장)"

# 불필요한 파일 제거
echo -e "${YELLOW}불필요한 파일 제거 중...${NC}"
find "$BUILD_DIR" -name "*.test.js" -delete
find "$BUILD_DIR" -name "*.spec.js" -delete
find "$BUILD_DIR" -name ".DS_Store" -delete
find "$BUILD_DIR" -name "Thumbs.db" -delete
find "$BUILD_DIR" -name "*.md" ! -name "README.md" ! -name "PRIVACY.md" -delete

# ZIP 파일 생성
echo -e "${YELLOW}ZIP 파일 생성 중...${NC}"
cd "$BUILD_DIR"
zip -r "../$DIST_DIR/$ZIP_NAME" . -q
cd ..

# 파일 크기 확인
FILE_SIZE=$(du -h "$DIST_DIR/$ZIP_NAME" | cut -f1)

echo ""
echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}✓ 빌드 완료!${NC}"
echo -e "${GREEN}==================================${NC}"
echo -e "${BLUE}파일:${NC} $DIST_DIR/$ZIP_NAME"
echo -e "${BLUE}크기:${NC} $FILE_SIZE"
echo ""
echo -e "${YELLOW}다음 단계:${NC}"
echo "1. Chrome Web Store Developer Dashboard 접속"
echo "   https://chrome.google.com/webstore/devconsole"
echo "2. 'New Item' 클릭"
echo "3. $ZIP_NAME 파일 업로드"
echo ""

# 빌드 디렉토리 정리 (선택사항)
# rm -rf "$BUILD_DIR"
