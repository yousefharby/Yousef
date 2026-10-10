/* =========================================================================
   Yousef Harby — Portfolio · main.js
   GSAP 3 + ScrollTrigger + SplitText · Lenis smooth scroll · EN / AR (RTL)
   ========================================================================= */
(function () {
'use strict';
const { AR, UI, PROJECTS } = window.YH || {};

const html = document.documentElement;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const mm = (q) => window.matchMedia(q).matches;

const WA_NUMBER = '201146164155';

const state = {
  lang: html.lang === 'ar' ? 'ar' : 'en',
  reduced: html.classList.contains('reduced-motion'),
  fine: mm('(hover: hover) and (pointer: fine)'),
  lenis: null,
  busy: true,
  menuOpen: false,
};
const isRTL = () => html.dir === 'rtl';
const ui = (k) => (UI[state.lang] && UI[state.lang][k]) ?? UI.en[k] ?? k;
const guard = (name, fn) => { try { return fn(); } catch (err) { console.error('[portfolio] ' + name + ' failed', err); return undefined; } };
// break long boot work into small tasks (keeps the preloader smooth + low Total Blocking Time)
const yieldToMain = () => (window.scheduler && typeof window.scheduler.yield === 'function')
  ? window.scheduler.yield() : new Promise((r) => setTimeout(r, 0));

let gsap, ScrollTrigger, SplitText;

/* ------------------------------------------------------------------ i18n */
const I18N = {
  en: new Map(),
  attrs: new Map(),
  pairs(el) {
    return el.dataset.i18nAttr.split(';').map((p) => p.split(':').map((s) => s.trim())).filter((p) => p.length === 2);
  },
  capture() {
    $$('[data-i18n]').forEach((el) => { const k = el.dataset.i18n; if (!this.en.has(k)) this.en.set(k, el.innerHTML.trim()); });
    $$('[data-i18n-attr]').forEach((el) => this.pairs(el).forEach(([attr, k]) => {
      const id = k + '|' + attr; if (!this.attrs.has(id)) this.attrs.set(id, el.getAttribute(attr) ?? '');
    }));
  },
  apply(lang) {
    html.lang = lang; html.dir = lang === 'ar' ? 'rtl' : 'ltr';
    $$('[data-i18n]').forEach((el) => {
      const k = el.dataset.i18n; const v = lang === 'ar' ? AR[k] : this.en.get(k);
      if (v != null && el.innerHTML.trim() !== v) el.innerHTML = v;
    });
    $$('[data-i18n-attr]').forEach((el) => this.pairs(el).forEach(([attr, k]) => {
      const v = lang === 'ar' ? AR[k] : this.attrs.get(k + '|' + attr);
      if (v != null) el.setAttribute(attr, v);
    }));
    document.title = UI[lang].docTitle;
    $('meta[name="description"]')?.setAttribute('content', UI[lang].docDesc);
    const wa = $('.wa-float');
    if (wa) wa.href = `https://wa.me/${WA_NUMBER}?text=` + encodeURIComponent(lang === 'ar' ? 'أهلاً يوسف، شاهدت معرض أعمالك 👋' : 'Hi Yousef, I saw your portfolio 👋');
    const mb = $('.menu-btn');
    if (mb) mb.setAttribute('aria-label', state.menuOpen ? (lang === 'ar' ? 'إغلاق القائمة' : 'Close menu') : (lang === 'ar' ? 'فتح القائمة' : 'Open menu'));
  },
};

/* ------------------------------------------------------------------ helpers */
function countUp(el, duration = 1.6) {
  const end = parseFloat(el.dataset.count);
  const dec = parseInt(el.dataset.decimals || '0', 10);
  if (Number.isNaN(end)) return;
  if (state.reduced || !gsap) { el.textContent = end.toFixed(dec); return; }
  const o = { v: 0 };
  gsap.to(o, { v: end, duration, ease: 'power3.out', onUpdate: () => { el.textContent = o.v.toFixed(dec); } });
}

function lockScroll(on) {
  if (state.lenis) { on ? state.lenis.stop() : state.lenis.start(); }
  html.classList.toggle('is-locked', on);
}

function scrollToTarget(target, immediate = false) {
  if (state.lenis) {
    state.lenis.scrollTo(target === 'top' ? 0 : target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4), immediate, force: true });
  } else if (target === 'top') {
    window.scrollTo({ top: 0, behavior: immediate || state.reduced ? 'auto' : 'smooth' });
  } else {
    target.scrollIntoView({ behavior: immediate || state.reduced ? 'auto' : 'smooth' });
  }
}

function imgReady(img) {
  if (!img) return Promise.resolve();
  if (img.complete && img.naturalWidth) return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
  return new Promise((res) => { img.addEventListener('load', res, { once: true }); img.addEventListener('error', res, { once: true }); });
}

/* ------------------------------------------------------------------ Lenis */
function initLenis() {
  if (state.reduced || typeof window.Lenis !== 'function') return;
  const lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.3 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  state.lenis = lenis;
}

/* ------------------------------------------------------------------ Preloader */
function runPreloader(ready = Promise.resolve()) {
  const pre = $('#preloader');
  return new Promise((resolve) => {
    if (!pre) { resolve(); return; }
    if (state.reduced) { pre.remove(); resolve(); return; }
    const num = $('.preloader__num', pre), bar = $('.preloader__bar span', pre), mark = $('.preloader__mark', pre), wipe = $('.preloader__wipe', pre);
    const c = { v: 0 };
    const slots = Array.from(num.children);
    const render = () => {
      const v = Math.round(c.v);
      const str = String(v).padStart(3, '0');
      slots.forEach((el, i) => {
        if (el.textContent !== str[i]) el.textContent = str[i];
        el.classList.toggle('is-off', i < 3 - String(v).length);
      });
      bar.style.transform = `scaleX(${c.v / 100})`;
      mark.style.setProperty('--p', c.v.toFixed(1) + '%');
    };
    const loads = Promise.all([
      Promise.race([
        Promise.all([document.fonts ? document.fonts.ready : null, imgReady($('.hero__photo')), imgReady($('.hero__halo img'))]),
        wait(4500),
      ]),
      ready,
    ]);
    const tl = gsap.timeline();
    tl.to(c, { v: 80, duration: 0.95, ease: 'power2.inOut', onUpdate: render });
    loads.then(() => {
      tl.to(c, { v: 100, duration: 0.42, ease: 'power3.out', onUpdate: render })
        .to(wipe, { scaleY: 1, duration: 0.7, ease: 'expo.inOut' }, '+=0.05')
        .add(() => {
          $$(':scope > *:not(.preloader__wipe)', pre).forEach((n) => { n.style.visibility = 'hidden'; });
          pre.style.background = 'transparent';
          resolve();
        })
        .to(wipe, { scaleY: 0, transformOrigin: '50% 0%', duration: 0.95, ease: 'expo.inOut' }, '+=0.02')
        .add(() => pre.remove());
    });
  });
}

