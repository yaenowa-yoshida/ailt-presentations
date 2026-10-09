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

  function show(n) {
    i = Math.min(Math.max(n, 0), total - 1);
    slides.forEach((s, k) => s.classList.toggle('active', k === i));
    history.replaceState(null, '', '#' + (i + 1));
  }
  function fit() {
    const s = Math.min(innerWidth / 1280, innerHeight / 720) * 0.96;
    deck.style.transform = `scale(${s})`;
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
  addEventListener('click', e => show(e.clientX < innerWidth / 3 ? i - 1 : i + 1));
  addEventListener('resize', fit);
  fit();
  show(i);
})();
