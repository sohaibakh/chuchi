// Vendor
import gsap from 'gsap';

// Components
import ContactForm from '@/components/ContactForm';
import Heading from '@/components/Heading';

export default {
  name: 'SectionFormCta',

  components: {
    ContactForm,
    Heading
  },

  computed: {
    // Detect Arabic/RTL (same logic as other sections)
    isArabic() {
      return (
        (this.$i18n && this.$i18n.locale === 'ar') ||
        (typeof document !== 'undefined' && document.documentElement.dir === 'rtl') ||
        (this.$root && this.$root.$data && this.$root.$data.isArabic === true)
      );
    },
    headingText() {
      return this.isArabic ? 'تواصل معنا' : 'Contact Us';
    },
  },

  mounted() {
    this._setupIntersectionObserver();
  },

  beforeDestroy() {
    this._removeEventListeners();
  },

  methods: {
    _setupIntersectionObserver() {
      this._io = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            this._io.disconnect();
            this.backgroundShow(() => {}, 1); // direction = 1
          }
        },
        { threshold: 0.25 }
      );
      this._io.observe(this.$el);
    },

    backgroundShow(done, direction) {
      if (this.timelineHide) this.timelineHide.kill();

      const delay = direction > 0 ? 0.6 : 0.8;
      this.timelineShow = gsap.timeline({ delay, onComplete: done });

      // Make section visible
      this.timelineShow.set(this.$el, { autoAlpha: 1 }, 0);

      // Animate heading
      if (this.$refs.heading.show) {
        this.timelineShow.add(this.$refs.heading.show(), 0);
      }

      // Animate form (fade in + upward motion)
      if (this.$refs.form.$el) {
        this.timelineShow.fromTo(
          this.$refs.form.$el,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
          0.4 // start shortly after heading begins
        );
      }

      return this.timelineShow;
    },

    backgroundHide(done, direction) {
      if (this.timelineShow) this.timelineShow.kill();

      const delay = direction > 0 ? 0 : 0;
      this.timelineHide = gsap.timeline({ delay, onComplete: done });

      this.timelineHide.to(this.$el, { autoAlpha: 0, duration: 0.5 }, 0.4);

      if (this.$refs.heading.hide) {
        this.$refs.heading.hide();
      }

      if (this.$refs.form.$el) {
        gsap.set(this.$refs.form.$el, { opacity: 0, y: 40 });
      }

      return this.timelineHide;
    },

    _removeEventListeners() {
      // No events to remove currently
    },
  }
};