/* ------------------------------------------------------------------ Hero */
const Hero = {
  splits: [],
  name: null,
  prepare() {
    if (state.reduced) { $$('.hero__stats [data-count]').forEach((el) => countUp(el)); return; }
    $$('.hero__word-inner').forEach((el) => {
      this.splits.push(SplitText.create(el, { type: 'chars', mask: 'chars', charsClass: 'char', aria: 'none' }));
      el.classList.add('is-split');
    });
    gsap.set('.hero__word .char', { yPercent: 108 });
    gsap.set('.hero__portrait', { yPercent: 9, filter: 'brightness(0.12)' });
    gsap.set('.hero__hello', { clipPath: 'inset(-30% 101% -30% -10%)' });
    this.name = SplitText.create('.hero__name', { type: 'lines', mask: 'lines', linesClass: 'split-line', aria: 'none' });
    gsap.set(this.name.lines, { yPercent: 112 });
    gsap.set(['.hero__roles', '.hero__bio', '.hero__avail', '.hero__tagline', '.stat', '.hero__scroll'], { autoAlpha: 0, y: 26 });
    gsap.set(['.topbar__brand', '.topbar__nav', '.topbar__right'], { autoAlpha: 0, y: -14 });
    gsap.set('.wa-float', { scale: 0 });
    $$('.hero__stats [data-count]').forEach((el) => { el.textContent = '0'; });
  },
  intro() {
    if (state.reduced) { this.after(); return; }
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: () => this.after() });
    tl.to('.hero__word--back .char', { yPercent: 0, duration: 1.6, stagger: { each: 0.055, from: 'center' } }, 0)
      .to('.hero__word--front .char', { yPercent: 0, duration: 1.6, stagger: { each: 0.055, from: 'center' } }, 0)
      .to('.hero__portrait', { yPercent: 0, duration: 1.9, ease: 'power3.out' }, 0.15)
      .to('.hero__portrait', { filter: 'brightness(1)', duration: 1.6, ease: 'power2.inOut', clearProps: 'filter' }, 0.2)
      .to(['.topbar__brand', '.topbar__nav', '.topbar__right'], { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.08 }, 0.5)
      .to('.hero__hello', { clipPath: 'inset(-30% -10% -30% -10%)', duration: 1.3, ease: 'power2.inOut' }, 0.55)
      .to(this.name.lines, { yPercent: 0, duration: 1.3, stagger: 0.1 }, 0.62)
      .to(['.hero__roles', '.hero__bio', '.hero__avail'], { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08 }, 0.85)
      .to(['.hero__tagline', '.stat'], { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.09 }, 0.95)
      .add(() => $$('.hero__stats [data-count]').forEach((el) => countUp(el, 1.9)), 1.05)
      .to('.hero__scroll', { autoAlpha: 1, y: 0, duration: 1 }, 1.3)
      .to('.wa-float', { scale: 1, duration: 1.1, ease: 'elastic.out(1, .6)' }, 1.5);
  },
  after() {
    if (this.name) { this.name.revert(); this.name = null; }
    gsap.set('.hero__hello', { clearProps: 'clipPath' });
    html.classList.add('is-ready');
    $('.hero__word--back .hero__word-inner')?.classList.add('has-glow');
    state.busy = false;
    this.parallax();
  },
  parallax() {
    if (state.reduced) return;
    const back = $('.hero__word--back'), portrait = $('.hero__portrait'), move = $('.hero__front-move'), front = $('.hero__word--front');
    gsap.matchMedia().add({ desk: '(min-width: 1024px)', mob: '(max-width: 1023px)' }, (ctx) => {
      const st = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true };
      if (ctx.conditions.desk) {
        gsap.timeline({ scrollTrigger: st })
          .to(back, { yPercent: 34, ease: 'none' }, 0)
          .to(portrait, { yPercent: 7, ease: 'none' }, 0)
          // the masked front copy lives inside the portrait: compensate so it stays glued to the back word
          .to(move, { y: () => back.offsetHeight * 0.34 - portrait.offsetHeight * 0.07, ease: 'none' }, 0)
          .to('.hero__content', { yPercent: -14, autoAlpha: 0, ease: 'none' }, 0);
      } else {
        // tall stacked hero on phones: gentle depth only, never fade the text the visitor is reading
        gsap.to(back, { yPercent: 22, ease: 'none', scrollTrigger: st });
      }
    });
    if (!state.fine) return;
    const halo = $('.hero__halo');
    const q = (el, prop, d = 1.1) => gsap.quickTo(el, prop, { duration: d, ease: 'power3' });
    const bx = q(back, 'x'), by = q(back, 'y'), px = q(portrait, 'x'), py = q(portrait, 'y');
    const fx = q(front, 'x'), fy = q(front, 'y'), hx = q(halo, 'x', 1.4), hy = q(halo, 'y', 1.4);
    const set = (nx, ny) => {
      bx(nx * -30); by(ny * -14); px(nx * 16); py(ny * 8);
      fx(nx * -46); fy(ny * -22); hx(nx * 40); hy(ny * 22);
    };
    const hero = $('.hero');
    hero.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      set(e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5);
    });
    hero.addEventListener('pointerleave', () => set(0, 0));
  },
  layout() {
    const hero = $('.hero'), back = $('.hero__word--back'), portrait = $('.hero__portrait'), mv = $('.hero__front-move');
    if (!hero || !back || !portrait) return;
    if (window.innerWidth >= 1024) {
      // stretch the word so its baseline lands at ~65% of the hero, whatever the viewport ratio
      const F = parseFloat(getComputedStyle(back).fontSize) || 1;
      const s = clamp((hero.offsetHeight * 0.655 - back.offsetTop) / (0.924 * F), 1.12, 1.75);
      hero.style.setProperty('--stretch', s.toFixed(3));
    } else {
      hero.style.removeProperty('--stretch');
    }
    if (mv) {
      mv.style.setProperty('--fx', -portrait.offsetLeft + 'px');
      mv.style.setProperty('--fy', back.offsetTop - portrait.offsetTop + 'px');
      mv.style.setProperty('--fw', hero.clientWidth + 'px');
    }
  },
};

