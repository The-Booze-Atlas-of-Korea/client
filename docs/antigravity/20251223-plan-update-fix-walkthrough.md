# 플랜 수정 시 데이터 반영 문제 해결

**작성일**: 2025-12-23  
**작업**: 플랜 수정 시 빈 필드 및 장소 삭제 반영

---

## 📋 문제

### 1. 선택적 필드(설명, 테마)를 비우면 반영 안됨

- 플랜 수정 시 설명이나 테마를 지워도 DB에 반영되지 않음

### 2. 장소 삭제가 반영 안됨

- 기존에 추가된 장소를 모두 삭제해도 DB에서 삭제되지 않음

---

## 🔍 원인 분석

### 문제 1: 빈 문자열 처리

[PlanFormPage.vue:325-327](IdeaProjects/anti/client/src/views/PlanFormPage.vue#L325-L327) (수정 전)

```typescript
description: formData.value.description || undefined,
theme: formData.value.theme || undefined,
totalBudget: formData.value.totalBudget || undefined,
```

**문제**: 빈 문자열(`''`)은 falsy이지만 `|| undefined`로 변환 후 백엔드에서 "변경 없음"으로 처리됨

### 문제 2: 빈 배열 처리

[PlanFormPage.vue:328](IdeaProjects/anti/client/src/views/PlanFormPage.vue#L328) (수정 전)

```typescript
spots: formData.value.spots.length > 0 ? formData.value.spots : undefined,
```

**문제**: 장소를 모두 삭제하면 `undefined`가 전송되어 백엔드에서 "변경 없음"으로 처리됨

---

## ✅ 해결 방법

### 1. PlanFormPage 수정 payload 로직 변경

#### [PlanFormPage.vue](/IdeaProjects/anti/client/src/views/PlanFormPage.vue#L323-L331)

```typescript
const payload: UpdatePlanRequest = {
  title: formData.value.title,
  // 빈 문자열('')을 null로 변환하여 명시적으로 필드 삭제
  description: formData.value.description?.trim() || null,
  theme: formData.value.theme?.trim() || null,
  totalBudget: formData.value.totalBudget || null,
  // 빈 배열도 전송하여 모든 spots 삭제 가능하도록 함
  spots: formData.value.spots,
}
```

**변경 사항**:

- `|| undefined` → `|| null`: 명시적으로 null 전송
- `.trim()` 추가: 공백만 있는 경우도 null 처리
- `spots.length > 0 ? spots : undefined` → `spots`: 빈 배열도 전송

---

### 2. UpdatePlanRequest 타입 수정

#### [types.ts](IdeaProjects/anti/client/src/api/plan/types.ts#L50-L56)

```typescript
export interface UpdatePlanRequest {
  title?: string
  description?: string | null // null 허용
  theme?: string | null // null 허용
  totalBudget?: number | null // null 허용
  spots?: Omit<PlanSpot, 'id'>[] | null // null 허용
}
```

**효과**: TypeScript 타입 에러 없이 null 전송 가능

---

## 🎯 동작 방식

### undefined vs null

| 값                      | 백엔드 처리              |
| ----------------------- | ------------------------ |
| `undefined` (필드 없음) | 변경 없음 (기존 값 유지) |
| `null`                  | 필드 삭제 (DB null 설정) |
| `빈 배열 []`            | 모든 spots 삭제          |

---

## 🧪 테스트 시나리오

### 1. 설명 삭제

1. 플랜 상세 페이지에서 "수정하기" 클릭
2. 설명 필드의 모든 텍스트 삭제
3. "수정하기" 버튼 클릭
4. ✅ 플랜 상세에서 설명이 사라짐 확인

### 2. 테마 삭제

1. 플랜 수정 페이지에서 테마 필드 비우기
2. 저장
3. ✅ 테마가 삭제됨 확인

### 3. 모든 장소 삭제

1. 플랜 수정 페이지에서 모든 장소 삭제 버튼 클릭
2. 저장
3. ✅ 플랜 상세에서 장소 목록이 비어있음 확인

---

## 📂 수정된 파일

- [PlanFormPage.vue](/IdeaProjects/anti/client/src/views/PlanFormPage.vue): payload 생성 로직 수정
- [types.ts](IdeaProjects/anti/client/src/api/plan/types.ts): UpdatePlanRequest 타입에 null 추가

---

**해결 완료!** ✅

이제 플랜 수정 시 필드를 비우거나 장소를 삭제해도 정상적으로 반영됩니다.
