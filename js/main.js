(function () {
  var root = document.documentElement;

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
    if (meta) meta.setAttribute('content', dusk ? '#231d3f' : '#fffaf0');
  }
  function toggleTheme() {
    if (root.dataset.theme === 'dusk') delete root.dataset.theme;
    else root.dataset.theme = 'dusk';
    try { localStorage.setItem('theme', root.dataset.theme || ''); } catch (e) {}
    renderTheme();
  }
  themeBtn.addEventListener('click', toggleTheme);
  document.getElementById('sun').addEventListener('click', toggleTheme);
  renderTheme();

  /* Rider easter egg: click to zoom across the desert */
  var rider = document.getElementById('rider');
  var zoomTimer;
  rider.addEventListener('click', function () {
    rider.classList.remove('zoom');
    void rider.offsetWidth;
    rider.classList.add('zoom');
    clearTimeout(zoomTimer);
    zoomTimer = setTimeout(function () { rider.classList.remove('zoom'); }, 2400);
  });

  /* Hairline under the nav once the page scrolls */
  var nav = document.getElementById('nav');
  function markNav() { nav.classList.toggle('stuck', window.scrollY > 8); }
  window.addEventListener('scroll', markNav, { passive: true });
  markNav();

  /* Project filters */
  var chips = document.querySelectorAll('.chip-btn');
  var rows = document.querySelectorAll('#cards .row');
  var emptyNote = document.getElementById('empty-note');
  function applyFilter(f, updateUrl) {
    var shown = 0;
    chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.filter === f)); });
    rows.forEach(function (row) {
      var show = f === 'all' || row.dataset.cat === f;
      row.hidden = !show;
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
})();
