/**
 * Unit Tests for URL Matching 알고리즘
 *
 * 테스트 대상:
 * - matchUrlPattern() 함수
 * - site_wide, path_pattern, exact_page 패턴 매칭
 *
 * TDD Red Phase: 이 테스트들은 현재 실패해야 합니다.
 */

// =============================================================================
// matchUrlPattern() Tests - site_wide
// =============================================================================

describe('matchUrlPattern - site_wide', () => {
  test('도메인이 정확히 일치하면 true를 반환한다', () => {
    const currentUrl = 'https://example.com/page';
    const pattern = 'example.com';
    const patternType = URL_PATTERN_TYPES.SITE_WIDE;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(true);
  });

  test('서브도메인을 포함한 URL도 매칭한다', () => {
    const currentUrl = 'https://www.example.com/page';
    const pattern = 'example.com';
    const patternType = URL_PATTERN_TYPES.SITE_WIDE;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(true);
  });

  test('깊은 서브도메인도 매칭한다', () => {
    const currentUrl = 'https://api.v2.example.com/endpoint';
    const pattern = 'example.com';
    const patternType = URL_PATTERN_TYPES.SITE_WIDE;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(true);
  });

  test('다른 도메인은 매칭하지 않는다', () => {
    const currentUrl = 'https://other.com/page';
    const pattern = 'example.com';
    const patternType = URL_PATTERN_TYPES.SITE_WIDE;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(false);
  });

  test('경로가 달라도 매칭한다', () => {
    const currentUrl = 'https://example.com/any/path/here';
    const pattern = 'example.com';
    const patternType = URL_PATTERN_TYPES.SITE_WIDE;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(true);
  });

  test('쿼리 파라미터가 있어도 매칭한다', () => {
    const currentUrl = 'https://example.com/page?param=value';
    const pattern = 'example.com';
    const patternType = URL_PATTERN_TYPES.SITE_WIDE;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(true);
  });

  test('해시가 있어도 매칭한다', () => {
    const currentUrl = 'https://example.com/page#section';
    const pattern = 'example.com';
    const patternType = URL_PATTERN_TYPES.SITE_WIDE;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(true);
  });

  test('HTTP와 HTTPS 모두 매칭한다', () => {
    const pattern = 'example.com';
    const patternType = URL_PATTERN_TYPES.SITE_WIDE;

    expect(matchUrlPattern('http://example.com', pattern, patternType)).toBe(
      true
    );
    expect(matchUrlPattern('https://example.com', pattern, patternType)).toBe(
      true
    );
  });

  test('포트 번호가 있어도 매칭한다', () => {
    const currentUrl = 'https://example.com:8080/page';
    const pattern = 'example.com';
    const patternType = URL_PATTERN_TYPES.SITE_WIDE;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(true);
  });

  test('유사한 도메인은 매칭하지 않는다', () => {
    const currentUrl = 'https://examplenotcom.com/page';
    const pattern = 'example.com';
    const patternType = URL_PATTERN_TYPES.SITE_WIDE;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(false);
  });
});

// =============================================================================
// matchUrlPattern() Tests - path_pattern
// =============================================================================

