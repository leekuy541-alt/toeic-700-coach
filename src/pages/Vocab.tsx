import { VOCAB_WORDS } from '../data/vocab';
import type { AppState } from '../types';

interface Props {
  state: AppState;
  setState: (u: AppState | ((p: AppState) => AppState)) => void;
}

export default function Vocab({ state, setState }: Props) {
  const known = new Set(state.knownVocabIds);
  const unknown = new Set(state.unknownVocabIds);

  function mark(id: number, as: 'known' | 'unknown') {
    setState((prev) => {
      const knownVocabIds = prev.knownVocabIds.filter((x) => x !== id);
      const unknownVocabIds = prev.unknownVocabIds.filter((x) => x !== id);
      if (as === 'known') knownVocabIds.push(id);
      else unknownVocabIds.push(id);
      return { ...prev, knownVocabIds, unknownVocabIds };
    });
  }

  const knownCount = state.knownVocabIds.length;

  return (
    <div className="page vocab">
      <h2>단어장</h2>
      <p className="sub">
        TOEIC 고빈도 단어 {VOCAB_WORDS.length}개 · 아는 단어 {knownCount}개
      </p>
      <ul className="vocab-list">
        {VOCAB_WORDS.map((w) => {
          const status = known.has(w.id)
            ? 'known'
            : unknown.has(w.id)
              ? 'unknown'
              : '';
          return (
            <li key={w.id} className={`vocab-card ${status}`}>
              <div className="vocab-head">
                <strong className="word">{w.word}</strong>
                <span className="meaning">{w.meaningKo}</span>
              </div>
              <p className="example">{w.example}</p>
              <div className="vocab-actions">
                <button
                  className={`chip ${status === 'known' ? 'active' : ''}`}
                  onClick={() => mark(w.id, 'known')}
                >
                  알아요
                </button>
                <button
                  className={`chip warn ${status === 'unknown' ? 'active' : ''}`}
                  onClick={() => mark(w.id, 'unknown')}
                >
                  어려워요
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
