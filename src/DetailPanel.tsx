import { motion, AnimatePresence } from 'framer-motion';
import type { Company } from './types';

type Props = {
  company: Company;
  onClose: () => void;
};

export default function DetailPanel({ company, onClose }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        className="detail-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          className="detail-container"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        >
          <div className="detail-header">
            <div className="detail-logo">
              <img src={company.logo} alt={company.name} />
            </div>
            <div className="detail-title">
              <h1>{company.name}</h1>
              {company.maker && <span className="maker">{company.maker}</span>}
            </div>
          </div>
          <div className="detail-body">
            {company.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {company.meta.length > 0 && (
              <div className="detail-meta">
                {company.meta.map((kv, i) => (
                  <div key={i} style={{ display: 'contents' }}>
                    <span className="k">{kv.k}</span>
                    <span className="v">{kv.v}</span>
                  </div>
                ))}
              </div>
            )}
            {company.links.length > 0 && (
              <div className="detail-links">
                {company.links.map((l, i) => (
                  <a key={i} href={l.url} target="_blank" rel="noreferrer">
                    {l.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
