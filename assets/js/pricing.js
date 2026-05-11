// Renders pricing sections from JSON configs.
// Mount points are <div data-pricing="flow"> on index.html and <div data-pricing="bungee"> on bungee2.html.
// Configs live in assets/data/pricing-{flow,bungee}.json — edit prices there, page re-renders automatically.

(function () {
  const mounts = document.querySelectorAll('[data-pricing]');
  if (!mounts.length) return;

  const arrowSvg = '<svg class="arrow" viewBox="0 0 14 10" fill="none" aria-hidden="true"><path d="M1 5h12m0 0L9 1m4 4L9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const esc = (s) => String(s == null ? '' : s);

  // ── FLOW Acrobatics ─────────────────────────────────────────────
  function renderFlowTrial(t) {
    return `
      <article class="price price-trial reveal">
        <span class="lbl">${esc(t.label)}</span>
        <h3>${esc(t.title)}</h3>
        <p>${esc(t.description)}</p>
        <a href="${esc(t.ctaHref)}" class="btn btn-primary">${esc(t.ctaText)}${arrowSvg}</a>
      </article>`;
  }
  function renderFlowPlan(p) {
    const cls = ['price', 'reveal'];
    if (p.highlight === 'best') cls.push('best');
    return `
      <article class="${cls.join(' ')}">
        <div class="name">${esc(p.name)}</div>
        <div class="amount">${esc(p.amount)}</div>
        <div class="meta">${esc(p.meta)}</div>
        <div class="ppv">${esc(p.ppv)}</div>
      </article>`;
  }
  function renderFlow(d) {
    const trial = d.trial ? renderFlowTrial(d.trial) : '';
    const plans = (d.plans || []).map(renderFlowPlan).join('');
    const row2  = (d.row2  || []).map(renderFlowPlan).join('');
    const extras = (d.extras || []).map(x => `
      <div class="extra">
        <div class="ico">${esc(x.icon)}</div>
        <h3>${esc(x.title)}</h3>
        <p>${esc(x.text)}</p>
      </div>`).join('');
    return `
      <div class="price-grid">
        ${trial}
        ${plans}
        <div class="row2">${row2}</div>
      </div>
      <div class="price-extras reveal">${extras}</div>`;
  }

  // ── Bungee Family ───────────────────────────────────────────────
  function renderBungeePlan(p, blockSize) {
    const cls = ['bfp'];
    if (blockSize === 'small') cls.push('small');
    if (p.highlight === 'hit')  cls.push('hit');
    if (p.highlight === 'best') cls.push('best');
    const badge  = p.badge ? `<span class="bfp-badge">${esc(p.badge)}</span>` : '';
    const perks  = (p.perks && p.perks.length)
      ? `<ul class="bfp-perks">${p.perks.map(li => `<li>${esc(li)}</li>`).join('')}</ul>`
      : '';
    return `
      <article class="${cls.join(' ')}">
        ${badge}
        <div class="bfp-meta">${esc(p.meta)}</div>
        <div class="bfp-amount">${esc(p.amount)}</div>
        <div class="bfp-ppv">${esc(p.ppv)}</div>
        ${perks}
      </article>`;
  }
  function renderBungeeBlock(b) {
    const plans = (b.plans || []).map(p => renderBungeePlan(p, b.size)).join('');
    return `
      <div class="price-block reveal">
        <div class="price-block-head">
          <span class="eyebrow">${esc(b.eyebrow)}</span>
          <h3 class="price-block-title">${esc(b.title)}</h3>
        </div>
        <div class="bf-price-grid">${plans}</div>
      </div>`;
  }
  function renderBungeeSingle(s) {
    if (!s) return '';
    const strike = s.strikePrice ? ` <span class="strike">${esc(s.strikePrice)}</span>` : '';
    return `
      <div class="price-block reveal">
        <div class="price-block-head">
          <span class="eyebrow">${esc(s.eyebrow)}</span>
          <h3 class="price-block-title">${esc(s.title)}</h3>
        </div>
        <article class="bfp single">
          <div class="bfp-meta">${esc(s.meta)}</div>
          <div class="bfp-amount">${esc(s.amount)}${strike}</div>
          <div class="bfp-ppv">${esc(s.ppv)}</div>
        </article>
      </div>`;
  }
  function renderBungee(d) {
    const blocks = (d.blocks || []).map(renderBungeeBlock).join('');
    const single = renderBungeeSingle(d.single);
    const extras = (d.extras || []).map(x => `
      <div class="extra">
        <div class="ico">${esc(x.icon)}</div>
        <h3>${esc(x.title)}</h3>
        <p>${esc(x.text)}</p>
      </div>`).join('');
    return `
      ${blocks}
      ${single}
      <div class="price-extras reveal">${extras}</div>`;
  }

  // ── Mount ───────────────────────────────────────────────────────
  const renderers = { flow: renderFlow, bungee: renderBungee };

  mounts.forEach(async (mount) => {
    const variant = mount.dataset.pricing;
    const renderer = renderers[variant];
    if (!renderer) return;
    try {
      const res = await fetch(`assets/data/pricing-${variant}.json`, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      mount.innerHTML = renderer(data);
      // Re-observe newly inserted .reveal elements so they animate in
      if (window.__pricingRevealObserver) {
        mount.querySelectorAll('.reveal').forEach(el => window.__pricingRevealObserver.observe(el));
      } else {
        mount.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
      }
    } catch (err) {
      console.error('Pricing load failed for', variant, err);
      mount.innerHTML = '<p style="color:rgba(255,255,255,0.6); padding:20px;">Цены временно недоступны. Позвони <a href="tel:+79522015247" style="color:var(--pink);">+7 (952) 201 52 47</a>.</p>';
    }
  });
})();
