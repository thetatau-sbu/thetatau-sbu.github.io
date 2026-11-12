import type { ImageMetadata } from 'astro';
import site from '../data/site.json';
import rush from '../data/rush.json';
import brothersRaw from '../data/brothers.json';
import eboardRaw from '../data/eboard.json';
import careers from '../data/careers.json';
import companiesRaw from '../data/companies.json';
import eventsRaw from '../data/events.json';

export { site, rush, careers };

// Pledge classes in order. Append each new class name (and its letters) to the end as it crosses.
// The chapter named the class after Psi "Gamma Beta"; it does not follow Omega / Alpha Beta / …
// scripts/check-data.mjs reads this list to validate pledgeClass.
export const CLASSES = [
  ['Founders', 'F'], ['Alpha', 'Α'], ['Beta', 'Β'], ['Gamma', 'Γ'], ['Delta', 'Δ'],
  ['Epsilon', 'Ε'], ['Zeta', 'Ζ'], ['Eta', 'Η'], ['Theta', 'Θ'], ['Iota', 'Ι'],
  ['Kappa', 'Κ'], ['Lambda', 'Λ'], ['Mu', 'Μ'], ['Nu', 'Ν'], ['Xi', 'Ξ'],
  ['Omicron', 'Ο'], ['Pi', 'Π'], ['Rho', 'Ρ'], ['Sigma', 'Σ'], ['Tau', 'Τ'],
  ['Upsilon', 'Υ'], ['Phi', 'Φ'], ['Chi', 'Χ'], ['Psi', 'Ψ'], ['Gamma Beta', 'ΓΒ'],
] as const;

export type Brother = {
  id: string;
  name: string;
  pledgeClass: string;
  gradYear: number | null;
  major: string;
  /** active: shown on the Actives page. inactive: on the roster but not active this term (class page only). alumni: Alumni page. */
  status: 'active' | 'inactive' | 'alumni';
  linkedin: string | null;
  photo: string | null;
  image?: ImageMetadata;
};

const photos = import.meta.glob<{ default: ImageMetadata }>('../assets/brothers/*.{jpg,jpeg,png,webp}', { eager: true });
const photoByFile = Object.fromEntries(
  Object.entries(photos).map(([path, mod]) => [path.split('/').pop()!, mod.default]),
);

export const classIndex = (name: string) => CLASSES.findIndex(([n]) => n === name);
export const classLetter = (name: string) => CLASSES.find(([n]) => n === name)?.[1] ?? '·';
export const classSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');
export const classLabel = (name: string) => (name === 'Founders' ? 'Founding Class' : `${name} Class`);

export const brothers: Brother[] = (brothersRaw as Brother[]).map((b) => ({
  ...b,
  image: b.photo ? photoByFile[b.photo] : undefined,
}));

export const byId = Object.fromEntries(brothers.map((b) => [b.id, b]));
export const actives = brothers.filter((b) => b.status === 'active');
export const alumni = brothers.filter((b) => b.status === 'alumni');
export const founders = brothers.filter((b) => b.pledgeClass === 'Founders');

export const eboard = {
  term: eboardRaw.term,
  // A role may carry its own `photo` (the matching e-board portrait set); otherwise the brother's headshot is used.
  roles: (eboardRaw.roles as { role: string; brother: string; photo?: string }[])
    .map((r) => {
      const b = byId[r.brother];
      const image = r.photo ? photoByFile[r.photo] : undefined;
      return { role: r.role, brother: b && image ? { ...b, image } : b };
    })
    .filter((r) => r.brother),
};

/** Group brothers by pledge class, newest class first unless `oldestFirst`. */
export function groupByClass(list: Brother[], oldestFirst = false) {
  const groups = new Map<string, Brother[]>();
  for (const b of list) {
    if (!groups.has(b.pledgeClass)) groups.set(b.pledgeClass, []);
    groups.get(b.pledgeClass)!.push(b);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (oldestFirst ? 1 : -1) * (classIndex(a) - classIndex(b)))
    .map(([name, members]) => ({ name, letter: classLetter(name), slug: classSlug(name), members }));
}

export const allClasses = groupByClass(brothers, true);

export type ChapterEvent = {
  name: string;
  date: string;
  time?: string;
  location?: string;
  type: string;
  rush?: string;
  note?: string;
};
export const events = (eventsRaw as ChapterEvent[]).slice().sort((a, b) => b.date.localeCompare(a.date));

/** Most recent rush that has events on record (used when the next rush has no schedule yet). */
export const lastRush = (() => {
  const sem = events.find((e) => e.rush)?.rush;
  return sem ? { semester: sem, events: events.filter((e) => e.rush === sem).reverse() } : null;
})();

export const companies = [...new Set(careers.map((c) => c.company))].sort((a, b) => a.localeCompare(b));

/** The names set large on the Careers page (src/data/companies.json), in that order, with the number of
 *  roles reported at each and the years they span ("2024" or "2021–2026"). check-data.mjs checks the names. */
export const headlineCompanies = companiesRaw.headline.map((name) => {
  const years = careers.filter((c) => c.company === name).map((c) => c.year);
  const first = Math.min(...years), last = Math.max(...years);
  return { name, roles: years.length, years: first === last ? `${first}` : `${first}–${last}` };
});

export const stats = {
  brothers: brothers.length,
  actives: actives.length,
  classes: allClasses.length,
  companies: companies.length,
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export function parseDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}
export function fmtDate(iso: string, withYear = true) {
  const d = parseDate(iso);
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}${withYear ? `, ${d.getFullYear()}` : ''}`;
}
export const monthShort = (iso: string) => MONTHS[parseDate(iso).getMonth()];
export const dayNum = (iso: string) => parseDate(iso).getDate();
