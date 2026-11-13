const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Mobile menu
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
const setMenu = (open) => {
  nav.classList.toggle('is-open', open);
  document.getElementById('navbar').classList.toggle('menu-open', open);
  document.body.style.overflow = open ? 'hidden' : '';
  burger.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
};
burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
document.addEventListener('click', (e) => {
  if (nav.classList.contains('is-open') && !e.target.closest('#navbar')) setMenu(false);
});

// Floating navbar: shadow once scrolled; on home, flip from dark to light past the hero
const navbar = document.getElementById('navbar');
const heroEl = document.querySelector('.hero');
const onScroll = () => {
  navbar.classList.toggle('is-scrolled', window.scrollY > 24);
  if (heroEl) navbar.classList.toggle('is-past-hero', window.scrollY > heroEl.offsetHeight - 80);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------- Dashboard mock — example data, edit freely ----------
if (document.getElementById('bars')) {
  const weeklyLeads = [96, 112, 104, 138, 151, 147, 176, 204];
  const channels = [
    { name: 'Instagram', leads: 462 },
    { name: 'Google Ads', leads: 347 },
    { name: 'TikTok', leads: 283 },
    { name: 'WhatsApp', leads: 192 },
  ];

  const barsEl = document.getElementById('bars');
  const maxLeads = Math.max(...weeklyLeads);
  barsEl.innerHTML = weeklyLeads
    .map(
      (v, i) =>
        `<span class="bar" tabindex="0" style="--h:${(v / maxLeads) * 100}%" aria-label="Week ${i + 1}: ${v} leads"><i></i><b>Wk ${i + 1} · ${v} leads</b></span>`
    )
    .join('');
  barsEl.insertAdjacentHTML(
    'afterend',
    `<div class="bar-axis">${weeklyLeads.map((_, i) => `<span>W${i + 1}</span>`).join('')}</div>`
  );

  const channelsEl = document.getElementById('channels');
  const maxChannel = Math.max(...channels.map((c) => c.leads));
  channelsEl.innerHTML = channels
    .map(
      (c) =>
        `<li><span>${c.name}</span><span class="track"><i style="--w:${(c.leads / maxChannel) * 100}%"></i></span><span>${c.leads}</span></li>`
    )
    .join('');
}

// ---------- Process journey (auto-advances, pauses on hover / off-screen) ----------
if (document.querySelector('.journey')) {
  const journeySteps = [
    {
      when: 'Week 1',
      title: 'We learn your business before we touch a single post.',
      text: 'A deep look at your channels, competitors, customers and numbers, so we know exactly where the quickest wins are.',
      items: ['Channel audit', 'Competitor review', 'Audience research', 'Tracking setup'],
    },
    {
      when: 'Week 2',
      title: 'A 90-day plan with clear targets, not guesswork.',
      text: 'We agree on goals, channels, budget and the content calendar, and exactly how we will measure success.',
      items: ['90-day roadmap', 'Budget split', 'Content calendar', 'KPI targets'],
    },
    {
      when: 'Weeks 3–4',
      title: 'Content shot, copy written, campaigns live.',
      text: 'Our team produces the creative and launches across every channel that matters to your customers.',
      items: ['Photo & video shoots', 'Ad creative', 'Campaign launch', 'Community replies'],
    },
    {
      when: 'Every month',
      title: 'Honest numbers, and budget behind what works.',
      text: 'A live dashboard you can check any time, plus a monthly review where we double down on winners and cut what isn’t working.',
      items: ['Live dashboard', 'Monthly review', 'A/B testing', 'Budget optimisation'],
    },
  ];
  const journey = document.querySelector('.journey');
  const jtabs = [...document.querySelectorAll('.jtab')];
  const jCopy = document.getElementById('j-copy');
  const jEls = {
    when: document.getElementById('j-when'),
    title: document.getElementById('j-title'),
    text: document.getElementById('j-text'),
    list: document.getElementById('j-list'),
  };
  journey.style.setProperty('--step-time', '7s');
  let jIndex = 0;
  let hovering = false;
  let onScreen = false;
  const updatePause = () => journey.classList.toggle('is-paused', hovering || !onScreen);

  const renderStep = (i) => {
    const s = journeySteps[i];
    jEls.when.textContent = s.when;
    jEls.title.textContent = s.title;
    jEls.text.textContent = s.text;
    jEls.list.innerHTML = s.items.map((t) => `<li>${t}</li>`).join('');
  };
  const showStep = (i) => {
    jIndex = (i + journeySteps.length) % journeySteps.length;
    jtabs.forEach((t, k) => {
      t.classList.remove('is-active');
      t.classList.toggle('is-done', k < jIndex);
      t.setAttribute('aria-selected', String(k === jIndex));
    });
    void jtabs[jIndex].offsetWidth; // restart the progress animation
    jtabs[jIndex].classList.add('is-active');
    jCopy.classList.add('is-changing');
    setTimeout(() => {
      renderStep(jIndex);
      jCopy.classList.remove('is-changing');
    }, 250);
  };
  jtabs.forEach((t, i) => t.addEventListener('click', () => showStep(i)));
  // Advance when the active tab's progress bar finishes filling
  jtabs.forEach((t) =>
    t.querySelector('b').addEventListener('animationend', () => {
      if (!reduceMotion) showStep(jIndex + 1);
    })
  );
  journey.addEventListener('mouseenter', () => { hovering = true; updatePause(); });
  journey.addEventListener('mouseleave', () => { hovering = false; updatePause(); });
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; updatePause(); }, { threshold: 0.3 }).observe(journey);
  renderStep(0);
  updatePause();
}

