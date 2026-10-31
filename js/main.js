(function () {
  'use strict';

  var nav = document.getElementById('nav');
  var progress = document.getElementById('progress');
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');

  document.getElementById('yr').textContent = new Date().getFullYear();

  /* scroll: nav background + progress bar */
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle('scrolled', y > 20);
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* mobile menu */
  burger.addEventListener('click', function () { navLinks.classList.toggle('open'); });
  navLinks.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { navLinks.classList.remove('open'); });
  });

  /* reveal on scroll + proficiency bars */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal, .meters').forEach(function (el) { io.observe(el); });

  /* active link highlight */
  var sections = document.querySelectorAll('main section[id]');
  var links = navLinks.querySelectorAll('a[href^="#"]');
  var so = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id); });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(function (s) { so.observe(s); });

  /* count-up stats */
  var counters = document.querySelectorAll('[data-count]');
  var co = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = null;
      function step(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / 1400, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      co.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(function (c) { co.observe(c); });

  /* typed headline */
  var phrases = [
    'Zoho Catalyst · AppSail · Signals',
    'Zoho CRM Blueprints & Deluge',
    'React.js · Node.js · MongoDB',
    'API integrations & automation'
  ];
  var typed = document.getElementById('typed');
  var pi = 0, ci = 0, del = false;
  function type() {
    var word = phrases[pi];
    typed.textContent = word.slice(0, ci);
    if (!del && ci < word.length) { ci++; setTimeout(type, 55); }
    else if (!del) { del = true; setTimeout(type, 1500); }
    else if (ci > 0) { ci--; setTimeout(type, 28); }
    else { del = false; pi = (pi + 1) % phrases.length; setTimeout(type, 300); }
  }
  type();

  /* project filters */
  var fbtn = document.querySelectorAll('#filters .f');
  var projects = document.querySelectorAll('.project');
  fbtn.forEach(function (b) {
    b.addEventListener('click', function () {
      fbtn.forEach(function (x) { x.classList.remove('active'); });
      b.classList.add('active');
      var f = b.dataset.f;
      projects.forEach(function (p) {
        var show = f === 'all' || p.dataset.cat.split(' ').indexOf(f) > -1;
        p.classList.toggle('hide', !show);
        if (show) p.classList.add('in');
      });
    });
  });

  /* ---------- loader ---------- */
  var loader = document.getElementById('loader');
  function hideLoader() { if (loader) loader.classList.add('done'); }
  window.addEventListener('load', function () { setTimeout(hideLoader, 700); });
  setTimeout(hideLoader, 3500); /* safety net */

  /* ---------- mobile "view more" ---------- */
  var mq = window.matchMedia('(max-width: 720px)');
  /* collapsed height per block type (px) */
  var LIMITS = { about: 330, achievements: 260, skills: 540, meters: 120, nexivo: 330, project: 150, edu: 330 };
  var LABELS = { about: 'Read more', achievements: 'View more', skills: 'View more skills', meters: 'View more', nexivo: 'View more', project: 'View project details', edu: 'View more' };
  var blocks = [];

  document.querySelectorAll('[data-more]').forEach(function (el) {
    var type = el.getAttribute('data-more');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'more-btn';
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span class="lbl"></span><span class="chev">&#9662;</span>';
    el.parentNode.insertBefore(btn, el.nextSibling);
    var b = { el: el, btn: btn, type: type, open: false };
    blocks.push(b);
    btn.addEventListener('click', function () {
      b.open = !b.open;
      apply(b);
      if (!b.open) { var r = el.getBoundingClientRect(); if (r.top < 70) window.scrollBy({ top: r.top - 90, behavior: 'smooth' }); }
    });
  });

  /* collapsed height that ends cleanly between items (no half-cut cards / bullets) */
  /* items that a block can be cut between */
  function items(b) {
    if (b.type === 'nexivo') return b.el.children;                 /* <li> bullets */
    if (b.type === 'achievements') return b.el.querySelectorAll('li, h3');
    if (b.type === 'about') return b.el.children;
    return b.el.children;
  }

  /* collapsed height that ends cleanly between items (no half-cut cards / bullets) */
  function snapLimit(b) {
    var limit = LIMITS[b.type];
    if (b.type === 'project' || b.type === 'meters') return limit; /* peek + fade */
    /* .more-wrap is position:relative, so a child's offsetTop is measured from it.
       offsetTop/offsetHeight ignore the reveal transform, so this is stable mid-animation. */
    var list = items(b), best = 0;
    for (var i = 0; i < list.length; i++) {
      var n = list[i];
      var top = n.offsetTop, p = n.offsetParent;
      while (p && p !== b.el) { top += p.offsetTop; p = p.offsetParent; }
      var bottom = top + n.offsetHeight;
      if (bottom <= limit + 1) best = Math.max(best, bottom);
    }
    return best > 80 ? Math.ceil(best + 6) : limit;
  }

  function apply(b) {
    var lbl = b.btn.querySelector('.lbl');
    b.btn.setAttribute('aria-expanded', b.open ? 'true' : 'false');
    lbl.textContent = b.open ? 'View less' : LABELS[b.type];
    b.el.classList.add('more-wrap');
    if (b.open) {
      b.el.classList.remove('collapsed');
      /* release the cap entirely so late layout changes (reveal animation, fonts) never clip */
      b.el.style.maxHeight = 'none';
    } else {
      b.el.style.maxHeight = 'none';          /* measure at natural height */
      var h = snapLimit(b);
      b.el.classList.add('collapsed');
      b.el.style.maxHeight = h + 'px';
    }
  }

  function setup() {
    blocks.forEach(function (b) {
      if (mq.matches) {
        /* skip collapsing if the content is already short */
        b.el.style.maxHeight = '';
        var full = b.el.scrollHeight;
        if (full <= LIMITS[b.type] + 40) {
          b.btn.style.display = 'none';
          b.el.classList.remove('more-wrap', 'collapsed');
          return;
        }
        b.btn.style.display = '';
        b.open = false;
        apply(b);
      } else {
        /* desktop: restore everything */
        b.open = false;
        b.el.classList.remove('more-wrap', 'collapsed');
        b.el.style.maxHeight = '';
        b.btn.style.display = '';
      }
    });
  }
  setup();
  var rt;
  function onChange() { clearTimeout(rt); rt = setTimeout(setup, 150); }
  if (mq.addEventListener) mq.addEventListener('change', setup); else mq.addListener(setup);
  window.addEventListener('load', setup);
  window.addEventListener('resize', onChange);

  /* keep the open blocks tall enough if the filter or fonts change layout */
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('#filters')) setTimeout(setup, 50);
  });

  /* ---------- WhatsApp popup ---------- */
  var wa = document.getElementById('wa');
  var waFab = document.getElementById('waFab');
  var waPop = document.getElementById('waPop');
  var waClose = document.getElementById('waClose');
  var waText = document.getElementById('waText');
  var waSend = document.getElementById('waSend');
  var WA_NUMBER = '919390078202'; /* +91 93900 78202 from the resume */

  function waLink() {
    var msg = (waText.value || '').trim() || 'Hi Lokesh, I came across your portfolio and would like to connect.';
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
  }
  function setWa(open) {
    wa.classList.toggle('open', open);
    waFab.setAttribute('aria-expanded', open ? 'true' : 'false');
    waPop.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) waSend.href = waLink();
  }
  waFab.addEventListener('click', function () { setWa(!wa.classList.contains('open')); });
  waClose.addEventListener('click', function () { setWa(false); });
  waText.addEventListener('input', function () { waSend.href = waLink(); });
  waSend.addEventListener('click', function () { waSend.href = waLink(); setTimeout(function () { setWa(false); }, 300); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setWa(false); });
  document.addEventListener('click', function (e) { if (wa.classList.contains('open') && !wa.contains(e.target)) setWa(false); });
  /* gentle nudge: open the popup once after 12s if the visitor has not interacted */
  setTimeout(function () {
    if (!sessionStorage.getItem('waShown') && !wa.classList.contains('open')) { setWa(true); sessionStorage.setItem('waShown', '1'); }
  }, 12000);
})();
