// =============================================
// NAVBAR SCROLL
// =============================================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// =============================================
// BUBBLES GENERATOR
// =============================================
function createBubbles() {
  const container = document.getElementById('bubbles');
  const count = window.innerWidth < 768 ? 18 : 35;

  for (let i = 0; i < count; i++) {
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');

    const size = Math.random() * 28 + 6;
    const left = Math.random() * 100;
    const duration = Math.random() * 18 + 10;
    const delay = Math.random() * 15;
    const drift = (Math.random() - 0.5) * 80;

    bubble.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      animation-duration: ${duration}s;
      animation-delay: -${delay}s;
      --drift: ${drift}px;
    `;

    container.appendChild(bubble);
  }
}

// =============================================
// SWIMMING FISH
// =============================================
const FISH_EMOJIS = ['🐟', '🐠', '🐡', '🦈', '🐙', '🦑', '🦐', '🐚'];

function createFish() {
  const container = document.getElementById('fishContainer');
  const fishCount = window.innerWidth < 768 ? 4 : 7;

  for (let i = 0; i < fishCount; i++) {
    spawnFish(container, i * 4000);
  }
}

function spawnFish(container, initialDelay) {
  const fish = document.createElement('div');
  fish.classList.add('swim-fish');

  const emoji = FISH_EMOJIS[Math.floor(Math.random() * FISH_EMOJIS.length)];
  const top = Math.random() * 85 + 5;
  const duration = Math.random() * 20 + 15;
  const size = Math.random() * 1.2 + 0.8;
  const flip = Math.random() > 0.5;

  fish.textContent = emoji;
  fish.style.cssText = `
    top: ${top}%;
    font-size: ${size * 1.8}rem;
    animation-duration: ${duration}s;
    animation-delay: -${initialDelay}ms;
    ${flip ? 'animation-name: swimAcross; transform: scaleX(-1);' : ''}
  `;

  container.appendChild(fish);

  // Re-spawn with new properties after each cycle
  fish.addEventListener('animationiteration', () => {
    const newEmoji = FISH_EMOJIS[Math.floor(Math.random() * FISH_EMOJIS.length)];
    const newTop = Math.random() * 85 + 5;
    const newDuration = Math.random() * 20 + 15;
    const newSize = Math.random() * 1.2 + 0.8;

    fish.textContent = newEmoji;
    fish.style.top = `${newTop}%`;
    fish.style.animationDuration = `${newDuration}s`;
    fish.style.fontSize = `${newSize * 1.8}rem`;
  });
}

// =============================================
// SCROLL REVEAL
// =============================================
function initReveal() {
  const elements = document.querySelectorAll('.reveal, .reveal-item');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

// =============================================
// SMOOTH ANCHOR LINKS
// =============================================
function initSmoothLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

// =============================================
// PARALLAX HERO
// =============================================
function initParallax() {
  const hero = document.querySelector('.hero-content');
  if (!hero) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      hero.style.transform = `translateY(${scrollY * 0.25}px)`;
      hero.style.opacity = 1 - scrollY / (window.innerHeight * 0.8);
    }
  }, { passive: true });
}

// =============================================
// CURSOR GLOW EFFECT (DESKTOP)
// =============================================
function initCursorGlow() {
  if (window.innerWidth < 768) return;

  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    pointer-events: none;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,180,216,0.06) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    z-index: 9999;
    transition: opacity 0.3s ease;
  `;
  document.body.appendChild(glow);

  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateGlow() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    glow.style.left = `${glowX}px`;
    glow.style.top = `${glowY}px`;
    requestAnimationFrame(animateGlow);
  }

  animateGlow();
}

// =============================================
// STATS COUNTER ANIMATION
// =============================================
function animateCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const text = el.textContent;

        // Only animate purely numeric values
        if (/^\d+$/.test(text.replace(/[,+]/g, ''))) {
          const target = parseInt(text.replace(/[^0-9]/g, ''));
          let current = 0;
          const increment = target / 60;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              el.textContent = text;
              clearInterval(timer);
            } else {
              el.textContent = Math.floor(current).toLocaleString();
            }
          }, 25);
        }

        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => observer.observe(el));
}

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  createBubbles();
  createFish();
  initReveal();
  initSmoothLinks();
  initParallax();
  initCursorGlow();
  animateCounters();
});