// ---------- Pricing: monthly / quarterly ----------
const billingBtns = document.querySelectorAll('.billing button');
const prices = document.querySelectorAll('[data-price]');
billingBtns.forEach((btn) =>
  btn.addEventListener('click', () => {
    billingBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
    const discount = btn.dataset.cycle === 'quarterly' ? 0.9 : 1;
    prices.forEach((p) => {
      p.textContent = Math.round(Number(p.dataset.price) * discount).toLocaleString('en-GB');
    });
  })
);

// ---------- Pricing cards (swipeable on smaller screens) ----------
// Start centred on the middle card, with a neighbour peeking in on each side.
// Uses scrollLeft on the row itself so the page doesn't jump.
const plansRow = document.querySelector('.home .plans');
if (plansRow) {
  let plansTouched = false;
  const centrePlans = () => {
    if (plansTouched || plansRow.scrollWidth <= plansRow.clientWidth + 2) return;
    const cards = [...plansRow.querySelectorAll('.tier')].sort((a, b) => a.offsetLeft - b.offsetLeft);
    const mid = cards[Math.floor(cards.length / 2)];
    plansRow.scrollLeft = mid.offsetLeft - (plansRow.clientWidth - mid.offsetWidth) / 2;
  };
  ['pointerdown', 'wheel', 'keydown'].forEach((ev) => plansRow.addEventListener(ev, () => { plansTouched = true; }, { passive: true }));
  centrePlans();
  window.addEventListener('load', centrePlans);
  window.addEventListener('resize', centrePlans);
}

