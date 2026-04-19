import { useEffect, useMemo, useState } from 'react';
import { LayoutGroup } from 'framer-motion';
import type { Category, Company } from './types';
import ClusterMap from './ClusterMap';
import CardGrid from './CardGrid';
import DetailPanel from './DetailPanel';

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
          {selectedCatId && (
            <button className="back-btn" onClick={() => { setSelectedCatId(null); setSelectedCompanyId(null); }}>
              ← All categories
            </button>
          )}
          <a href="https://ai-industry-map.vercel.app" target="_blank" rel="noreferrer">
            Static site
          </a>
        </nav>
      </header>

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
  );
}
