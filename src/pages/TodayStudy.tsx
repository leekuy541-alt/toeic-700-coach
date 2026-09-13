import { useMemo, useState } from 'react';
import { PART5_QUESTIONS } from '../data/part5';
import { VOCAB_WORDS } from '../data/vocab';
import type { AppState } from '../types';
import { todayKey } from '../hooks/useLocalStorage';
import Part5Quiz from './Part5Quiz';

interface Props {
  state: AppState;
  setState: (u: AppState | ((p: AppState) => AppState)) => void;
}

function pickN<T>(arr: T[], n: number, seed: string): T[] {
  const copy = [...arr];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  for (let i = copy.length - 1; i > 0; i--) {
    h = (h * 1664525 + 1013904223) >>> 0;
    const j = h % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

export default function TodayStudy({ state, setState }: Props) {
  const day = todayKey();
  const alreadyDone = state.completedDays.includes(day);
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'vocab' | 'done'>(
    alreadyDone ? 'done' : 'intro'
  );

  const quizQs = useMemo(() => pickN(PART5_QUESTIONS, 5, day + '-q'), [day]);
  const vocabQs = useMemo(() => pickN(VOCAB_WORDS, 5, day + '-v'), [day]);

  const [vocabIdx, setVocabIdx] = useState(0);

  function markDayComplete() {
    setState((prev) => {
      if (prev.completedDays.includes(day)) return prev;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      const streak =
        prev.lastStudyDate === yKey ? prev.streak + 1 : 1;
      return {
        ...prev,
        streak,
        daysStudied: prev.daysStudied + 1,
        lastStudyDate: day,
        completedDays: [...prev.completedDays, day],
      };
    });
    setPhase('done');
  }

  function markVocab(id: number, as: 'known' | 'unknown') {
    setState((prev) => {
      const knownVocabIds = prev.knownVocabIds.filter((x) => x !== id);
      const unknownVocabIds = prev.unknownVocabIds.filter((x) => x !== id);
      if (as === 'known') knownVocabIds.push(id);
      else unknownVocabIds.push(id);
      return { ...prev, knownVocabIds, unknownVocabIds };
    });
    if (vocabIdx + 1 >= vocabQs.length) markDayComplete();
    else setVocabIdx((i) => i + 1);
  }

  if (phase === 'intro') {
    return (
      <div className="page today">
        <h2>오늘의 학습</h2>
        <p className="sub">{day}</p>
        <div className="today-card">
          <p>빠른 세션 (약 10분)</p>
          <ul>
            <li>Part 5 문제 5개</li>
            <li>단어 5개 복습</li>
          </ul>
          <button className="action primary" onClick={() => setPhase('quiz')}>
            시작하기
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'quiz') {
    return (
      <Part5Quiz
        state={state}
        setState={(u) => {
          setState(u);
        }}
        questions={quizQs}
        title="오늘의 Part 5"
        saveScore={true}
        continueLabel="단어 복습으로"
        onDone={(correct, total) => {
          setState((prev) => ({
            ...prev,
            lastPart5Score: { correct, total, date: day },
          }));
          setPhase('vocab');
        }}
      />
    );
  }

  if (phase === 'vocab') {
    const w = vocabQs[vocabIdx];
    return (
      <div className="page today">
        <div className="quiz-top">
          <h2>오늘의 단어</h2>
          <span className="progress">
            {vocabIdx + 1} / {vocabQs.length}
          </span>
        </div>
        <div className="vocab-card focus">
          <strong className="word big">{w.word}</strong>
          <p className="meaning">{w.meaningKo}</p>
          <p className="example">{w.example}</p>
          <div className="vocab-actions">
            <button className="chip" onClick={() => markVocab(w.id, 'known')}>
              알아요
            </button>
            <button
              className="chip warn"
              onClick={() => markVocab(w.id, 'unknown')}
            >
              어려워요
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page today done">
      <h2>오늘 학습 완료! 🎉</h2>
      <p className="sub">
        연속 {state.streak || 1}일 · 총 {state.daysStudied || 1}일
      </p>
      <p>내일도 같은 시간에 잠깐만 돌아와 보세요.</p>
      <p className="ok-msg">
        {alreadyDone
          ? '오늘은 이미 완료했어요. 내일 또 만나요!'
          : '오늘의 학습이 기록되었습니다.'}
      </p>
      <button
        className="action"
        onClick={() => {
          setPhase('intro');
          setVocabIdx(0);
        }}
      >
        세션 다시 하기
      </button>
    </div>
  );
}
