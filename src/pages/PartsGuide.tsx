import { PARTS_GUIDE } from '../data/partsGuide';

export default function PartsGuide() {
  const lc = PARTS_GUIDE.filter((p) => p.section === 'LC');
  const rc = PARTS_GUIDE.filter((p) => p.section === 'RC');

  return (
    <div className="page guide">
      <h2>파트 가이드</h2>
      <p className="sub">초보자를 위한 LC · RC 한눈에 보기</p>

      <h3 className="section-title">🎧 Listening (Part 1–4)</h3>
      {lc.map((p) => (
        <article key={p.part} className="guide-card">
          <h4>
            Part {p.part}. {p.title}
          </h4>
          <p>{p.summary}</p>
          <ul>
            {p.tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </article>
      ))}

      <h3 className="section-title">📖 Reading (Part 5–7)</h3>
      {rc.map((p) => (
        <article key={p.part} className="guide-card">
          <h4>
            Part {p.part}. {p.title}
          </h4>
          <p>{p.summary}</p>
          <ul>
            {p.tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
