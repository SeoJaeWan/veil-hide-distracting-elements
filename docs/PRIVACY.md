# Privacy Policy for Veil - Focus Mode Manager

**Last Updated:** January 18, 2026
**Version:** 1.0

## Introduction

Veil ("we") is committed to protecting your privacy. This Privacy Policy explains how Veil handles information when you use our Chrome extension.

**TL;DR:** Veil stores all data locally on your device and does not collect, transmit, or share any personal information.

---

## Information Collection and Use

### What Data We Collect

Veil stores the following data **locally on your device only**:

1. **Presets**
   - Preset names (e.g., "Study Mode", "Work Mode")
   - Lists of block element IDs included in each preset
   - Preset enabled/disabled status

2. **Block Elements (Hidden Elements)**
   - Element names (e.g., "YouTube Shorts Section")
   - CSS selectors for identifying elements to hide
   - URL patterns (site-wide, path-based, or exact page)
   - Element-specific metadata

3. **Settings**
   - Last active tab preference (Presets or Hidden Elements)
   - Extension UI state

### What Data We Do NOT Collect

- ❌ Personal information (name, email, phone number)
- ❌ Browsing history
- ❌ Visited websites
- ❌ Search queries
- ❌ Form data or input
- ❌ Cookies or tracking data
- ❌ Location data
- ❌ Any data from web pages you visit

---

## How We Use Your Data

All data collected by Veil is used **exclusively for providing the extension's functionality**:

1. **Presets**: To save and quickly switch between different hiding configurations
2. **Block Elements**: To remember which elements you want to hide on specific websites
3. **Settings**: To maintain your UI preferences and improve user experience

**No analytics, tracking, or profiling is performed.**

---

## Data Storage

### Storage Location

All data is stored in **Chrome's local storage** (`chrome.storage.local`) on your device.

- **Server Storage**: None - We do not operate any servers
- **Cloud Sync**: Not supported - Data remains on your local device only
- **Data Transmission**: None - No data is sent over the internet

### Data Security

Since all data is stored locally:

- Data is protected by Chrome's security mechanisms
- No network transmission means no interception risk
- Only accessible to the Veil extension on your device

---

## Permissions Explained

Veil requests the following permissions to function:

| Permission   | Purpose                                           | Data Access                           |
| ------------ | ------------------------------------------------- | ------------------------------------- |
| `storage`    | Store presets and hidden element settings locally | None - local storage only             |
| `activeTab`  | Access current tab to select elements for hiding  | Current tab URL and DOM structure     |
| `scripting`  | Inject CSS to hide selected elements              | None - only applies CSS rules         |
| `sidePanel`  | Display side panel UI                             | None - UI rendering only              |
| `<all_urls>` | Work on all websites as requested by user         | Current page URL for pattern matching |

**Important:**

- Veil only accesses web page content when you explicitly use the Element Picker
- No background scanning or monitoring of browsing activity
- Permissions are used strictly for advertised functionality

---

## Third-Party Services

**Veil does not integrate with any third-party services.**

- No analytics (e.g., Google Analytics)
- No crash reporting
- No advertising networks
- No external APIs

---

## Data Sharing

**Veil does not share your data with anyone.**

- No data transmission to developers
- No data selling
- No data sharing with third parties
- No cross-device synchronization

---

## User Rights

### Data Access

You can view all stored data at any time:

1. Open Chrome DevTools (F12)
2. Go to "Application" > "Storage" > "Local Storage"
3. Find "chrome-extension://[veil-id]"

### Data Deletion

You can delete all Veil data in two ways:

**Option 1: Uninstall Extension**

1. Go to `chrome://extensions`
2. Find "Veil - Focus Mode Manager"
3. Click "Remove"
4. All data is automatically deleted

**Option 2: Clear Individual Data**

1. Open Veil side panel
2. Delete individual presets and hidden elements
3. Data is removed immediately

**Option 3: Chrome Storage**

1. Right-click extension icon
2. "Manage Extension"
3. "Storage" > "Clear storage"

### Data Portability

Currently, Veil does not support data export or import. All data remains local and is not transferable between devices.

---

## Children's Privacy

Veil does not knowingly collect data from anyone, including children under 13. Since no data is transmitted or stored on servers, there is no age restriction concern.

---

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time. Changes will be reflected in:

- The "Last Updated" date at the top of this document
- The Chrome Web Store listing

Continued use of Veil after changes constitutes acceptance of the updated policy.

---

## Open Source

Veil is open source. You can review the complete source code to verify our privacy claims:

**GitHub Repository:** https://github.com/SeoJaeWan/veil-hide-distracting-elements

---

## Contact Us

If you have questions about this Privacy Policy or Veil's data practices:

- **GitHub Issues:** https://github.com/SeoJaeWan/veil-hide-distracting-elements/issues
- **Email:** sjw7324@gmail.com
- **Developer:** SeoJaeWan

