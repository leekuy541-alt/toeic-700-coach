import { useMemo, useState } from 'react';
import AudioPlayer from '../components/AudioPlayer';
import AccentBadges from '../components/AccentBadges';
import { assetUrl } from '../lib/assetUrl';
import {
  LC_COUNTS,
  PART1_ITEMS,
  PART2_ITEMS,
  PART3_ITEMS,
  PART4_ITEMS,
  type ChoiceQuestion,
  type Part3Item,
  type Part4Item,
} from '../data/listening';

type LcTab = 'menu' | 'part1' | 'part2' | 'part3' | 'part4';
const LETTERS = ['A', 'B', 'C', 'D'] as const;

export default function Listening() {
  const [tab, setTab] = useState<LcTab>('menu');

  if (tab === 'menu') {
    return (
      <div className="page listening">
        <h2>듣기 (LC)</h2>
        <p className="sub">
          Part 1–4 오리지널 연습 · 미국/영국/호주 억양 TTS (ETS 오디오 아님)
        </p>
        <div className="lc-menu">
          <button className="action lc-card" onClick={() => setTab('part1')}>
            <strong>Part 1 · 사진 묘사</strong>
            <span>{LC_COUNTS.part1}문항 · 사진 + A–D 듣기</span>
          </button>
          <button className="action lc-card" onClick={() => setTab('part2')}>
            <strong>Part 2 · 질의응답</strong>
            <span>{LC_COUNTS.part2}문항 · 질문 + 응답 3개</span>
          </button>
          <button className="action lc-card" onClick={() => setTab('part3')}>
            <strong>Part 3 · 대화</strong>
            <span>{LC_COUNTS.part3}세트 · 대화 + 화면 선택지</span>
          </button>
          <button className="action lc-card" onClick={() => setTab('part4')}>
            <strong>Part 4 · 설명문</strong>
            <span>{LC_COUNTS.part4}세트 · 담화 + 화면 선택지</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page listening">
      <button type="button" className="back-link" onClick={() => setTab('menu')}>
        ← 듣기 메뉴
      </button>
      {tab === 'part1' && <Part1Practice />}
      {tab === 'part2' && <Part2Practice />}
      {tab === 'part3' && <Part34Practice kind="part3" items={PART3_ITEMS} title="Part 3 · 대화" />}
      {tab === 'part4' && <Part34Practice kind="part4" items={PART4_ITEMS} title="Part 4 · 설명문" />}
    </div>
  );
}

function ResultView({
  correct,
  total,
  onRetry,
  onMenu,
}: {
  correct: number;
  total: number;
  onRetry: () => void;
  onMenu?: () => void;
}) {
  const pct = Math.round((correct / total) * 100);
  return (
    <div className="quiz-result">
      <h2>연습 완료!</h2>
      <p className="big-score">
        {correct} / {total}
        <span className="pct"> ({pct}%)</span>
      </p>
      <p className="result-msg">
        {pct >= 80
          ? '듣기 감각이 좋아요. 억양 차이를 계속 익혀 보세요.'
          : pct >= 60
            ? '괜찮아요. 틀린 문항은 스크립트를 다시 읽어 보세요.'
            : '초보 단계입니다. 다시 듣고 해설을 복습해 보세요.'}
      </p>
      <div className="btn-row">
        <button className="action primary" onClick={onRetry}>
          처음부터 다시
        </button>
        {onMenu && (
          <button className="action" onClick={onMenu}>
            듣기 메뉴
          </button>
        )}
      </div>
    </div>
  );
}

function Part1Practice() {
  const items = PART1_ITEMS;
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const item = items[idx];

  function pick(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === item.answer) setCorrectCount((c) => c + 1);
  }

  function next() {
    if (idx + 1 >= items.length) {
      setFinished(true);
      return;
    }
    setIdx((n) => n + 1);
    setSelected(null);
  }

  function restart() {
    setIdx(0);
    setSelected(null);
    setCorrectCount(0);
    setFinished(false);
  }

  if (finished) {
    return <ResultView correct={correctCount} total={items.length} onRetry={restart} />;
  }

  const isCorrect = selected !== null && selected === item.answer;

  return (
    <div className="lc-practice">
      <div className="quiz-top">
        <h2>Part 1 · 사진 묘사</h2>
        <span className="progress">
          {idx + 1} / {items.length}
        </span>
      </div>
      <img
        className="lc-photo"
        src={assetUrl(item.image)}
        alt={item.imageAlt}
        loading="lazy"
      />
      <AudioPlayer src={item.audio} label="보기 듣기" autoResetKey={item.id} />
      <p className="hint">사진을 보고 A–D 중 맞는 설명을 고르세요.</p>
      <div className="options">
        {LETTERS.map((L, i) => {
          let cls = 'option';
          if (selected !== null) {
            if (i === item.answer) cls += ' correct';
            else if (i === selected) cls += ' wrong';
          }
          return (
            <button
              key={L}
              type="button"
              className={cls}
              onClick={() => pick(i)}
              disabled={selected !== null}
            >
              <span className="letter">{L}</span>
              <span>{selected !== null ? item.statements[i].text : '듣기 선택지'}</span>
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <div className={`explain ${isCorrect ? 'ok' : 'bad'}`}>
          <strong>{isCorrect ? '정답!' : '오답'}</strong>
          <AccentBadges accents={item.accents} show />
          <p>{item.explanationKo}</p>
          <details className="transcript">
            <summary>스크립트 보기</summary>
            <ol>
              {item.statements.map((s, i) => (
                <li key={i}>
                  <strong>{LETTERS[i]}.</strong> {s.text}{' '}
                  <span className="mini-accent">({s.accent})</span>
                </li>
              ))}
            </ol>
          </details>
          <button type="button" className="action primary" onClick={next}>
            {idx + 1 >= items.length ? '결과 보기' : '다음 문제'}
          </button>
        </div>
      )}
    </div>
  );
}

function Part2Practice() {
  const items = PART2_ITEMS;
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const item = items[idx];

  function pick(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === item.answer) setCorrectCount((c) => c + 1);
  }

  function next() {
    if (idx + 1 >= items.length) {
      setFinished(true);
      return;
    }
    setIdx((n) => n + 1);
    setSelected(null);
  }

  function restart() {
    setIdx(0);
    setSelected(null);
    setCorrectCount(0);
    setFinished(false);
  }

  if (finished) {
    return <ResultView correct={correctCount} total={items.length} onRetry={restart} />;
  }

  const isCorrect = selected !== null && selected === item.answer;

  return (
    <div className="lc-practice">
      <div className="quiz-top">
        <h2>Part 2 · 질의응답</h2>
        <span className="progress">
          {idx + 1} / {items.length}
        </span>
      </div>
      <AudioPlayer src={item.audio} label="질문·응답 듣기" autoResetKey={item.id} />
      <p className="hint">질문에 가장 알맞은 응답을 고르세요. (선택지는 듣기 전 비공개)</p>
      <div className="options">
        {(['A', 'B', 'C'] as const).map((L, i) => {
          let cls = 'option';
          if (selected !== null) {
            if (i === item.answer) cls += ' correct';
            else if (i === selected) cls += ' wrong';
          }
          return (
            <button
              key={L}
              type="button"
              className={cls}
              onClick={() => pick(i)}
              disabled={selected !== null}
            >
              <span className="letter">{L}</span>
              <span>{selected !== null ? item.responses[i].text : '응답 듣기'}</span>
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <div className={`explain ${isCorrect ? 'ok' : 'bad'}`}>
          <strong>{isCorrect ? '정답!' : '오답'}</strong>
          <AccentBadges accents={item.accents} show />
          <p>{item.explanationKo}</p>
          <details className="transcript">
            <summary>스크립트 보기</summary>
            <p>
              <strong>Q.</strong> {item.question.text}{' '}
              <span className="mini-accent">({item.question.accent})</span>
            </p>
            <ol>
              {item.responses.map((r, i) => (
                <li key={i}>
                  <strong>{LETTERS[i]}.</strong> {r.text}{' '}
                  <span className="mini-accent">({r.accent})</span>
                </li>
              ))}
            </ol>
          </details>
          <button type="button" className="action primary" onClick={next}>
            {idx + 1 >= items.length ? '결과 보기' : '다음 문제'}
          </button>
        </div>
      )}
    </div>
  );
}

type SetItem = Part3Item | Part4Item;

function Part34Practice({
  kind,
  items,
  title,
}: {
  kind: 'part3' | 'part4';
  items: SetItem[];
  title: string;
}) {
  const [setIdx, setSetIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const setItem = items[setIdx];
  const questions = setItem.questions;
  const q: ChoiceQuestion = questions[qIdx];
  const totalQs = useMemo(
    () => items.reduce((n, it) => n + it.questions.length, 0),
    [items]
  );
  const answeredSoFar = useMemo(() => {
    let n = 0;
    for (let i = 0; i < setIdx; i++) n += items[i].questions.length;
    return n + qIdx;
  }, [items, setIdx, qIdx]);

  function pick(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.answer) setCorrectCount((c) => c + 1);
  }

  function next() {
    if (qIdx + 1 < questions.length) {
      setQIdx((n) => n + 1);
      setSelected(null);
      return;
    }
    if (setIdx + 1 < items.length) {
      setSetIdx((n) => n + 1);
      setQIdx(0);
      setSelected(null);
      setShowTranscript(false);
      return;
    }
    setFinished(true);
  }

  function restart() {
    setSetIdx(0);
    setQIdx(0);
    setSelected(null);
    setCorrectCount(0);
    setFinished(false);
    setShowTranscript(false);
  }

  if (finished) {
    return <ResultView correct={correctCount} total={totalQs} onRetry={restart} />;
  }

  const isCorrect = selected !== null && selected === q.answer;
  const accents =
    kind === 'part3'
      ? (setItem as Part3Item).accents
      : (setItem as Part4Item).accents;

  return (
    <div className="lc-practice">
      <div className="quiz-top">
        <h2>{title}</h2>
        <span className="progress">
          Q {answeredSoFar + 1} / {totalQs}
        </span>
      </div>
      <p className="lc-set-title">
        Set {setIdx + 1}. {setItem.title}
      </p>
      <AudioPlayer
        src={setItem.audio}
        label={kind === 'part3' ? '대화 듣기' : '담화 듣기'}
        autoResetKey={`${kind}-${setItem.id}`}
      />
      <div className="stem">
        <p className="q-text">{q.q}</p>
      </div>
      <div className="options">
        {q.choices.map((opt, i) => {
          let cls = 'option';
          if (selected !== null) {
            if (i === q.answer) cls += ' correct';
            else if (i === selected) cls += ' wrong';
          }
          return (
            <button
              key={i}
              type="button"
              className={cls}
              onClick={() => pick(i)}
              disabled={selected !== null}
            >
              <span className="letter">{LETTERS[i]}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <div className={`explain ${isCorrect ? 'ok' : 'bad'}`}>
          <strong>{isCorrect ? '정답!' : '오답'}</strong>
          <AccentBadges accents={accents} show />
          <p>{q.explanationKo}</p>
          <button
            type="button"
            className="chip"
            onClick={() => setShowTranscript((v) => !v)}
          >
            {showTranscript ? '스크립트 숨기기' : '스크립트 보기'}
          </button>
          {showTranscript && (
            <div className="transcript-box">
              {kind === 'part3'
                ? (setItem as Part3Item).speakers.map((s, i) => (
                    <p key={i}>
                      <span className="mini-accent">[{s.accent}]</span> {s.text}
                    </p>
                  ))
                : (
                    <p>
                      <span className="mini-accent">
                        [{(setItem as Part4Item).accent}]
                      </span>{' '}
                      {setItem.transcript}
                    </p>
                  )}
            </div>
          )}
          <button type="button" className="action primary" onClick={next}>
            {answeredSoFar + 1 >= totalQs ? '결과 보기' : '다음 문제'}
          </button>
        </div>
      )}
    </div>
  );
}