/* ------------------------------------------------------------------ Split-text headings */
const Splits = {
  list: [],
  build() {
    if (state.reduced) return;
    $$('[data-split]').forEach((el) => {
      const s = SplitText.create(el, {
        type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true,
        onSplit: (self) => gsap.from(self.lines, {
          yPercent: 118, duration: 1.3, ease: 'expo.out', stagger: 0.1,
          scrollTrigger: { trigger: el, start: 'top 87%', once: true },
        }),
      });
      this.list.push(s);
    });
  },
  destroy() { this.list.forEach((s) => s.revert()); this.list = []; },
};

/* ------------------------------------------------------------------ Idea statement (scrubbed word highlight) */
const Idea = {
  split: null, tween: null,
  build() {
    const el = $('.idea__statement');
    if (!el || state.reduced) return;
    this.split = SplitText.create(el, { type: 'words', wordsClass: 'word' });
    this.split.words.forEach((w) => { if (w.closest('em')) w.classList.add('is-red'); });
    this.tween = gsap.to(this.split.words, {
      color: (i, w) => (w.classList.contains('is-red') ? '#e10600' : '#f4f1ec'),
      stagger: 0.1, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 50%', scrub: 0.6 },
    });
  },
  destroy() {
    if (this.tween) { this.tween.scrollTrigger?.kill(); this.tween.kill(); }
    this.split?.revert();
    this.tween = this.split = null;
  },
};

/* ------------------------------------------------------------------ Marquee */
const Marquee = {
  tweens: [], st: null,
  build() {
    $$('.marquee__track').forEach((track) => {
      const base = track.innerHTML;
      track._base = base;
      const baseCount = track.children.length;
      const bandW = track.parentElement.offsetWidth || window.innerWidth;
      let n = 0;
      while (track.scrollWidth < bandW * 1.1 && n++ < 12) track.insertAdjacentHTML('beforeend', base);
      track.insertAdjacentHTML('beforeend', track.innerHTML);
      Array.from(track.children).forEach((c, i) => { if (i >= baseCount) c.setAttribute('aria-hidden', 'true'); });
      if (state.reduced) return;
      const rtl = getComputedStyle(track).direction === 'rtl';
      let from = 0, to = rtl ? 50 : -50;
      if (track.classList.contains('marquee__track--reverse')) [from, to] = [to, from];
      const dur = Math.max(18, (track.scrollWidth / 2) / 75);
      const tw = gsap.fromTo(track, { xPercent: from }, { xPercent: to, duration: dur, ease: 'none', repeat: -1 });
      tw.totalTime(dur * 300);
      this.tweens.push(tw);
    });
    if (state.reduced || !this.tweens.length) return;
    this.st = ScrollTrigger.create({
      trigger: '.marquee', start: 'top bottom', end: 'bottom top',
      onToggle: (self) => this.tweens.forEach((t) => t.paused(!self.isActive)),
      onUpdate: (self) => {
        const d = self.direction || 1;
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 800, 4);
        this.tweens.forEach((t) => {
          gsap.to(t, { timeScale: d * boost, duration: 0.25, overwrite: true, onComplete: () => gsap.to(t, { timeScale: d, duration: 1.2, overwrite: true }) });
        });
      },
    });
    if (!this.st.isActive) this.tweens.forEach((t) => t.pause());
  },
  destroy() {
    this.tweens.forEach((t) => t.kill()); this.tweens = [];
    this.st?.kill(); this.st = null;
    $$('.marquee__track').forEach((tr) => { if (tr._base != null) { tr.innerHTML = tr._base; gsap.set(tr, { clearProps: 'transform' }); } });
  },
};

