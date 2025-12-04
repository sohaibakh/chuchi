import Heading from '@/components/Heading';

let gsap = null;

export default {
  name: 'SectionPartnersCustom',

  components: { Heading },

  props: {
    data: {
      type: Object,
      required: true, // expects { title: "...", logos: [ {logo, link}, … ] }
    },
  },

  computed: {
    // Detect Arabic/RTL
    isArabic() {
      return (
        (this.$i18n && this.$i18n.locale === 'ar') ||
        (typeof document !== 'undefined' && document.documentElement.dir === 'rtl') ||
        (this.$root && this.$root.$data && this.$root.$data.isArabic === true)
      );
    },

    // Heading text with fallback
    headingText() {
      return this.data.title || (this.isArabic ? 'عملاؤنا' : 'Our Clients');
    },
  },

  mounted() {
    if (process.client) {
      this._setupIntersectionObserver();
    }

    console.log('SectionPartnersCustom data prop:', this.data);
  },

  methods: {
    _setupIntersectionObserver() {
      this._io = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            this._io.disconnect();
            this.backgroundShow(() => {}, 1);
          }
        },
        { threshold: 0.3 }
      );

      this._io.observe(this.$el);
    },

    async backgroundShow(done, direction) {
      if (!gsap) gsap = (await import('gsap')).default;

      const tl = gsap.timeline({ onComplete: done });

      // Animate heading
      if (this.$refs.heading.show) {
        tl.add(this.$refs.heading.show(), 0);
      }

      // Animate logos
      const items = this.$el.querySelectorAll('.logos > li');
      if (items.length) {
        tl.fromTo(
          items,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            stagger: 0.1,
          },
          0.3
        );
      }

      return tl;
    },

    async backgroundHide(done) {
      if (!gsap) gsap = (await import('gsap')).default;

      const tl = gsap.timeline({ onComplete: done });

      if (this.$refs.heading.hide) {
        tl.add(this.$refs.heading.hide(), 0);
      }

      return tl;
    },
  },
};
