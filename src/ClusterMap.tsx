import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import type { Category, CategoryNode, Company } from './types';
import Starfield from './Starfield';

type Props = {
  categories: Category[];
  companiesByCategory: Map<string, Company[]>;
  selectedCatId: string | null;
  onSelect: (slug: string) => void;
};

type Transform = { x: number; y: number; k: number };

const MIN_R = 130;
const MAX_R = 245;
const LOGO_SIZE = 90;
const CLUSTER_POPUP_W = 280;
const CLUSTER_POPUP_H = 150;
const COMPANY_POPUP_W = 300;
const COMPANY_POPUP_H = 150;

type HoverCluster = { slug: string };
type HoverCompany = { id: string; slug: string; index: number };

type LogoPos = { angle: number; radius: number };
type SimNode = CategoryNode & d3.SimulationNodeDatum;

function layoutLogos(n: CategoryNode, count: number): LogoPos[] {
  const positions: LogoPos[] = [];
  const outerR = Math.min(n.r * 0.72, n.r - LOGO_SIZE / 2 - 10);
  if (count <= 6) {
    for (let i = 0; i < count; i++) {
      positions.push({ angle: (i / count) * 2 * Math.PI - Math.PI / 2, radius: outerR });
    }
  } else {
    const outerCount = Math.ceil(count / 2);
    const innerCount = count - outerCount;
    const innerR = Math.max(outerR - LOGO_SIZE - 6, LOGO_SIZE * 0.35);
    const outerStart = -Math.PI / 2;
    const innerStart = -Math.PI / 2 + Math.PI / outerCount;
    for (let i = 0; i < outerCount; i++) {
      positions.push({ angle: (i / outerCount) * 2 * Math.PI + outerStart, radius: outerR });
    }
    for (let i = 0; i < innerCount; i++) {
      positions.push({ angle: (i / innerCount) * 2 * Math.PI + innerStart, radius: innerR });
    }
  }
  return positions;
}