// ---------- Case study carousel ----------
if (document.querySelector('.carousel')) {
  const carousel = document.querySelector('.carousel');
  const track = document.getElementById('track');
  const slides = [...track.querySelectorAll('.slide')];
  const caseDots = document.getElementById('case-dots');
  const playBtn = document.getElementById('case-play');
  const SLIDE_MS = 6000;
  carousel.style.setProperty('--slide-time', `${SLIDE_MS}ms`);
  caseDots.innerHTML = slides
    .map((sl, i) => `<button aria-label="Go to slide ${i + 1}"></button>`)
    .join('');
  const caseDotBtns = [...caseDots.children];
  let caseIndex = -1;
  let caseTimer;
  let stopped = reduceMotion;
  let caseHover = false;
  let caseOnScreen = false;

  const scrollToSlide = (i, behavior = 'smooth') => {
    const sl = slides[(i + slides.length) % slides.length];
    track.scrollTo({ left: sl.offsetLeft - (track.clientWidth - sl.offsetWidth) / 2, behavior });
  };
  const setActive = (i) => {
    if (i === caseIndex) return;
    caseIndex = i;
    slides.forEach((sl, k) => sl.classList.toggle('is-active', k === i));
    caseDotBtns.forEach((d, k) => {
      d.classList.remove('is-active');
      if (k === i) {
        void d.offsetWidth; // restart the progress fill
        d.classList.add('is-active');
      }
    });
    schedule();
  };
  const schedule = () => {
    clearTimeout(caseTimer);
    const paused = stopped || caseHover || !caseOnScreen;
    carousel.classList.toggle('is-paused', paused);
    carousel.classList.toggle('is-stopped', stopped);
    if (!paused) caseTimer = setTimeout(() => scrollToSlide(caseIndex + 1), SLIDE_MS);
  };
  // The slide nearest the centre of the track is the active one
  let scrollRaf;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(scrollRaf);
    scrollRaf = requestAnimationFrame(() => {
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      slides.forEach((sl, k) => {
        const d = Math.abs(sl.offsetLeft + sl.offsetWidth / 2 - mid);
        if (d < Math.abs(slides[best].offsetLeft + slides[best].offsetWidth / 2 - mid)) best = k;
      });
      setActive(best);
    });
  });
  caseDotBtns.forEach((d, i) => d.addEventListener('click', () => scrollToSlide(i)));
  slides.forEach((sl, i) =>
    sl.addEventListener('click', (e) => {
      if (i !== caseIndex) {
        e.preventDefault();
        scrollToSlide(i);
      }
    })
  );
  playBtn.addEventListener('click', () => {
    stopped = !stopped;
    playBtn.setAttribute('aria-label', stopped ? 'Play slideshow' : 'Pause slideshow');
    schedule();
  });
  track.addEventListener('mouseenter', () => { caseHover = true; schedule(); });
  track.addEventListener('mouseleave', () => { caseHover = false; schedule(); });
  new IntersectionObserver(([e]) => { caseOnScreen = e.isIntersecting; schedule(); }, { threshold: 0.4 }).observe(track);
  // Start on the middle slide, with neighbours peeking in on both sides
  const startSlide = Math.floor(slides.length / 2);
  scrollToSlide(startSlide, 'instant');
  setActive(startSlide);
}

// ---------- Client stories — replace with real client quotes ----------
if (document.querySelector('.story')) {
  const reviews = [
    {
      name: 'Ama K.',
      role: 'CEO, Retail Brand',
      img: 'images/avatar-1.jpg',
      result: ['+210%', 'online orders'],
      text: 'Trendzeta helped us completely rethink our online presence. Our engagement and leads have grown significantly, and for the first time we actually understand what our marketing budget is doing.',
    },
    {
      name: 'Kojo T.',
      role: 'Founder, Agribusiness',
      img: 'images/avatar-2.jpg',
      result: ['+350%', 'qualified leads'],
      text: 'Strategic, creative and results-driven. They understand our market and always bring fresh ideas. Our lead pipeline has never been this full.',
    },
    {
      name: 'Efua M.',
      role: 'Owner, Hospitality Group',
      img: 'images/avatar-3.jpg',
      result: ['3x', 'weekend bookings'],
      text: 'The content calendar alone changed how we run the business. Weekends are fully booked now and customers mention our posts when they walk in.',
    },
    {
      name: 'Esi D.',
      role: 'Marketing Lead, Fintech',
      img: 'images/avatar-4.jpg',
      result: ['+180%', 'app sign-ups'],
      text: "Professional, responsive and a true partner. They report honestly on what's working and move budget fast when something isn't.",
    },
  ];
  const story = document.querySelector('.story');
  const storyMedia = story.querySelector('.story__media');
  const rv = {
    img: document.getElementById('rv-img'),
    name: document.getElementById('rv-name'),
    role: document.getElementById('rv-role'),
    text: document.getElementById('rv-text'),
    result: document.getElementById('rv-result'),
    dots: document.getElementById('rv-dots'),
  };
  rv.dots.innerHTML = reviews
    .map((r, i) => `<button class="dot${i ? '' : ' is-active'}" aria-label="Story ${i + 1}: ${r.name}"></button>`)
    .join('');
  const dots = [...rv.dots.children];
  let current = 0;
  const showReview = (i) => {
    current = (i + reviews.length) % reviews.length;
    const r = reviews[current];
    dots.forEach((d, k) => d.classList.toggle('is-active', k === current));
    story.classList.add('is-changing');
    setTimeout(() => {
      rv.img.style.display = '';
      rv.img.src = r.img;
      storyMedia.dataset.label = r.img.split('/').pop();
      rv.name.textContent = r.name;
      rv.role.textContent = r.role;
      rv.text.textContent = r.text;
      rv.result.innerHTML = `<strong>${r.result[0]}</strong> ${r.result[1]}`;
      story.classList.remove('is-changing');
    }, 300);
  };
  dots.forEach((d, i) => d.addEventListener('click', () => showReview(i)));
  document.getElementById('rv-prev').addEventListener('click', () => showReview(current - 1));
  document.getElementById('rv-next').addEventListener('click', () => showReview(current + 1));
}