---

## Compliance

### Chrome Web Store Requirements

This Privacy Policy complies with:

- Chrome Web Store Developer Program Policies
- Chrome Extension User Data Privacy Requirements
- General Data Protection Regulation (GDPR) principles

### GDPR Compliance

Although Veil does not collect personal data, we adhere to GDPR principles:

- **Lawfulness**: Data processing is necessary for extension functionality
- **Purpose Limitation**: Data used only for stated purposes
- **Data Minimization**: Only essential data is stored
- **Storage Limitation**: Data stored only as long as you use the extension
- **Integrity**: Local storage ensures data security
- **Accountability**: Open source code provides transparency

---

## Summary

✅ All data stored locally on your device
✅ No server communication
✅ No personal information collected
✅ No data sharing with third parties
✅ No tracking or analytics
✅ Open source and transparent
✅ Easy data deletion

Veil is designed with privacy as a core principle. Your browsing activity and preferences remain entirely private.

---

**Effective Date:** January 18, 2026

---

# 개인정보 보호정책 (한국어)

**최종 업데이트:** 2026년 1월 18일
**버전:** 1.0

## 소개

Veil("저희")은 귀하의 개인정보 보호를 최우선으로 생각합니다. 본 개인정보 보호정책은 Chrome 확장 프로그램 사용 시 Veil이 정보를 처리하는 방식을 설명합니다.

**요약:** Veil은 모든 데이터를 귀하의 기기에 로컬로 저장하며, 개인정보를 수집, 전송 또는 공유하지 않습니다.

---

## 정보 수집 및 사용

### 수집하는 데이터

Veil은 다음 데이터를 **귀하의 기기에만 로컬로 저장**합니다:

1. **프리셋**
   - 프리셋 이름 (예: "공부 모드", "업무 모드")
   - 각 프리셋에 포함된 숨김 요소 ID 목록
   - 프리셋 활성/비활성 상태

2. **숨김 요소**
   - 요소 이름 (예: "유튜브 쇼츠 섹션")
   - 숨길 요소를 식별하기 위한 CSS 선택자
   - URL 패턴 (사이트 전체, 경로 기반 또는 정확한 페이지)
   - 요소별 메타데이터

3. **설정**
   - 마지막으로 활성화된 탭 선호도 (프리셋 또는 숨김 요소)
   - 확장 프로그램 UI 상태

### 수집하지 않는 데이터

- ❌ 개인정보 (이름, 이메일, 전화번호)
- ❌ 브라우징 기록
- ❌ 방문한 웹사이트
- ❌ 검색어
- ❌ 폼 데이터 또는 입력
- ❌ 쿠키 또는 추적 데이터
- ❌ 위치 정보
- ❌ 방문한 웹 페이지의 모든 데이터

---

## 데이터 사용 방법

Veil이 수집하는 모든 데이터는 **오직 확장 프로그램 기능 제공을 위해서만** 사용됩니다:

1. **프리셋**: 다양한 숨김 설정을 저장하고 빠르게 전환
2. **숨김 요소**: 특정 웹사이트에서 숨기고 싶은 요소 기억
3. **설정**: UI 환경설정 유지 및 사용자 경험 개선

**분석, 추적 또는 프로파일링은 수행되지 않습니다.**

---

## 데이터 저장

### 저장 위치

모든 데이터는 귀하의 기기에 있는 **Chrome 로컬 저장소** (`chrome.storage.local`)에 저장됩니다.

- **서버 저장**: 없음 - 서버를 운영하지 않습니다
- **클라우드 동기화**: 지원 안 함 - 데이터는 로컬 기기에만 유지됩니다
- **데이터 전송**: 없음 - 인터넷을 통한 데이터 전송이 없습니다

### 데이터 보안

모든 데이터가 로컬로 저장되므로:

- Chrome의 보안 메커니즘으로 보호됩니다
- 네트워크 전송이 없어 가로채기 위험이 없습니다
- 귀하의 기기에서 Veil 확장 프로그램만 접근 가능합니다

---

## 권한 설명

Veil은 다음 권한을 요청합니다:

| 권한         | 목적                                      | 데이터 접근                      |
| ------------ | ----------------------------------------- | -------------------------------- |
| `storage`    | 프리셋 및 숨김 요소 설정을 로컬에 저장    | 없음 - 로컬 저장소만 사용        |
| `activeTab`  | 현재 탭에서 숨길 요소 선택                | 현재 탭 URL 및 DOM 구조          |
| `scripting`  | 선택한 요소를 숨기기 위한 CSS 주입        | 없음 - CSS 규칙만 적용           |
| `sidePanel`  | 사이드 패널 UI 표시                       | 없음 - UI 렌더링만               |
| `<all_urls>` | 사용자 요청에 따라 모든 웹사이트에서 작동 | 패턴 매칭을 위한 현재 페이지 URL |

