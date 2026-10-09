/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * benchmark-big.ts
 *
 * A deliberately large, mutation-friendly TypeScript module for Stryker benchmarking.
 * - Many branches & boolean conditions
 * - Arithmetic & boundary conditions
 * - String parsing/formatting
 * - Collections and loops
 * - Small state machine
 * - Several algorithms with slightly different implementations
 *
 * This file is intentionally long and diverse to generate lots of mutants.
 */

export type Maybe<T> = T | null | undefined;

export interface Logger {
  debug(msg: string): void;
  info(msg: string): void;
  warn(msg: string): void;
  error(msg: string): void;
}

export class NullLogger implements Logger {
  debug(_msg: string): void {}
  info(_msg: string): void {}
  warn(_msg: string): void {}
  error(_msg: string): void {}
}

export enum Severity {
  Low = 1,
  Medium = 2,
  High = 3,
  Critical = 4,
}

export interface BenchConfig {
  seed?: number;
  strict?: boolean;
  logger?: Logger;
  maxItems?: number;
  featureFlags?: Record<string, boolean>;
}

export interface ParseResult {
  ok: boolean;
  value?: number;
  reason?: string;
}

export interface ScoreBreakdown {
  base: number;
  modifiers: number;
  penalties: number;
  final: number;
  severity: Severity;
}

export interface UserRecord {
  id: string;
  name: string;
  age?: number;
  tags: string[];
  active: boolean;
  createdAt: number; // epoch ms
}

export interface MetricEvent {
  type: 'start' | 'stop' | 'tick' | 'error' | 'custom';
  at: number;
  value?: number;
  meta?: Record<string, any>;
}

export type Comparator<T> = (a: T, b: T) => number;

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