describe('matchUrlPattern - path_pattern', () => {
  test('정확한 경로를 매칭한다', () => {
    const currentUrl = 'https://example.com/videos';
    const pattern = 'example.com/videos';
    const patternType = URL_PATTERN_TYPES.PATH_PATTERN;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(true);
  });

  test('와일드카드(*)로 경로 일부를 매칭한다', () => {
    const currentUrl = 'https://example.com/videos/watch/123';
    const pattern = 'example.com/videos/*';
    const patternType = URL_PATTERN_TYPES.PATH_PATTERN;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(true);
  });

  test('와일드카드가 여러 세그먼트를 매칭한다', () => {
    const currentUrl = 'https://example.com/videos/category/action/movie/123';
    const pattern = 'example.com/videos/*';
    const patternType = URL_PATTERN_TYPES.PATH_PATTERN;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(true);
  });

  test('경로가 일치하지 않으면 false를 반환한다', () => {
    const currentUrl = 'https://example.com/music';
    const pattern = 'example.com/videos/*';
    const patternType = URL_PATTERN_TYPES.PATH_PATTERN;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(false);
  });

  test('도메인이 다르면 false를 반환한다', () => {
    const currentUrl = 'https://other.com/videos';
    const pattern = 'example.com/videos';
    const patternType = URL_PATTERN_TYPES.PATH_PATTERN;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(false);
  });

  test('쿼리 파라미터는 무시한다', () => {
    const currentUrl = 'https://example.com/videos/watch?id=123';
    const pattern = 'example.com/videos/*';
    const patternType = URL_PATTERN_TYPES.PATH_PATTERN;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(true);
  });

  test('해시는 무시한다', () => {
    const currentUrl = 'https://example.com/videos/watch#comments';
    const pattern = 'example.com/videos/*';
    const patternType = URL_PATTERN_TYPES.PATH_PATTERN;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(true);
  });

  test('여러 개의 와일드카드를 사용할 수 있다', () => {
    const currentUrl = 'https://example.com/videos/123/comments/456';
    const pattern = 'example.com/videos/*/comments/*';
    const patternType = URL_PATTERN_TYPES.PATH_PATTERN;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(true);
  });

  test('패턴에 프로토콜이 포함되어도 동작한다', () => {
    const currentUrl = 'https://example.com/videos/watch';
    const pattern = 'https://example.com/videos/*';
    const patternType = URL_PATTERN_TYPES.PATH_PATTERN;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(true);
  });

  test('서브도메인이 다르면 매칭하지 않는다', () => {
    const currentUrl = 'https://www.example.com/videos';
    const pattern = 'example.com/videos';
    const patternType = URL_PATTERN_TYPES.PATH_PATTERN;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(false);
  });

  test('루트 경로도 매칭한다', () => {
    const currentUrl = 'https://example.com/';
    const pattern = 'example.com/';
    const patternType = URL_PATTERN_TYPES.PATH_PATTERN;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(true);
  });
});

// =============================================================================
// matchUrlPattern() Tests - exact_page
// =============================================================================

