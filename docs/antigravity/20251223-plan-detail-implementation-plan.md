# 지도 장소 클릭 시 플랜에 추가 기능 구현

플랜 목록 페이지에서 특정 플랜 카드를 클릭하면 상세 페이지(`/plans/:planId`)로 이동하여 해당 플랜의 상세 정보를 조회 및 표시하는 기능을 구현합니다.

## 현재 상태 분석

기존 코드를 분석한 결과, **요청하신 기능이 이미 구현되어 있습니다**:

### ✅ 이미 구현된 부분

1. **API 계층** ([planApi.ts](file:///Users/sungjinkim/IdeaProjects/anti/client/src/api/plan/planApi.ts#L30-L33))
   - `getPlanDetail(planId: number)` 메서드 존재
   - `GET /plans/${planId}` 엔드포인트 호출
   - `HttpClient` (withCredentials) 사용
   - `handleUnauthorized` 에러 처리 포함

2. **타입 정의** ([types.ts](file:///Users/sungjinkim/IdeaProjects/anti/client/src/api/plan/types.ts#L21-L30))
   - `Plan` 인터페이스 정의됨
   - `PlanSpot` 인터페이스 정의됨
   - 필요한 모든 필드 포함 (id, title, description, theme, totalBudget, spots, etc.)

3. **목록 페이지 클릭 동작** ([PlansListPage.vue](file:///Users/sungjinkim/IdeaProjects/anti/client/src/views/PlansListPage.vue#L54-L56))
   - 플랜 카드에 `@click` 핸들러 연결됨
   - `navigateToPlanDetail(plan.planId!)` 메서드로 라우팅
   - `router.push(\`/plans/${planId}\`)` 구현됨

4. **상세 페이지** ([PlanDetailPage.vue](file:///Users/sungjinkim/IdeaProjects/anti/client/src/views/PlanDetailPage.vue))
   - `useRoute()`로 planId 파라미터 추출
   - `onMounted`에서 `loadPlanDetail()` 호출
   - 로딩/에러/성공 상태 UI 구현
   - spots sequence 기준 정렬 표시
   - 제목, 설명, 테마, 예산, 장소 목록 렌더링

5. **라우터 설정** ([router/index.ts](file:///Users/sungjinkim/IdeaProjects/anti/client/src/router/index.ts#L48-L51))
   - `/plans/:planId` 경로 등록됨
   - `PlanDetail` 라우트 이름 지정됨

### ⚠️ 누락된 부분

**Route 파라미터 변경 감지**: 같은 컴포넌트에서 `planId`만 변경되는 경우 재호출이 필요합니다.

현재 `PlanDetailPage.vue`는 `onMounted`에서만 데이터를 로드하므로, 예를 들어 `/plans/1`에서 `/plans/2`로 이동할 때 컴포넌트가 재마운트되지 않으면 데이터가 업데이트되지 않습니다.

## 제안 변경 사항

### [MODIFY] [PlanDetailPage.vue](file:///Users/sungjinkim/IdeaProjects/anti/client/src/views/PlanDetailPage.vue)

**변경 내용**: route 파라미터 변경 시 데이터 재로드를 위한 `watch` 추가

```typescript
import { ref, onMounted, computed, watch } from 'vue'

// ... 기존 코드 ...

// route 파라미터 변경 감지
watch(
  () => route.params.planId,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      loadPlanDetail()
    }
  },
)
```

**이유**:

- 사용자가 상세 페이지에서 다른 플랜으로 직접 이동하는 경우 대비
- Vue Router는 같은 컴포넌트 간 이동 시 컴포넌트를 재마운트하지 않음
- 파라미터 변경을 감지하여 새 데이터를 fetch해야 함

## Verification Plan

### 1. 브라우저 테스트

개발 서버가 이미 실행 중이므로 다음 단계로 검증:

1. **플랜 목록 페이지 접속**

   ```
   http://localhost:5173/plans
   ```

2. **플랜 카드 클릭**
   - 플랜 목록에서 임의의 플랜 카드 클릭
   - URL이 `/plans/{planId}`로 변경되는지 확인

3. **네트워크 요청 확인**
   - 브라우저 개발자 도구 > Network 탭
   - `GET http://localhost:8888/api/plans/{id}` 요청 확인
   - 상태 코드 200 확인
   - 응답 본문에 plan 데이터 포함 확인

4. **UI 렌더링 확인**
   - 플랜 제목, 설명, 테마, 예산 표시 확인
   - spots 목록이 sequence 순으로 정렬되어 표시되는지 확인
   - 각 spot의 장소명, 주소, 메모 표시 확인

5. **에러 처리 확인**
   - 존재하지 않는 planId로 접속 (`/plans/99999`)
   - 에러 메시지 표시 확인
   - 인증 만료 시 로그인 페이지로 리다이렉트 확인 (기존 `handleUnauthorized` 동작)

6. **Route 파라미터 변경 테스트** (watch 추가 후)
   - 주소창에서 planId를 직접 변경
   - 페이지 새로고침 없이 데이터가 업데이트되는지 확인

### 2. curl 예시

백엔드 API 직접 테스트:

```bash
# 세션 쿠키 포함하여 플랜 상세 조회
curl -X GET 'http://localhost:8888/api/plans/1' \
  -H 'Cookie: JSESSIONID=YOUR_SESSION_ID' \
  -v
```

예상 응답:

```json
{
  "planId": 1,
  "title": "강남 술자리",
  "description": "강남에서 즐기는 술자리",
  "theme": "회식",
  "totalBudget": 200000,
  "spots": [
    {
      "placeId": 1,
      "placeNameSnapshot": "술집1",
      "placeAddressSnapshot": "서울시 강남구 ...",
      "latitude": 37.5,
      "longitude": 127.0,
      "sequence": 1,
      "memo": "1차"
    }
  ],
  "createdAt": "2025-12-23T10:00:00",
  "updatedAt": "2025-12-23T10:00:00"
}
```

### 3. Manual Testing

사용자가 직접 확인할 사항:

1. **기본 플로우**
   - 로그인 → 플랜 목록 → 플랜 클릭 → 상세 페이지
   - 각 단계에서 콘솔 에러 없이 정상 동작 확인

2. **UI/UX**
   - 클릭 시 커서가 pointer로 변경되는지 확인
   - hover 효과 (shadow-xl, transform) 동작 확인
   - 로딩 상태 표시 확인
   - 빈 spots 배열 처리 확인

3. **Edge Cases**
   - spots가 없는 플랜
   - totalBudget이 null인 플랜
   - theme이 없는 플랜
   - 긴 제목/설명 텍스트 처리
