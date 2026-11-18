/* Motion for the drafting sheet. Inlined into <head> by src/layouts/Base.astro, so it runs before
   the first paint. The styles it switches on live in src/styles/motion.css.
   - html.motion: set at once unless the visitor's device asks for reduced motion. Without it the
     site is static, exactly as it was before any motion existed.
   - html.intro: the plot (a black cover swept off by a gold plotter head), first page of a tab session only.
   - .is-in on .stamp and .np: they arrive once half on screen and the plot (if any) is done.
   - --lx on .np: where the band of light on the brass sits (pointer x, or scroll on touch screens).
   - .lamp: a patch of gold grid that follows a mouse.
   Any error switches everything off and leaves the static site. */
(function () {
  var d = document;
  var root = d.documentElement;
  var dead = false;

  function drop(sel) {
    var el = d.querySelector(sel);
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }
  function fail() {
    dead = true;
    try {
      root.classList.remove('motion', 'intro');
      root.style.removeProperty('--plot-ms');
      drop('.plot');
      drop('.lamp');
      var hot = d.querySelector('.plot-hot');
      if (hot) hot.classList.remove('plot-hot');
      var np = d.querySelector('.np');
      if (np) np.style.removeProperty('--lx');
    } catch (e) { /* nothing left to do */ }
  }
  // Every callback runs through this: after a failure nothing runs again.
  function guard(fn) {
    return function (e) {
      if (dead) return;
      try { fn(e); } catch (err) { fail(); }
    };
  }

  try {
    if (!window.matchMedia || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    root.classList.add('motion');

    var intro = false;
    try {
      if (!sessionStorage.getItem('tt-plotted')) {
        sessionStorage.setItem('tt-plotted', '1');
        intro = true;
      }
    } catch (e) { intro = false; }

    var PLOT_DELAY = 120;
    var plotMs = Math.round(Math.min(1100, Math.max(650, 500 + 0.25 * window.innerWidth)));
    if (intro) {
      root.style.setProperty('--plot-ms', plotMs + 'ms');
      root.classList.add('intro');
    }

    if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', guard(ready));
    else guard(ready)();
  } catch (e) {
    fail();
  }

  function ready() {
    var plot = d.querySelector('.plot');
    var np = d.querySelector('.np');
    var plotDone = !intro;

    /* ---------- arrivals: the stamp, then the nameplate ---------- */
    // [ms after the plot ends, ms after DOMContentLoaded when there is no plot]
    var arrivals = [];
    [['.stamp', 80, 150], ['.np', 260, 330]].forEach(function (a) {
      var el = d.querySelector(a[0]);
      if (el) arrivals.push({ el: el, after: [a[1], a[2]], ready: false, seen: false, done: false });
    });
    var io = null;
    function arrive(a) {
      if (a.done || !a.ready || !a.seen) return;
      a.done = true;
      a.el.classList.add('is-in');
      if (io) io.unobserve(a.el);
    }
    if (arrivals.length) {
      if ('IntersectionObserver' in window) {
        io = new IntersectionObserver(guard(function (entries) {
          entries.forEach(function (en) {
            var half = en.intersectionRatio >= 0.5 ||
              (en.isIntersecting && en.intersectionRect.height >= 0.5 * window.innerHeight);
            if (!half) return;
            arrivals.forEach(function (a) {
              if (a.el === en.target) { a.seen = true; arrive(a); }
            });
          });
        }), { threshold: [0, 0.25, 0.5, 0.75, 1] });
        arrivals.forEach(function (a) { io.observe(a.el); });
      } else {
        arrivals.forEach(function (a) { a.seen = true; });
      }
    }
    function release(fromPlot) {
      arrivals.forEach(function (a) {
        setTimeout(guard(function () { a.ready = true; arrive(a); }), a.after[fromPlot ? 0 : 1]);
      });
    }

    /* ---------- the plot ---------- */
    function endPlot() {
      if (plotDone) return;
      plotDone = true;
      if (plot && plot.parentNode) plot.parentNode.removeChild(plot);
      plot = null;
      root.classList.remove('intro');
      root.style.removeProperty('--plot-ms');
      release(true);
    }

    if (!intro) {
      if (plot && plot.parentNode) plot.parentNode.removeChild(plot);
      release(false);
    } else if (!plot) {
      endPlot();
    } else {
      plot.addEventListener('animationend', guard(function (e) {
        if (e.target === plot) endPlot();
      }));
      setTimeout(guard(endPlot), PLOT_DELAY + plotMs + 400);

      // The hot title: the h1 glows gold right behind the head, then cools (motion.css, .plot-hot).
      var h1 = d.querySelector('h1');
      if (h1) {
        var r = h1.getBoundingClientRect();
        var speed = window.innerWidth / plotMs; // px per ms
        if (r.width > 0 && speed > 0) {
          // Line the title up with the cover's clock (its animation may have started before this ran).
          var elapsed = 0;
          if (plot.getAnimations) {
            plot.getAnimations().forEach(function (an) {
              if (an.animationName === 'plot-sweep' && an.currentTime) elapsed = Number(an.currentTime) || 0;
            });
          }
          var hotDelay = PLOT_DELAY + Math.max(0, r.left) / speed - elapsed;
          var hotMs = (1.5 * r.width) / speed;
          var cool = guard(function () {
            h1.classList.remove('plot-hot');
            h1.style.removeProperty('--hot-delay');
            h1.style.removeProperty('--hot-ms');
          });
          h1.style.setProperty('--hot-delay', hotDelay.toFixed(1) + 'ms');
          h1.style.setProperty('--hot-ms', hotMs.toFixed(1) + 'ms');
          h1.classList.add('plot-hot');
          h1.addEventListener('animationend', function (e) {
            if (e.target === h1 && e.animationName === 'plot-hot') cool();
          });
          setTimeout(cool, Math.max(0, hotDelay) + hotMs + 400);
        }
      }
    }

    /* ---------- the lamp and the light on the brass ---------- */
    var lamp = null;
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      lamp = d.createElement('div');
      lamp.className = 'lamp';
      lamp.setAttribute('aria-hidden', 'true');
      d.body.insertBefore(lamp, d.body.firstChild);
    }
    if (!lamp && !np) return;

    var px = 0, py = 0;        // last mouse position (client px)
    var mouseSeen = false;     // a fine pointer has moved
    var lampOn = false;
    var lastLx = '';
    var docH = root.getBoundingClientRect().height;
    var queued = false;

    // The page grid is the body background, painted on the canvas and sized to <html>: its vertical
    // lines (90deg) start at x = 0, its horizontal lines (0deg) are counted up from the bottom of <html>.
    if (lamp && 'ResizeObserver' in window) {
      new ResizeObserver(guard(function () { docH = root.getBoundingClientRect().height; schedule(); })).observe(root);
    }

    function mod(n, m) { return ((n % m) + m) % m; }

    function frame() {
      queued = false;
      if (np) {
        var lx;
        if (mouseSeen) {
          lx = -15 + (130 * px) / Math.max(1, window.innerWidth);
        } else {
          var r = np.getBoundingClientRect();
          var vh = window.innerHeight;
          lx = 115 - (130 * (vh - r.top)) / Math.max(1, vh + r.height);
        }
        lx = Math.min(115, Math.max(-15, lx)).toFixed(2) + '%';
        if (lx !== lastLx) { np.style.setProperty('--lx', lx); lastLx = lx; }
      }
      if (lamp && mouseSeen) {
        if (!('ResizeObserver' in window)) docH = root.getBoundingClientRect().height;
        var x = Math.round(px) - 260;
        var y = Math.round(py) - 260;
        var gx = mod(-(x + window.scrollX), 100);
        var gy = mod(docH - (y + window.scrollY), 100);
        var g = gx + 'px ' + gy + 'px';
        lamp.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
        lamp.style.backgroundPosition = g + ', ' + g + ', ' + g + ', ' + g + ', center';
      }
    }
    function schedule() {
      if (queued || dead) return;
      queued = true;
      requestAnimationFrame(guard(frame));
    }

    addEventListener('pointermove', guard(function (e) {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      px = e.clientX;
      py = e.clientY;
      mouseSeen = true;
      if (lamp && !lampOn) { lamp.classList.add('is-on'); lampOn = true; }
      schedule();
    }), { passive: true });
    d.addEventListener('mouseout', guard(function (e) {
      if (!e.relatedTarget && lamp && lampOn) { lamp.classList.remove('is-on'); lampOn = false; }
    }), { passive: true });
    addEventListener('scroll', guard(schedule), { passive: true });
    addEventListener('resize', guard(schedule), { passive: true });
    schedule();
  }
})();