describe('matchUrlPattern - exact_page', () => {
  test('정확히 일치하는 URL을 매칭한다', () => {
    const currentUrl = 'https://example.com/specific-page';
    const pattern = 'https://example.com/specific-page';
    const patternType = URL_PATTERN_TYPES.EXACT_PAGE;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(true);
  });

  test('경로가 조금이라도 다르면 매칭하지 않는다', () => {
    const currentUrl = 'https://example.com/specific-page/subpage';
    const pattern = 'https://example.com/specific-page';
    const patternType = URL_PATTERN_TYPES.EXACT_PAGE;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(false);
  });

  test('쿼리 파라미터가 다르면 매칭하지 않는다', () => {
    const currentUrl = 'https://example.com/page?param=value';
    const pattern = 'https://example.com/page';
    const patternType = URL_PATTERN_TYPES.EXACT_PAGE;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(false);
  });

  test('해시가 다르면 매칭하지 않는다', () => {
    const currentUrl = 'https://example.com/page#section';
    const pattern = 'https://example.com/page';
    const patternType = URL_PATTERN_TYPES.EXACT_PAGE;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(false);
  });

  test('프로토콜이 다르면 매칭하지 않는다', () => {
    const currentUrl = 'http://example.com/page';
    const pattern = 'https://example.com/page';
    const patternType = URL_PATTERN_TYPES.EXACT_PAGE;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(false);
  });

  test('서브도메인이 다르면 매칭하지 않는다', () => {
    const currentUrl = 'https://www.example.com/page';
    const pattern = 'https://example.com/page';
    const patternType = URL_PATTERN_TYPES.EXACT_PAGE;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(false);
  });

  test('대소문자를 구분한다', () => {
    const currentUrl = 'https://example.com/Page';
    const pattern = 'https://example.com/page';
    const patternType = URL_PATTERN_TYPES.EXACT_PAGE;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(false);
  });

  test('포트가 다르면 매칭하지 않는다', () => {
    const currentUrl = 'https://example.com:8080/page';
    const pattern = 'https://example.com/page';
    const patternType = URL_PATTERN_TYPES.EXACT_PAGE;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(false);
  });

  test('trailing slash 차이도 구분한다', () => {
    const currentUrl = 'https://example.com/page/';
    const pattern = 'https://example.com/page';
    const patternType = URL_PATTERN_TYPES.EXACT_PAGE;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(false);
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe('matchUrlPattern - Edge Cases', () => {
  test('잘못된 패턴 타입은 false를 반환한다', () => {
    const currentUrl = 'https://example.com/page';
    const pattern = 'example.com';
    const patternType = 'invalid_type';

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(false);
  });

  test('잘못된 URL 형식은 에러를 발생시킨다', () => {
    const currentUrl = 'not-a-valid-url';
    const pattern = 'example.com';
    const patternType = URL_PATTERN_TYPES.SITE_WIDE;

    expect(() => matchUrlPattern(currentUrl, pattern, patternType)).toThrow();
  });

  test('빈 URL은 false를 반환한다', () => {
    const currentUrl = '';
    const pattern = 'example.com';
    const patternType = URL_PATTERN_TYPES.SITE_WIDE;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(false);
  });

  test('빈 패턴은 false를 반환한다', () => {
    const currentUrl = 'https://example.com';
    const pattern = '';
    const patternType = URL_PATTERN_TYPES.SITE_WIDE;

    const result = matchUrlPattern(currentUrl, pattern, patternType);

    expect(result).toBe(false);
  });

  test('null URL은 에러를 발생시킨다', () => {
    const currentUrl = null;
    const pattern = 'example.com';
    const patternType = URL_PATTERN_TYPES.SITE_WIDE;

    expect(() => matchUrlPattern(currentUrl, pattern, patternType)).toThrow();
  });

  test('undefined 패턴은 에러를 발생시킨다', () => {
    const currentUrl = 'https://example.com';
    const pattern = undefined;
    const patternType = URL_PATTERN_TYPES.SITE_WIDE;

    expect(() => matchUrlPattern(currentUrl, pattern, patternType)).toThrow();
  });
});

// =============================================================================
// 실제 사용 시나리오 Tests
// =============================================================================

describe('matchUrlPattern - 실제 사용 시나리오', () => {
  test('YouTube 전체에서 Shorts 숨기기', () => {
    const pattern = 'youtube.com';
    const patternType = URL_PATTERN_TYPES.SITE_WIDE;

    expect(
      matchUrlPattern('https://www.youtube.com/', pattern, patternType)
    ).toBe(true);
    expect(
      matchUrlPattern('https://www.youtube.com/watch?v=123', pattern, patternType)
    ).toBe(true);
    expect(
      matchUrlPattern('https://m.youtube.com/watch', pattern, patternType)
    ).toBe(true);
  });

  test('YouTube 시청 페이지에서만 추천 영상 숨기기', () => {
    const pattern = 'youtube.com/watch*';
    const patternType = URL_PATTERN_TYPES.PATH_PATTERN;

    expect(
      matchUrlPattern(
        'https://www.youtube.com/watch?v=123',
        pattern,
        patternType
      )
    ).toBe(true);
    expect(
      matchUrlPattern('https://www.youtube.com/', pattern, patternType)
    ).toBe(false);
    expect(
      matchUrlPattern(
        'https://www.youtube.com/playlist?list=123',
        pattern,
        patternType
      )
    ).toBe(false);
  });

  test('특정 뉴스 기사 페이지에서만 광고 숨기기', () => {
    const pattern = 'https://news.example.com/article/2025/01/breaking-news';
    const patternType = URL_PATTERN_TYPES.EXACT_PAGE;

    expect(
      matchUrlPattern(
        'https://news.example.com/article/2025/01/breaking-news',
        pattern,
        patternType
      )
    ).toBe(true);
    expect(
      matchUrlPattern(
        'https://news.example.com/article/2025/01/other-news',
        pattern,
        patternType
      )
    ).toBe(false);
  });

  test('GitHub 저장소 페이지에서만 특정 요소 숨기기', () => {
    const pattern = 'github.com/*/issues';
    const patternType = URL_PATTERN_TYPES.PATH_PATTERN;

    expect(
      matchUrlPattern(
        'https://github.com/user/repo/issues',
        pattern,
        patternType
      )
    ).toBe(true);
    expect(
      matchUrlPattern(
        'https://github.com/user/repo/issues/123',
        pattern,
        patternType
      )
    ).toBe(true);
    expect(
      matchUrlPattern(
        'https://github.com/user/repo/pulls',
        pattern,
        patternType
      )
    ).toBe(false);
  });

  test('여러 서브도메인을 포함하는 site_wide 패턴', () => {
    const pattern = 'google.com';
    const patternType = URL_PATTERN_TYPES.SITE_WIDE;

    expect(
      matchUrlPattern('https://www.google.com/search', pattern, patternType)
    ).toBe(true);
    expect(
      matchUrlPattern('https://mail.google.com/inbox', pattern, patternType)
    ).toBe(true);
    expect(
      matchUrlPattern('https://drive.google.com/file/123', pattern, patternType)
    ).toBe(true);
    expect(
      matchUrlPattern('https://docs.google.com/document/123', pattern, patternType)
    ).toBe(true);
  });
});
