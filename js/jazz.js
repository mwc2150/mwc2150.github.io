(function () {
  /* Edit this list to change the bubbles. `match` is a word that must appear in the artist name,
     which keeps the preview lookup from grabbing a cover version. */
  var CLUSTERS = [
    { id: 'bossa',  name: 'Bossa Nova',          color: 'h-teal' },
    { id: 'samba',  name: 'Samba Jazz',          color: 'h-mustard' },
    { id: 'mpb',    name: 'MPB & Jazz',          color: 'h-rose' },
    { id: 'fusion', name: 'Fusion & Experiments', color: 'h-sky' }
  ];
  var SONGS = [
    { cluster: 'bossa',  title: 'The Girl from Ipanema', artist: 'Stan Getz & João Gilberto', match: 'getz' },
    { cluster: 'bossa',  title: 'Chega de Saudade',      artist: 'João Gilberto',             match: 'gilberto' },
    { cluster: 'bossa',  title: 'Desafinado',            artist: 'Stan Getz',                 match: 'getz' },
    { cluster: 'bossa',  title: 'Wave',                  artist: 'Antônio Carlos Jobim',      match: 'jobim' },
    { cluster: 'samba',  title: 'Mas Que Nada',          artist: 'Sergio Mendes',             match: 'mendes' },
    { cluster: 'samba',  title: 'Samba de Verão',        artist: 'Marcos Valle',              match: 'valle' },
    { cluster: 'samba',  title: 'Summer Samba',          artist: 'Walter Wanderley',          match: 'wanderley' },
    { cluster: 'mpb',    title: 'Águas de Março',        artist: 'Elis Regina & Tom Jobim',   match: 'elis' },
    { cluster: 'mpb',    title: 'Travessia',             artist: 'Milton Nascimento',         match: 'nascimento' },
    { cluster: 'fusion', title: 'Frevo',                 artist: 'Egberto Gismonti',          match: 'gismonti' },
    { cluster: 'fusion', title: 'Celebration Suite',     artist: 'Airto Moreira',             match: 'airto' },
    { cluster: 'fusion', title: 'Bebê',                  artist: 'Hermeto Pascoal',           match: 'hermeto' }
  ];

  var stage = document.getElementById('stage');
  var loading = document.getElementById('loading');
  var player = document.getElementById('player');
  var now = document.getElementById('now');
  var startBtn = document.getElementById('start-btn');
  var hint = document.getElementById('hint');
  var started = false;
  var current = null;
  var bubbles = [];

  function norm(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }

  function lookup(song) {
    var url = 'https://itunes.apple.com/search?entity=song&limit=8&term=' + encodeURIComponent(song.artist + ' ' + song.title);
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 8000);
    return fetch(url, { signal: ctrl.signal })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        clearTimeout(timer);
        var hit = (data.results || []).filter(function (r) {
          return r.previewUrl && norm(r.artistName).indexOf(norm(song.match)) !== -1;
        })[0];
        if (hit) {
          song.preview = hit.previewUrl;
          song.link = hit.trackViewUrl;
          song.art = (hit.artworkUrl100 || '').replace('100x100', '300x300');
          song.realTitle = hit.trackName;
          song.realArtist = hit.artistName;
        }
      })
      .catch(function () { clearTimeout(timer); });
  }

  function setNow(song) {
    now.textContent = '';
    var p = document.createElement('p');
    if (!song) {
      p.className = 'now-empty';
      p.textContent = 'Nothing playing yet.';
      now.appendChild(p);
      return;
    }
    p.className = 'now-title';
    p.textContent = song.title + ' · ' + song.artist;
    now.appendChild(p);
    if (song.link) {
      var a = document.createElement('a');
      a.href = song.link;
      a.textContent = 'Open the full track in Apple Music →';
      var p2 = document.createElement('p');
      p2.appendChild(a);
      now.appendChild(p2);
    }
  }

  function stop() {
    player.pause();
    if (current) current.el.classList.remove('playing');
    current = null;
  }

  function play(song) {
    if (!song.preview) return;
    if (current === song) return;
    stop();
    current = song;
    song.el.classList.add('playing');
    player.src = song.preview;
    player.currentTime = 0;
    setNow(song);
    player.play().catch(function () {
      /* Blocked until the visitor interacts; the Turn On Sound button fixes that. */
      if (current === song) { song.el.classList.remove('playing'); current = null; }
    });
  }

  player.addEventListener('ended', stop);

  startBtn.addEventListener('click', function () {
    started = true;
    startBtn.hidden = true;
    hint.textContent = 'Sound is on. Hover or focus a bubble, or tap on a phone.';
    /* Unlock audio for later hover plays. */
    player.muted = true;
    player.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
    player.play().catch(function () {}).then(function () { player.pause(); player.muted = false; player.removeAttribute('src'); });
  });

  function layout() {
    var w = stage.clientWidth;
    var narrow = w < 700;
    var size = narrow ? 76 : 92;
    var rows = narrow ? 4 : 2;
    var cols = narrow ? 1 : 2;
    var cellH = narrow ? 350 : 400;
    stage.style.height = (rows * cellH) + 'px';
    CLUSTERS.forEach(function (c, i) {
      var col = i % cols, row = Math.floor(i / cols);
      var cx = (col + 0.5) * (w / cols);
      var cy = (row + 0.5) * cellH + 8;
      var inCluster = SONGS.filter(function (s) { return s.cluster === c.id; });
      var ring = Math.min(48 + inCluster.length * 15, (w / cols) / 2 - size / 2 - 22);
      var halo = c.haloEl;
      var hr = ring + size / 2 + 16;
      halo.style.width = halo.style.height = (hr * 2) + 'px';
      halo.style.left = (cx - hr) + 'px';
      halo.style.top = (cy - hr) + 'px';
      inCluster.forEach(function (s, k) {
        var angle = (Math.PI * 2 * k) / inCluster.length - Math.PI / 2 + 0.4;
        s.el.style.setProperty('--size', size + 'px');
        s.el.style.left = (cx + Math.cos(angle) * ring - size / 2) + 'px';
        s.el.style.top = (cy + Math.sin(angle) * ring - size / 2 + 12) + 'px';
      });
    });
  }

  function build() {
    loading.remove();
    CLUSTERS.forEach(function (c) {
      var halo = document.createElement('div');
      halo.className = 'halo ' + c.color;
      halo.setAttribute('aria-hidden', 'true');
      halo.innerHTML = '<span></span>';
      halo.firstChild.textContent = c.name;
      stage.appendChild(halo);
      c.haloEl = halo;
    });
    SONGS.forEach(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'bubble' + (s.preview ? '' : ' unavailable');
      b.style.setProperty('--delay', (-(i * 0.7)).toFixed(1) + 's');
      if (s.art) b.style.backgroundImage = 'url("' + s.art + '")';
      else b.textContent = s.title.charAt(0);
      b.setAttribute('aria-label', s.title + ' by ' + s.artist + (s.preview ? ', 30-second preview' : ', preview unavailable'));
      b.title = s.title + ' · ' + s.artist;
      b.addEventListener('pointerenter', function (e) { if (started && e.pointerType === 'mouse') play(s); });
      b.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' && current === s) stop(); });
      b.addEventListener('focus', function () { if (started && b.matches(':focus-visible')) play(s); });
      b.addEventListener('blur', function () { if (current === s) stop(); });
      b.addEventListener('click', function (e) {
        /* Mouse: hover already plays it. Touch and keyboard: toggle. */
        if (e.pointerType === 'mouse') play(s);
        else if (current === s) stop(); else play(s);
      });
      s.el = b;
      stage.appendChild(b);
      bubbles.push(b);
    });
    layout();
    window.addEventListener('resize', layout);
  }

  Promise.all(SONGS.map(lookup)).then(build);
})();
