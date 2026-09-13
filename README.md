# 토익700

한 달 안에 TOEIC 700점을 목표로 하는 **초보 학습용 웹 앱**입니다.  
교과서가 없어도 **듣기(LC) Part 1–4**, Part 5·단어·파트 가이드로 매일 짧게 공부할 수 있습니다.

## 기능

- **홈**: 목표(700점/한 달), 연속·총 학습일, 최근 Part 5 점수 (localStorage)
- **듣기 (LC)**: Part 1–4 오리지널 문항 + Microsoft Edge neural TTS (미국/영국/호주 억양 혼합)
  - Part 1 사진 묘사 · Part 2 질의응답 · Part 3 대화 · Part 4 설명문
  - 답 후 한국어 해설 · 스크립트 · 억양 배지
- **Part 5 퀴즈**: 원작 문제, 즉시 한국어 해설, 틀린 문제 재도전
- **단어장**: 고빈도 단어 + 예문, 알아요/어려워요 표시
- **오늘의 학습**: Part 5 × 5 + 단어 × 5, 완료 시 스트릭 기록
- **파트 가이드**: LC 1–4 / RC 5–7 초보 요약

> ETS/공식 TOEIC 오디오·스크립트는 사용하지 않습니다. 학습용 오리지널 콘텐츠입니다.

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 표시되는 주소(보통 `http://localhost:5173/toeic-700-coach/`)로 접속하세요.

> GitHub Pages용 `base` 경로가 `/toeic-700-coach/` 이므로, 로컬에서도 그 경로로 열립니다.

## 듣기 오디오 재생성 (선택)

```bash
python3 -m venv .venv
.venv/bin/pip install edge-tts
.venv/bin/python scripts/generate_listening_audio.py
```

## 빌드 / 배포

```bash
npm run build
npm run deploy   # build + gh-pages
```

**라이브:** https://leekuy541-alt.github.io/toeic-700-coach/

## 기술

- Vite + React + TypeScript
- 백엔드 없음 · localStorage만 사용
- edge-tts (Microsoft neural voices)로 MP3 생성

## 라이선스

학습 목적의 개인 프로젝트입니다.