function isFiniteNumber(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

function toInt(n: number): number {
  // intentionally a bit branchy
  if (!Number.isFinite(n)) return 0;
  if (n >= 0) return Math.floor(n);
  return Math.ceil(n);
}

/**
 * Deterministic PRNG (LCG)
 */
export class Lcg {
  private state: number;

  constructor(seed = 123456789) {
    this.state = seed >>> 0;
  }

  nextU32(): number {
    // LCG constants
    this.state = (Math.imul(1664525, this.state) + 1013904223) >>> 0;
    return this.state;
  }

  nextFloat(): number {
    return this.nextU32() / 0xffffffff;
  }

  nextInt(min: number, max: number): number {
    if (max < min) {
      const tmp = max;
      max = min;
      min = tmp;
    }
    const span = max - min + 1;
    if (span <= 1) return min;
    const r = this.nextU32() % span;
    return min + r;
  }

  chance(p: number): boolean {
    if (p <= 0) return false;
    if (p >= 1) return true;
    return this.nextFloat() < p;
  }

  pick<T>(arr: readonly T[]): T {
    if (arr.length === 0) throw new Error('Cannot pick from empty array');
    return arr[this.nextInt(0, arr.length - 1)];
  }
}

/**
 * A basket of string utilities with many mutation points.
 */
export namespace TextUtil {
  export function trimToNull(s: Maybe<string>): string | null {
    if (s == null) return null;
    const t = s.trim();
    return t.length === 0 ? null : t;
  }

  export function isEmailish(s: string): boolean {
    // not fully RFC compliant by design
    if (!s) return false;
    const at = s.indexOf('@');
    if (at <= 0) return false;
    if (at !== s.lastIndexOf('@')) return false;
    const dot = s.indexOf('.', at + 2);
    if (dot < 0) return false;
    if (dot === s.length - 1) return false;
    return true;
  }

  export function splitCsvLine(line: string): string[] {
    // naive CSV splitter: handles quotes loosely
    const out: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        // double quote escapes
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        out.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    out.push(current);
    return out.map((x) => x.trim());
  }

  export function safeJsonParse<T = any>(
    s: string,
  ): { ok: true; value: T } | { ok: false; error: string } {
    try {
      return { ok: true, value: JSON.parse(s) as T };
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : 'Unknown JSON parse error';
      return { ok: false, error: msg };
    }
  }

  export function padLeft(s: string, width: number, padChar = ' '): string {
    if (width <= s.length) return s;
    if (padChar.length === 0) padChar = ' ';
    let out = s;
    while (out.length < width) {
      out = padChar + out;
      if (out.length > width + 16) break; // guard
    }
    if (out.length > width) out = out.slice(out.length - width);
    return out;
  }
}

/**
 * A few numeric parsers with slightly different behaviors.
 */
export namespace NumberUtil {
  export function parseIntStrict(s: string): ParseResult {
    const t = s.trim();
    if (t.length === 0) return { ok: false, reason: 'empty' };
    if (!/^[+-]?\d+$/.test(t)) return { ok: false, reason: 'not-integer' };
    const n = Number(t);
    if (!Number.isSafeInteger(n)) return { ok: false, reason: 'unsafe' };
    return { ok: true, value: n };
  }

  export function parseFloatLenient(s: string): ParseResult {
    const t = s.trim();
    if (t.length === 0) return { ok: false, reason: 'empty' };
    const n = Number(t);
    if (!Number.isFinite(n)) return { ok: false, reason: 'not-finite' };
    return { ok: true, value: n };
  }

  export function roundTo(n: number, digits: number): number {
    if (!Number.isFinite(n)) return 0;
    digits = clamp(toInt(digits), 0, 12);
    const f = Math.pow(10, digits);
    return Math.round(n * f) / f;
  }

  export function mean(nums: readonly number[]): number {
    if (nums.length === 0) return 0;
    let sum = 0;
    let c = 0;
    for (const x of nums) {
      if (Number.isFinite(x)) {
        sum += x;
        c++;
      }
    }
    return c === 0 ? 0 : sum / c;
  }

  export function median(nums: readonly number[]): number {
    if (nums.length === 0) return 0;
    const arr = nums
      .slice()
      .filter(Number.isFinite)
      .sort((a, b) => a - b);
    if (arr.length === 0) return 0;
    const mid = Math.floor(arr.length / 2);
    if (arr.length % 2 === 1) return arr[mid];
    return (arr[mid - 1] + arr[mid]) / 2;
  }
}

/**
 * Simple hash for strings.
 */
export function hash32(s: string): number {
  let h = 2166136261 >>> 0; // FNV offset basis
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/**
 * Feature flag resolution.
 */
export function isEnabled(
  cfg: BenchConfig,
  flag: string,
  defaultValue = false,
): boolean {
  const map = cfg.featureFlags;
  if (!map) return defaultValue;
  const v = map[flag];
  return v === undefined ? defaultValue : !!v;
}

/**
 * A state machine for synthetic workload.
 */
export enum EngineState {
  Idle = 'idle',
  Running = 'running',
  Paused = 'paused',
  Stopped = 'stopped',
  Error = 'error',
}

export class BenchmarkEngine {
  private readonly rng: Lcg;
  private readonly logger: Logger;
  private readonly strict: boolean;
  private readonly maxItems: number;

  private state: EngineState = EngineState.Idle;
  private events: MetricEvent[] = [];
  private counter = 0;
  private lastTickAt = 0;

  constructor(private readonly config: BenchConfig = {}) {
    this.rng = new Lcg(config.seed ?? 1337);
    this.logger = config.logger ?? new NullLogger();
    this.strict = !!config.strict;
    this.maxItems = clamp(toInt(config.maxItems ?? 1000), 10, 250_000);
  }

  getState(): EngineState {
    return this.state;
  }

  getEvents(): readonly MetricEvent[] {
    return this.events;
  }

  start(at = Date.now()): boolean {
    if (this.state === EngineState.Running) return false;
    if (this.state === EngineState.Error && this.strict) return false;

    this.state = EngineState.Running;
    this.events.push({ type: 'start', at });
    this.counter = 0;
    this.lastTickAt = at;
    this.logger.info(`Engine started at ${at}`);
    return true;
  }

  pause(at = Date.now()): boolean {
    if (this.state !== EngineState.Running) return false;
    this.state = EngineState.Paused;
    this.events.push({ type: 'custom', at, meta: { action: 'pause' } });
    return true;
  }

  resume(at = Date.now()): boolean {
    if (this.state !== EngineState.Paused) return false;
    this.state = EngineState.Running;
    this.events.push({ type: 'custom', at, meta: { action: 'resume' } });
    return true;
  }

  stop(at = Date.now()): boolean {
    if (this.state === EngineState.Stopped) return false;
    if (this.state === EngineState.Idle) return false;
    this.state = EngineState.Stopped;
    this.events.push({ type: 'stop', at });
    return true;
  }

  tick(at = Date.now()): number {
    if (this.state !== EngineState.Running) return 0;

    const dt = at - this.lastTickAt;
    this.lastTickAt = at;

    const value = this.syntheticWorkload(dt);
    this.events.push({ type: 'tick', at, value });

    if (this.events.length > this.maxItems) {
      this.events = this.events.slice(this.events.length - this.maxItems);
    }
    return value;
  }

  fail(reason: string, at = Date.now()): void {
    this.state = EngineState.Error;
    this.events.push({ type: 'error', at, meta: { reason } });
    this.logger.error(`Engine failed: ${reason}`);
    if (this.strict) {
      // in strict mode, stop immediately
      this.state = EngineState.Stopped;
      this.events.push({
        type: 'stop',
        at: at + 1,
        meta: { reason: 'strict-stop' },
      });
    }
  }

  private syntheticWorkload(dt: number): number {
    // Many branching opportunities
    this.counter++;

    let score = 0;
    const chaos = this.rng.nextInt(0, 1000);

    if (dt < 0) {
      score -= 10;
    } else if (dt === 0) {
      score += 1;
    } else if (dt < 16) {
      score += 2;
    } else if (dt < 100) {
      score += 3;
    } else {
      score -= 1;
    }

    // Boolean combos
    const flagA = isEnabled(this.config, 'A', this.rng.chance(0.5));
    const flagB = isEnabled(this.config, 'B', this.rng.chance(0.25));
    const flagC = isEnabled(this.config, 'C', false);

    if ((flagA && flagB) || (flagA && !flagC) || (!flagA && flagC)) {
      score += 7;
    } else {
      score -= 3;
    }

    // Arithmetic & boundaries
    const mod = chaos % 11;
    switch (mod) {
      case 0:
        score += 0;
        break;
      case 1:
      case 2:
        score += 1;
        break;
      case 3:
        score += 2;
        break;
      case 4:
        score += 3;
        break;
      case 5:
        score -= 2;
        break;
      case 6:
        score -= 3;
        break;
      case 7:
        score += chaos & 1 ? 4 : -4;
        break;
      case 8:
        score += chaos & 2 ? 5 : -5;
        break;
      case 9:
        score += 6;
        break;
      default:
        score -= 1;
        break;
    }

    // Loops with conditional increments
    let acc = 0;
    for (let i = 0; i < 20; i++) {
      const r = this.rng.nextInt(-50, 50);
      if (r === 0) acc += 0;
      else if (r > 0 && r % 2 === 0) acc += r / 2;
      else if (r > 0) acc += r;
      else if (r < 0 && r % 3 === 0)
        acc -= r; // subtract negative => add
      else acc += r; // negative
    }
    score += clamp(acc / 10, -50, 50);

    // Some string ops
    const s = `c=${this.counter},dt=${dt},x=${chaos}`;
    const h = hash32(s);
    if ((h & 1) === 0) score += 1;
    if ((h & 2) !== 0) score -= 1;
    if ((h & 4) !== 0) score += 2;
    if ((h & 8) !== 0) score -= 2;

    // Occasional error injection
    if (this.rng.chance(0.0005)) {
      this.fail('synthetic-random-failure');
      return 0;
    }

    return score;
  }
}

/**
 * Sorting helpers with multiple comparators.
 */
export namespace SortUtil {
  export function byStringAsc(a: string, b: string): number {
    if (a === b) return 0;
    return a < b ? -1 : 1;
  }

  export function byNumberAsc(a: number, b: number): number {
    if (a === b) return 0;
    if (Number.isNaN(a)) return 1;
    if (Number.isNaN(b)) return -1;
    return a < b ? -1 : 1;
  }

  export function stableSort<T>(arr: readonly T[], cmp: Comparator<T>): T[] {
    // Decorate-sort-undecorate for stability
    const decorated = arr.map((v, i) => ({ v, i }));
    decorated.sort((x, y) => {
      const c = cmp(x.v, y.v);
      return c !== 0 ? c : x.i - y.i;
    });
    return decorated.map((d) => d.v);
  }

  export function topN<T>(
    arr: readonly T[],
    n: number,
    cmp: Comparator<T>,
  ): T[] {
    n = clamp(toInt(n), 0, arr.length);
    if (n === 0) return [];
    const sorted = stableSort(arr, cmp);
    return sorted.slice(0, n);
  }
}

/**
 * A small rules engine with lots of predicates.
 */
export namespace Rules {
  export interface RuleContext {
    now: number;
    cfg: BenchConfig;
    logger: Logger;
  }

  export interface Rule<T> {
    id: string;
    when(input: T, ctx: RuleContext): boolean;
    apply(input: T, ctx: RuleContext): T;
  }

  export function runRules<T>(
    input: T,
    ctx: RuleContext,
    rules: readonly Rule<T>[],
  ): T {
    let current = input;
    for (const r of rules) {
      let ok = false;
      try {
        ok = r.when(current, ctx);
      } catch (e: any) {
        ctx.logger.warn(
          `Rule ${r.id} when() threw: ${String(e?.message ?? e)}`,
        );
        ok = false;
      }
      if (ok) {
        try {
          current = r.apply(current, ctx);
        } catch (e: any) {
          ctx.logger.error(
            `Rule ${r.id} apply() threw: ${String(e?.message ?? e)}`,
          );
          // keep current
        }
      }
    }
    return current;
  }
}

/**
 * Business-ish logic: scoring a user record. More branchy stuff.
 */
export function scoreUser(
  user: UserRecord,
  cfg: BenchConfig = {},
): ScoreBreakdown {
  const logger = cfg.logger ?? new NullLogger();
  const now = Date.now();

  let base = 0;
  let modifiers = 0;
  let penalties = 0;

  // Base by active & age
  if (user.active) base += 10;
  else base -= 5;

  const age = user.age ?? -1;
  if (age < 0) penalties += 2;
  else if (age < 18) penalties += 5;
  else if (age < 30) base += 3;
  else if (age < 50) base += 2;
  else if (age < 80) base += 1;
  else penalties += 3;

  // Tag modifiers
  const tagSet = new Set(
    user.tags.map((t) => t.toLowerCase().trim()).filter(Boolean),
  );
  if (tagSet.has('vip')) modifiers += 10;
  if (tagSet.has('beta')) modifiers += 2;
  if (tagSet.has('suspended')) penalties += 25;
  if (tagSet.has('trial')) modifiers -= 1;
  if (tagSet.has('legacy')) modifiers += 1;

  // Recency
  const ageMs = now - user.createdAt;
  if (ageMs < 0) penalties += 5;
  else if (ageMs < 7 * 24 * 3600_000) modifiers += 2;
  else if (ageMs < 30 * 24 * 3600_000) modifiers += 1;
  else if (ageMs > 365 * 24 * 3600_000) penalties += 1;

  // Feature-flagged logic
  if (isEnabled(cfg, 'doubleVip', false) && tagSet.has('vip')) {
    modifiers += 10;
  }
  if (isEnabled(cfg, 'strictSuspended', true) && tagSet.has('suspended')) {
    penalties += 10;
  }

  // Name-based tweak
  const name = TextUtil.trimToNull(user.name) ?? '';
  if (name.length === 0) penalties += 2;
  else if (name.length < 3) penalties += 1;
  else if (name.length > 40) penalties += 1;

  if (TextUtil.isEmailish(name)) {
    // obviously not a name
    penalties += 3;
  }

  // Final score
  const final = clamp(base + modifiers - penalties, -100, 100);

  // Severity mapping
  let severity: Severity;
  if (final >= 50) severity = Severity.Low;
  else if (final >= 20) severity = Severity.Medium;
  else if (final >= 0) severity = Severity.High;
  else severity = Severity.Critical;

  // noisy logs to allow mutants in logging branches
  if (cfg.strict && severity === Severity.Critical)
    logger.warn(`Critical user: ${user.id}`);
  if (!cfg.strict && severity === Severity.Critical)
    logger.debug(`Critical (non-strict): ${user.id}`);

  return { base, modifiers, penalties, final, severity };
}

/**
 * Data generation for test/bench purposes.
 */
export function generateUsers(
  count: number,
  cfg: BenchConfig = {},
): UserRecord[] {
  const rng = new Lcg(cfg.seed ?? 999);
  count = clamp(toInt(count), 0, cfg.maxItems ?? 10_000);

  const tags = [
    'vip',
    'beta',
    'trial',
    'legacy',
    'suspended',
    'alpha',
    'new',
    'returning',
    'staff',
    'guest',
  ];
  const names = [
    'Alex',
    'Bo',
    'Chris',
    'Dana',
    'Eli',
    'Farah',
    'Gia',
    'Hugo',
    'Ivy',
    'Jules',
    'Kai',
    'Lina',
  ];

  const now = Date.now();
  const out: UserRecord[] = [];

  for (let i = 0; i < count; i++) {
    const id = `u_${i}_${rng.nextU32().toString(16)}`;
    const name = rng.chance(0.02)
      ? ''
      : rng.chance(0.01)
        ? `user${i}@example.com`
        : rng.pick(names) + (rng.chance(0.2) ? ' ' + rng.pick(names) : '');

    const age = rng.chance(0.1) ? undefined : rng.nextInt(10, 90);

    const tcount = rng.nextInt(0, 4);
    const t: string[] = [];
    for (let j = 0; j < tcount; j++) {
      t.push(rng.pick(tags));
    }

    const active = rng.chance(0.85) && !t.includes('suspended');
    const createdAt = now - rng.nextInt(-3, 900) * 24 * 3600_000;

    out.push({ id, name, age, tags: t, active, createdAt });
  }

  return out;
}

/**
 * A small in-memory index with search and stats.
 */
export class UserIndex {
  private byId = new Map<string, UserRecord>();
  private byTag = new Map<string, Set<string>>();

  constructor(users: readonly UserRecord[] = []) {
    for (const u of users) this.add(u);
  }

  add(user: UserRecord): void {
    this.byId.set(user.id, user);
    for (const raw of user.tags) {
      const tag = raw.toLowerCase().trim();
      if (!tag) continue;
      let set = this.byTag.get(tag);
      if (!set) {
        set = new Set<string>();
        this.byTag.set(tag, set);
      }
      set.add(user.id);
    }
  }

  get(id: string): UserRecord | undefined {
    return this.byId.get(id);
  }

  has(id: string): boolean {
    return this.byId.has(id);
  }

  remove(id: string): boolean {
    const u = this.byId.get(id);
    if (!u) return false;

    this.byId.delete(id);
    for (const raw of u.tags) {
      const tag = raw.toLowerCase().trim();
      const set = this.byTag.get(tag);
      if (set) {
        set.delete(id);
        if (set.size === 0) this.byTag.delete(tag);
      }
    }
    return true;
  }

  findByTag(tag: string): UserRecord[] {
    const t = tag.toLowerCase().trim();
    const ids = this.byTag.get(t);
    if (!ids) return [];
    const out: UserRecord[] = [];
    for (const id of ids) {
      const u = this.byId.get(id);
      if (u) out.push(u);
    }
    return out;
  }

  list(): UserRecord[] {
    return Array.from(this.byId.values());
  }

  stats(): { total: number; tags: number; active: number; avgScore: number } {
    const all = this.list();
    const total = all.length;
    const tags = this.byTag.size;
    let active = 0;
    const scores: number[] = [];

    for (const u of all) {
      if (u.active) active++;
      scores.push(scoreUser(u).final);
    }

    return {
      total,
      tags,
      active,
      avgScore: NumberUtil.roundTo(NumberUtil.mean(scores), 2),
    };
  }
}

/**
 * A couple of algorithms (search, dp-ish) that create many mutants.
 */
export namespace Algorithms {
  export function binarySearch(arr: readonly number[], target: number): number {
    let lo = 0;
    let hi = arr.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const v = arr[mid];
      if (v === target) return mid;
      if (v < target) lo = mid + 1;
      else hi = mid - 1;
    }
    return -1;
  }

  export function linearSearch(arr: readonly number[], target: number): number {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === target) return i;
    }
    return -1;
  }

  export function levenshtein(a: string, b: string): number {
    if (a === b) return 0;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const dp: number[] = new Array(b.length + 1);
    for (let j = 0; j <= b.length; j++) dp[j] = j;

    for (let i = 1; i <= a.length; i++) {
      let prev = dp[0];
      dp[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const tmp = dp[j];
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
        prev = tmp;
      }
    }
    return dp[b.length];
  }

  export function knapsack01(
    values: readonly number[],
    weights: readonly number[],
    capacity: number,
  ): number {
    capacity = clamp(toInt(capacity), 0, 10_000);
    const n = Math.min(values.length, weights.length);
    const dp = new Array<number>(capacity + 1).fill(0);

    for (let i = 0; i < n; i++) {
      const w = clamp(toInt(weights[i]), 0, capacity);
      const v = values[i];
      for (let c = capacity; c >= w; c--) {
        const cand = dp[c - w] + v;
        if (cand > dp[c]) dp[c] = cand;
      }
    }
    return dp[capacity];
  }
}

