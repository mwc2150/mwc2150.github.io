(function () {
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Day / dusk theme */
  var themeBtn = document.getElementById('theme-btn');
  var themeIcon = document.getElementById('theme-icon');
  var themeLabel = document.getElementById('theme-label');
  function renderTheme() {
    var dusk = root.dataset.theme === 'dusk';
    themeBtn.setAttribute('aria-pressed', String(dusk));
    themeBtn.setAttribute('aria-label', dusk ? 'Switch to day' : 'Switch to dusk');
    themeIcon.textContent = dusk ? '☾' : '☀';
    themeLabel.textContent = dusk ? 'dusk' : 'day';
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dusk ? '#2a2347' : '#fbf1dc');
  }
  function toggleTheme() {
    if (root.dataset.theme === 'dusk') delete root.dataset.theme;
    else root.dataset.theme = 'dusk';
    try { localStorage.setItem('theme', root.dataset.theme || ''); } catch (e) {}
    renderTheme();
  }
  themeBtn.addEventListener('click', toggleTheme);
  var sun = document.getElementById('sun');
  sun.addEventListener('click', toggleTheme);
  renderTheme();

  /* Music: never autoplays; plays a user-supplied track at assets/audio/bgm.mp3 */
  var audio = document.getElementById('bgm');
  var musicBtn = document.getElementById('music-btn');
  var musicLabel = document.getElementById('music-label');
  var missing = false;
  audio.volume = 0.4;
  function setMusic(on) {
    musicBtn.setAttribute('aria-pressed', String(on));
    musicBtn.setAttribute('aria-label', on ? 'Pause background music' : 'Play background music');
    musicLabel.textContent = on ? 'playing' : 'music';
  }
  audio.addEventListener('error', function () {
    missing = true;
    setMusic(false);
    musicLabel.textContent = 'no track yet';
    musicBtn.disabled = true;
  });
  musicBtn.addEventListener('click', function () {
    if (missing) return;
    if (audio.paused) {
      audio.play().then(function () { setMusic(true); }).catch(function () { setMusic(false); });
    } else {
      audio.pause();
      setMusic(false);
    }
  });

  /* Project filters */
  var chips = document.querySelectorAll('.chip-btn');
  var cards = document.querySelectorAll('#cards .card');
  var emptyNote = document.getElementById('empty-note');
  function applyFilter(f, updateUrl) {
    var shown = 0;
    chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.filter === f)); });
    cards.forEach(function (card) {
      var show = f === 'all' || card.dataset.cat === f;
      card.hidden = !show;
      if (show) shown++;
    });
    emptyNote.hidden = shown > 0;
    if (updateUrl) {
      var url = new URL(window.location.href);
      if (f === 'all') url.searchParams.delete('filter'); else url.searchParams.set('filter', f);
      history.replaceState(null, '', url);
    }
  }
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () { applyFilter(chip.dataset.filter, true); });
  });
  var initial = new URLSearchParams(window.location.search).get('filter');
  if (initial && document.querySelector('.chip-btn[data-filter="' + initial + '"]')) applyFilter(initial, false);

  /* Copy email */
  var copyBtn = document.getElementById('copy-btn');
  var copyStatus = document.getElementById('copy-status');
  copyBtn.addEventListener('click', function () {
    var email = 'mwc2150@columbia.edu';
    var done = function (msg) {
      copyStatus.textContent = msg;
      setTimeout(function () { copyStatus.textContent = ''; }, 2500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(function () { done('Copied! ✓'); }, function () { done('Copy failed, the address is above.'); });
    } else {
      done('Copy isn’t available here, the address is above.');
    }
  });

  /* Parallax on the hero layers */
  if (!reduceMotion) {
    var layers = Array.prototype.slice.call(document.querySelectorAll('.layer'));
    var ticking = false;
    var update = function () {
      var y = Math.min(window.scrollY, window.innerHeight * 1.2);
      layers.forEach(function (l) {
        var s = parseFloat(l.dataset.speed) || 0;
        if (s) l.style.transform = 'translate3d(0,' + (y * s).toFixed(1) + 'px,0)';
      });
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
  }

  /* Reveal on scroll */
  var targets = document.querySelectorAll('.section .wrap > *, .card, .trail li');
  targets.forEach(function (t) { t.classList.add('reveal'); });
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(function (t) { t.classList.add('in'); });
  }
})();