/* ------------------------------------------------------------------ Work (pinned horizontal / stacked carousel) */
const Work = {
  mm: null,
  build() {
    const section = $('#work');
    if (!section) return;
    const track = $('.work__track', section), viewport = $('.work__viewport', section);
    this.mm = gsap.matchMedia();
    this.mm.add({
      pin: '(min-width: 1024px) and (min-height: 560px)',
      stack: '(max-width: 1023px), (max-height: 559px)',
      reduce: '(prefers-reduced-motion: reduce)',
    }, (ctx) => {
      const { pin, reduce } = ctx.conditions;
      if (reduce) return undefined;
      return pin ? this.pinned(section, track, viewport) : this.stacked(section, track);
    });
  },
  destroy() { this.mm?.revert(); this.mm = null; },

  pinned(section, track, viewport) {
    section.classList.add('is-pinned');
    const rtl = isRTL();
    const dir = rtl ? 1 : -1;
    const bar = $('.work__progress span', section), cur = $('.work__current', section);
    const items = $$(':scope > li', track);
    const dist = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
    let last = -1;
    const updateCurrent = () => {
      const mid = window.innerWidth / 2; let best = 0, bd = Infinity;
      items.forEach((li, i) => { const r = li.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - mid); if (d < bd) { bd = d; best = i; } });
      if (best !== last) { last = best; const n = items[best].dataset.num; if (n && cur) cur.textContent = n; }
    };
    // progress + counter follow the *smoothed* (scrubbed) tween, not the raw scroll position
    const tween = gsap.to(track, {
      x: () => dir * dist(), ease: 'none',
      onUpdate() { if (bar) bar.style.transform = `scaleX(${this.progress()})`; updateCurrent(); },
    });
    const st = ScrollTrigger.create({
      trigger: section, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.9,
      animation: tween, invalidateOnRefresh: true, anticipatePin: 1,
      onRefresh: () => { last = -1; updateCurrent(); },
    });
    // keyboard: tabbing to an off-screen project scrolls the page so it slides into view
    const pin = $('.work__pin', section);
    const onFocus = (e) => {
      const li = e.target.closest('.work__track > li');
      if (!li || !st) return;
      viewport.scrollLeft = 0; viewport.scrollTop = 0; if (pin) { pin.scrollLeft = 0; pin.scrollTop = 0; }
      const fromStart = rtl ? track.offsetWidth - li.offsetLeft - li.offsetWidth : li.offsetLeft;
      const p = clamp((fromStart + li.offsetWidth / 2 - viewport.clientWidth / 2) / (dist() || 1), 0, 1);
      const y = st.start + (st.end - st.start) * p;
      if (state.lenis) state.lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
    };
    section.addEventListener('focusin', onFocus);
    const bg = $('.work__bgword', section);
    if (bg) gsap.to(bg, { x: () => dir * dist() * 0.28, ease: 'none', scrollTrigger: { trigger: section, start: 'top top', end: () => '+=' + dist(), scrub: 1.2, invalidateOnRefresh: true } });
    const [s0, e0] = rtl ? ['right left', 'left right'] : ['left right', 'right left'];
    items.forEach((li) => {
      $$('.browser__screen picture', li).forEach((pic) => gsap.fromTo(pic, { xPercent: rtl ? 4.6 : -4.6 }, {
        xPercent: rtl ? -4.6 : 4.6, ease: 'none',
        scrollTrigger: { trigger: li, containerAnimation: tween, start: s0, end: e0, scrub: true },
      }));
      const idx = $('.project__index', li);
      if (idx) gsap.fromTo(idx, { x: rtl ? -110 : 110 }, {
        x: rtl ? 110 : -110, ease: 'none',
        scrollTrigger: { trigger: li, containerAnimation: tween, start: s0, end: e0, scrub: true },
      });
    });
    return () => { section.removeEventListener('focusin', onFocus); section.classList.remove('is-pinned'); if (bar) bar.style.transform = ''; };
  },

  stacked(section, track) {
    section.classList.add('is-stacked');
    const items = $$(':scope > li', track).filter((li) => getComputedStyle(li).display !== 'none');
    const cur = $('.work__current', section), bar = $('.work__progress span', section);
    const txs = new Map();
    let raf = 0;
    const update = () => {
      raf = 0;
      const s = isRTL() ? -1 : 1;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 14;
      const vr = track.getBoundingClientRect();
      const vc = vr.left + vr.width / 2;
      let best = 0, bd = Infinity;
      items.forEach((li, i) => {
        const r = li.getBoundingClientRect();
        const w = li.offsetWidth, unit = w + gap;
        const c = (r.left + r.right) / 2 - (txs.get(li) || 0);
        const p = (s * (c - vc)) / unit;
        if (Math.abs(p) < bd) { bd = Math.abs(p); best = i; }
        let tx = 0, sc = 1, rot = 0, op = 1, z;
        if (p > 0) {
          const q = Math.min(p, 3.2);
          const f = 0.11 * Math.min(q, 1) + 0.07 * clamp(q - 1, 0, 1) + 0.05 * clamp(q - 2, 0, 1);
          tx = -s * (p * unit - f * w);
          sc = 1 - 0.075 * q;
          op = p > 3 ? clamp(1 - (p - 3) * 3, 0, 1) : 1;
          z = 100 - Math.round(p * 10);
        } else {
          const q = Math.max(p, -1.25);
          const k = Math.min(0, q + 0.12); // small dead-zone: a nearly-centred card stays put
          sc = 1 + 0.05 * k; rot = s * k * 4;
          op = clamp(1 - Math.max(0, -q - 0.55) / 0.55, 0, 1); // the top card slides off opaque, then fades
          z = 200 + Math.round(q * 10);
        }
        txs.set(li, tx);
        li.style.transform = `translate3d(${tx.toFixed(2)}px,0,0) scale(${sc.toFixed(4)}) rotate(${rot.toFixed(2)}deg)`;
        li.style.opacity = op.toFixed(3);
        li.style.zIndex = String(z);
      });
      const n = items[best]?.dataset.num;
      if (cur && n) cur.textContent = n;
      const max = track.scrollWidth - track.clientWidth;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? clamp(Math.abs(track.scrollLeft) / max, 0, 1) : 0})`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      section.classList.remove('is-stacked');
      items.forEach((li) => { li.style.transform = ''; li.style.opacity = ''; li.style.zIndex = ''; });
      if (bar) bar.style.transform = '';
    };
  },
};

function initTilt() {
  if (!state.fine || state.reduced) return;
  $$('.project__frame').forEach((frame) => {
    const b = $('.browser', frame), glow = $('.browser__glow', frame);
    const rx = gsap.quickTo(b, 'rotationX', { duration: 0.7, ease: 'power3' });
    const ry = gsap.quickTo(b, 'rotationY', { duration: 0.7, ease: 'power3' });
    frame.addEventListener('pointermove', (e) => {
      const r = frame.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      rx((0.5 - py) * 7); ry((px - 0.5) * 9);
      if (glow) { glow.style.setProperty('--mx', (px * 100).toFixed(1) + '%'); glow.style.setProperty('--my', (py * 100).toFixed(1) + '%'); }
    });
    frame.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });
  // make all work images eager once the section approaches (they live off-screen to the side)
  ScrollTrigger.create({ trigger: '#work', start: 'top bottom+=1400', once: true, onEnter: () => $$('#work img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; }) });
}

/* ------------------------------------------------------------------ Case study overlay */
const Case = {
  el: null, isOpen: false, closing: false, id: null, nextId: null, source: null, lastFocus: null, pushed: false,
  init() {
    this.el = $('#case');
    if (!this.el) return;
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-open-case]');
      if (!btn) return;
      e.preventDefault();
      const holder = btn.closest('[data-project]');
      const frame = btn.classList.contains('project__frame') ? btn : holder?.querySelector('.project__frame');
      this.open(btn.dataset.openCase, frame);
    });
    $('.case__close', this.el).addEventListener('click', () => this.close());
    $('.case__next', this.el).addEventListener('click', () => this.swap(this.nextId));
    document.addEventListener('keydown', (e) => { if (this.isOpen && !this.closing) this.onKey(e); });
    window.addEventListener('popstate', () => {
      if (this.isOpen && !this.closing) { this.pushed = false; this.close(true); }
    });
  },
  data(id) { return PROJECTS.find((p) => p.id === id); },
  render(p) {
    const L = state.lang, el = this.el;
    $('.case__index', el).textContent = p.idx;
    $('.case__frame .browser__url', el).textContent = p.domain;
    const sizes = '(max-width: 1240px) 96vw, 1240px';
    const src = $('.case__frame source', el), img = $('.case__frame img', el);
    src.srcset = `public/work/${p.img}-960.webp 960w, public/work/${p.img}-1265.webp 1265w`; src.sizes = sizes;
    img.srcset = `public/work/${p.img}-960.jpg 960w, public/work/${p.img}-1265.jpg 1265w`; img.sizes = sizes;
    img.src = `public/work/${p.img}-1265.jpg`;
    img.alt = `${p.title[L]} — ${L === 'ar' ? 'لقطة من الموقع' : 'website screenshot'}`;
    $('.case__cat', el).textContent = p.cat[L];
    $('.case__title', el).textContent = p.title[L];
    $('.case__lead', el).textContent = p.lead[L];
    $('.case__facts', el).innerHTML =
      `<div><dt>${esc(ui('category'))}</dt><dd>${esc(p.cat[L])}</dd></div>` +
      `<div><dt>${esc(ui('year'))}</dt><dd>${esc(p.year)}</dd></div>` +
      `<div><dt>${esc(ui('role'))}</dt><dd>${esc(p.role[L])}</dd></div>` +
      `<div><dt>${esc(ui('link'))}</dt><dd><a class="link-u" href="${esc(p.url)}" target="_blank" rel="noopener" dir="ltr">${esc(p.domain)}</a></dd></div>`;
    $('.case__metrics', el).innerHTML = (p.metrics || []).map((m) => `<div class="case__metric"><b dir="ltr">${esc(m.v)}</b><span>${esc(m[L])}</span></div>`).join('');
    $('.case__built', el).innerHTML = p.built[L].map((x) => `<li>${esc(x)}</li>`).join('');
    $('.case__stack', el).innerHTML = p.stack[L].map((x) => `<li>${esc(x)}</li>`).join('');
    $('.case__visit', el).href = p.url;
    const nx = PROJECTS[(PROJECTS.indexOf(p) + 1) % PROJECTS.length];
    this.nextId = nx.id;
    $('.case__next-title', el).textContent = nx.title[L];
  },
  ghost(fromEl, r) {
    const g = fromEl.cloneNode(true);
    g.classList.remove('case__frame');
    g.classList.add('case-ghost');
    g.removeAttribute('style');
    g.querySelectorAll('[style]').forEach((n) => n.removeAttribute('style'));
    g.querySelectorAll('img').forEach((i) => { i.loading = 'eager'; });
    g.setAttribute('aria-hidden', 'true');
    Object.assign(g.style, { position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', margin: '0', zIndex: '85', transform: 'none', maxWidth: 'none' });
    document.body.appendChild(g);
    return g;
  },
  parts() { return $$('.case__top, .case__body > *, .case__next', this.el); },
  open(id, frame) {
    const p = this.data(id);
    if (!p) return;
    if (this.isOpen) { this.swap(id); return; }
    this.isOpen = true; this.id = id; this.source = frame || null; this.lastFocus = document.activeElement;
    this.render(p);
    this.el.hidden = false;
    $('.case__scroll', this.el).scrollTop = 0;
    lockScroll(true);
    $('#topbar')?.classList.add('is-hidden');
    if (!this.pushed) { try { history.pushState({ case: id }, '', '#case-' + id); this.pushed = true; } catch (e) { /* file:// */ } }
    const bg = $('.case__bg', this.el), target = $('.case__frame', this.el), parts = this.parts();
    const fromEl = frame?.querySelector('.browser');
    if (fromEl) gsap.set(fromEl, { rotationX: 0, rotationY: 0 });
    const r0 = fromEl?.getBoundingClientRect();
    const visible = r0 && r0.width > 0 && r0.bottom > 0 && r0.top < window.innerHeight && r0.right > 0 && r0.left < window.innerWidth;
    if (state.reduced || !visible) {
      gsap.fromTo(this.el, { autoAlpha: 0 }, { autoAlpha: 1, duration: state.reduced ? 0 : 0.5, ease: 'power2.out' });
      if (!state.reduced) gsap.fromTo(parts, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.06, delay: 0.15 });
      this.afterOpen();
      return;
    }
    gsap.set(this.el, { autoAlpha: 1 });
    const r1 = target.getBoundingClientRect();
    const ghost = this.ghost(fromEl, r0);
    gsap.set(target, { autoAlpha: 0 });
    gsap.set(fromEl, { autoAlpha: 0 });
    gsap.set(parts, { autoAlpha: 0, y: 40 });
    gsap.timeline({
      onComplete: () => { gsap.set(target, { autoAlpha: 1 }); ghost.remove(); gsap.set(fromEl, { autoAlpha: 1 }); },
    })
      .fromTo(bg, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' }, 0)
      .to(ghost, { left: r1.left, top: r1.top, width: r1.width, height: r1.height, duration: 1.05, ease: 'expo.inOut' }, 0)
      .to(parts, { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.06 }, 0.6);
    this.afterOpen();
  },
  afterOpen() {
    const close = $('.case__close', this.el);
    const tryFocus = (n = 0) => {
      if (!this.isOpen) return;
      close?.focus({ preventScroll: true });
      if (document.activeElement !== close && n < 20) setTimeout(() => tryFocus(n + 1), 80);
    };
    setTimeout(tryFocus, 80);
  },
  swap(id) {
    const p = this.data(id);
    if (!p) return;
    const scroller = $('.case__scroll', this.el);
    const parts = $$('.case__hero, .case__body, .case__next', this.el);
    const apply = () => {
      this.render(p); this.id = id; scroller.scrollTop = 0;
      this.source = document.querySelector(`[data-project="${id}"] .project__frame`) || null;
      try { history.replaceState({ case: id }, '', '#case-' + id); } catch (e) { /* noop */ }
    };
    if (state.reduced) { apply(); return; }
    gsap.timeline()
      .to(parts, { autoAlpha: 0, y: -30, duration: 0.4, ease: 'power2.in', stagger: 0.04 })
      .add(apply)
      .fromTo(parts, { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.07 });
  },
  close(fromPop = false) {
    if (!this.isOpen || this.closing) return;
    this.closing = true;
    if (this.pushed && !fromPop) { this.pushed = false; try { history.back(); } catch (e) { /* noop */ } }
    const target = $('.case__frame', this.el), bg = $('.case__bg', this.el);
    const fromEl = this.source?.querySelector('.browser');
    const r0 = target.getBoundingClientRect();
    const r1 = fromEl?.getBoundingClientRect();
    const canFlip = !state.reduced && fromEl && r1 && r1.width > 0 && r1.bottom > 0 && r1.top < window.innerHeight && r0.bottom > 40 && r0.top < window.innerHeight;
    const parts = $$('.case__top, .case__body, .case__next, .case__hero', this.el);
    const done = () => {
      this.el.hidden = true;
      gsap.set([this.el, bg, target, ...parts, ...this.parts()], { clearProps: 'opacity,visibility,transform' });
      if (fromEl) gsap.set(fromEl, { autoAlpha: 1 });
      lockScroll(false);
      $('#topbar')?.classList.remove('is-hidden');
      this.isOpen = false; this.closing = false;
      this.lastFocus?.focus?.({ preventScroll: true });
    };
    if (!canFlip) {
      gsap.to(this.el, { autoAlpha: 0, duration: state.reduced ? 0 : 0.45, ease: 'power2.inOut', onComplete: done });
      return;
    }
    const ghost = this.ghost(target, r0);
    gsap.set(target, { autoAlpha: 0 });
    gsap.set(fromEl, { autoAlpha: 0 });
    gsap.timeline({ onComplete: () => { ghost.remove(); done(); } })
      .to($$('.case__top, .case__body, .case__next', this.el), { autoAlpha: 0, y: 24, duration: 0.35, ease: 'power2.in' }, 0)
      .to(bg, { autoAlpha: 0, duration: 0.7, ease: 'power2.inOut' }, 0.2)
      .to(ghost, { left: r1.left, top: r1.top, width: r1.width, height: r1.height, duration: 1, ease: 'expo.inOut' }, 0.05);
  },
  onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); this.close(); return; }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      if (e.target.closest('input, textarea')) return;
      const fwd = (e.key === 'ArrowRight') !== isRTL();
      const i = PROJECTS.findIndex((p) => p.id === this.id);
      const n = PROJECTS[(i + (fwd ? 1 : -1) + PROJECTS.length) % PROJECTS.length];
      this.swap(n.id);
      return;
    }
    if (e.key !== 'Tab') return;
    const f = $$('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', this.el).filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  },
  fromHash() {
    const m = location.hash.match(/^#case-([\w-]+)$/);
    if (!m || !this.data(m[1])) return;
    this.pushed = false;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* noop */ }
    this.open(m[1], null);
  },
};

/* ------------------------------------------------------------------ Systems */
function initSystems() {
  const stage = $('.bots__stage');
  if (!stage) return;
  const sb = $('.tg-sedra-bubble'), toast = $('.tg-toast'), push = $('.push'), ob = $('.tg-om-bubble'), chip = $('.tg-om-chip'), ping = $('.bots__ping');
  if (state.reduced) { gsap.set([toast, push], { autoAlpha: 0 }); }
  else {
    gsap.set(toast, { autoAlpha: 0, xPercent: 115 });
    gsap.set(push, { autoAlpha: 0, yPercent: -160 });
    gsap.set([sb, ob], { autoAlpha: 0, yPercent: 16, scale: 0.965, transformOrigin: '0% 100%' });
    gsap.set(chip, { autoAlpha: 0, y: 10 });
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } })
      .to(toast, { autoAlpha: 1, xPercent: 0, duration: 0.85 }, 0)
      .to(sb, { autoAlpha: 1, yPercent: 0, scale: 1, duration: 1.2 }, 0.3)
      .to(push, { autoAlpha: 1, yPercent: 0, duration: 0.9 }, 0.95)
      .to(chip, { autoAlpha: 1, y: 0, duration: 0.6 }, 1.25)
      .to(ob, { autoAlpha: 1, yPercent: 0, scale: 1, duration: 1.2 }, 1.35)
      .fromTo(ping, { scale: 0.3, autoAlpha: 0.95 }, { scale: 2.6, autoAlpha: 0, duration: 1.5, ease: 'power2.out' }, 1.35)
      .to(toast, { autoAlpha: 0, xPercent: 115, duration: 0.6, ease: 'power3.in' }, 3.4)
      .to(push, { autoAlpha: 0, yPercent: -160, duration: 0.6, ease: 'power3.in' }, 4);
    ScrollTrigger.create({
      trigger: stage, start: 'top 72%', end: 'bottom 15%',
      onEnter: () => tl.restart(), onEnterBack: () => tl.restart(),
      onLeave: () => tl.progress(1).pause(), onLeaveBack: () => tl.pause(0),
    });
  }
  // dashboard
  const kpis = $$('.kpis [data-count]');
  if (!state.reduced) kpis.forEach((el) => { el.textContent = (0).toFixed(parseInt(el.dataset.decimals || '0', 10)); });
  ScrollTrigger.create({ trigger: '.kpis', start: 'top 88%', once: true, onEnter: () => kpis.forEach((el) => countUp(el, 2)) });
  if (state.reduced) return;
  gsap.fromTo('.gov__list li', { '--s': 0 }, { '--s': 1, duration: 1.5, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: '.gov', start: 'top 90%', once: true } });
  gsap.fromTo('.dash__frame', { clipPath: 'inset(10% 6% 10% 6% round 14px)' }, { clipPath: 'inset(0% 0% 0% 0% round 14px)', duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.dash__frame', start: 'top 85%', once: true } });
  gsap.fromTo('.dash__frame img', { scale: 1.1 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.dash__frame', start: 'top bottom', end: 'bottom top', scrub: true } });
}

/* ------------------------------------------------------------------ Services (hover preview) */
function initServices() {
  if (!state.fine || state.reduced) return;
  const pv = $('.svc-preview'), list = $('.svc-list');
  if (!pv || !list) return;
  const img = $('img', pv);
  gsap.set(pv, { xPercent: -50, yPercent: -50, scale: 0.6 });
  const xTo = gsap.quickTo(pv, 'x', { duration: 0.6, ease: 'power3' });
  const yTo = gsap.quickTo(pv, 'y', { duration: 0.6, ease: 'power3' });
  const rTo = gsap.quickTo(pv, 'rotation', { duration: 0.9, ease: 'power3' });
  let lastX = 0, preloaded = false;
  const pos = (e) => {
    const w = pv.offsetWidth || 300, h = pv.offsetHeight || 225;
    const x = clamp(e.clientX + (isRTL() ? -1 : 1) * (w * 0.5 + 46), w / 2 + 12, window.innerWidth - w / 2 - 12);
    const y = clamp(e.clientY, h / 2 + 12, window.innerHeight - h / 2 - 12);
    return [x, y];
  };
  list.addEventListener('pointerenter', () => {
    if (preloaded) return; preloaded = true;
    $$('.svc', list).forEach((r) => { const i = new Image(); i.src = r.dataset.preview; });
  });
  list.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const [x, y] = pos(e);
    xTo(x); yTo(y); rTo(clamp((e.clientX - lastX) * 0.5, -10, 10)); lastX = e.clientX;
  });
  $$('.svc', list).forEach((row) => {
    row.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      if (img.getAttribute('src') !== row.dataset.preview) img.src = row.dataset.preview;
      if (gsap.getProperty(pv, 'autoAlpha') < 0.05) { const [x, y] = pos(e); gsap.set(pv, { x, y }); }
      gsap.to(pv, { autoAlpha: 1, scale: 1, duration: 0.55, ease: 'expo.out', overwrite: 'auto' });
    });
    row.addEventListener('pointerleave', () => gsap.to(pv, { autoAlpha: 0, scale: 0.6, duration: 0.35, ease: 'power2.in', overwrite: 'auto' }));
  });
}

/* ------------------------------------------------------------------ Process line */
function initProcess() {
  const proc = $('.process');
  if (!proc) return;
  const steps = $$('.step', proc), lineWrap = $('.process__line', proc), line = $('span', lineWrap);
  if (state.reduced) { steps.forEach((s) => s.classList.add('is-active')); gsap.set(line, { scaleY: 1 }); return; }
  let th = [];
  const calc = () => {
    const lt = lineWrap.offsetTop, lh = lineWrap.offsetHeight || 1;
    th = steps.map((s) => { const ic = $('.step__icon', s); return (ic.offsetTop + ic.offsetHeight / 2 - lt) / lh; });
  };
  calc();
  gsap.fromTo(line, { scaleY: 0 }, {
    scaleY: 1, ease: 'none',
    onUpdate() { const p = this.progress(); steps.forEach((s, i) => s.classList.toggle('is-active', p >= th[i] - 0.015)); },
    scrollTrigger: { trigger: proc, start: 'top 72%', end: 'bottom 62%', scrub: 0.6, onRefresh: calc },
  });
}

/* ------------------------------------------------------------------ Generic reveals */
function initReveals() {
  if (state.reduced) return;
  const sel = [
    '.idea .label', '.idea__card', '.section-head .label', '.section-head .section-lead',
    '.bots__copy > *', '.bots__stage', '.dash__copy > *', '.svc', '.about__title', '.skill-group', '.step', '.about__quote',
    '.contact__text', '.contact__status', '.contact__list > li', '.brief', '.work__head', '.work__foot',
  ];
  const els = $$(sel.join(','));
  gsap.set(els, { autoAlpha: 0, y: 42 });
  ScrollTrigger.batch(els, {
    start: 'top 91%', once: true,
    onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1.15, ease: 'expo.out', stagger: 0.08, overwrite: true }),
  });
  // chips cascade
  $$('.chips').forEach((ul) => {
    if (ul.closest('.case')) return;
    gsap.from($$('li', ul), { autoAlpha: 0, y: 14, duration: 0.7, ease: 'power3.out', stagger: 0.03, scrollTrigger: { trigger: ul, start: 'top 92%', once: true } });
  });
  // footer wordmark
  const big = $('.footer__big');
  if (big) {
    const fs = SplitText.create($$('span', big), { type: 'chars', mask: 'chars', charsClass: 'char', aria: 'none' });
    big.classList.add('is-split');
    gsap.from(fs.chars, { yPercent: 105, duration: 1.3, ease: 'expo.out', stagger: 0.035, scrollTrigger: { trigger: '.footer', start: 'top 92%', once: true } });
  }
}

/* ------------------------------------------------------------------ Section background shifts + header */
function initBgShift() {
  if (state.reduced) return;
  $$('[data-bg]').forEach((sec) => ScrollTrigger.create({
    trigger: sec, start: 'top 50%', end: 'bottom 50%',
    onToggle: (self) => { if (self.isActive) gsap.to(document.body, { backgroundColor: sec.dataset.bg, duration: 0.9, ease: 'power2.out', overwrite: 'auto' }); },
  }));
}

function initHeader() {
  const bar = $('#topbar'), prog = $('.progress span');
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      bar.classList.toggle('is-scrolled', y > 30);
      if (!state.menuOpen && !Case.isOpen) bar.classList.toggle('is-hidden', self.direction === 1 && y > window.innerHeight * 0.9);
      if (prog) prog.style.transform = `scaleX(${self.progress})`;
    },
  });
  $$('.topbar__nav .nav-link').forEach((a) => {
    const sec = document.getElementById(a.getAttribute('href').slice(1));
    if (!sec) return;
    ScrollTrigger.create({ trigger: sec, start: 'top 45%', end: 'bottom 45%', onToggle: (self) => a.classList.toggle('is-active', self.isActive) });
  });
}

/* ------------------------------------------------------------------ Cursor + magnetic */
function initCursor() {
  if (!state.fine || state.reduced) return;
  html.classList.add('has-cursor');
  const c = $('.cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring');
  c.classList.add('is-hidden');
  const dx = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power3' }), dy = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power3' });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
  let shown = false;
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    if (!shown) { shown = true; gsap.set([dot, ring], { x: e.clientX, y: e.clientY }); c.classList.remove('is-hidden'); }
    dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
  }, { passive: true });
  document.addEventListener('pointerover', (e) => {
    const el = e.target.closest?.('[data-cursor], a, button, label, .svc, input, textarea, select');
    const view = !!el && el.matches('[data-cursor="view"]');
    const text = !!el && el.matches('input, textarea, select');
    c.classList.toggle('is-view', view);
    c.classList.toggle('is-text', text);
    c.classList.toggle('is-link', !!el && !view && !text);
  });
  html.addEventListener('mouseleave', () => c.classList.add('is-hidden'));
  html.addEventListener('mouseenter', () => { if (shown) c.classList.remove('is-hidden'); });
  window.addEventListener('pointerdown', () => gsap.to(ring, { scale: 0.82, duration: 0.2 }));
  window.addEventListener('pointerup', () => gsap.to(ring, { scale: 1, duration: 0.5, ease: 'elastic.out(1, .5)' }));
}

function initMagnetic() {
  if (!state.fine || state.reduced) return;
  $$('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'elastic.out(1, .45)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'elastic.out(1, .45)' });
    const s = el.classList.contains('wa-float') ? 0.4 : 0.32;
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2 - (gsap.getProperty(el, 'x') || 0), cy = r.top + r.height / 2 - (gsap.getProperty(el, 'y') || 0);
      xTo((e.clientX - cx) * s); yTo((e.clientY - cy) * s);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

/* ------------------------------------------------------------------ Menu, anchors, language, brief */
function toggleMenu(open) {
  const btn = $('.menu-btn'), menu = $('#menu');
  if (!btn || !menu) return;
  state.menuOpen = open;
  btn.setAttribute('aria-expanded', String(open));
  btn.setAttribute('aria-label', open ? (state.lang === 'ar' ? 'إغلاق القائمة' : 'Close menu') : (state.lang === 'ar' ? 'فتح القائمة' : 'Open menu'));
  if (open) {
    menu.hidden = false;
    lockScroll(true);
    $('#topbar')?.classList.remove('is-hidden');
    if (!state.reduced) {
      gsap.fromTo(menu, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'expo.inOut' });
      gsap.fromTo($$('.menu__link', menu), { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: 0.06, duration: 1, ease: 'expo.out', delay: 0.25 });
      gsap.fromTo($('.menu__foot', menu), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, delay: 0.6 });
    }
  } else {
    lockScroll(false);
    const end = () => { menu.hidden = true; gsap.set(menu, { clearProps: 'clipPath' }); };
    if (state.reduced) end();
    else gsap.to(menu, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.6, ease: 'expo.inOut', onComplete: end });
  }
}

function initNav() {
  $('.menu-btn')?.addEventListener('click', () => toggleMenu(!state.menuOpen));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && state.menuOpen) toggleMenu(false); });
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const hash = a.getAttribute('href');
    if (hash.length < 2) return;
    const el = document.getElementById(hash.slice(1));
    if (!el) return;
    e.preventDefault();
    const go = () => {
      if (hash === '#top') scrollToTarget('top');
      else if (hash === '#main') { el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); scrollToTarget(el); }
      else scrollToTarget(el);
    };
    if (state.menuOpen) { toggleMenu(false); setTimeout(go, 80); } else go();
  });
}

function sectionAnchor() {
  const secs = $$('main > section, footer');
  for (const s of secs) {
    const ref = s.parentElement?.classList.contains('pin-spacer') ? s.parentElement : s;
    const r = ref.getBoundingClientRect();
    if (r.bottom > 1) return { sec: s, offset: -r.top };
  }
  return null;
}

async function switchLang(lang) {
  if (state.busy || lang === state.lang) return;
  state.busy = true;
  const wipe = $('.lang-wipe'), txt = $('.lang-wipe__txt');
  txt.textContent = UI[lang].wipe;
  txt.setAttribute('lang', lang);
  const fonts = lang === 'ar' && document.fonts
    ? Promise.race([Promise.all([
      document.fonts.load('800 48px Alexandria', 'يوسف'), document.fonts.load('400 16px Alexandria', 'يوسف'),
      document.fonts.load('700 48px "Aref Ruqaa"', 'العربية'),
    ]), wait(2500)])
    : Promise.resolve();
  const anchor = sectionAnchor();
  if (!state.reduced) {
    await new Promise((r) => gsap.fromTo(wipe, { scaleY: 0, transformOrigin: '50% 100%', visibility: 'visible' }, { scaleY: 1, duration: 0.65, ease: 'expo.inOut', onComplete: r }));
  }
  Work.destroy(); Marquee.destroy(); Idea.destroy(); Splits.destroy();
  I18N.apply(lang);
  state.lang = lang;
  try { localStorage.setItem('yh-lang', lang); } catch (e) { /* private mode */ }
  await fonts;
  Splits.build(); Idea.build(); Marquee.build(); Work.build();
  Hero.layout();
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
  if (anchor) {
    const ref = anchor.sec.parentElement?.classList.contains('pin-spacer') ? anchor.sec.parentElement : anchor.sec;
    const y = ref.getBoundingClientRect().top + window.scrollY + anchor.offset;
    if (state.lenis) state.lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
    ScrollTrigger.update();
  }
  if (state.reduced) { state.busy = false; return; }
  gsap.to(wipe, {
    scaleY: 0, transformOrigin: '50% 0%', duration: 0.8, ease: 'expo.inOut', delay: 0.12,
    onComplete: () => { wipe.style.visibility = 'hidden'; state.busy = false; },
  });
}

function initBrief() {
  const form = $('#brief');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get('name') || '').trim().slice(0, 60);
    const msg = String(fd.get('msg') || '').trim().slice(0, 600);
    const needs = fd.getAll('need').map((v) => ui('need.' + v));
    const lines = [ui('wa.hi') + (name ? ' ' + ui('wa.iam').replace('{name}', name) : '')];
    if (needs.length) lines.push(ui('wa.need') + ' ' + needs.join(state.lang === 'ar' ? '، ' : ', ') + (state.lang === 'ar' ? '.' : '.'));
    if (msg) lines.push(msg);
    lines.push(ui('wa.sig'));
    const a = document.createElement('a');
    a.href = `https://wa.me/${WA_NUMBER}?text=` + encodeURIComponent(lines.join('\n'));
    a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
  });
}

