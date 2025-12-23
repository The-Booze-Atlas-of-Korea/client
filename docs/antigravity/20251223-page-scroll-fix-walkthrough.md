# 페이지 스크롤 문제 해결

**작성일**: 2025-12-23  
**작업**: 페이지 스크롤 활성화

---

## 📋 문제

플랜 만들기 페이지나 다른 페이지에서 장소를 추가하면 컨텐츠가 화면 밖으로 벗어나는데 **스크롤이 작동하지 않는** 문제가 발생했습니다.

---

## 🔍 원인 분석

### 1. MainPageLayout의 overflow 설정

[MainPageLayout.vue:136](file:///Users/sungjinkim/IdeaProjects/anti/client/src/layout/MainPageLayout.vue#L136)

```vue
<!-- 수정 전 -->
<main class="flex-1 min-h-0 p-6 flex flex-col overflow-hidden">
  <slot />
</main>
```

**문제**: `overflow-hidden` 때문에 스크롤이 비활성화됨

### 2. 페이지 컴포넌트의 min-h-screen

각 페이지 컴포넌트에서 `min-h-screen`을 사용하여 MainPageLayout과 레이아웃이 중첩되면서 스크롤 영역이 제대로 설정되지 않음:

- PlanFormPage.vue
- PlanDetailPage.vue
- PlansListPage.vue

---

## ✅ 해결 방법

### 1. MainPageLayout 수정

#### [MainPageLayout.vue](file:///Users/sungjinkim/IdeaProjects/anti/client/src/layout/MainPageLayout.vue#L136)

```diff
- <main class="flex-1 min-h-0 p-6 flex flex-col overflow-hidden">
+ <main class="flex-1 min-h-0 p-6 flex flex-col overflow-auto">
    <slot />
  </main>
```

**변경**: `overflow-hidden` → `overflow-auto`

**효과**: 컨텐츠가 영역을 벗어날 때 스크롤 활성화

---

### 2. 페이지 컴포넌트 수정

#### [PlanFormPage.vue](file:///Users/sungjinkim/IdeaProjects/anti/client/src/views/PlanFormPage.vue#L3)

```diff
- <div class="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
+ <div class="flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 min-h-full">
```

#### [PlanDetailPage.vue](file:///Users/sungjinkim/IdeaProjects/anti/client/src/views/PlanDetailPage.vue#L3)

```diff
- <div class="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
+ <div class="flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 min-h-full">
```

#### [PlansListPage.vue](file:///Users/sungjinkim/IdeaProjects/anti/client/src/views/PlansListPage.vue#L3)

```diff
- <div class="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
+ <div class="flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 min-h-full">
```

**변경**: `min-h-screen` → `min-h-full`

**이유**: 
- `min-h-screen`은 뷰포트 높이(100vh)를 기준으로 하여 레이아웃이 중첩됨
- `min-h-full`은 부모 요소 높이(100%)를 기준으로 하여 MainPageLayout 내에서 적절히 동작

---

## 📊 레이아웃 구조

### 수정 전

```
<div h-screen>              # MainPageLayout
  <main overflow-hidden>    # 스크롤 불가
    <div min-h-screen>      # 페이지 (100vh, 레이아웃 중첩)
      긴 컨텐츠
    </div>
  </main>
</div>
```

### 수정 후

```
<div h-screen>              # MainPageLayout
  <main overflow-auto>      # 스크롤 가능 ✅
    <div min-h-full>        # 페이지 (부모 기준 100%)
      긴 컨텐츠
    </div>
  </main>
</div>
```

---

## 🧪 테스트 방법

### 1. 플랜 만들기 페이지
1. `/plans/new` 접속
2. "장소 추가" 버튼을 여러 번 클릭하여 5개 이상의 장소 추가
3. 페이지가 길어지면서 스크롤이 나타나는지 확인 ✅
4. 스크롤하여 맨 아래까지 이동 가능한지 확인 ✅

### 2. 플랜 상세 페이지
1. 장소가 많은 플랜의 상세 페이지 이동
2. 스크롤 가능 여부 확인 ✅

### 3. 플랜 목록 페이지
1. 플랜이 많은 계정으로 `/plans` 접속
2. 스크롤 가능 여부 확인 ✅

---

## 📂 수정된 파일

- [MainPageLayout.vue](file:///Users/sungjinkim/IdeaProjects/anti/client/src/layout/MainPageLayout.vue): `overflow-hidden` → `overflow-auto`
- [PlanFormPage.vue](file:///Users/sungjinkim/IdeaProjects/anti/client/src/views/PlanFormPage.vue): `min-h-screen` → `min-h-full`
- [PlanDetailPage.vue](file:///Users/sungjinkim/IdeaProjects/anti/client/src/views/PlanDetailPage.vue): `min-h-screen` → `min-h-full`
- [PlansListPage.vue](file:///Users/sungjinkim/IdeaProjects/anti/client/src/views/PlansListPage.vue): `min-h-screen` → `min-h-full`

---

**해결 완료!** ✅

이제 모든 페이지에서 컨텐츠가 화면을 벗어날 때 스크롤이 정상적으로 작동합니다.