// ---------- FAQ — keep one answer open at a time ----------
const faqs = document.querySelectorAll('.faq details');
faqs.forEach((d) =>
  d.addEventListener('toggle', () => {
    if (d.open) faqs.forEach((o) => o !== d && (o.open = false));
  })
);

// ---------- Free audit form -> opens an email (swap for a form service later) ----------
if (document.getElementById('audit-form')) {
  document.getElementById('audit-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const body = encodeURIComponent(
      `Hi Trendzeta,\n\nI'd like a free marketing audit.\n\nWebsite / Instagram: ${data.get('handle')}\nEmail: ${data.get('email')}\n\nThanks!`
    );
    window.location.href = `mailto:hello@trendzeta.com?subject=${encodeURIComponent('Free audit request')}&body=${body}`;
  });
}

// ---------- Highlight the nav link for the section in view ----------
const links = [...nav.querySelectorAll('a[href^="#"]')];
const targets = links.map((a) => document.querySelector(a.getAttribute('href')));
const navObserver = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a, i) => a.classList.toggle('is-active', targets[i] === entry.target));
    }),
  { rootMargin: '-45% 0px -50% 0px' }
);
targets.forEach((t) => t && navObserver.observe(t));

// ---------- Reveal on scroll ----------
const revealObserver = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }),
  { threshold: 0.15 }
);
document
  .querySelectorAll('.head, .tile, .extras, .carousel, .journey__tabs, .dash, .plans, .compare, .addons, .story, .faq, .cta__content, .footer__grid, .inner .grid, .inner .cells, .inner .shead, .inner .rail, .spec-card, .cta-card, .office')
  .forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 3) * 70}ms`;
    revealObserver.observe(el);
  });

// ---------- Card rails: prev / next buttons, hidden when everything fits ----------
document.querySelectorAll('[data-rail]').forEach((rail) => {
  const nav = document.querySelector(`[data-rail-nav="${rail.id}"]`);
  if (!nav) return;
  const [prev, next] = nav.querySelectorAll('button');
  const update = () => {
    const max = rail.scrollWidth - rail.clientWidth;
    nav.hidden = max <= 2;
    prev.disabled = rail.scrollLeft <= 2;
    next.disabled = rail.scrollLeft >= max - 2;
  };
  nav.querySelectorAll('button').forEach((btn) =>
    btn.addEventListener('click', () => {
      const step = rail.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap || 0);
      rail.scrollBy({ left: Number(btn.dataset.dir) * step, behavior: reduceMotion ? 'auto' : 'smooth' });
    })
  );
  rail.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
});

// ---------- Contact form -> opens a pre-filled email (swap for a form service later) ----------
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(contactForm);
    const body = encodeURIComponent(
      `Hi Trendzeta,\n\n${d.get('message')}\n\n—\nName: ${d.get('name')}\nCompany: ${d.get('company') || '—'}\nEmail: ${d.get('email')}\nPhone: ${d.get('phone') || '—'}\nInterested in: ${d.get('service')}\nMonthly budget: ${d.get('budget')}`
    );
    window.location.href = `mailto:hello@trendzeta.com?subject=${encodeURIComponent('New enquiry from ' + d.get('name'))}&body=${body}`;
  });
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
