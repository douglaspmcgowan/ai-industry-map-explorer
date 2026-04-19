import { motion, AnimatePresence } from 'framer-motion';
import type { Category, Company } from './types';

type Props = {
  category: Category;
  companies: Company[];
  onClose: () => void;
  onSelectCompany: (id: string) => void;
};

export default function CardGrid({ category, companies, onClose, onSelectCompany }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        className="grid-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => {
          const t = e.target as HTMLElement;
          if (!t.closest('.card')) onClose();
        }}
      >
        <div className="grid-container">
          <motion.div
            className="grid-header"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1>{category.name}</h1>
            <p>{category.blurb}</p>
          </motion.div>
          <div className="card-grid">
            {companies.map((c) => (
              <div key={c.id} className="card" onClick={() => onSelectCompany(c.id)}>
                <div className="card-top">
                  <motion.div
                    layoutId={`logo-${c.id}`}
                    className="card-logo"
                    transition={{ type: 'spring', stiffness: 280, damping: 32 }}
                  >
                    <img src={c.logo} alt={c.name} loading="lazy" />
                  </motion.div>
                  <div className="card-title">
                    <span className="card-name">{c.name}</span>
                    {c.maker && <span className="card-maker">{c.maker}</span>}
                  </div>
                </div>
                <div className="card-tagline">{c.tagline}</div>
                {c.tags.length > 0 && (
                  <div className="card-tags">
                    {c.tags.slice(0, 4).map((t, i) => (
                      <span key={i} className={`tag ${t.variant !== 'default' ? t.variant : ''}`}>
                        {t.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
