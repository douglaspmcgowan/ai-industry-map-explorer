// Walks ../ai-industry-map/categories/*.html and emits normalized JSON.
// Run: node scripts/extract.mjs
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = resolve(__dirname, '../../ai-industry-map');
const CATEGORIES_DIR = join(SITE_ROOT, 'categories');
const OUT_DIR = resolve(__dirname, '../public/data');
mkdirSync(OUT_DIR, { recursive: true });

const cleanText = (s) => (s || '').replace(/\s+/g, ' ').trim();

// Pull the first "What it is." sentence-ish out of a .comp-body for a tagline.
function taglineFrom($, body) {
  const firstP = body.find('p').first();
  const text = cleanText(firstP.text());
  const stripped = text.replace(/^What it is\.\s*/i, '');
  const firstSentence = stripped.split(/(?<=[.!?])\s/)[0];
  return firstSentence || stripped.slice(0, 180);
}

function extractCompetitor($, el, categorySlug) {
  const $el = $(el);
  const id = $el.attr('id') || '';
  const name = cleanText($el.find('.comp-title h3').first().text());
  const maker = cleanText($el.find('.comp-title .maker').first().text());
  const logo = $el.find('.comp-logo img').first().attr('src') || '';
  const tags = $el.find('.comp-tags .tag').map((_, t) => {
    const $t = $(t);
    const classes = ($t.attr('class') || '').split(/\s+/).filter(Boolean);
    const variant = classes.includes('good') ? 'good' : classes.includes('warn') ? 'warn' : 'default';
    return { label: cleanText($t.text()), variant };
  }).get();
  const body = $el.find('.comp-body').first();
  const tagline = taglineFrom($, body);
  const paragraphs = body.find('p').map((_, p) => cleanText($(p).text())).get();
  const meta = body.find('.comp-meta .kv').map((_, kv) => ({
    k: cleanText($(kv).find('.k').text()),
    v: cleanText($(kv).find('.v').text()),
  })).get();
  const links = body.find('.comp-links a').map((_, a) => {
    const $a = $(a);
    return { label: cleanText($a.text()), url: $a.attr('href') || '' };
  }).get();
  return { id, slug: id, name, maker, logo, tags, tagline, paragraphs, meta, links, category: categorySlug };
}

function extractCategoryPage(filePath) {
  const html = readFileSync(filePath, 'utf8');
  const $ = cheerio.load(html);
  const fileName = filePath.split(/[\\/]/).pop().replace(/\.html$/, '');
  const categorySlug = fileName;
  const categoryName = cleanText($('h1').first().text());
  const blurb = cleanText($('.lead').first().text());
  const competitors = $('.comp').map((_, el) => extractCompetitor($, el, categorySlug)).get();
  return { slug: categorySlug, name: categoryName, blurb, competitors };
}

const files = readdirSync(CATEGORIES_DIR).filter(f => f.endsWith('.html'));
const categories = [];
const companies = [];

for (const f of files) {
  const page = extractCategoryPage(join(CATEGORIES_DIR, f));
  categories.push({
    id: page.slug,
    slug: page.slug,
    name: page.name,
    blurb: page.blurb,
    companyIds: page.competitors.map(c => `${page.slug}__${c.id}`),
  });
  for (const c of page.competitors) {
    companies.push({
      ...c,
      id: `${page.slug}__${c.id}`,
      categorySlug: page.slug,
      categoryName: page.name,
    });
  }
}

writeFileSync(join(OUT_DIR, 'companies.json'), JSON.stringify(companies, null, 2));
writeFileSync(join(OUT_DIR, 'categories.json'), JSON.stringify(categories, null, 2));

console.log(`Wrote ${companies.length} companies across ${categories.length} categories.`);
for (const c of categories) console.log(`  ${c.slug.padEnd(28)} ${c.companyIds.length}`);
