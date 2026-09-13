import { useMemo, useState } from 'react';
import { PART5_QUESTIONS } from '../data/part5';
import type { AppState, Part5Question } from '../types';
import { todayKey } from '../hooks/useLocalStorage';

interface Props {
  state: AppState;
  setState: (u: AppState | ((p: AppState) => AppState)) => void;
  questions?: Part5Question[];
  title?: string;
  onDone?: (correct: number, total: number) => void;
  saveScore?: boolean;
  continueLabel?: string;
}

export default function Part5Quiz({
  setState,
  questions: externalQs,
  title = 'Part 5 퀴즈',
  onDone,
  saveScore = true,
  continueLabel,
}: Props) {
  const allQs = externalQs ?? PART5_QUESTIONS;
  const [qs, setQs] = useState(allQs);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [wrongIds, setWrongIds] = useState<number[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [retryMode, setRetryMode] = useState(false);

  const q = qs[idx];
  const progress = useMemo(() => `${idx + 1} / ${qs.length}`, [idx, qs.length]);

  function pick(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.answer) setCorrectCount((c) => c + 1);
    else setWrongIds((w) => [...w, q.id]);
  }

  function finishWith(finalCorrect: number) {
    setFinished(true);
    if (saveScore && !retryMode && !externalQs) {
      setState((prev) => ({
        ...prev,
        lastPart5Score: {
          correct: finalCorrect,
          total: qs.length,
          date: todayKey(),
        },
      }));
    }
  }

  function next() {
    if (idx + 1 >= qs.length) {
      finishWith(correctCount);
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
  }

  function retryWrong() {
    const wrong = allQs.filter((x) => wrongIds.includes(x.id));
    if (wrong.length === 0) return;
    setQs(wrong);
    setIdx(0);
    setSelected(null);
    setWrongIds([]);
    setCorrectCount(0);
    setFinished(false);
    setRetryMode(true);
  }

  function restart() {
    setQs(allQs);
    setIdx(0);
    setSelected(null);
    setWrongIds([]);
    setCorrectCount(0);
    setFinished(false);
    setRetryMode(false);
  }

  if (finished) {
    const pct = Math.round((correctCount / qs.length) * 100);
    return (
      <div className="page quiz-result">
        <h2>{retryMode ? '틀린 문제 복습 완료' : '퀴즈 완료!'}</h2>
        <p className="big-score">
          {correctCount} / {qs.length}
          <span className="pct"> ({pct}%)</span>
        </p>
        <p className="result-msg">
          {pct >= 80
            ? '잘했어요! 이 페이스면 700점 충분히 가능합니다.'
            : pct >= 60
              ? '좋아요. 틀린 문제 설명을 다시 읽어 보세요.'
              : '괜찮아요. 초보 단계입니다. 설명을 복습하고 다시 도전하세요.'}
        </p>
        <div className="btn-row">
          {onDone && (
            <button
              className="action primary"
              onClick={() => onDone(correctCount, qs.length)}
            >
              {continueLabel ?? '다음으로'}
            </button>
          )}
          {!retryMode && wrongIds.length > 0 && !onDone && (
            <button className="action primary" onClick={retryWrong}>
              틀린 문제만 다시 ({wrongIds.length}개)
            </button>
          )}
          {!onDone && (
            <button className="action" onClick={restart}>
              처음부터 다시
            </button>
          )}
        </div>
      </div>
    );
  }

  const letters = ['A', 'B', 'C', 'D'] as const;
  const isCorrect = selected !== null && selected === q.answer;

  return (
    <div className="page quiz">
      <div className="quiz-top">
        <h2>
          {title}
          {retryMode ? ' · 복습' : ''}
        </h2>
        <span className="progress">{progress}</span>
      </div>
      <p className="stem">{q.sentence}</p>
      <div className="options">
        {q.options.map((opt, i) => {
          let cls = 'option';
          if (selected !== null) {
            if (i === q.answer) cls += ' correct';
            else if (i === selected) cls += ' wrong';
          }
          return (
            <button
              key={i}
              className={cls}
              onClick={() => pick(i)}
              disabled={selected !== null}
            >
              <span className="letter">{letters[i]}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <div className={`explain ${isCorrect ? 'ok' : 'bad'}`}>
          <strong>{isCorrect ? '정답!' : '오답'}</strong>
          <p>{q.explanationKo}</p>
          <button className="action primary" onClick={next}>
            {idx + 1 >= qs.length ? '결과 보기' : '다음 문제'}
          </button>
        </div>
      )}
    </div>
  );
}
