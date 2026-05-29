// ─── CURSOR ───────────────────────────────────────────────
const cursor    = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
let mx = -100, my = -100, rx = -100, ry = -100;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
document.addEventListener('mousedown', () => {
    cursor.style.transform    = 'translate(-50%,-50%) scale(0.65)';
    cursorRing.style.transform = 'translate(-50%,-50%) scale(0.75)';
});
document.addEventListener('mouseup', () => {
    cursor.style.transform    = 'translate(-50%,-50%) scale(1)';
    cursorRing.style.transform = 'translate(-50%,-50%) scale(1)';
});

function tickCursor() {
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top  = ry + 'px';
    requestAnimationFrame(tickCursor);
}
tickCursor();

document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorRing.style.transform = 'translate(-50%,-50%) scale(1.45)';
        cursorRing.style.borderColor = 'rgba(255,215,0,0.85)';
    });
    el.addEventListener('mouseleave', () => {
        cursorRing.style.transform = 'translate(-50%,-50%) scale(1)';
        cursorRing.style.borderColor = 'rgba(255,215,0,0.5)';
    });
});

// ─── NAV SCROLL ───────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ─── HERO PARALLAX ────────────────────────────────────────
const heroContent = document.querySelector('.hero-content');
window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight && heroContent) {
        heroContent.style.transform = `translateY(${y * 0.28}px)`;
        heroContent.style.opacity   = String(Math.max(0, 1 - y / (window.innerHeight * 0.65)));
    }
}, { passive: true });

// ─── PARTICLES ────────────────────────────────────────────
const canvas = document.getElementById('particles-canvas');
const ctx    = canvas.getContext('2d');
const COLORS = ['#7B2FBE', '#00D4FF', '#FFD700', '#FF6EC7', '#9D50E0', '#ffffff'];

let W = canvas.width  = window.innerWidth;
let H = canvas.height = window.innerHeight;
let particles = [];

window.addEventListener('resize', () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initParticles();
}, { passive: true });

function mkParticle() {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 0.35 + 0.05;
    return {
        x:       Math.random() * W,
        y:       Math.random() * H,
        size:    Math.random() * 1.8 + 0.3,
        color:   COLORS[Math.floor(Math.random() * COLORS.length)],
        vx:      Math.cos(angle) * speed,
        vy:      Math.sin(angle) * speed - 0.18,
        opacity: Math.random() * 0.55 + 0.15,
        life:    0,
        maxLife: Math.random() * 180 + 90,
    };
}

function initParticles() {
    const count = Math.min(Math.floor((W * H) / 7500), 120);
    particles = Array.from({ length: count }, mkParticle);
}

function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        const t = p.life / p.maxLife;
        const alpha = t < 0.12
            ? p.opacity * (t / 0.12)
            : t > 0.78
            ? p.opacity * (1 - (t - 0.78) / 0.22)
            : p.opacity;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowBlur  = 8;
        ctx.shadowColor = p.color;
        ctx.fillStyle   = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.life >= p.maxLife || p.x < -10 || p.x > W + 10 || p.y < -10 || p.y > H + 10) {
            particles[i] = mkParticle();
        }
    });
    requestAnimationFrame(drawParticles);
}

initParticles();
drawParticles();

// ─── SCROLL REVEAL ────────────────────────────────────────
const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObs.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('[data-reveal]').forEach(el => revealObs.observe(el));

// ─── GALLERY STAGGER ──────────────────────────────────────
const galleryItems = document.querySelectorAll('.gallery-item');
galleryItems.forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(28px) scale(0.97)';
    el.style.transition = 'opacity 0.65s ease, transform 0.65s ease';
});

const galleryObs = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) {
        galleryItems.forEach((el, i) => {
            setTimeout(() => {
                el.style.opacity   = '1';
                el.style.transform = 'none';
            }, i * 75);
        });
        galleryObs.disconnect();
    }
}, { threshold: 0.05 });

if (galleryItems.length) galleryObs.observe(galleryItems[0]);

// ─── COUNTER ──────────────────────────────────────────────
function animateCount(el, target, dur = 1400) {
    const t0 = performance.now();
    const tick = now => {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * target).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

const countObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCount(entry.target, parseInt(entry.target.dataset.count, 10));
            countObs.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => countObs.observe(el));

// ─── MUSIC PLAYER ─────────────────────────────────────────
const bgMusic     = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
const playBtn     = document.getElementById('playBtn');
const playerLogo  = document.getElementById('playerLogo');
const barsEl      = document.getElementById('bars');
const musicIcon   = musicToggle.querySelector('.music-icon');

const ICON_PLAY  = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
const ICON_PAUSE = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

let isPlaying = false;

function setPlayState(playing) {
    isPlaying = playing;
    musicToggle.classList.toggle('playing', playing);
    musicIcon.textContent   = playing ? '♬' : '♪';
    playBtn.innerHTML       = playing ? ICON_PAUSE : ICON_PLAY;
    playerLogo.classList.toggle('spinning', playing);
    barsEl.classList.toggle('active', playing);
}

async function togglePlay() {
    if (!isPlaying) {
        try {
            await bgMusic.play();
            setPlayState(true);
        } catch {
            // autoplay blocked — user must interact again
        }
    } else {
        bgMusic.pause();
        setPlayState(false);
    }
}

musicToggle.addEventListener('click', togglePlay);
playBtn.addEventListener('click', togglePlay);
bgMusic.addEventListener('ended', () => setPlayState(false));

// ─── LOGO TILT ────────────────────────────────────────────
const logoContainer = document.querySelector('.logo-container');
if (logoContainer) {
    logoContainer.addEventListener('mousemove', e => {
        const rect = logoContainer.getBoundingClientRect();
        const cx   = rect.left + rect.width / 2;
        const cy   = rect.top  + rect.height / 2;
        const rx_  = ((e.clientY - cy) / (rect.height / 2)) * -12;
        const ry_  = ((e.clientX - cx) / (rect.width  / 2)) * 12;
        logoContainer.style.transform = `perspective(600px) rotateX(${rx_}deg) rotateY(${ry_}deg)`;
    });
    logoContainer.addEventListener('mouseleave', () => {
        logoContainer.style.transform = 'none';
        logoContainer.style.transition = 'transform 0.6s ease';
    });
    logoContainer.addEventListener('mouseenter', () => {
        logoContainer.style.transition = 'transform 0.08s linear';
    });
}
