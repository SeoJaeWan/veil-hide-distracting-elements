# Chrome Web Store Build Script (PowerShell)

Write-Host "==================================" -ForegroundColor Blue
Write-Host "  Veil Extension Build Script" -ForegroundColor Blue
Write-Host "==================================" -ForegroundColor Blue
Write-Host ""

# Extract version from manifest.json
$manifestContent = Get-Content -Path "manifest.json" -Raw
$version = ($manifestContent | Select-String -Pattern '"version":\s*"([^"]+)"').Matches[0].Groups[1].Value
Write-Host "Version: " -NoNewline -ForegroundColor Green
Write-Host $version

# Build directories
$BUILD_DIR = "build"
$DIST_DIR = "dist"
$ZIP_NAME = "veil-v$version.zip"

Write-Host "Cleaning build directory..." -ForegroundColor Yellow

# Remove and create directories
if (Test-Path $BUILD_DIR) {
    Remove-Item -Path $BUILD_DIR -Recurse -Force
}
if (Test-Path $DIST_DIR) {
    Remove-Item -Path $DIST_DIR -Recurse -Force
}

New-Item -ItemType Directory -Path $BUILD_DIR -Force | Out-Null
New-Item -ItemType Directory -Path $DIST_DIR -Force | Out-Null

# Copy required files/folders
Write-Host "Copying files..." -ForegroundColor Yellow

Copy-Item -Path "assets" -Destination "$BUILD_DIR\assets" -Recurse
Copy-Item -Path "background" -Destination "$BUILD_DIR\background" -Recurse
Copy-Item -Path "content" -Destination "$BUILD_DIR\content" -Recurse
Copy-Item -Path "popup" -Destination "$BUILD_DIR\popup" -Recurse
Copy-Item -Path "shared" -Destination "$BUILD_DIR\shared" -Recurse
Copy-Item -Path "manifest.json" -Destination "$BUILD_DIR\"

# Copy optional files
if (Test-Path "README.md") {
    Copy-Item -Path "README.md" -Destination "$BUILD_DIR\"
} else {
    Write-Host "README.md not found (optional)" -ForegroundColor Gray
}

if (Test-Path "LICENSE") {
    Copy-Item -Path "LICENSE" -Destination "$BUILD_DIR\"
} else {
    Write-Host "LICENSE not found (optional)" -ForegroundColor Gray
}

if (Test-Path "docs\PRIVACY.md") {
    Copy-Item -Path "docs\PRIVACY.md" -Destination "$BUILD_DIR\"
} else {
    Write-Host "PRIVACY.md not found (recommended)" -ForegroundColor Gray
}

# Remove unwanted files
Write-Host "Removing unwanted files..." -ForegroundColor Yellow
Get-ChildItem -Path $BUILD_DIR -Include "*.test.js", "*.spec.js", ".DS_Store", "Thumbs.db" -Recurse | Remove-Item -Force
Get-ChildItem -Path $BUILD_DIR -Include "*.md" -Recurse | Where-Object {
    $_.Name -ne "README.md" -and $_.Name -ne "PRIVACY.md"
} | Remove-Item -Force

# Create ZIP file
Write-Host "Creating ZIP file..." -ForegroundColor Yellow
Compress-Archive -Path "$BUILD_DIR\*" -DestinationPath "$DIST_DIR\$ZIP_NAME" -Force

# Display file size
$fileSize = (Get-Item "$DIST_DIR\$ZIP_NAME").Length / 1MB
$fileSizeFormatted = "{0:N2} MB" -f $fileSize

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "Build Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host "File: " -NoNewline -ForegroundColor Blue
Write-Host "$DIST_DIR\$ZIP_NAME"
Write-Host "Size: " -NoNewline -ForegroundColor Blue
Write-Host $fileSizeFormatted
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Go to Chrome Web Store Developer Dashboard"
Write-Host "   https://chrome.google.com/webstore/devconsole"
Write-Host "2. Click 'New Item'"
Write-Host "3. Upload $ZIP_NAME"
Write-Host ""