export default function ClusterMap({ categories, companiesByCategory, selectedCatId, onSelect }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const panLayerRef = useRef<HTMLDivElement>(null);
  const bubbleRefs = useRef<Map<string, SVGGElement>>(new Map());
  const labelRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const logoRefs = useRef<Map<string, (HTMLDivElement | null)[]>>(new Map());

  const simRef = useRef<d3.Simulation<SimNode, undefined> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<HTMLDivElement, unknown> | null>(null);
  const transformRef = useRef<Transform>({ x: 0, y: 0, k: 1 });
  const didFitRef = useRef(false);
  const pannedRef = useRef(false);
  const panStartRef = useRef<[number, number]>([0, 0]);
  const rafRef = useRef<number | null>(null);

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [nodes, setNodes] = useState<SimNode[]>([]);
  const [hoverCluster, setHoverCluster] = useState<HoverCluster | null>(null);
  const [hoverCompany, setHoverCompany] = useState<HoverCompany | null>(null);
  const [, forceTick] = useState(0);

  const hasHoverRef = useRef(false);
  hasHoverRef.current = !!hoverCluster || !!hoverCompany;

  const nodesRef = useRef<SimNode[]>([]);
  nodesRef.current = nodes;

  useLayoutEffect(() => {
    if (!stageRef.current) return;
    const el = stageRef.current;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        setSize({ w: e.contentRect.width, h: e.contentRect.height });
      }
    });
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const radii = useMemo(() => {
    const counts = categories.map((c) => c.companyIds.length);
    if (counts.length === 0) return new Map<string, number>();
    const min = Math.min(...counts);
    const max = Math.max(...counts);
    const scale = d3.scaleSqrt().domain([min, max]).range([MIN_R, MAX_R]);
    const m = new Map<string, number>();
    for (const c of categories) m.set(c.slug, scale(c.companyIds.length));
    return m;
  }, [categories]);

  useEffect(() => {
    if (!categories.length || !size.w || !size.h || nodes.length) return;
    const seeded: SimNode[] = categories.map((c, i) => {
      const angle = (i / categories.length) * Math.PI * 2;
      const seedR = Math.min(size.w, size.h) * 0.3;
      return {
        ...c,
        x: size.w / 2 + Math.cos(angle) * seedR,
        y: size.h / 2 + Math.sin(angle) * seedR,
        r: radii.get(c.slug) ?? MIN_R,
      };
    });
    setNodes(seeded);
  }, [categories, radii, size.w, size.h, nodes.length]);

  const updatePositions = useCallback(() => {
    const ns = nodesRef.current;
    for (const n of ns) {
      const x = n.x ?? 0;
      const y = n.y ?? 0;
      const bubbleG = bubbleRefs.current.get(n.slug);
      if (bubbleG) bubbleG.setAttribute('transform', `translate(${x},${y})`);

      const labelEl = labelRefs.current.get(n.slug);
      if (labelEl) {
        const labelW = n.r * 1.9;
        const labelH = n.r;
        labelEl.style.transform = `translate3d(${x - labelW / 2}px, ${y - labelH / 2}px, 0)`;
      }

      const logoEls = logoRefs.current.get(n.slug);
      if (logoEls && logoEls.length) {
        const positions = layoutLogos(n, logoEls.length);
        for (let i = 0; i < logoEls.length; i++) {
          const el = logoEls[i];
          if (!el) continue;
          const p = positions[i];
          const cx = x + Math.cos(p.angle) * p.radius;
          const cy = y + Math.sin(p.angle) * p.radius;
          el.style.transform = `translate3d(${cx - LOGO_SIZE / 2}px, ${cy - LOGO_SIZE / 2}px, 0)`;
        }
      }
    }
    if (hasHoverRef.current && rafRef.current == null) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        forceTick((v) => v + 1);
      });
    }
  }, []);

  useLayoutEffect(() => {
    if (nodes.length) updatePositions();
  }, [nodes, updatePositions]);

  useEffect(() => {
    if (!nodes.length || !size.w || !size.h) return;
    const sim = d3
      .forceSimulation<SimNode>(nodes)
      .force('center', d3.forceCenter(size.w / 2, size.h / 2).strength(0.02))
      .force('charge', d3.forceManyBody<SimNode>().strength((d) => -Math.pow(d.r, 1.3) * 0.5))
      .force('collide', d3.forceCollide<SimNode>().radius((d) => d.r + 16).strength(0.9))
      .force('x', d3.forceX<SimNode>(size.w / 2).strength(0.02))
      .force('y', d3.forceY<SimNode>(size.h / 2).strength(0.03))
      .velocityDecay(0.5)
      .alphaDecay(0.02)
      .alphaTarget(0.04)
      .on('tick', updatePositions);
    for (let i = 0; i < 180; i++) sim.tick();
    simRef.current = sim;
    updatePositions();
    return () => {
      sim.stop();
      simRef.current = null;
    };
  }, [nodes, size.w, size.h, updatePositions]);

  useEffect(() => {
    const sim = simRef.current;
    if (!sim) return;
    if (selectedCatId || hoverCluster || hoverCompany) {
      sim.alphaTarget(0);
    } else {
      sim.alphaTarget(0.04).restart();
    }
  }, [selectedCatId, hoverCluster, hoverCompany]);

  useEffect(() => {
    if (!stageRef.current) return;
    const stage = stageRef.current;
    const sel = d3.select<HTMLDivElement, unknown>(stage);
    const zoom = d3
      .zoom<HTMLDivElement, unknown>()
      .scaleExtent([0.3, 2.5])
      .on('start', (event) => {
        pannedRef.current = false;
        if (event.sourceEvent) {
          panStartRef.current = [event.sourceEvent.clientX ?? 0, event.sourceEvent.clientY ?? 0];
        }
      })
      .on('zoom', (event) => {
        const t = { x: event.transform.x, y: event.transform.y, k: event.transform.k };
        transformRef.current = t;
        if (panLayerRef.current) {
          panLayerRef.current.style.transform = `translate(${t.x}px, ${t.y}px) scale(${t.k})`;
        }
        if (event.sourceEvent) {
          const [sx, sy] = panStartRef.current;
          const dx = (event.sourceEvent.clientX ?? sx) - sx;
          const dy = (event.sourceEvent.clientY ?? sy) - sy;
          if (Math.hypot(dx, dy) > 4) pannedRef.current = true;
        }
        if (hasHoverRef.current && rafRef.current == null) {
          rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            forceTick((v) => v + 1);
          });
        }
      });
    zoomRef.current = zoom;
    sel.call(zoom);
    sel.on('dblclick.zoom', null);
    return () => {
      sel.on('.zoom', null);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (didFitRef.current || !nodes.length || !stageRef.current || !zoomRef.current) return;
    if (!size.w || !size.h) return;
    const pad = 60;
    const minX = Math.min(...nodes.map((n) => (n.x ?? 0) - n.r));
    const maxX = Math.max(...nodes.map((n) => (n.x ?? 0) + n.r));
    const minY = Math.min(...nodes.map((n) => (n.y ?? 0) - n.r));
    const maxY = Math.max(...nodes.map((n) => (n.y ?? 0) + n.r));
    const kx = (size.w - pad * 2) / (maxX - minX);
    const ky = (size.h - pad * 2) / (maxY - minY);
    const k = Math.min(kx, ky, 1.05);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const x = size.w / 2 - cx * k;
    const y = size.h / 2 - cy * k;
    d3.select(stageRef.current).call(
      zoomRef.current.transform,
      d3.zoomIdentity.translate(x, y).scale(k),
    );
    didFitRef.current = true;
  }, [nodes, size.w, size.h]);

  const toScreen = (cx: number, cy: number) => {
    const t = transformRef.current;
    return { x: cx * t.k + t.x, y: cy * t.k + t.y };
  };

  const hoveredCategory = hoverCluster ? categories.find((c) => c.slug === hoverCluster.slug) : null;
  const hoveredClusterNode = hoverCluster ? nodes.find((n) => n.slug === hoverCluster.slug) : null;
  const hoveredCompanyData = hoverCompany
    ? companiesByCategory.get(hoverCompany.slug)?.find((c) => c.id === hoverCompany.id)
    : null;
  const hoveredCompanyNode = hoverCompany ? nodes.find((n) => n.slug === hoverCompany.slug) : null;

  return (
    <div ref={stageRef} className="cluster-stage">
      <Starfield width={size.w} height={size.h} transformRef={transformRef} />

      <svg className="nebulae-svg">
        <defs>
          <radialGradient id="nebula-a" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(150, 90, 220, 0.18)" />
            <stop offset="100%" stopColor="rgba(150, 90, 220, 0)" />
          </radialGradient>
          <radialGradient id="nebula-b" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(60, 140, 220, 0.16)" />
            <stop offset="100%" stopColor="rgba(60, 140, 220, 0)" />
          </radialGradient>
          <radialGradient id="nebula-c" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(220, 90, 160, 0.12)" />
            <stop offset="100%" stopColor="rgba(220, 90, 160, 0)" />
          </radialGradient>
        </defs>
        <circle cx={size.w * 0.2} cy={size.h * 0.25} r={Math.min(size.w, size.h) * 0.55} fill="url(#nebula-a)" />
        <circle cx={size.w * 0.8} cy={size.h * 0.7} r={Math.min(size.w, size.h) * 0.6} fill="url(#nebula-b)" />
        <circle cx={size.w * 0.55} cy={size.h * 0.4} r={Math.min(size.w, size.h) * 0.4} fill="url(#nebula-c)" />
      </svg>

      <div ref={panLayerRef} className="pan-layer">
        <svg className="cluster-svg">
          <defs>
            <radialGradient id="bubble-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(124, 156, 255, 0.35)" />
              <stop offset="60%" stopColor="rgba(124, 156, 255, 0.08)" />
              <stop offset="100%" stopColor="rgba(124, 156, 255, 0)" />
            </radialGradient>
          </defs>
          {nodes.map((n, i) => {
            const isActive = hoverCluster?.slug === n.slug;
            return (
              <g
                key={n.slug}
                ref={(el) => {
                  if (el) bubbleRefs.current.set(n.slug, el);
                  else bubbleRefs.current.delete(n.slug);
                }}
                className="cluster-group"
              >
                <circle className="cluster-glow" cx={0} cy={0} r={n.r * 1.5} fill="url(#bubble-glow)" />
                <circle
                  className={`cluster-circle${isActive ? ' is-active' : ''}`}
                  cx={0}
                  cy={0}
                  r={n.r}
                  style={{ animationDelay: `${i * 0.35}s` }}
                  onClick={() => {
                    if (!pannedRef.current) onSelect(n.slug);
                  }}
                  onMouseEnter={() => setHoverCluster({ slug: n.slug })}
                  onMouseLeave={() => setHoverCluster((h) => (h?.slug === n.slug ? null : h))}
                />
              </g>
            );
          })}
        </svg>

        <div className="logo-layer">
          {nodes.map((n) => {
            if (selectedCatId === n.slug) return null;
            const comps = companiesByCategory.get(n.slug) ?? [];
            const positions = layoutLogos(n, comps.length);
            return comps.map((c, i) => {
              const p = positions[i];
              const cx = (n.x ?? 0) + Math.cos(p.angle) * p.radius;
              const cy = (n.y ?? 0) + Math.sin(p.angle) * p.radius;
              return (
                <div
                  key={c.id}
                  className="cluster-logo-slot"
                  ref={(el) => {
                    let arr = logoRefs.current.get(n.slug);
                    if (!arr) {
                      arr = [];
                      logoRefs.current.set(n.slug, arr);
                    }
                    arr[i] = el;
                  }}
                  style={{
                    width: LOGO_SIZE,
                    height: LOGO_SIZE,
                    transform: `translate3d(${cx - LOGO_SIZE / 2}px, ${cy - LOGO_SIZE / 2}px, 0)`,
                  }}
                  onMouseEnter={() => setHoverCompany({ id: c.id, slug: n.slug, index: i })}
                  onMouseLeave={() => setHoverCompany((h) => (h?.id === c.id ? null : h))}
                  onClick={(e) => {
                    if (pannedRef.current) return;
                    e.stopPropagation();
                    onSelect(n.slug);
                  }}
                >
                  <motion.div
                    layoutId={`logo-${c.id}`}
                    className="cluster-logo"
                    transition={{ type: 'spring', stiffness: 280, damping: 32 }}
                  >
                    <img src={c.logo} alt={c.name} loading="lazy" />
                  </motion.div>
                </div>
              );
            });
          })}
        </div>

        <div className="label-layer">
          {nodes.map((n) => {
            const labelW = n.r * 1.9;
            const labelH = n.r;
            const labelFont = Math.max(18, Math.min(34, n.r * 0.18));
            const countFont = Math.max(14, Math.min(22, n.r * 0.12));
            return (
              <div
                key={n.slug}
                ref={(el) => {
                  if (el) labelRefs.current.set(n.slug, el);
                  else labelRefs.current.delete(n.slug);
                }}
                className="cluster-label-container"
                style={{ width: labelW, height: labelH }}
              >
                <div
                  className="cluster-label-text"
                  style={{ fontSize: labelFont, lineHeight: 1.15 }}
                >
                  {n.name}
                </div>
                <div
                  className="cluster-count-inline"
                  style={{ fontSize: countFont }}
                >
                  {n.companyIds.length} tools
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {hoverCluster && hoveredCategory && hoveredClusterNode && !hoverCompany && (() => {
        const tr = transformRef.current;
        const sp = toScreen(hoveredClusterNode.x ?? 0, hoveredClusterNode.y ?? 0);
        const rScreen = hoveredClusterNode.r * tr.k;
        const spaceAbove = sp.y - rScreen - 12;
        const flipBelow = spaceAbove < CLUSTER_POPUP_H + 12;
        const top = flipBelow
          ? Math.min(size.h - CLUSTER_POPUP_H - 12, sp.y + rScreen + 12)
          : sp.y - rScreen - CLUSTER_POPUP_H - 12;
        const clampedTop = Math.max(12, top);
        const left = Math.max(
          12,
          Math.min(size.w - CLUSTER_POPUP_W - 12, sp.x - CLUSTER_POPUP_W / 2),
        );
        return (
          <div
            className="hover-popup cluster-popup"
            style={{ left, top: clampedTop, width: CLUSTER_POPUP_W, maxHeight: CLUSTER_POPUP_H }}
          >
            <h3>{hoveredCategory.name}</h3>
            <p>{hoveredCategory.blurb}</p>
            <span className="count-chip">{hoveredCategory.companyIds.length} tools · click to explore</span>
          </div>
        );
      })()}

      {hoverCompany && hoveredCompanyData && hoveredCompanyNode && (() => {
        const tr = transformRef.current;
        const comps = companiesByCategory.get(hoveredCompanyNode.slug) ?? [];
        const positions = layoutLogos(hoveredCompanyNode, comps.length);
        const p = positions[hoverCompany.index];
        if (!p) return null;
        const cx = (hoveredCompanyNode.x ?? 0) + Math.cos(p.angle) * p.radius;
        const cy = (hoveredCompanyNode.y ?? 0) + Math.sin(p.angle) * p.radius;
        const sp = toScreen(cx, cy);
        const halfScreen = (LOGO_SIZE / 2) * tr.k;
        const spaceAbove = sp.y - halfScreen - 12;
        const flipBelow = spaceAbove < COMPANY_POPUP_H + 12;
        const top = flipBelow
          ? Math.min(size.h - COMPANY_POPUP_H - 12, sp.y + halfScreen + 12)
          : sp.y - halfScreen - COMPANY_POPUP_H - 12;
        const clampedTop = Math.max(12, top);
        const left = Math.max(
          12,
          Math.min(size.w - COMPANY_POPUP_W - 12, sp.x - COMPANY_POPUP_W / 2),
        );
        return (
          <div
            className="hover-popup company-popup"
            style={{ left, top: clampedTop, width: COMPANY_POPUP_W, maxHeight: COMPANY_POPUP_H }}
          >
            <div className="popup-head">
              <div className="popup-logo">
                <img src={hoveredCompanyData.logo} alt="" />
              </div>
              <div>
                <strong>{hoveredCompanyData.name}</strong>
                {hoveredCompanyData.maker && <small>{hoveredCompanyData.maker}</small>}
              </div>
            </div>
            <p>{hoveredCompanyData.tagline}</p>
          </div>
        );
      })()}

      {!!nodes.length && (
        <div className="pan-hint">drag to pan · scroll to zoom · clusters drift</div>
      )}
    </div>
  );
}
