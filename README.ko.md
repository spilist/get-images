# Image Scraper - 빠른 다중 소스 이미지 검색

여러 소스에서 이미지를 검색하고 수집할 수 있는 현대적이고 지능적인 웹 애플리케이션입니다. 자동 API 키 로테이션, 스마트 이미지 검증, 이중 검색 기능과 같은 고급 기능을 제공합니다. Next.js 15, TypeScript, shadcn/ui 컴포넌트로 구축되었으며, 포괄적인 이미지 검색 워크플로우를 위한 웹 인터페이스와 CLI 도구를 모두 제공합니다.

*[English version available](README.md)*

## 🤖 이 프로젝트에 대해

이 프로젝트는 고급 의미 분석 기능을 갖춘 AI 코딩 에이전트를 사용하여 개발되었습니다. 향상된 개발 생산성을 위해 두 개의 강력한 Model Context Protocol (MCP) 서버를 활용합니다:

- **[ShadCN UI v4 MCP](https://github.com/Jpisnice/shadcn-ui-mcp-server)** - shadcn/ui 컴포넌트 라이브러리와의 원활한 통합을 제공하여 일관된 디자인 패턴으로 신속한 UI 개발을 가능하게 합니다. Claude Code를 사용하는 경우 `@agent-shadcn-ui-builder`를 사용하여 UI 컴포넌트를 수정할 수 있습니다.
- **[Serena MCP](https://github.com/oraios/serena)** - TypeScript/JavaScript 프로젝트를 위한 고급 의미 코드 분석 및 지능적 편집 기능

### 도구에 대해 더 자세히 알아보기

Serena MCP를 효과적으로 사용하는 데 관심이 있는 개발자들을 위해 이 포괄적인 가이드를 추천합니다: [Serena MCP 개요와 설치, Claude Code 통합](https://hansdev.kr/tech/serena-mcp/) - Serena의 의미 분석 기능으로 생산성을 최대화하는 방법을 설명하는 자세한 블로그 포스트입니다.

## ✨ 주요 기능

- **다중 키워드 이미지 검색**: 여러 키워드를 동시에 검색
- **이중 API 지원**: 웹 인터페이스 (SERPAPI) + CLI 도구 (DuckDuckGo)
- **지능적 캐싱**: 24시간 인메모리 캐시로 API 호출 감소 및 성능 향상
- **유연한 API 키 관리**: 제공된 키 사용 또는 자체 키 구성
- **스마트 이미지 검증**: 손상된 이미지에 대한 자동 대체
- **반응형 디자인**: 데스크톱 및 모바일 기기에서 작동
- **내보내기 기능**: 외부 사용을 위한 결과 복사

## 🚀 빠른 시작

### 웹 애플리케이션

1. **저장소 복제**:
   ```bash
   git clone https://github.com/spilist/image-scraper.git
   cd image-scraper
   ```

2. **의존성 설치**:
   ```bash
   pnpm install
   ```

3. **즉시 시작** (기본 SERPAPI 키 사용):
   ```bash
   pnpm dev
   ```

4. **브라우저에서 열기**: [http://localhost:3000](http://localhost:3000)에서 확인

테스트용 SERPAPI 키를 구성하세요.

### CLI 스크립트

배치 처리 또는 오프라인 사용을 위해:

1. **Python 의존성 설치**:
   ```bash
   pip install -r requirements.txt
   ```

2. **CLI 스크립트 실행**:
   ```bash
   python scripts/scraper.py
   ```

CLI는 DuckDuckGo 검색을 사용합니다 (API 키 불필요).

## ⚙️ 구성

### 자신만의 SERPAPI 키 사용

자신만의 API 키를 얻는 방법:

1. **SERPAPI 가입**: [https://serpapi.com/manage-api-key](https://serpapi.com/manage-api-key)에서 가입
2. **API 키 복사**
3. **앱에서 구성**: 설정 UI를 사용하여 키 입력
4. **또는 환경 변수 설정**:
   ```bash
   SERPAPI_KEY=your_api_key_here pnpm dev
   ```

### 환경 변수

```bash
# 기본 기능을 위한 주 SERPAPI 키
SERPAPI_KEY=your_primary_serpapi_key_here

# 보조 SERPAPI 키 (선택사항, 자동 로테이션 활성화)
SERPAPI_KEY2=your_secondary_serpapi_key_here
```

**API 키 로테이션**: `SERPAPI_KEY`와 `SERPAPI_KEY2`가 모두 구성되면, 애플리케이션은 로드 밸런싱과 속도 제한 분산을 위해 자동으로 이들 간에 로테이션됩니다. 이는 과도한 사용 중 단일 키의 API 제한에 도달하는 것을 방지하는 데 도움이 됩니다.

## ⚡ 성능 및 캐싱

### 지능적 캐싱 시스템

애플리케이션은 성능을 크게 향상시키고 API 비용을 절감하는 고급 인메모리 캐싱 시스템을 제공합니다:

**주요 장점:**
- **즉시 결과**: 캐시된 검색은 10ms 미만으로 반환
- **비용 절감**: 반복 검색에 대한 중복 API 호출 제거
- **향상된 경험**: 이전에 검색한 쿼리에 대한 대기 시간 없음
- **속도 제한 보호**: API 사용량 감소로 제한 도달 방지

**작동 방식:**
- **24시간 캐시**: 검색 결과가 24시간 동안 캐시됨
- **스마트 키**: 캐시가 쿼리, 결과 수, API 키를 고려
- **자동 정리**: 만료된 항목이 자동으로 제거됨
- **메모리 효율성**: 메모리 문제 방지를 위한 캐시 크기 제한

**캐시 성능:**
- 캐시 히트가 모니터링을 위해 콘솔에 기록됨
- 캐싱이 실패해도 API 기능에 영향 없음
- API 키 로테이션과 원활하게 작동

이는 "김치찌개"나 "삼계탕" 같은 인기 검색어가 첫 검색 이후 즉시 로드되어 시간과 API 비용을 모두 절약함을 의미합니다!

## 🛠️ 개발

```bash
# 핫 리로드가 있는 개발 서버
pnpm dev

# 프로덕션용 빌드
pnpm build

# 프로덕션 서버 시작
pnpm start

# 코드 린트
pnpm lint
```

## 📁 프로젝트 구조

```
image-scraper-web/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/scraper/     # API 엔드포인트 (SERPAPI)
│   │   ├── page.tsx         # 메인 애플리케이션 페이지
│   │   └── layout.tsx       # 루트 레이아웃
│   ├── components/ui/       # shadcn/ui 컴포넌트
│   ├── lib/                 # 유틸리티
│   └── types/               # TypeScript 정의
├── scripts/
│   └── scraper.py          # CLI 스크립트 (DuckDuckGo)
├── requirements.txt        # Python 의존성
└── package.json           # Node.js 의존성
```

## 🔧 API 사용법

### 웹 API 엔드포인트: `/api/scraper`

**단일 키워드 검색**:
```javascript
const response = await fetch('/api/scraper', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "삼계탕",
    max_results: 5
  })
});
```

**다중 키워드 검색**:
```javascript
const response = await fetch('/api/scraper', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'X-API-Key': 'your_serpapi_key' // 선택사항: 기본 키 오버라이드
  },
  body: JSON.stringify({
    keywords: ["삼계탕", "김치찌개", "된장찌개"],
    max_keywords: 10,
    max_results_per_keyword: 3
  })
});
```

## 🚀 배포

### Vercel (권장)

1. **저장소를 Vercel에 연결**
2. **환경 변수 설정**:
   - `SERPAPI_KEY`: 기본 SERPAPI 키
3. **배포**: 푸시 시 자동 배포

### 다른 플랫폼

이 앱은 표준 Next.js 애플리케이션으로 Node.js를 지원하는 모든 플랫폼에 배포할 수 있습니다.

## 🤝 기여하기

1. 저장소 포크
2. 기능 브랜치 생성: `git checkout -b feature-name`
3. 변경사항 적용
4. 철저히 테스트
5. 풀 리퀘스트 제출

## 📄 라이선스

이 프로젝트는 오픈소스이며 [MIT 라이선스](LICENSE) 하에 제공됩니다.

## ☕ 이 프로젝트 지원하기

이 프로젝트가 도움이 되었다면 개발을 지원해 주세요:

**[☕ 커피 한 잔 사주기](https://coff.ee/steady.study.dev)**

제작자: [배휘동](https://stdy.blog)

## 🆘 도움말 및 문서

- **이슈**: GitHub Issues를 통해 버그 신고 또는 기능 요청
- **문서**: 개발 가이드라인은 `CLAUDE.md`를 확인하세요
- **API 문서**: API 세부사항은 [SERPAPI 문서](https://serpapi.com/search-api)를 참조하세요