/**
 * A "main" style runner that you can call from tests or benchmarks.
 */
export function runSyntheticBenchmark(
  iterations: number,
  cfg: BenchConfig = {},
): {
  ticks: number;
  sum: number;
  min: number;
  max: number;
  stats: ReturnType<UserIndex['stats']>;
} {
  const engine = new BenchmarkEngine(cfg);
  engine.start(0);

  iterations = clamp(toInt(iterations), 0, 2_000_000);

  let sum = 0;
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (let i = 0; i < iterations; i++) {
    const v = engine.tick(i);
    sum += v;
    if (v < min) min = v;
    if (v > max) max = v;

    // occasional state changes
    if (i % 10_000 === 0 && i !== 0) {
      if (engine.getState() === EngineState.Running && (i / 10_000) % 2 === 0)
        engine.pause(i);
      else if (engine.getState() === EngineState.Paused) engine.resume(i);
    }
    if (engine.getState() === EngineState.Error) break;
  }

  engine.stop(iterations + 1);

  const users = generateUsers(
    clamp(Math.floor(iterations / 1000), 10, 5000),
    cfg,
  );
  const idx = new UserIndex(users);

  const s = idx.stats();
  return {
    ticks: engine.getEvents().filter((e) => e.type === 'tick').length,
    sum,
    min: Number.isFinite(min) ? min : 0,
    max: Number.isFinite(max) ? max : 0,
    stats: s,
  };
}
