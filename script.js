document.body.classList.add('js-ready');

// ── TRANSCRIPT LIGHTBOX ───────────────────────────────────────────────────────
function openTranscript() {
  document.getElementById('transcriptLb').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLbBtn() {
  document.getElementById('transcriptLb').classList.remove('open');
  document.body.style.overflow = '';
}
function closeLb(e) {
  if (e.target === document.getElementById('transcriptLb')) closeLbBtn();
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLbBtn();
});

// ── CURSOR ──────────────────────────────────────────────────────────────────
const cur  = document.getElementById('cur');
const curR = document.getElementById('curR');
const curG = document.getElementById('curGlow');
let mx=0, my=0, rx=0, ry=0, gx=0, gy=0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx+'px'; cur.style.top = my+'px';
  const el = document.elementFromPoint(mx, my);
  const isLink = el && (el.tagName==='A' || el.tagName==='BUTTON' || el.closest('a') || el.closest('button'));
  cur.classList.toggle('on-link', !!isLink);
  curR.classList.toggle('on-link', !!isLink);
});

(function cursorLoop() {
  rx += (mx-rx)*0.12; ry += (my-ry)*0.12;
  curR.style.left = rx+'px'; curR.style.top = ry+'px';
  gx += (mx-gx)*0.06; gy += (my-gy)*0.06;
  curG.style.left = gx+'px'; curG.style.top = gy+'px';
  requestAnimationFrame(cursorLoop);
})();

// ── PAGE TRANSITIONS ─────────────────────────────────────────────────────────
let currentPage = 'home';

function transitionTo(id) {
  if (currentPage === id) return;
  const overlay = document.getElementById('pageOverlay');
  overlay.classList.add('active');
  setTimeout(() => {
    _show(id);
    history.pushState({ page: id }, '', '#' + id);
    setTimeout(() => overlay.classList.remove('active'), 60);
  }, 260);
}

function show(id) {
  _show(id);
}

function _show(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) { el.classList.add('active'); window.scrollTo({ top:0 }); }
  currentPage = id;

  const ind = document.getElementById('scrollInd');
  if (ind) ind.style.opacity = id === 'home' ? '1' : '0.3';

  document.querySelectorAll('.nav-a[data-page]').forEach(a => {
    a.classList.toggle('active', a.dataset.page === id);
  });

  if (id === 'about') {
    setTimeout(triggerTimeline, 200);
  }
}

// Browser back/forward button support
window.addEventListener('popstate', e => {
  const id = (e.state && e.state.page) ? e.state.page : 'home';
  const overlay = document.getElementById('pageOverlay');
  overlay.classList.add('active');
  setTimeout(() => {
    _show(id);
    setTimeout(() => overlay.classList.remove('active'), 60);
  }, 260);
});

// Honor a deep link already in the URL (e.g. shared link to #av-research)
// instead of always resetting to home, while still seeding history state
// so back/forward works from the first page too.
(function initialRoute() {
  const requestedId = (location.hash || '#home').slice(1);
  const target = document.getElementById(requestedId);
  const id = (target && target.classList.contains('page')) ? requestedId : 'home';
  if (id !== 'home') _show(id);
  history.replaceState({ page: id }, '', '#' + id);
})();

function goContact() {
  if (currentPage !== 'home') {
    transitionTo('home');
    setTimeout(() => document.getElementById('contact-sec').scrollIntoView({ behavior:'smooth' }), 450);
  } else {
    document.getElementById('contact-sec').scrollIntoView({ behavior:'smooth' });
  }
}

// ── MOBILE MENU ───────────────────────────────────────────────────────────────
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

function closeMobile() {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
}

// ── PROGRESS BAR + SCROLL EVENTS ─────────────────────────────────────────────
const progressBar = document.getElementById('progressBar');
const mainNav     = document.getElementById('mainNav');

window.addEventListener('scroll', () => {
  const sy    = window.scrollY;
  const total = document.body.scrollHeight - window.innerHeight;
  progressBar.style.width = total > 0 ? (sy / total * 100)+'%' : '0%';

  const ind = document.getElementById('scrollInd');
  if (ind) ind.style.opacity = sy > 80 ? '0.3' : '1';

  mainNav.classList.toggle('scrolled', sy > 10);

  // Name parallax
  const nameLarge = document.querySelector('.name-large');
  if (nameLarge && currentPage === 'home') {
    const scale   = 1 + sy * 0.001;
    const moveUp  = sy * 0.3;
    const rotateX = sy * 0.05;
    const opacity = Math.max(0, 1 - sy * 0.003);
    nameLarge.style.transform = `translateX(-50%) translateY(-${moveUp}px) scale(${scale}) perspective(800px) rotateX(${rotateX}deg)`;
    nameLarge.style.opacity   = opacity;
  }
});

