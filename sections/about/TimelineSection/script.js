import gsap from 'gsap';
import SectionAbout from '@/components/SectionAbout';
import sample from '@/assets/images/about/approach.jpeg'

export default {
  name: 'TimelineSection', // required for dynamic method matching
  extends: SectionAbout,

  data() {
    return {
      sample,
      activeIndex: -1,
      stepsData: [
        {
          title: 'DISCOVER',
          description:
            'We start by listening and diving deep into your goals, audience, and vision to understand what experience you truly want to create.'
        },
        {
          title: 'DESIGN',
          description:
            'We translate insights into concepts, journeys, and visuals — crafting the right narrative, space flow, and interaction blueprint.'
        },
        {
          title: 'DEVELOP',
          description:
            'We prototype, iterate, and engineer the content, media, and technology that power the experience.'
        },
        {
          title: 'DEPLOY',
          description:
            'We integrate, test, and launch on-site or on-platform with a focus on quality, stability, and impact.'
        },
        {
          title: 'EVALUATE',
          description:
            'We measure outcomes, learn from audience behavior, and refine to maximize long‑term value.'
        }
      ],

      _observer: null,
      _activeIO: null,

      // connector utilities
      _gridRO: null,
      _connectorRaf: null,
      _queueDrawConnector: null,
      _bpLarge: 850 // must match your SCSS 'large' min-width
    };
  },

  mounted() {
    const cards = this.$refs.cards || [];
    if (!cards.length) return;

    // Draw connector once DOM is painted
    this.$nextTick(() => {
      this._setupConnector(); // draw once ready
    });

    // Passive observer (kept for future needs)
    this._observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // currently no-op, preserved for potential debug/use
          // const index = Number(entry.target.dataset.index);
        });
      },
      { root: null, threshold: 0.5 }
    );

    // Attach dataset index & observe
    cards.forEach((el, i) => {
      el.dataset.index = i;
      this._observer.observe(el);
    });

    // Active observer for highlighting + tiny orb pulse
    this._activeIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const i = Number(entry.target.dataset.index);
          if (entry.isIntersecting) {
            this.activeIndex = i;
            const orb = entry.target.querySelector('.orb');
            if (orb) {
              gsap.fromTo(
                orb,
                { scale: 0.95 },
                { scale: 1, duration: 0.6, ease: 'power2.out' }
              );
            }
          }
        });
      },
      { threshold: 0.55 }
    );

    cards.forEach((el) => this._activeIO.observe(el));
  },

  beforeDestroy() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
    if (this._activeIO) {
      this._activeIO.disconnect();
      this._activeIO = null;
    }
    this._teardownConnector?.();
  },

  methods: {
    /* ============================
       Connector (curved SVG line)
       ============================ */
    _setupConnector() {
      // Throttled/RAF’d draw
      this._queueDrawConnector =
        this._queueDrawConnector ||
        (() => {
          cancelAnimationFrame(this._connectorRaf);
          this._connectorRaf = requestAnimationFrame(() => this._drawConnector());
        });

      // Resize
      window.addEventListener('resize', this._queueDrawConnector, { passive: true });

      // Observe the grid size changes (content reflow etc.)
      const grid = this.$refs.grid;
      if (grid && window.ResizeObserver) {
        this._gridRO = new ResizeObserver(this._queueDrawConnector);
        this._gridRO.observe(grid);
      }

      // Initial draw
      this._drawConnector();
    },

    _teardownConnector() {
      window.removeEventListener('resize', this._queueDrawConnector);
      if (this._gridRO) {
        this._gridRO.disconnect();
        this._gridRO = null;
      }
      cancelAnimationFrame(this._connectorRaf);
    },

    _drawConnector() {
      const svg = this.$refs.connectorSvg;
      const path = this.$refs.connectorPath;
      const grid = this.$refs.grid;
      const cards = this.$refs.cards || [];

      if (!svg || !path || !grid || !cards.length) return;

      // Hide on small screens (1-column)
      if (window.innerWidth < this._bpLarge) {
        svg.style.display = 'none';
        path.setAttribute('d', '');
        return;
      } else {
        svg.style.display = 'block';
      }

      // Size SVG to grid box
      const gridRect = grid.getBoundingClientRect();
      const w = gridRect.width;
      const h = gridRect.height;

      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.setAttribute('width', w);
      svg.setAttribute('height', h);

      // Collect orb centers relative to grid
      const points = [];
      cards.forEach((card) => {
        const orb = card.querySelector('.orb');
        if (!orb) return;
        const r = orb.getBoundingClientRect();
        const cx = (r.left - gridRect.left) + r.width / 2;
        const cy = (r.top - gridRect.top) + r.height / 2;
        points.push({ x: cx, y: cy });
      });

      if (points.length < 2) {
        path.setAttribute('d', '');
        return;
      }

      // Build smooth path through centers
      const d = this._buildSmoothPath(points, 0.2); // tweak smoothing 0.15–0.35 if needed
      path.setAttribute('d', d);
    },

    _buildSmoothPath(points, smoothing = 0.2) {
      const line = (p1, p2) => {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return { length: Math.hypot(dx, dy), angle: Math.atan2(dy, dx) };
      };

      const controlPoint = (current, previous, next, reverse) => {
        const p = previous || current;
        const n = next || current;
        const o = line(p, n);
        const angle = o.angle + (reverse ? Math.PI : 0);
        const length = o.length * smoothing;
        return {
          x: current.x + Math.cos(angle) * length,
          y: current.y + Math.sin(angle) * length
        };
      };

      return points.reduce((d, point, i, a) => {
        if (i === 0) return `M ${point.x},${point.y}`;
        const cps = controlPoint(a[i - 1], a[i - 2], point, false);
        const cpe = controlPoint(point, a[i - 1], a[i + 1], true);
        return `${d} C ${cps.x},${cps.y} ${cpe.x},${cpe.y} ${point.x},${point.y}`;
      }, '');
    }
  }
};
