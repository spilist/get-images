# GetImages - 다중 소스 이미지 검색 도구

여러 소스에서 이미지를 검색하고 수집할 수 있는 현대적이고 지능적인 웹 애플리케이션입니다. API 키 로테이션, 스마트 캐싱, 이중 검색 옵션과 같은 고급 기능으로 포괄적인 이미지 검색 워크플로우를 제공합니다.

🌐 **라이브 데모**: [get-images.effectiveai.io](https://get-images.effectiveai.io)  
📚 *[English version available](README.md)*

---

## ✨ 주요 기능

- **다중 키워드 검색**: 여러 키워드를 동시에 검색
- **이중 API 지원**: 웹 인터페이스 (SERPAPI) + CLI 도구 (DuckDuckGo)
- **스마트 캐싱**: 24시간 캐시 시스템으로 비용 절감 및 속도 향상
- **유연한 API 키**: 기본 키 사용 또는 개인 키 설정
- **반응형 디자인**: 데스크톱 및 모바일 최적화
- **내보내기 기능**: 결과 복사/내보내기 간편

---

## 🚀 빠른 시작

### 옵션 1: 웹 애플리케이션 (권장)

```bash
# 복제 및 설치
git clone https://github.com/spilist/get-images.git
cd get-images
pnpm install

# 개발 서버 시작 (기본 SERPAPI 키 사용)
pnpm dev

# http://localhost:3000 열기
```

### 옵션 2: CLI 스크립트 (API 키 불필요)

```bash
# Python 의존성 설치
pip install -r requirements.txt

# 원하는대로 scripts/keywords.txt 수정

# CLI 스크립트 실행
python scripts/scraper.py
```

> **⚠️ 중요**: CLI 스크립트는 이미지 사용 권리에 대한 면책 고지를 표시합니다. 이 도구로 찾은 이미지를 사용하기 전에 저작권 허가 및 라이선스를 확인하는 것은 사용자의 책임입니다. 또한 핫링킹 방지로 인해 많은 이미지 링크가 원본 웹사이트 외부에서 작동하지 않을 수 있으므로 목표 환경에서 각 링크를 반드시 테스트하세요.

---

## ⚙️ 구성

### SERPAPI 설정 (웹 인터페이스)

1. **API 키 획득**: [serpapi.com/manage-api-key](https://serpapi.com/manage-api-key)에서 가입
2. **앱에서 구성**: 설정 UI를 사용하여 키 입력
3. **또는 환경 변수 설정**:
   ```bash
   SERPAPI_KEY=your_primary_key_here
   SERPAPI_KEY2=your_secondary_key_here  # 선택사항: 자동 로테이션 활성화
   ```

**API 키 로테이션**: 여러 키를 설정하여 자동 로드 밸런싱 및 속도 제한 분산이 가능합니다.

### 검색 엔진 옵션

GetImages는 각각 다른 용도에 최적화된 두 가지 검색 엔진 모드를 지원합니다:

| 엔진 | 속도 | 이미지 품질 | 사용 용도 |
|------|------|------------|----------|
| **Google Images Light** | ⚡ 빠름 | 📱 썸네일 | 빠른 미리보기, 콘텐츠 발견 |
| **Google Images Full** (기본값) | 🐌 느림 | 🖼️ 전체 해상도 | 프로덕션 사용, 고품질 필요 |

**설정 방법**: 설정 → 검색 옵션 → 검색 엔진에서 변경

### 고급 필터 옵션

이미지 필터(라이선스, 크기, 유형 등)에 대한 자세한 정보는 다음을 참조하세요:
[SERPAPI Google Images API 문서](https://serpapi.com/google-images-api)

---

## ⚡ 성능 기능

### 지능적 캐싱 시스템

고급 캐싱 시스템이 제공하는 성능 향상:

| 기능 | 장점 |
|------|------|
| **즉시 결과** | 캐시된 검색은 10ms 미만으로 반환 |
| **비용 절감** | 중복 API 호출 제거 |
| **속도 제한 보호** | API 사용량 감소 |
| **스마트 키** | 쿼리 + 결과 수 + API 키 고려 |

**예시**: "김치찌개" 같은 인기 검색어는 첫 검색 후 즉시 로드!

---

## 🛠️ 개발

```bash
# 핫 리로드 개발 서버
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버
pnpm start

# 코드 린팅
pnpm lint
```

### 프로젝트 구조

```
get-images/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/scraper/     # API 엔드포인트 (SERPAPI)
│   │   └── page.tsx         # 메인 애플리케이션
│   ├── components/ui/       # shadcn/ui 컴포넌트
│   ├── lib/                 # 유틸리티 & 캐싱
│   └── hooks/               # React 훅
├── scripts/
│   └── scraper.py          # CLI 스크립트 (DuckDuckGo)
└── requirements.txt        # Python 의존성
```

---

## 🔧 API 사용법

### 웹 API 엔드포인트: `/api/scraper`

**단일 키워드 검색:**
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

**다중 키워드 검색:**
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

---

## 🚀 배포

### Vercel (권장)

1. 저장소를 Vercel에 연결
2. 환경 변수 설정:
   - `SERPAPI_KEY`: 기본 SERPAPI 키
   - `SERPAPI_KEY2`: 선택적 보조 키
3. 푸시 시 자동 배포

### 다른 플랫폼

표준 Next.js 애플리케이션 - Node.js 호스팅 플랫폼과 호환됩니다.

---

## 🤖 AI 개발

이 프로젝트는 의미 분석 기능을 갖춘 고급 AI 코딩 에이전트를 활용합니다:

- **[ShadCN UI v4 MCP](https://github.com/Jpisnice/shadcn-ui-mcp-server)** - 일관된 디자인 패턴으로 신속한 UI 개발
- **[Serena MCP](https://github.com/oraios/serena)** - TypeScript/JavaScript용 고급 의미 코드 분석

**더 알아보기**: [Serena MCP 가이드](https://hansdev.kr/tech/serena-mcp/) - 의미 분석으로 생산성을 극대화하는 포괄적인 블로그 포스트.

---

## ⚠️ 이미지 사용 면책 고지

**중요**: 이 도구는 참조 목적으로만 이미지 링크를 제공합니다. 사용자는 다음 사항에 대해 책임이 있습니다:

- ✅ **저작권 확인**: 이미지 라이선스 및 허가 사항 확인
- ✅ **출처 약관**: 원본 웹사이트의 이용 약관 검토
- ✅ **사용 권리**: 원본 컨텍스트 외부에서 이미지 사용 가능 여부 확인
- ✅ **상업적 사용**: 상업적 활용을 위한 적절한 라이선스 확보

### 🔗 기술적 제한사항

**이미지 링크 접근성**: 많은 이미지 링크가 원본 웹사이트 외부에서 작동하지 않을 수 있습니다:
- **핫링킹 보호**: 웹사이트에서 외부 도메인의 직접 이미지 접근을 차단
- **리퍼러 체크**: 원본 웹사이트에서만 이미지가 로드되도록 제한
- **인증 요구사항**: 일부 이미지는 로그인이나 특별한 접근 권한 필요

**해결책**: 각 이미지 링크를 목표 환경에서 반드시 테스트하세요. 안정적인 사용을 위해서는 직접 링크 사용보다는 이미지를 다운로드하여 직접 호스팅하는 것이 좋습니다.

**모범 사례**:
- 의문이 있을 때는 항상 이미지 소유자에게 문의
- 크리에이티브 커먼즈 또는 로열티 프리 이미지 사용 고려
- 필요시 출처 표기
- 사용 허가 기록 보관

이 도구는 발견된 이미지를 사용할 수 있는 권리를 부여하지 않습니다. 모든 저작권 및 지적 재산권은 각각의 소유자에게 있습니다.

---

## 🤝 기여하기

1. 저장소 포크
2. 기능 브랜치 생성: `git checkout -b feature-name`
3. 변경사항 작성 및 철저한 테스트
4. 풀 리퀘스트 제출

---

## 📄 라이선스

[MIT 라이선스](LICENSE) 하의 오픈소스.

---

## 💝 지원

이 프로젝트가 도움이 되셨나요? 개발을 지원해 주세요:

**[☕ 커피 한 잔 사주기](https://coff.ee/steady.study.dev)**

제작자: [배휘동](https://stdy.blog)

---

## 📚 리소스

- **이슈 및 기능**: [GitHub Issues](https://github.com/spilist/get-images/issues)
- **개발 가이드**: 가이드라인은 `CLAUDE.md` 확인
- **API 문서**: [SERPAPI 문서](https://serpapi.com/search-api)