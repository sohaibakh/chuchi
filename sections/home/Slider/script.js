import Heading from '@/components/Heading';
import gsap from 'gsap';
import sample from '@/assets/images/portfolio-detail/sample.png';

export default {
  name: 'SectionSlider',
  components: { Heading },

  props: {
    slides: {
      type: Array,
      required: true,
      default: () => [],
    },
  },

  data() {
    return {
      sample,
      state: {
        current: 0,
        target: 0,
        currentIndex: 0,
        slideWidth: 0,
        isDragging: false,
        startX: 0,
        wrapper: null,
        container: null,
        animationFrame: null,
        containerCenter: 0,
      },
    };
  },

  computed: {
    // Detect Arabic/RTL — mirrors the previous section’s logic
    isArabic() {
      return (
        (this.$i18n && this.$i18n.locale === 'ar') ||
        (typeof document !== 'undefined' && document.documentElement.dir === 'rtl') ||
        (this.$root && this.$root.$data && this.$root.$data.isArabic === true)
      );
    },
    // Heading text only
    headingText() {
      return this.isArabic ? 'المشاريع' : 'Projects';
    },
  },

  mounted() {
    this._setupIntersectionObserver();

    this.$nextTick(() => {
      const checkWrapper = () => {
        const wrapper = this.$el.querySelector('.swiper-wrapper');
        if (wrapper && this.slides.length > 0) {
          this._initCenteredSlider();
        } else {
          requestAnimationFrame(checkWrapper);
        }
      };
      checkWrapper();
    });
  },

  beforeDestroy() {
    if (this.state && this.state.animationFrame) {
      cancelAnimationFrame(this.state.animationFrame);
    }
  
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
    }
  
    if (this._io) {
      this._io.disconnect();
    }
  }
,  

  methods: {
    _setupIntersectionObserver() {
      this._io = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            this._io.disconnect();
            this.backgroundShow(() => {}, 1);
          }
        },
        { threshold: 0.35 }
      );
      this._io.observe(this.$el);
    },

    backgroundShow(done) {
      const tl = gsap.timeline({ onComplete: done });
    
      if (this.$refs && this.$refs.heading && typeof this.$refs.heading.show === "function") {
        tl.add(this.$refs.heading.show(), 0);
      }
    
      if (this.$refs && this.$refs.slides) {
        tl.to(this.$refs.slides, {
          y: 0,
          opacity: 1,
          duration: 1.0,
          ease: 'power2.out'
        }, 0.4);
      }
    
      return tl;
    }
    ,

    backgroundHide(done) {
      const tl = gsap.timeline({ onComplete: done });
    
      if (this.$refs && this.$refs.heading && typeof this.$refs.heading.hide === "function") {
        tl.add(this.$refs.heading.hide(), 0);
      }
    
      if (this.$refs && this.$refs.slides) {
        gsap.set(this.$refs.slides, { opacity: 0, y: 50 });
      }
    
      return tl;
    }
    ,

    _initCenteredSlider() {
      const wrapper = this.$el.querySelector('.swiper-wrapper');
      const container = this.$el.querySelector('.swiper-container');

      Object.assign(this.state, { wrapper, container });

      this._measure();
      this._centerSlide(this.state.currentIndex);

      const lerp = (a, b, t) => (1 - t) * a + t * b;
      const render = () => {
        this.state.current = lerp(this.state.current, this.state.target, 0.18);
        wrapper.style.transform = `translateX(${-this.state.current}px)`;
        this.state.animationFrame = requestAnimationFrame(render);
      };
      render();

      // Mouse drag
      container.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.state.isDragging = true;
        this.state.startX = e.clientX;
        container.classList.add('grabbing');
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.state.isDragging) return;
        const delta = e.clientX - this.state.startX;
        this.state.startX = e.clientX;
        this.state.target -= delta;
      });

      window.addEventListener('mouseup', () => {
        if (!this.state.isDragging) return;
        this.state.isDragging = false;
        container.classList.remove('grabbing');
        this._centerNearestSlide();
      });

      window.addEventListener('mouseleave', () => {
        if (!this.state.isDragging) return;
        this.state.isDragging = false;
        container.classList.remove('grabbing');
        this._centerNearestSlide();
      });

      // Touch drag
      container.addEventListener('touchstart', (e) => {
        this.state.isDragging = true;
        this.state.startX = e.touches[0].clientX;
      });

      window.addEventListener('touchmove', (e) => {
        if (!this.state.isDragging) return;
        const delta = e.touches[0].clientX - this.state.startX;
        this.state.startX = e.touches[0].clientX;
        this.state.target -= delta;
      });

      window.addEventListener('touchend', () => {
        if (!this.state.isDragging) return;
        this.state.isDragging = false;
        this._centerNearestSlide();
      });

      // Arrows
      this.$el.querySelector('.swiper-button-next').addEventListener('click', () => {
        this.state.currentIndex = Math.min(this.slides.length - 1, this.state.currentIndex + 1);
        this._centerSlide(this.state.currentIndex);
      });

      this.$el.querySelector('.swiper-button-prev').addEventListener('click', () => {
        this.state.currentIndex = Math.max(0, this.state.currentIndex - 1);
        this._centerSlide(this.state.currentIndex);
      });

      // Recalculate on resize
      this._resizeHandler = () => {
        this._measure();
        this._centerSlide(this.state.currentIndex);
      };
      window.addEventListener('resize', this._resizeHandler);
    },

    _measure() {
      const wrapper   = this.state.wrapper || this.$el.querySelector('.swiper-wrapper');
      const container = this.state.container || this.$el.querySelector('.swiper-container');
      const slides    = this.$el.querySelectorAll('.swiper-slide');
      if (!slides.length || !wrapper || !container) return;
      this.state.containerCenter = container.clientWidth / 2;
    },

    _setActive(index) {
      const slides =
        this.state && this.state.wrapper
          ? this.state.wrapper.querySelectorAll('.swiper-slide')
          : [];
    
      slides.forEach((el, i) => {
        el.classList.toggle('active', i === index);
      });
    }
    ,

    _centerSlide(index) {
      const slides = this.$el.querySelectorAll('.swiper-slide');
      const container = this.state.container;
      if (!slides.length || !container) return;

      const slideEl = slides[index];
      const slideCenter = slideEl.offsetLeft + (slideEl.offsetWidth / 2);
      this.state.target = Math.max(0, slideCenter - this.state.containerCenter);

      this._setActive(index);
    },

    _centerNearestSlide() {
      const slides = this.$el.querySelectorAll('.swiper-slide');
      if (!slides.length) return;

      let nearest = 0;
      let bestDist = Infinity;
      const currentCenter = this.state.current + this.state.containerCenter;

      slides.forEach((el, i) => {
        const center = el.offsetLeft + el.offsetWidth / 2;
        const d = Math.abs(center - currentCenter);
        if (d < bestDist) { bestDist = d; nearest = i; }
      });

      this.state.currentIndex = nearest;
      this._centerSlide(nearest);
    },
  },
};
