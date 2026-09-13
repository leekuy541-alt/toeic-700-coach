# 토익700

한 달 안에 TOEIC 700점을 목표로 하는 **초보 학습용 웹 앱**입니다.  
교과서가 없어도 Part 5·단어·파트 가이드로 매일 짧게 공부할 수 있습니다.

## 기능

- **홈**: 목표(700점/한 달), 연속·총 학습일, 최근 Part 5 점수 (localStorage)
- **Part 5 퀴즈**: 원작 문제 30문항, 즉시 한국어 해설, 틀린 문제 재도전
- **단어장**: 고빈도 단어 40개 + 예문, 알아요/어려워요 표시
- **오늘의 학습**: Part 5 × 5 + 단어 × 5, 완료 시 스트릭 기록
- **파트 가이드**: LC 1–4 / RC 5–7 초보 요약

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 표시되는 주소(보통 `http://localhost:5173/toeic-700-coach/`)로 접속하세요.

> GitHub Pages용 `base` 경로가 `/toeic-700-coach/` 이므로, 로컬에서도 그 경로로 열립니다.

## 빌드

```bash
npm run build
npm run preview
```

결과물은 `dist/` 폴더에 생성됩니다.

## GitHub Pages

배포 URL (Pages 활성화 후):

**https://leekuy541-alt.github.io/toeic-700-coach/**

소스 푸시 후 Actions 또는 저장소 Settings → Pages에서 `gh-pages` 브랜치(또는 GitHub Actions)로 배포됩니다.

수동 배포 예시:

```bash
npm run build
npx gh-pages -d dist
```

## 기술

- Vite + React + TypeScript
- 백엔드 없음 · localStorage만 사용
- ETS/시중 교재 무단 복제 없음 (오리지널 학습용 문항)

## 라이선스

학습 목적의 개인 프로젝트입니다.