**중요:**

- Veil은 귀하가 명시적으로 요소 선택 기능을 사용할 때만 웹 페이지 콘텐츠에 접근합니다
- 백그라운드 스캔 또는 브라우징 활동 모니터링 없음
- 권한은 광고된 기능을 위해서만 엄격하게 사용됩니다

---

## 제3자 서비스

**Veil은 어떠한 제3자 서비스와도 통합되지 않습니다.**

- 분석 도구 없음 (예: Google Analytics)
- 크래시 리포팅 없음
- 광고 네트워크 없음
- 외부 API 없음

---

## 데이터 공유

**Veil은 귀하의 데이터를 누구와도 공유하지 않습니다.**

- 개발자에게 데이터 전송 없음
- 데이터 판매 없음
- 제3자와 데이터 공유 없음
- 기기 간 동기화 없음

---

## 사용자 권리

### 데이터 접근

언제든지 저장된 모든 데이터를 확인할 수 있습니다:

1. Chrome DevTools 열기 (F12)
2. "Application" > "Storage" > "Local Storage"로 이동
3. "chrome-extension://[veil-id]" 찾기

### 데이터 삭제

두 가지 방법으로 모든 Veil 데이터를 삭제할 수 있습니다:

**방법 1: 확장 프로그램 제거**

1. `chrome://extensions`로 이동
2. "Veil - Focus Mode Manager" 찾기
3. "제거" 클릭
4. 모든 데이터가 자동으로 삭제됩니다

**방법 2: 개별 데이터 삭제**

1. Veil 사이드 패널 열기
2. 개별 프리셋 및 숨김 요소 삭제
3. 데이터가 즉시 제거됩니다

**방법 3: Chrome 저장소**

1. 확장 프로그램 아이콘 우클릭
2. "확장 프로그램 관리"
3. "저장소" > "저장소 지우기"

### 데이터 이동성

현재 Veil은 데이터 내보내기 또는 가져오기를 지원하지 않습니다. 모든 데이터는 로컬에 남아있으며 기기 간 전송이 불가능합니다.

---

## 아동 개인정보 보호

Veil은 13세 미만의 아동을 포함하여 누구로부터도 의도적으로 데이터를 수집하지 않습니다. 서버로 전송되거나 저장되는 데이터가 없으므로 연령 제한 우려가 없습니다.

---

## 개인정보 보호정책 변경

본 개인정보 보호정책은 때때로 업데이트될 수 있습니다. 변경 사항은 다음에 반영됩니다:

- 본 문서 상단의 "최종 업데이트" 날짜
- Chrome 웹 스토어 목록

변경 후 Veil을 계속 사용하는 것은 업데이트된 정책에 대한 동의를 의미합니다.

---

## 오픈 소스

Veil은 오픈 소스입니다. 전체 소스 코드를 검토하여 개인정보 보호 주장을 확인할 수 있습니다:

**GitHub 저장소:** https://github.com/SeoJaeWan/veil-hide-distracting-elements

---

## 문의하기

본 개인정보 보호정책 또는 Veil의 데이터 처리 방식에 대해 질문이 있으시면:

- **GitHub Issues:** https://github.com/SeoJaeWan/veil-hide-distracting-elements/issues
- **이메일:** sjw7324@gmail.com
- **개발자:** SeoJaeWan

---

## 규정 준수

### Chrome 웹 스토어 요구사항

본 개인정보 보호정책은 다음을 준수합니다:

- Chrome 웹 스토어 개발자 프로그램 정책
- Chrome 확장 프로그램 사용자 데이터 개인정보 보호 요구사항
- GDPR(일반 데이터 보호 규정) 원칙

### GDPR 준수

Veil은 개인 데이터를 수집하지 않지만 GDPR 원칙을 준수합니다:

- **합법성**: 데이터 처리는 확장 프로그램 기능에 필요합니다
- **목적 제한**: 데이터는 명시된 목적으로만 사용됩니다
- **데이터 최소화**: 필수 데이터만 저장됩니다
- **저장 제한**: 확장 프로그램 사용 기간 동안만 데이터 저장
- **무결성**: 로컬 저장소가 데이터 보안을 보장합니다
- **책임성**: 오픈 소스 코드가 투명성을 제공합니다

---

## 요약

✅ 모든 데이터는 귀하의 기기에 로컬로 저장
✅ 서버 통신 없음
✅ 개인정보 수집 없음
✅ 제3자와 데이터 공유 없음
✅ 추적 또는 분석 없음
✅ 오픈 소스 및 투명성
✅ 간편한 데이터 삭제

Veil은 개인정보 보호를 핵심 원칙으로 설계되었습니다. 귀하의 브라우징 활동과 환경설정은 완전히 비공개로 유지됩니다.

---

**시행일:** 2026년 1월 18일
