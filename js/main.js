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
})();
