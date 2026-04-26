import { useEffect, useMemo, useState } from 'react';
import { LayoutGroup } from 'framer-motion';
import type { Category, Company } from './types';
import ClusterMap from './ClusterMap';
import CardGrid from './CardGrid';
import DetailPanel from './DetailPanel';
import NewsPage from './NewsPage';

function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'dark',
  );
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch { /* noop */ }
  }, [theme]);
  return (
    <button
      type="button"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      className="theme-toggle"
    >
      {theme === 'dark' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

function readParam(name: string): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(name);
}

function writeParams(patch: Record<string, string | null>) {
  const url = new URL(window.location.href);
  for (const [k, v] of Object.entries(patch)) {
    if (v == null) url.searchParams.delete(k);
    else url.searchParams.set(k, v);
  }
  window.history.replaceState({}, '', url.toString());
}

export default function App() {
  const [view, setView] = useState<'map' | 'news'>('map');
  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedCatId, setSelectedCatId] = useState<string | null>(() => readParam('cat'));
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(() => readParam('co'));

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.BASE_URL}data/categories.json`).then((r) => r.json()),
      fetch(`${import.meta.env.BASE_URL}data/companies.json`).then((r) => r.json()),
    ])
      .then(([cats, comps]) => {
        setCategories(cats);
        setCompanies(comps);
      })
      .catch((e) => setLoadError(String(e)));
  }, []);

  useEffect(() => {
    writeParams({ cat: selectedCatId, co: selectedCompanyId });
  }, [selectedCatId, selectedCompanyId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedCompanyId) setSelectedCompanyId(null);
        else if (selectedCatId) setSelectedCatId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedCatId, selectedCompanyId]);

  const companiesByCategory = useMemo(() => {
    const map = new Map<string, Company[]>();
    for (const c of companies) {
      const list = map.get(c.categorySlug) ?? [];
      list.push(c);
      map.set(c.categorySlug, list);
    }
    return map;
  }, [companies]);

  const selectedCategory = selectedCatId ? categories.find((c) => c.slug === selectedCatId) ?? null : null;
  const selectedCompany = selectedCompanyId ? companies.find((c) => c.id === selectedCompanyId) ?? null : null;

  return (
    <>
      <header className="explorer-header">
        <div className="brand">
          <span className="accent">AI</span> Industry Map
        </div>
        <nav>
          {view === 'map' && selectedCatId && (
            <button className="back-btn" onClick={() => { setSelectedCatId(null); setSelectedCompanyId(null); }}>
              ← All categories
            </button>
          )}
          {view === 'map' ? (
            <button className="nav-link-btn" onClick={() => setView('news')}>News Queue</button>
          ) : (
            <button className="back-btn" onClick={() => setView('map')}>← Map</button>
          )}
          <a href="https://ai-industry-map.vercel.app" target="_blank" rel="noreferrer">
            Static site
          </a>
          <ThemeToggle />
        </nav>
      </header>

      {view === 'news' ? (
        <NewsPage />
      ) : (
        <>
          {loadError && (
            <div style={{ padding: 40, color: 'var(--warn)' }}>Failed to load data: {loadError}</div>
          )}

          <LayoutGroup>
            <ClusterMap
              categories={categories}
              companiesByCategory={companiesByCategory}
              selectedCatId={selectedCatId}
              onSelect={setSelectedCatId}
            />

            {selectedCategory && (
              <CardGrid
                category={selectedCategory}
                companies={companiesByCategory.get(selectedCategory.slug) ?? []}
                onClose={() => setSelectedCatId(null)}
                onSelectCompany={setSelectedCompanyId}
              />
            )}
          </LayoutGroup>

          {selectedCompany && (
            <DetailPanel company={selectedCompany} onClose={() => setSelectedCompanyId(null)} />
          )}
        </>
      )}
    </>
  );
}
