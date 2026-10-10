// deck.js — ヤエノワ LT 共通スライド制御
// <body data-title="…"> の値をフッターに表示する。
// .slide.title 以外の各スライドにフッター（ロゴ・社名・タイトル・ページ番号）を挿入し、
// .sakura-bg を持つスライドには桜の透かしを入れる。
(() => {
  const script = document.currentScript;
  const base = script.src.replace(/deck\.js(\?.*)?$/, '');
  const slides = [...document.querySelectorAll('.slide')];
  const deck = document.querySelector('.deck');
  const total = slides.length;
  const title = document.body.dataset.title || document.title;
  let i = Math.min(Math.max(parseInt(location.hash.slice(1), 10) - 1 || 0, 0), total - 1);

  // 5枚の花弁と同心円（コーポレートサイトのOG画像のモチーフ）
  const petal = 'M0,-30 C-38,-60 -30,-140 0,-170 C30,-140 38,-60 0,-30 Z';
  const sakura = (fill, line) => `
    <svg class="sakura" viewBox="-280 -280 560 560" aria-hidden="true">
      <circle r="270" fill="none" stroke="${line}" stroke-dasharray="4 6"/>
      <circle r="200" fill="none" stroke="${line}"/>
      <g fill="${fill}">${[0, 72, 144, 216, 288].map(a => `<path d="${petal}" transform="rotate(${a})"/>`).join('')}</g>
      <circle r="90" fill="none" stroke="${line}" stroke-dasharray="3 5"/>
    </svg>`;

  slides.forEach((s, n) => {
    if (s.classList.contains('sakura-bg')) {
      const dark = s.classList.contains('inverse');
      s.insertAdjacentHTML('afterbegin', dark
        ? sakura('rgba(232,160,168,0.10)', 'rgba(232,160,168,0.22)')
        : sakura('rgba(232,160,168,0.16)', 'rgba(192,96,106,0.18)'));
    }
    if (s.classList.contains('title')) return;
    const f = document.createElement('div');
    f.className = 'footer';
    f.innerHTML = `<img src="${base}logo.png" alt=""><span>株式会社ヤエノワ</span><span>｜</span><span>${title}</span><span class="page">${n + 1} / ${total}</span>`;
    s.appendChild(f);
  });

  let onShow = () => {};
  function show(n) {
    i = Math.min(Math.max(n, 0), total - 1);
    slides.forEach((s, k) => s.classList.toggle('active', k === i));
    history.replaceState(null, '', '#' + (i + 1));
    onShow(i);
  }
  // スマホ幅では拡大縮小をやめ、全スライドを縦に並べて読めるようにする（見た目は deck.css 側）
  const mobile = matchMedia('(max-width: 760px) and (orientation: portrait)');
  function fit() {
    if (mobile.matches) { deck.style.transform = ''; return; }
    const s = Math.min(innerWidth / 1280, innerHeight / 720) * 0.96;
    deck.style.transform = `translate(-50%, -50%) scale(${s})`;
  }
  addEventListener('keydown', e => {
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); show(i + 1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); show(i - 1); }
    else if (e.key === 'Home') show(0);
    else if (e.key === 'End') show(total - 1);
    else if (e.key === 'f' || e.key === 'F') {
      document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();
    }
  });
  // スライドの外側（左右の余白）のクリックだけでページ送りする。
  // スライド内のクリックやテキスト選択では移動しない。
  addEventListener('click', e => {
    const r = deck.getBoundingClientRect();
    if (e.clientX < r.left) show(i - 1);
    else if (e.clientX > r.right) show(i + 1);
  });
  addEventListener('mousemove', e => {
    const r = deck.getBoundingClientRect();
    document.body.style.cursor = e.clientX < r.left ? 'w-resize' : e.clientX > r.right ? 'e-resize' : '';
  });
  addEventListener('resize', fit);
  mobile.addEventListener('change', fit);
  fit();
  show(i);
  // スマホでは図を横スクロールで見せるので、その案内を図の下に添える
  document.querySelectorAll('.figure').forEach(f => {
    const h = document.createElement('p');
    h.className = 'figure-hint';
    h.textContent = '← 図は横にスクロールできます →';
    f.after(h);
  });
  // スマホ・タブレット用：右下の前後ボタンと、左右スワイプでのページ送り
  // 縦に並べた表示のときは、隣のスライドまでスクロールする
  const current = () => {
    if (!mobile.matches) return i;
    let k = 0;
    slides.forEach((s, n) => { if (s.getBoundingClientRect().top <= innerHeight * 0.3) k = n; });
    return k;
  };
  const go = d => {
    const n = Math.min(Math.max(current() + d, 0), total - 1);
    if (mobile.matches) { slides[n].scrollIntoView({ behavior: 'smooth' }); history.replaceState(null, '', '#' + (n + 1)); }
    else show(n);
    updateNav(n);
  };
  const nav = document.createElement('div');
  nav.className = 'touch-nav';
  nav.innerHTML = '<button type="button" aria-label="前のスライド">‹</button><span></span><button type="button" aria-label="次のスライド">›</button>';
  const [prevBtn, label, nextBtn] = nav.children;
  const updateNav = (n = current()) => { label.textContent = `${n + 1} / ${total}`; };
  prevBtn.addEventListener('click', e => { e.stopPropagation(); go(-1); });
  nextBtn.addEventListener('click', e => { e.stopPropagation(); go(1); });
  document.body.appendChild(nav);
  addEventListener('scroll', () => updateNav(), { passive: true });
  onShow = updateNav;
  updateNav();

  let touch = null;
  addEventListener('touchstart', e => {
    // 図の横スクロールや、文字の選択とはぶつからないようにする
    touch = e.target.closest('.figure, table') ? null : { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  addEventListener('touchend', e => {
    if (!touch) return;
    const dx = e.changedTouches[0].clientX - touch.x, dy = e.changedTouches[0].clientY - touch.y;
    touch = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
  }, { passive: true });

  // data-mobile-scroll="end" の図は、スマホでは右端（見せたい側）から表示する
  if (mobile.matches) document.querySelectorAll('.figure[data-mobile-scroll="end"]').forEach(f => { f.scrollLeft = f.scrollWidth; });
  if (mobile.matches && i > 0) slides[i].scrollIntoView();
})();
