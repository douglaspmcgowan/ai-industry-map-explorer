import { useEffect, useState } from 'react';

type NewsItem = {
  id: string;
  title: string;
  url: string;
  source: string;
  date: string;
  summary: string;
  industry_nodes: string[];
  schools: string[];
  relevance: number;
  status: 'pending' | 'keep' | 'skip';
};

type NewsQueue = {
  generated: string;
  items: NewsItem[];
};

export default function NewsPage() {
  const [queue, setQueue] = useState<NewsQueue | null>(null);
  const [decisions, setDecisions] = useState<Record<string, 'pending' | 'keep' | 'skip'>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/news-queue.json`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((q: NewsQueue) => {
        setQueue(q);
        const initial: Record<string, 'pending' | 'keep' | 'skip'> = {};
        for (const item of q.items) initial[item.id] = item.status;
        setDecisions(initial);
      })
      .catch(e => setLoadError(String(e)));
  }, []);

  const pending = queue?.items.filter(i => i.status === 'pending') ?? [];
  const decided = queue?.items.filter(i => i.status !== 'pending') ?? [];

  const toggle = (id: string, val: 'keep' | 'skip') => {
    setDecisions(prev => ({ ...prev, [id]: prev[id] === val ? 'pending' : val }));
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const updates = Object.entries(decisions)
        .filter(([, s]) => s !== 'pending')
        .map(([id, status]) => ({ id, status }));
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updates }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSubmitted(true);
    } catch (e) {
      setSubmitError(String(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) return <div className="news-error">Failed to load queue: {loadError}</div>;
  if (!queue) return <div className="news-loading">Loading…</div>;

  return (
    <div className="news-page">
      <div className="news-page-header">
        <h2>News Queue</h2>
        <span className="news-meta">
          {pending.length} pending &middot; generated {new Date(queue.generated).toLocaleDateString()}
        </span>
      </div>

      {pending.length === 0 ? (
        <div className="news-empty">No pending articles — check back after the next collection run.</div>
      ) : (
        <div className="news-list">
          {pending.map(item => {
            const dec = decisions[item.id] ?? 'pending';
            return (
              <div key={item.id} className={`news-card${dec !== 'pending' ? ` news-card--${dec}` : ''}`}>
                <div className="news-card-meta">
                  <span className="news-source">{item.source}</span>
                  <span className="news-date">{item.date}</span>
                  <span className="news-relevance" title={`Relevance: ${item.relevance}/5`}>
                    {'●'.repeat(item.relevance)}{'○'.repeat(5 - item.relevance)}
                  </span>
                </div>
                <a className="news-title" href={item.url} target="_blank" rel="noreferrer">
                  {item.title}
                </a>
                <p className="news-summary">{item.summary}</p>
                <div className="news-tags">
                  {item.industry_nodes.map(n => (
                    <span key={n} className="news-tag news-tag--node">{n}</span>
                  ))}
                  {item.schools.map(s => (
                    <span key={s} className="news-tag news-tag--school">{s}</span>
                  ))}
                </div>
                <div className="news-actions">
                  <button
                    className={`news-btn news-btn--keep${dec === 'keep' ? ' active' : ''}`}
                    onClick={() => toggle(item.id, 'keep')}
                  >Keep</button>
                  <button
                    className={`news-btn news-btn--skip${dec === 'skip' ? ' active' : ''}`}
                    onClick={() => toggle(item.id, 'skip')}
                  >Skip</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {decided.length > 0 && (
        <details className="news-decided">
          <summary>{decided.length} already decided</summary>
          <div className="news-list news-list--decided">
            {decided.map(item => (
              <div key={item.id} className={`news-card news-card--${item.status}`}>
                <div className="news-card-meta">
                  <span className="news-source">{item.source}</span>
                  <span className="news-date">{item.date}</span>
                  <span className={`news-decision-badge news-decision-badge--${item.status}`}>{item.status}</span>
                </div>
                <a className="news-title" href={item.url} target="_blank" rel="noreferrer">
                  {item.title}
                </a>
              </div>
            ))}
          </div>
        </details>
      )}

      {pending.length > 0 && (
        <div className="news-submit-bar">
          {submitted ? (
            <span className="news-submit-ok">Saved — queue updated on GitHub.</span>
          ) : (
            <button className="news-submit-btn" onClick={submit} disabled={submitting}>
              {submitting ? 'Saving…' : 'Submit decisions'}
            </button>
          )}
          {submitError && <span className="news-submit-error">{submitError}</span>}
        </div>
      )}
    </div>
  );
}