// ── SCROLL REVEAL (project cards) ────────────────────────────────────────────
const cardObs = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) e.target.classList.add('visible');
}), { threshold: 0.1 });
document.querySelectorAll('.proj-card').forEach(el => cardObs.observe(el));

// Stats bar counter
const statsObs = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.querySelectorAll('.stat-item').forEach((item, i) => {
    setTimeout(() => item.classList.add('visible'), i * 90);
  });
  e.target.querySelectorAll('.stat-count').forEach(el => animateCount(el));
  statsObs.unobserve(e.target);
}), { threshold: 0.3 });
const statsBar = document.getElementById('statsBar');
if (statsBar) statsObs.observe(statsBar);

function animateCount(el) {
  const target  = parseInt(el.dataset.target);
  const frames  = 28;
  let   frame   = 0;
  const timer   = setInterval(() => {
    frame++;
    el.textContent = Math.min(Math.round(target * (frame / frames)), target);
    if (frame >= frames) clearInterval(timer);
  }, 35);
}

// ── FILTER PILLS ─────────────────────────────────────────────────────────────
const workCount = document.getElementById('workCount');

function updateWorkCount() {
  const n = document.querySelectorAll('.proj-card:not(.filtered)').length;
  if (workCount) workCount.textContent = String(n).padStart(2, '0') + ' projects';
}

document.querySelectorAll('.fpill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.fpill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    const filter = pill.dataset.filter;
    document.querySelectorAll('.proj-card').forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('filtered', !match);
      if (match) card.classList.add('visible');
    });
    updateWorkCount();
  });
});

// ── PAPER PREVIEW SCROLL ─────────────────────────────────────────────────────
document.querySelectorAll('.proj-abs--paper').forEach(wrap => {
  const doc = wrap.querySelector('.paper-doc-wrap');
  const cap = wrap.querySelector('.paper-scroll-cap');
  if (!doc || !cap) return;
  let scrollPx = 0;

  const setScroll = (px) => {
    scrollPx = Math.max(0, px);
    doc.style.top = `-${scrollPx * 2}px`;
  };

  cap.addEventListener('wheel', e => {
    e.preventDefault();
    e.stopPropagation();
    setScroll(scrollPx + e.deltaY * 0.65);
  }, { passive: false });

  cap.addEventListener('mouseleave', () => { setScroll(0); });
});

// ── TYPING WRAP PARALLAX ─────────────────────────────────────────────────────
const typingWrap = document.querySelector('.hero-typing-wrap');
if (typingWrap) {
  typingWrap.addEventListener('animationend', () => {
    typingWrap.style.opacity  = '1';
    typingWrap.style.animation = 'none';
  }, { once: true });

  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    const scale = 1 + sy * 0.003;
    typingWrap.style.transform = `translateY(${sy * 0.3}px) scale(${scale})`;
  }, { passive: true });
}

// ── TIMELINE ──────────────────────────────────────────────────────────────────
let timelineAnimated = false;
function triggerTimeline() {
  if (timelineAnimated) return;
  timelineAnimated = true;
  document.querySelectorAll('.tl-item').forEach((item, i) => {
    setTimeout(() => item.classList.add('visible'), i * 160);
  });
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2400);
}

// ── CLIPBOARD COPY (email & phone) ───────────────────────────────────────────
document.querySelectorAll('.c-link[data-copy]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const text = link.dataset.copy;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => showToast('Copied: ' + text))
        .catch(() => showToast('Open: ' + link.href));
    } else {
      showToast('Copy: ' + text);
    }
  });
});

// ── LIGHTBOX ──────────────────────────────────────────────────────────────────
const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lbImg');

document.querySelectorAll('.lightbox-trigger').forEach(img => {
  img.addEventListener('click', e => {
    e.stopPropagation();
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

// ── 3D TILT on project cards ─────────────────────────────────────────────────
document.querySelectorAll('.proj-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    // Speed up transform transition for real-time tilt feel
    card.style.transition = 'background 0.35s';
  });
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x  = e.clientX - rect.left;
    const y  = e.clientY - rect.top;
    const cx = rect.width  / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -2.5;
    const rotY = ((x - cx) / cx) *  2.5;
    card.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transition = 'opacity 0.7s ease, transform 0.6s ease, background 0.35s';
    card.style.transform  = '';
  });
});

