import type { AppState, Page } from '../types';
import { LC_COUNTS } from '../data/listening';

interface Props {
  state: AppState;
  onNavigate: (p: Page) => void;
}

export default function Home({ state, onNavigate }: Props) {
  const score = state.lastPart5Score;
  const lcTotal =
    LC_COUNTS.part1 + LC_COUNTS.part2 + LC_COUNTS.part3 + LC_COUNTS.part4;

  return (
    <div className="page home">
      <header className="hero">
        <p className="eyebrow">초보 → 700점</p>
        <h1>토익700</h1>
        <p className="goal">
          목표: <strong>700점 / 한 달</strong>
        </p>
        <p className="sub">교과서 없이, 매일 조금씩. LC·RC 함께 연습하세요.</p>
      </header>

      <section className="stats">
        <div className="stat-card">
          <span className="stat-label">연속 학습</span>
          <span className="stat-value">{state.streak}일</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">총 학습일</span>
          <span className="stat-value">{state.daysStudied}일</span>
        </div>
        <div className="stat-card wide">
          <span className="stat-label">최근 Part 5 점수</span>
          <span className="stat-value">
            {score
              ? `${score.correct}/${score.total} (${Math.round((score.correct / score.total) * 100)}%)`
              : '아직 없음'}
          </span>
          {score && <span className="stat-date">{score.date}</span>}
        </div>
      </section>

      <section className="quick-actions">
        <button className="action primary" onClick={() => onNavigate('today')}>
          📅 오늘의 학습 시작
        </button>
        <button className="action" onClick={() => onNavigate('listening')}>
          🎧 듣기 LC (Part 1–4) · {lcTotal}세트/문항
        </button>
        <button className="action" onClick={() => onNavigate('part5')}>
          ✏️ Part 5 퀴즈
        </button>
        <button className="action" onClick={() => onNavigate('vocab')}>
          📚 단어장
        </button>
        <button className="action" onClick={() => onNavigate('guide')}>
          🗺️ 파트 가이드
        </button>
      </section>
    </div>
  );
}
