(function(){
  'use strict';

  // -------- Utilities --------
  function q(sel, el){ return (el || document).querySelector(sel); }
  function qa(sel, el){ return Array.prototype.slice.call((el || document).querySelectorAll(sel)); }

  function safeStorage(){
    try{
      var t='__test__';
      localStorage.setItem(t,t);
      localStorage.removeItem(t);
      return localStorage;
    }catch(e){
      // Fallback no-op storage (for strict privacy modes)
      return {getItem:function(){}, setItem:function(){}, removeItem:function(){}};
    }
  }
  var storage = safeStorage();

  function onReady(fn){
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(fn, 0);
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  onReady(function(){

    // -------- Year --------
    var yearEls = [q('#year'), q('#year2')];
    var nowYear = new Date().getFullYear();
    yearEls.forEach(function(el){
      if (el) el.textContent = nowYear;
    });

    // -------- Preloader hide on full load --------
    var pl = q('#preloader');
    if (pl) {
      window.addEventListener('load', function(){
        pl.classList.add('hide');
        setTimeout(function(){ pl.style.display='none'; }, 500);
      });
    }

    // -------- Mobile menu (hamburger) --------
    var menuBtn = q('#menuToggle');
    var mobileMenu = q('#mobileMenu');
    if (menuBtn && mobileMenu) {
      menuBtn.addEventListener('click', function(){
        var open = menuBtn.getAttribute('aria-expanded') === 'true';
        menuBtn.setAttribute('aria-expanded', (!open).toString());
        if (open) {
          mobileMenu.setAttribute('hidden','');
        } else {
          mobileMenu.removeAttribute('hidden');
        }
      });

      qa('#mobileMenu a').forEach(function(a){
        a.addEventListener('click', function(){
          menuBtn.setAttribute('aria-expanded','false');
          mobileMenu.setAttribute('hidden','');
        });
      });
    }

    // -------- Theme toggle --------
    var root = document.documentElement;
    var toggle = q('#themeToggle');

    (function applyStoredTheme(){
      var stored = storage.getItem('theme'); // 'light' | 'dark'
      if (stored === 'light' || stored === 'dark') {
        root.classList.remove('light','dark');
        root.classList.add(stored);
      }
    })();

    if (toggle) {
      toggle.addEventListener('click', function(){
        var next;
        if (root.classList.contains('dark')) next = 'light';
        else if (root.classList.contains('light')) next = 'dark';
        else {
          // No explicit class yet: invert system preference
          var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          next = prefersDark ? 'light' : 'dark';
        }

        root.classList.remove('light','dark');
        root.classList.add(next);
        storage.setItem('theme', next);
      });
    }

    // -------- Rotating text in hero --------
    var rotator = q('#rotator');
    if (rotator) {
      var items = qa('.rotate-item', rotator);
      if (items.length > 1) {
        var idx = 0;
        setInterval(function(){
          items[idx].classList.remove('active');
          idx = (idx + 1) % items.length;
          items[idx].classList.add('active');
        }, 2200);
      }
    }

    // -------- Projects filter --------
    var grid = q('#projectGrid');
    var filters = qa('.filter');
    if (grid && filters.length) {
      function applyFilter(cat){
        qa(':scope > .project', grid).forEach(function(card){
          var show = (cat === 'all') || (card.getAttribute('data-cat') === cat);
          card.style.display = show ? '' : 'none';
        });
      }
      filters.forEach(function(btn){
        btn.addEventListener('click', function(){
          filters.forEach(function(b){ b.classList.remove('active'); });
          btn.classList.add('active');
          applyFilter(btn.getAttribute('data-filter'));
        });
      });
    }

    // -------- CV download links helper --------
    function setCV(href){
      var a1 = q('#downloadCV');
      var a2 = q('#downloadCVm');
      if (a1) a1.href = href;
      if (a2) a2.href = href;
    }
    setCV('./assets/docs/Kais_Alshaar_CV.pdf');

    // -------- Reveal on scroll (with fallback) --------
    var revealTargets = qa('.section, .card, .project');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12 });

      revealTargets.forEach(function(el){
        el.classList.add('reveal');
        io.observe(el);
      });
    } else {
      // Simple fallback: just show everything
      revealTargets.forEach(function(el){
        el.classList.add('in');
      });
    }

    // -------- Elfsight WhatsApp floating button size tweak --------
    function addWaFabSm() {
      var el = document.querySelector('[class^="FloatingButton__FloatingButtonContainer"]');
      if (el && !el.classList.contains('wa-fab-sm')) {
        el.classList.add('wa-fab-sm');
      }
    }

    // Try once now, then watch for new nodes
    addWaFabSm();
    if ('MutationObserver' in window) {
      var mo = new MutationObserver(addWaFabSm);
      mo.observe(document.body, { childList: true, subtree: true });
    }
  });
})();