// ── MAGNETIC NAV LINKS ────────────────────────────────────────────────────────
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('mousemove', e => {
    const rect = link.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width  / 2;
    const y = e.clientY - rect.top  - rect.height / 2;
    link.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
  });
  link.addEventListener('mouseleave', () => {
    link.style.transform  = '';
    link.style.transition = 'color 0.25s, transform 0.4s ease';
    setTimeout(() => { link.style.transition = ''; }, 420);
  });
});

// ── TYPING ANIMATION ─────────────────────────────────────────────────────────
const typingEl = document.getElementById('heroTyping');
const phrases  = [
  'Human Factors',
  'HCI Research',
  'UX Research',
  'Physiological Sensing',
  'Autonomous Systems',
];
let phraseIdx = 0, charIdx = 0, isDeleting = false;

function typeLoop() {
  if (!typingEl) return;
  const current = phrases[phraseIdx];
  if (!isDeleting) {
    typingEl.textContent = current.slice(0, charIdx + 1);
    charIdx++;
    if (charIdx === current.length) {
      isDeleting = true;
      setTimeout(typeLoop, 1900);
      return;
    }
    setTimeout(typeLoop, 62);
  } else {
    typingEl.textContent = current.slice(0, charIdx - 1);
    charIdx--;
    if (charIdx === 0) {
      isDeleting = false;
      phraseIdx  = (phraseIdx + 1) % phrases.length;
      setTimeout(typeLoop, 380);
      return;
    }
    setTimeout(typeLoop, 36);
  }
}
setTimeout(typeLoop, 1600);

// ── HERO CANVAS — mouse-reactive nodes ───────────────────────────────────────
const canvas = document.getElementById('heroCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, t = 0;
  const nodes = [];
  let mouseCanvasX = -9999, mouseCanvasY = -9999;

  document.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseCanvasX = e.clientX - rect.left;
    mouseCanvasY = e.clientY - rect.top;
  });

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  new ResizeObserver(resize).observe(canvas);

  for (let i = 0; i < 22; i++) {
    nodes.push({
      x:  Math.random() * (window.innerWidth  || 800),
      y:  Math.random() * (window.innerHeight || 600),
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r:  Math.random() * 2 + 1,
      pulse: Math.random() * Math.PI * 2,
    });
  }

  const human = { x: 0, y: 0 };

  function draw() {
    t += 0.012;
    ctx.clearRect(0, 0, W, H);

    human.x = W * 0.5 + Math.sin(t * 0.4) * W * 0.08;
    human.y = H * 0.45 + Math.cos(t * 0.3) * H * 0.05;

    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      n.pulse += 0.03;

      // Subtle mouse attraction
      const mdx = mouseCanvasX - n.x;
      const mdy = mouseCanvasY - n.y;
      const md  = Math.sqrt(mdx*mdx + mdy*mdy);
      if (md < 160 && md > 0) {
        n.x += (mdx / md) * 0.35;
        n.y += (mdy / md) * 0.35;
      }

      const dx   = n.x - human.x;
      const dy   = n.y - human.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < W * 0.38) {
        const alpha = (1 - dist / (W * 0.38)) * 0.18;
        ctx.beginPath();
        ctx.moveTo(human.x, human.y);
        ctx.lineTo(n.x, n.y);
        ctx.strokeStyle = `rgba(107,140,186,${alpha})`;
        ctx.lineWidth   = 0.8;
        ctx.stroke();
      }

      const pr = n.r + Math.sin(n.pulse) * 0.5;
      ctx.beginPath();
      ctx.arc(n.x, n.y, pr, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(107,140,186,0.3)';
      ctx.fill();
    });

    // Node-to-node connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(107,140,186,${(1 - d/120) * 0.07})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }

    // Human node — breathing glow
    const breathe = 1 + Math.sin(t * 0.8) * 0.15;
    const grad = ctx.createRadialGradient(human.x, human.y, 0, human.x, human.y, 30 * breathe);
    grad.addColorStop(0, 'rgba(107,140,186,0.12)');
    grad.addColorStop(1, 'rgba(107,140,186,0)');
    ctx.beginPath();
    ctx.arc(human.x, human.y, 30 * breathe, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(human.x, human.y, 4 * breathe, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(107,140,186,0.7)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(human.x, human.y, 10 * breathe, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(107,140,186,0.25)';
    ctx.lineWidth   = 1;
    ctx.stroke();

    requestAnimationFrame(draw);
  }
  draw();
}
