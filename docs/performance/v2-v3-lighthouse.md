# v2/v3 상품 상세 Lighthouse 비교

## 측정 목적

React SPA 기반 v2와 Next.js App Router 기반 v3의 상품 상세 페이지 초기 렌더링 성능을 비교한다.
비교 대상은 동일 Supabase 데이터와 동일 상품 상세 URL이며, v3는 상품 상세 정보를 서버 fetch와 태그 기반 캐시로 조회하고 사용자 인터랙션 영역은 클라이언트 컴포넌트로 분리한 상태다.

## 측정 환경

- 측정 일시: 2026-05-29
- 측정 도구: Chrome DevTools Lighthouse
- 측정 모드: Mobile
- 측정 횟수: 각 버전 3회
- 측정 페이지: 상품 상세 페이지
- v2 URL: `https://84-react-mvp.vercel.app/item/195834d5-ddcc-4f57-918d-92e2407f7490`
- v3 URL: `https://84-next-app-router.vercel.app/item/195834d5-ddcc-4f57-918d-92e2407f7490`

## 측정 결과

### v3 Next App Router

| 회차 | Performance | FCP | LCP | TBT | Speed Index | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 96 | 0.8s | 2.6s | 100ms | 2.1s | 0 |
| 2 | 97 | 0.8s | 2.5s | 90ms | 2.1s | 0 |
| 3 | 96 | 0.8s | 2.6s | 100ms | 2.7s | 0 |
| 평균 | 96.3 | 0.8s | 2.6s | 96.7ms | 2.3s | 0 |

### v2 React SPA

| 회차 | Performance | FCP | LCP | TBT | Speed Index | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 74 | 1.6s | 27.2s | 20ms | 2.8s | 0 |
| 2 | 74 | 1.6s | 27.3s | 20ms | 2.8s | 0 |
| 3 | 74 | 1.6s | 27.3s | 10ms | 2.8s | 0 |
| 평균 | 74.0 | 1.6s | 27.3s | 16.7ms | 2.8s | 0 |

## 비교 요약

| 지표 | v2 평균 | v3 평균 | 변화 |
| --- | ---: | ---: | ---: |
| Performance | 74.0 | 96.3 | +22.3점 |
| FCP | 1.6s | 0.8s | 약 50.0% 단축 |
| LCP | 27.3s | 2.6s | 약 90.5% 단축 |
| Speed Index | 2.8s | 2.3s | 약 17.9% 단축 |
| CLS | 0 | 0 | 동일 |
| TBT | 16.7ms | 96.7ms | 증가 |

## 해석

v3는 상품 상세 데이터를 클라이언트 렌더 이후 가져오는 방식에서 벗어나, App Router 서버 컴포넌트에서 먼저 조회하고 렌더링하도록 전환했다. 그 결과 모바일 Lighthouse 3회 평균 기준 FCP는 1.6s에서 0.8s로 약 50.0% 단축됐고, LCP는 27.3s에서 2.6s로 약 90.5% 단축됐다.

다만 TBT는 v3에서 증가했다. 이는 Next 런타임과 아직 전역에 남아 있는 클라이언트 Provider, React Query/Zustand 기반 세션 구조의 영향이 남아 있기 때문으로 본다. 따라서 현재 결과는 v3 1차 전환 기준이며, 이후 Supabase SSR auth 도입과 Provider 범위 축소 후 동일 조건으로 재측정한다.

## 후속 개선

- Supabase SSR auth를 도입해 서버 컴포넌트와 서버 액션에서 userId를 안정적으로 확인한다.
- 로그인 사용자 흐름의 전역 SessionProvider/Zustand 의존도를 줄인다.
- 상품 이미지의 `sizes`, `quality`, `priority` 정책을 정리하고 업로드 이미지 리사이징 전략을 검토한다.
- 채팅 Realtime WebSocket 연결 문제는 상품 상세 성능 측정과 분리해 별도 이슈로 추적한다.
