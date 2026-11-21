/* CatWalking: page behaviour. Data lives in data.js (window.CW). */
(() => {
  'use strict';
  const CW = window.CW;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const IMG = (n) => `assets/img/${n}.webp`;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pct = (v, total) => `${(v / total) * 100}%`;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  const catByKey = Object.fromEntries(CW.categories.map((c) => [c.key, c]));
  const countBy = (list, field) => list.reduce((m, c) => ((m[c[field]] = (m[c[field]] || 0) + 1), m), {});

  /* ================= perspective helpers (gang, 1600x1600 stage, VP 800,820) ================= */
  const VPX = 800, VPY = 820, F = 800, YG = 0.975;
  const project = (X, Y, z) => [VPX + (X * F) / z, VPY + (Y * F) / z];
  const layerOf = (z) => (z < 1.45 ? 'front' : z < 2.5 ? 'near' : z < 4.5 ? 'mid' : 'far');

  /* ================= 1. OPENING ================= */
  const opening = $('#opening');
  const stage = $('#stage');
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  CW.bobcats.forEach((c, i) => {
    const h = (c.hU * F) / c.z, w = h * c.ar;
    const [x, yb] = project(c.X, c.onFence ? YG - 0.62 : YG, c.z);
    const el = document.createElement('div');
    el.className = 'bob' + (c.flip ? ' flip' : '');
    Object.assign(el.style, { left: pct(x - w / 2, 1600), top: pct(yb - h, 1600), width: pct(w, 1600), height: pct(h, 1600), animationDelay: `${0.5 + i * 0.18}s` });
    const [cx, cy, rx, ry, px, py] = c.head;
    el.innerHTML = `<img src="${IMG(c.img)}" alt=""><div class="bob-head" style="background-image:url(${IMG(c.img)});clip-path:ellipse(${rx}% ${ry}% at ${cx}% ${cy}%);transform-origin:${px}% ${py}%;--spd:${c.speed}s;animation-delay:-${(i * 0.37).toFixed(2)}s"></div>`;
    $(`.layer[data-layer="${layerOf(c.z)}"]`, stage).appendChild(el);
  });

  let entered = false, autoTimer = null, touchY = null;
  const setP = (p) => stage.style.setProperty('--p', p.toFixed(4));
  function finishEnter() {
    document.body.classList.remove('locked');
    document.body.classList.add('entered');
    window.scrollTo(0, 0);
    setTimeout(() => { opening.style.display = 'none'; }, 850);
  }
  function enter() {
    if (entered) return;
    entered = true;
    clearTimeout(autoTimer);
    if (reduce) { opening.classList.add('gone'); finishEnter(); return; }
    const t0 = performance.now(), dur = 1500;
    let faded = false;
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const e = t * t * t; // ease-in: walking faster into the gang
      setP(e);
      if (!faded && t > 0.5) { faded = true; opening.classList.add('gone'); finishEnter(); }
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  function armOpening() {
    entered = false; setP(0);
    autoTimer = setTimeout(enter, 3300); // ~1.3s intro + 2s pause
  }
  addEventListener('wheel', (e) => { if (!entered && e.deltaY > 0) enter(); }, { passive: true });
  addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchmove', (e) => { if (!entered && touchY !== null && touchY - e.touches[0].clientY > 12) enter(); }, { passive: true });
  addEventListener('keydown', (e) => { if (!entered && ['ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); enter(); } });
  $('#enter').addEventListener('click', enter);
  armOpening();

  $('#replay').addEventListener('click', () => {
    window.scrollTo(0, 0);
    document.body.classList.add('locked');
    document.body.classList.remove('entered');
    opening.style.display = '';
    opening.classList.remove('gone');
    // restart bob pop-in
    $$('.bob', stage).forEach((b) => { b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; });
    armOpening();
  });

  /* ================= reveal on scroll ================= */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.18 });
  const watch = (el) => io.observe(el);

  /* ================= 4. ROUTE ================= */
  (function route() {
    const R = CW.route, [W, H] = R.canvas, canvas = $('#routeCanvas');
    const place = (el, [x, y, w, h]) => Object.assign(el.style, { left: pct(x, W), top: pct(y, H), width: pct(w, W), height: pct(h, H) });
    place($('#routeMap'), R.map);
    place($('#routeTitle'), R.title);
    const ov = $('#routeOverlay');
    ov.setAttribute('viewBox', `0 0 ${W} ${H}`);
    ov.innerHTML = `<path id="rp" d="${R.path}" fill="none" stroke="none"/>
      <g><circle r="16" fill="#E8893A" opacity=".25"><animate attributeName="r" values="10;22;10" dur="1.6s" repeatCount="indefinite"/></circle>
      <circle r="8" fill="#E8893A" stroke="#fff" stroke-width="4"/>
      <animateMotion dur="16s" repeatCount="indefinite"><mpath href="#rp"/></animateMotion></g>`;
    const words = ['meow!', 'mrrp?', 'feed me', 'hi hooman', 'purrr', 'nyaa~', '…zzz', 'miaw!'];
    const cats = [...R.cats].sort((a, b) => a.x - b.x);
    cats.forEach((c, i) => {
      const b = document.createElement('button');
      b.className = 'rcat'; b.type = 'button';
      b.setAttribute('aria-label', `Cat ${i + 1} spotted on the route`);
      place(b, [c.x, c.y, c.w, c.h]);
      b.style.transitionDelay = `${(i % 2 ? 0.35 : 0) + i * 0.12}s`;
      b.innerHTML = `<span class="idle" style="--d:${(2.6 + (i % 3) * 0.7).toFixed(1)}s;--dl:-${(i * 0.9).toFixed(1)}s;--r:${i % 2 ? -2.5 : 2.5}deg"><img src="${IMG('route_cat_' + c.id)}" alt="" loading="lazy"><span class="meow"></span></span>`;
      b.addEventListener('click', () => {
        $('.meow', b).textContent = words[Math.floor(Math.random() * words.length)];
        b.classList.remove('hop'); void b.offsetWidth; b.classList.add('hop', 'talk');
        clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('talk', 'hop'), 1500);
      });
      canvas.appendChild(b);
    });
    watch(canvas);
  })();

  /* ================= 5. METHOD ================= */
  (function method() {
    const M = CW.method, [W, H] = M.canvas, canvas = $('#methodCanvas'), detail = $('#methodDetail');
    const place = (el, [x, y, w, h]) => Object.assign(el.style, { left: pct(x, W), top: pct(y, H), width: pct(w, W), height: pct(h, H) });
    place($('#methodBg'), M.bg);
    const buttons = M.bubbles.map((box, i) => {
      const a = CW.approaches[i];
      const b = document.createElement('button');
      b.className = 'bubble'; b.type = 'button';
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-label', `${a.title}: ${a.when}`);
      b.innerHTML = `<img src="${IMG('bubble' + (i + 1))}" alt="">`;
      place(b, box);
      b.addEventListener('click', () => select(i));
      canvas.appendChild(b);
      return b;
    });
    let current = -1;
    function select(i) {
      if (current === i) { current = -1; canvas.classList.remove('has-active'); buttons.forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); }); detail.innerHTML = '<p class="hand">Tap a bubble to see how our 22 cats reacted.</p>'; return; }
      current = i;
      canvas.classList.add('has-active');
      buttons.forEach((b, j) => { b.classList.toggle('active', j === i); b.setAttribute('aria-pressed', String(j === i)); });
      const a = CW.approaches[i], counts = countBy(CW.cats, a.field), total = CW.cats.length;
      detail.innerHTML = `<h3>${a.title}</h3><p class="when">${a.when}</p>` + a.options.map((o) => `
        <div class="bar-row"><span class="badge" style="background:${o.color}">${o.badge}</span><span class="bar-label">${o.label}</span><span class="bar-n">${counts[o.v] || 0}</span>
        <span class="bar"><i style="background:${o.color}" data-w="${((counts[o.v] || 0) / total) * 100}"></i></span></div>`).join('') +
        `<p class="hand" style="font-size:16px;margin-top:14px">out of ${total} cats · tap the bubble again to close</p>`;
      requestAnimationFrame(() => $$('.bar i', detail).forEach((el) => { el.style.width = el.dataset.w + '%'; }));
    }
  })();

  /* ================= pie chart helper ================= */
  const SVGNS = 'http://www.w3.org/2000/svg';
  function arcPath(r, a0, a1) {
    if (a1 - a0 >= 359.999) return `M0,${-r} A${r},${r} 0 1 1 -0.01,${-r} Z`;
    const p = (a) => [r * Math.cos((a * Math.PI) / 180), r * Math.sin((a * Math.PI) / 180)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `M0,0 L${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)},${y1.toFixed(2)} Z`;
  }
  function wrap(label) {
    if (label.length <= 12) return [label];
    const words = label.replace(' / ', ' / ').split(' '), lines = [''];
    words.forEach((w) => { if ((lines[lines.length - 1] + ' ' + w).trim().length > 13) lines.push(w); else lines[lines.length - 1] = (lines[lines.length - 1] + ' ' + w).trim(); });
    return lines.filter(Boolean);
  }
  function drawPie(svg, items, { r = 175, labels = true, animate = true, onHover } = {}) {
    svg.innerHTML = '';
    const total = items.reduce((s, it) => s + it.value, 0) || 1;
    const shadow = document.createElementNS(SVGNS, 'circle');
    shadow.setAttribute('r', r); shadow.setAttribute('cx', 9); shadow.setAttribute('cy', 11); shadow.setAttribute('fill', '#1E1B1C');
    svg.appendChild(shadow);
    const g = document.createElementNS(SVGNS, 'g'); svg.appendChild(g);
    const lg = document.createElementNS(SVGNS, 'g'); svg.appendChild(lg);
    let acc = -90;
    const spans = items.filter((it) => it.value > 0).map((it) => { const a0 = acc; acc += (it.value / total) * 360; return { it, a0, a1: acc }; });
    const paths = spans.map(({ it }) => {
      const p = document.createElementNS(SVGNS, 'path');
      p.setAttribute('class', 'slice'); p.setAttribute('fill', it.fill); p.dataset.key = it.key;
      if (onHover) { p.addEventListener('mouseenter', () => onHover(it.key)); p.addEventListener('mouseleave', () => onHover(null)); p.addEventListener('click', () => onHover(it.key)); }
      g.appendChild(p); return p;
    });
    const ring = document.createElementNS(SVGNS, 'circle');
    ring.setAttribute('r', r); ring.setAttribute('fill', 'none'); ring.setAttribute('stroke', '#1E1B1C'); ring.setAttribute('stroke-width', 6);
    svg.appendChild(ring);
    const render = (k) => spans.forEach((s, i) => paths[i].setAttribute('d', arcPath(r, -90 + (s.a0 + 90) * k, -90 + (s.a1 + 90) * k)));
    const addLabels = () => {
      if (!labels) return;
      const blocks = spans.map(({ it, a0, a1 }) => {
        const m = (((a0 + a1) / 2) * Math.PI) / 180, cos = Math.cos(m), sin = Math.sin(m);
        const lines = wrap(it.label), hgt = 48 + lines.length * 16;
        const side = cos >= 0 ? 1 : -1;
        let y = (r + 30) * sin - (sin < 0 ? hgt - 40 : 0);
        return { it, lines, hgt, side, x: side * Math.max(r * 0.35, (r + 22) * Math.abs(cos)) + side * 12, y };
      });
      [1, -1].forEach((side) => {   // push overlapping labels apart, per side
        const col = blocks.filter((b) => b.side === side).sort((a, b) => a.y - b.y);
        for (let i = 1; i < col.length; i++) { const prev = col[i - 1]; if (col[i].y < prev.y + prev.hgt + 6) col[i].y = prev.y + prev.hgt + 6; }
      });
      blocks.forEach((b) => {   // keep labels clear of the pie edge
        const top = b.y - 32, bot = b.y + 12 + 16 * b.lines.length, yy = top > 0 ? top : bot < 0 ? bot : 0;
        const need = Math.abs(yy) < r + 8 ? Math.sqrt(Math.max(0, (r + 8) ** 2 - yy ** 2)) + 12 : 0;
        if (Math.abs(b.x) < need) b.x = b.side * need;
      });
      blocks.forEach((b) => {
        const anchor = b.side > 0 ? 'start' : 'end';
        const t = document.createElementNS(SVGNS, 'g');
        t.innerHTML = `<text class="lab-n" x="${b.x}" y="${b.y + 4}" text-anchor="${anchor}">${b.it.valueLabel ?? b.it.value}</text>` +
          b.lines.map((ln, i) => `<text class="lab-t" x="${b.x}" y="${b.y + 24 + i * 16}" text-anchor="${anchor}">${ln}</text>`).join('');
        t.style.opacity = 0; t.style.transition = 'opacity .4s';
        lg.appendChild(t); requestAnimationFrame(() => { t.style.opacity = 1; });
      });
    };
    if (!animate || reduce) { render(1); addLabels(); return paths; }
    const t0 = performance.now();
    const tick = (now) => { const t = Math.min(1, (now - t0) / 900), e = 1 - Math.pow(1 - t, 3); render(e); if (t < 1) requestAnimationFrame(tick); else addLabels(); };
    render(0); requestAnimationFrame(tick);
    return paths;
  }
  const swatch = (fill) => `<svg viewBox="0 0 30 30"><rect width="30" height="30" fill="${fill}"/></svg>`;
  const realItems = (counts) => CW.categories.map((c) => ({ key: c.key, label: c.label, fill: c.fill, value: counts[c.key] || 0 }));

  /* ================= 6. RESULT ================= */
  (function result() {
    const counts = countBy(CW.cats, 'key'), total = CW.cats.length;
    const pie = $('#resultPie'), legend = $('#resultLegend'), wall = $('#catwall'), pop = $('#catPop');
    const hover = (key) => {
      $$('.slice', pie).forEach((s) => { s.classList.toggle('dim', !!key && s.dataset.key !== key); s.classList.toggle('hi', s.dataset.key === key); });
      $$('li', legend).forEach((li) => li.classList.toggle('hi', li.dataset.key === key));
      $$('.cw-row', wall).forEach((row) => row.classList.toggle('hi', row.dataset.key === key));
    };
    legend.innerHTML = CW.categories.map((c) => `<li data-key="${c.key}"><span class="sw">${swatch(c.fill)}</span><span>${c.label}</span><span class="ct">${counts[c.key] || 0}</span></li>`).join('');
    $$('li', legend).forEach((li) => { li.addEventListener('mouseenter', () => hover(li.dataset.key)); li.addEventListener('mouseleave', () => hover(null)); li.addEventListener('click', () => hover(li.dataset.key)); });

    const plain = (counts.black || 0) + (counts.ginger || 0);
    const carry = total - (counts.white || 0);
    $('#resultStats').innerHTML = `
      <div class="stat"><b>${total}</b><span>cats met along ${CW.distanceKm} km</span></div>
      <div class="stat"><b>≈${Math.round(total / CW.distanceKm)}</b><span>cats per km</span></div>
      <div class="stat"><b>${plain} / ${total}</b><span>were plainly black/grey or ginger/cream</span></div>
      <div class="stat"><b>${carry} / ${total}</b><span>had black, orange, or both somewhere in their fur</span></div>
      <div class="stat wide"><b>Not quite a myth, not quite true.</b><span>Most cats weren't <i>only</i> black or orange, but nearly all of them were made of black, orange, or a mix of both.</span></div>`;

    const myth = [{ key: 'mb', label: 'Black?', fill: '#1E1B1C', value: 1, valueLabel: '50%' }, { key: 'mo', label: 'Orange?', fill: '#E8893A', value: 1, valueLabel: '50%' }];
    const show = (which) => {
      $('#tabMyth').setAttribute('aria-selected', String(which === 'myth'));
      $('#tabReal').setAttribute('aria-selected', String(which === 'real'));
      legend.style.opacity = which === 'myth' ? 0.35 : 1;
      drawPie(pie, which === 'myth' ? myth : realItems(counts), { onHover: which === 'real' ? hover : null });
    };
    $('#tabMyth').addEventListener('click', () => show('myth'));
    $('#tabReal').addEventListener('click', () => show('real'));
    let shown = false;
    new IntersectionObserver((en, obs) => { if (en[0].isIntersecting && !shown) { shown = true; show('myth'); setTimeout(() => show('real'), 1900); obs.disconnect(); } }, { threshold: 0.35 }).observe(pie);

    const rowsOrder = ['black', 'tabby', 'ginger', 'tortie', 'orwh', 'unknown', 'white'];
    const A = CW.approaches;
    const optOf = (ai, v) => A[ai].options.find((o) => o.v === v);
    const badges = (c) => [optOf(0, c.n), optOf(1, c.l), optOf(2, c.h)].filter(Boolean).map((o) => `<span class="badge" style="background:${o.color}">${o.badge}</span>`).join('');
    wall.innerHTML = rowsOrder.map((key) => {
      const cat = catByKey[key];
      const list = CW.cats.filter((c) => c.key === key);
      return `<div class="cw-row reveal" data-key="${key}"><img class="note" src="${IMG(cat.note)}" alt="${cat.label}" loading="lazy">
        <div class="cw-cats">${list.map((c) => `<button class="cw-cat" type="button" data-id="${c.id}" aria-label="${cat.label} cat"><img src="${IMG('res_cat_' + c.id)}" alt="" loading="lazy"><span class="mini-badges">${badges(c)}</span></button>`).join('')}</div></div>`;
    }).join('');
    $$('.cw-row', wall).forEach(watch);
    $$('.cw-cat', wall).forEach((btn) => btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const c = CW.cats.find((x) => x.id === btn.dataset.id);
      const items = [optOf(0, c.n), optOf(1, c.l), optOf(2, c.h)].map((o, i) => o ? `<li><span class="badge" style="background:${o.color}">${o.badge}</span>${A[i].when}: ${o.label}</li>` : '').join('');
      pop.innerHTML = `<button class="x" type="button" aria-label="Close">×</button><img src="${IMG('res_cat_' + c.id)}" alt=""><div><h4>${catByKey[c.key].label}</h4><ul>${items}</ul></div>`;
      pop.hidden = false;
      $('.x', pop).addEventListener('click', () => { pop.hidden = true; });
    }));
    document.addEventListener('click', (e) => { if (!pop.hidden && !pop.contains(e.target)) pop.hidden = true; });
  })();

  /* ================= 7. IMPORT THE CATS ================= */
  (function importCats() {
    const street = $('#street'), form = $('#importForm'), file = $('#catFile'), preview = $('#catPreview'), dropText = $('#dropText'), status = $('#importStatus'), btn = $('#importBtn'), drop = $('#drop');
    const KEY = 'cw-imported-cats';
    let cats = store.get(KEY, []);
    const residents = [
      { name: 'Oyen', src: IMG('route_cat_176'), ar: 333 / 283, z: 2.6, X: -0.45, resident: true },
      { name: 'Belang', src: IMG('route_cat_175'), ar: 284 / 549, z: 3.6, X: 0.4, resident: true }
    ];
    const setStatus = (t) => { status.textContent = t; };
    function placeCat(c) {
      const h = (0.55 * F) / c.z, w = h * c.ar;
      const [x, yb] = project(c.X, YG, c.z);
      const el = document.createElement('div');
      el.className = 'scat' + (c.resident ? ' resident' : '');
      Object.assign(el.style, { left: pct(x - w / 2, 1600), top: pct(yb - 500 - h, 900), width: pct(w, 1600), height: pct(h, 900), zIndex: Math.round(100 - c.z * 10) });
      el.innerHTML = `<div class="walker" style="--spd:${(1.1 + Math.random() * 0.8).toFixed(2)}s"><img src="${c.src}" alt="${c.name}"></div><span class="tag"></span>`;
      $('.tag', el).textContent = c.name;
      street.appendChild(el);
      return el;
    }
    function renderStreet() {
      $$('.scat', street).forEach((n) => n.remove());
      [...residents, ...cats].forEach(placeCat);
      $('#streetCount').textContent = `${cats.length} cat${cats.length === 1 ? '' : 's'} moved in`;
    }
    renderStreet();

    const showPreview = (f) => { if (!f) return; preview.src = URL.createObjectURL(f); preview.hidden = false; dropText.hidden = true; };
    file.addEventListener('change', () => showPreview(file.files[0]));
    ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
    ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
    drop.addEventListener('drop', (e) => { const f = e.dataTransfer.files[0]; if (f && f.type.startsWith('image/')) { const dt = new DataTransfer(); dt.items.add(f); file.files = dt.files; showPreview(f); } });

    const loadImg = (src) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
    function trimToCanvas(im, oval) {
      const maxS = 360;
      const c = document.createElement('canvas'), ctx = c.getContext('2d');
      if (oval) {
        const s = Math.min(im.naturalWidth, im.naturalHeight), k = Math.min(1, maxS / s);
        c.width = c.height = Math.round(s * k);
        ctx.beginPath(); ctx.ellipse(c.width / 2, c.height / 2, c.width / 2, c.height / 2, 0, 0, Math.PI * 2); ctx.clip();
        ctx.drawImage(im, (im.naturalWidth - s) / 2, (im.naturalHeight - s) / 2, s, s, 0, 0, c.width, c.height);
        return c;
      }
      const t = document.createElement('canvas'); t.width = im.naturalWidth; t.height = im.naturalHeight;
      const tc = t.getContext('2d'); tc.drawImage(im, 0, 0);
      const d = tc.getImageData(0, 0, t.width, t.height).data;
      let x0 = t.width, y0 = t.height, x1 = 0, y1 = 0;
      for (let y = 0; y < t.height; y += 2) for (let x = 0; x < t.width; x += 2) if (d[(y * t.width + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 <= x0 || y1 <= y0) { x0 = 0; y0 = 0; x1 = t.width - 1; y1 = t.height - 1; }
      const w = x1 - x0 + 1, h = y1 - y0 + 1, k = Math.min(1, maxS / Math.max(w, h));
      c.width = Math.round(w * k); c.height = Math.round(h * k);
      ctx.drawImage(t, x0, y0, w, h, 0, 0, c.width, c.height);
      return c;
    }
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = file.files[0], name = $('#catName').value.trim();
      if (!f) { setStatus('Pick a cat photo first.'); return; }
      if (!name) { setStatus('Give your cat a name.'); return; }
      btn.disabled = true;
      let im, oval = false;
      try {
        if ($('#removeBg').checked) {
          setStatus('Loading the background remover…');
          const mod = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/+esm');
          const blob = await mod.removeBackground(f, {
            progress: (key, cur, tot) => { if (tot) setStatus(`${key.includes('fetch') ? 'Downloading model' : 'Working'}… ${Math.round((cur / tot) * 100)}%`); }
          });
          setStatus('Cutting out your cat…');
          im = await loadImg(URL.createObjectURL(blob));
        } else { throw new Error('skip'); }
      } catch (err) {
        if (err.message !== 'skip') console.warn(err);
        if (err.message !== 'skip') setStatus("Couldn't remove the background here, so your cat gets a round sticker instead.");
        im = await loadImg(URL.createObjectURL(f)); oval = true;
      }
      const canvas = trimToCanvas(im, oval);
      let src = canvas.toDataURL('image/webp', 0.85);
      if (!src.startsWith('data:image/webp')) src = canvas.toDataURL('image/png');
      const cat = { name, src, ar: canvas.width / canvas.height, z: 1.7 + Math.random() * 3.6, X: (Math.random() * 1.3 - 0.65) };
      cats.push(cat);
      if (!store.set(KEY, cats)) { setStatus(`${name} moved in, but your browser storage is full, so it won't be remembered after reload.`); }
      else setStatus(oval ? `${name} moved into the gang as a round sticker (background removal wasn't available). 🐾` : `${name} moved into the gang! 🐾`);
      renderStreet();
      street.scrollIntoView({ behavior: 'smooth', block: 'center' });
      form.reset(); preview.hidden = true; dropText.hidden = false; $('#removeBg').checked = true;
      btn.disabled = false;
    });
    $('#clearCats').addEventListener('click', () => { cats = []; store.set(KEY, cats); renderStreet(); setStatus('Your cats went home.'); });
  })();

  /* ================= 8. LET'S DO THE CATWALK ================= */
  (function catwalk() {
    const KEY = 'cw-my-walk';
    const form = $('#walkForm'), out = $('#walkOut'), box = $('#counters');
    box.innerHTML = CW.categories.map((c) => `
      <div class="counter"><span class="sw">${swatch(c.fill)}</span><label for="cnt-${c.key}">${c.label}</label>
        <span class="stepper"><button type="button" data-d="-1" aria-label="fewer">−</button><input id="cnt-${c.key}" data-key="${c.key}" type="number" min="0" max="999" value="0" inputmode="numeric"><button type="button" data-d="1" aria-label="more">+</button></span></div>`).join('');
    $$('.stepper', box).forEach((s) => {
      const input = $('input', s);
      $$('button', s).forEach((b) => b.addEventListener('click', () => { input.value = Math.max(0, (parseInt(input.value, 10) || 0) + Number(b.dataset.d)); }));
    });
    const ours = countBy(CW.cats, 'key');
    function verdict(c, total) {
      if (!total) return 'No cats this time? Try another gang, or another time of day!';
      const plain = (c.black || 0) + (c.ginger || 0), mixed = total - (c.white || 0) - (c.unknown || 0);
      if (plain / total >= 0.8) return 'Your gang agrees with the myth: nearly every cat you met was simply black or orange.';
      if (mixed / total >= 0.8) return 'Not just black or orange, but most of your cats still carried black, orange, or both, just like ours.';
      return 'Your gang breaks the myth! Lots of the cats you met were neither black nor orange.';
    }
    function show(d, animate = true) {
      const total = Object.values(d.counts).reduce((a, b) => a + b, 0);
      out.innerHTML = `<h3></h3><p class="sub"></p>
        <div class="walk-pies"><figure><svg class="pie" id="myPie" viewBox="-290 -265 580 540" role="img" aria-label="Your cat colour pie chart"></svg><figcaption>your catwalk</figcaption></figure>
        <figure><svg class="pie" id="ourPie" viewBox="-200 -200 400 400" role="img" aria-label="Our cat colour pie chart"></svg><figcaption>our datawalk (${CW.cats.length} cats)</figcaption></figure></div>
        <div class="stats"><div class="stat"><b>${total}</b><span>cats met</span></div><div class="stat"><b>${d.km > 0 ? (total / d.km).toFixed(1) : '–'}</b><span>cats per km</span></div></div>
        <p class="verdict">${verdict(d.counts, total)}</p>
        <div class="walk-actions"><button class="btn" type="button" id="dlPie">Download my pie</button></div>`;
      $('h3', out).textContent = d.name || 'Your catwalk';
      $('.sub', out).textContent = `${d.km} km walked`;
      drawPie($('#myPie'), realItems(d.counts), { animate });
      drawPie($('#ourPie'), realItems(ours), { labels: false, r: 170, animate });
      $('#dlPie').addEventListener('click', () => download(d, total));
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const counts = Object.fromEntries($$('input[data-key]', box).map((i) => [i.dataset.key, Math.max(0, parseInt(i.value, 10) || 0)]));
      const d = { name: $('#walkName').value.trim(), km: Math.max(0, parseFloat($('#walkKm').value) || 0), counts };
      store.set(KEY, d);
      show(d);
      if (innerWidth < 900) out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    const saved = store.get(KEY, null);
    if (saved) {
      $('#walkName').value = saved.name || ''; $('#walkKm').value = saved.km || 1;
      Object.entries(saved.counts || {}).forEach(([k, v]) => { const i = $(`#cnt-${k}`); if (i) i.value = v; });
      show(saved, false);
    }
    async function download(d, total) {
      let fontCss = '';
      try {
        const buf = await (await fetch('assets/fonts/londrina-solid-latin-900-normal.woff2')).arrayBuffer();
        let bin = ''; new Uint8Array(buf).forEach((b) => { bin += String.fromCharCode(b); });
        fontCss = `@font-face{font-family:"Londrina Solid";font-weight:900;src:url(data:font/woff2;base64,${btoa(bin)}) format("woff2");}`;
      } catch (e) { /* fall back to system font */ }
      const pieSvg = $('#myPie').innerHTML;
      const defs = $('#cw-defs').outerHTML;
      const esc = (s) => s.replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]));
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
        <style>${fontCss} .lab-n{font-family:"Londrina Solid",sans-serif;font-weight:900;font-size:46px;fill:#1E1B1C}.lab-t{font-family:sans-serif;font-size:15px;fill:#1E1B1C}.slice{stroke:#1E1B1C;stroke-width:4;stroke-linejoin:round}</style>
        ${defs}<rect width="1080" height="1350" fill="#F4EBDA"/>
        <text x="540" y="150" text-anchor="middle" font-family="Londrina Solid, sans-serif" font-weight="900" font-size="84" fill="#4B53E6" stroke="#fff" stroke-width="14" paint-order="stroke fill">${esc(d.name || 'MY CATWALK').toUpperCase()}</text>
        <text x="540" y="210" text-anchor="middle" font-family="sans-serif" font-size="30" fill="#2B2420">${total} cats · ${d.km} km · black or orange?</text>
        <g transform="translate(540 720) scale(1.55)">${pieSvg}</g>
        <text x="540" y="1290" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#2F5BD3">CatWalking: a cat datawalk</text></svg>`;
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas'); c.width = 1080; c.height = 1350;
        c.getContext('2d').drawImage(img, 0, 0);
        const a = document.createElement('a'); a.download = 'my-catwalk.png'; a.href = c.toDataURL('image/png'); a.click();
      };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }
  })();

  $$('.reveal').forEach(watch);
})();