/* ------------------------------------------------------------------ Boot */
function fallback() {
  $('#preloader')?.remove();
  html.classList.add('is-ready', 'no-motion', 'hero-ready');
  $$('[data-count]').forEach((el) => { const d = parseInt(el.dataset.decimals || '0', 10); el.textContent = parseFloat(el.dataset.count).toFixed(d); });
  initNav(); initBrief();
  $('.lang-toggle')?.addEventListener('click', () => {
    const lang = state.lang === 'en' ? 'ar' : 'en';
    I18N.apply(lang); state.lang = lang;
    try { localStorage.setItem('yh-lang', lang); } catch (e) { /* noop */ }
  });
  state.busy = false;
}

async function boot() {
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  I18N.capture();
  if (state.lang === 'ar') I18N.apply('ar');

  ({ gsap, ScrollTrigger, SplitText } = window);
  if (!gsap || !ScrollTrigger || !SplitText) { fallback(); return; }
  gsap.registerPlugin(ScrollTrigger, SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.config({ nullTargetWarn: false });

  guard('lenis', initLenis);
  lockScroll(true);
  guard('cursor', initCursor);
  guard('magnetic', initMagnetic);
  guard('nav', initNav);
  guard('brief', initBrief);
  $('.lang-toggle')?.addEventListener('click', () => switchLang(state.lang === 'en' ? 'ar' : 'en'));
  guard('case', () => Case.init());

  // hidden initial states first, so nothing can flash when the preloader leaves
  guard('layout', () => Hero.layout());
  guard('hero', () => Hero.prepare());

  const setup = (async () => {
    if (state.lang === 'ar' && document.fonts) {
      await Promise.race([Promise.all([document.fonts.load('800 48px Alexandria', 'يوسف'), document.fonts.load('400 16px Alexandria', 'يوسف'), document.fonts.load('700 48px "Aref Ruqaa"', 'أهلاً')]), wait(2500)]);
    }
    const steps = [
      ['splits', () => Splits.build()], ['idea', () => Idea.build()], ['marquee', () => Marquee.build()],
      ['work', () => Work.build()], ['tilt', initTilt], ['systems', initSystems], ['services', initServices],
      ['process', initProcess], ['reveals', initReveals], ['bg', initBgShift], ['header', initHeader],
    ];
    for (const [name, fn] of steps) { await yieldToMain(); guard(name, fn); }
    ScrollTrigger.sort();
  })();

  await runPreloader(setup);
  await setup;
  if (state.reduced && document.fonts) Promise.race([document.fonts.ready, wait(1500)]).then(() => html.classList.add('hero-ready'));
  else html.classList.add('hero-ready');
  lockScroll(false);
  window.scrollTo(0, 0);
  guard('layout', () => Hero.layout());
  ScrollTrigger.refresh();
  guard('intro', () => Hero.intro());
  guard('deeplink', () => Case.fromHash());

  let rt = 0;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { Hero.layout(); ScrollTrigger.refresh(); }, 160); });
  document.fonts?.ready.then(() => { Hero.layout(); ScrollTrigger.refresh(); });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
})();
