# 플랜 생성 오류 및 Tooltip 경고 수정

**작성일**: 2025-12-23  
**작업**: 플랜 생성 DB 에러 및 콘솔 경고 제거

---

## 📋 문제

### 1. 플랜 생성 시 500 에러

```
Column 'latitude' cannot be null
```

**원인**: PlanFormPage에서 장소 추가 시 latitude/longitude 필드가 설정되지 않아 DB NOT NULL 제약 위반

### 2. Console Tooltip 경고

```
[Vue warn]: Failed to resolve directive: tooltip
```

**원인**: PrimeVue Tooltip 디렉티브가 등록되지 않음

---

## ✅ 해결 방법

### 1. PlanFormPage - latitude/longitude 기본값 추가

#### [PlanFormPage.vue](file:///Users/sungjinkim/IdeaProjects/anti/client/src/views/PlanFormPage.vue#L246-L248)

```diff
const addSpot = () => {
  formData.value.spots.push({
    placeNameSnapshot: '',
    placeAddressSnapshot: '',
+   latitude: 0,  // 기본값 설정 (DB NOT NULL 제약 대응)
+   longitude: 0, // 기본값 설정
    memo: '',
    sequence: formData.value.spots.length,
  })
}
```

**효과**: 임시로 0, 0 좌표를 설정하여 DB 에러 방지. 나중에 지도에서 장소 선택 시 실제 좌표로 업데이트 가능

---

### 2. Tooltip 디렉티브 등록

#### [main.ts](file:///Users/sungjinkim/IdeaProjects/anti/client/src/main.ts#L11)

```diff
+ import Tooltip from 'primevue/tooltip'
```

#### [main.ts](file:///Users/sungjinkim/IdeaProjects/anti/client/src/main.ts#L69)

```diff
  app.use(ToastService)
  app.use(ConfirmationService)
+ app.directive('tooltip', Tooltip)
```

**효과**: MainPageLayout에서 `v-tooltip` 사용 시 경고 제거

---

## 📂 수정된 파일

- [PlanFormPage.vue](file:///Users/sungjinkim/IdeaProjects/anti/client/src/views/PlanFormPage.vue): addSpot에 latitude/longitude 기본값 추가
- [main.ts](file:///Users/sungjinkim/IdeaProjects/anti/client/src/main.ts): Tooltip 디렉티브 등록

---

## 🔄 향후 개선 사항

장소 추가 시 지도에서 직접 선택하도록 UI 개선하면 실제 좌표를 입력할 수 있습니다.

---

**해결 완료!** ✅
