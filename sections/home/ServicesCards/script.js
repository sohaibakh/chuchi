import gsap from 'gsap';
import sample from '@/assets/images/services/interactive.PNG';
import sample2 from '@/assets/images/services/concept-design.png';
import Heading from '@/components/Heading';

export default {
  name: 'SectionServicesCards',

  components: { Heading },

  data() {
    return {
      slides: [
        { title: 'Interactive', titleAr: 'التفاعل البشري', image: sample, slug: 'human-interaction' },
        { title: 'Concept Design', titleAr: 'تصميم المفهوم', image: sample2, slug: 'concept-design-experiential-content' },
      ]
    };
  },

  computed: {
    // Detect Arabic
    isArabic() {
      return (
        (this.$i18n && this.$i18n.locale === 'ar') ||
        (typeof document !== 'undefined' && document.documentElement.dir === 'rtl') ||
        (this.$root && this.$root.$data && this.$root.$data.isArabic === true)
      );
    },

    // Heading text
    headingText() {
      return this.isArabic ? 'خدماتنا' : 'Our Services';
    },

    // Localized slides
    localizedSlides() {
      return this.slides.map(s => ({
        ...s,
        title: this.isArabic ? s.titleAr : s.title,
      }));
    },
  },

  mounted() {
    this._setupIntersectionObserver();
  },

  methods: {
    _setupIntersectionObserver() {
      this._io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          this._io.disconnect();
          this.backgroundShow(() => {}, 1);
        }
      }, { threshold: 0.25 });

      this._io.observe(this.$el);
    },

    backgroundShow(done, direction) {
      const tl = gsap.timeline({ onComplete: done });

      if (this.$refs.heading?.show) {
        tl.add(this.$refs.heading.show(), 0);
      }

      if (Array.isArray(this.$refs.sercards)) {
        const cards = this.$refs.sercards.map(el => el?.$el || el);
        tl.fromTo(
          cards,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.15 },
          0.3
        );
      }

      return tl;
    },

    backgroundHide(done) {
      const tl = gsap.timeline({ onComplete: done });

      if (this.$refs.heading?.hide) tl.add(this.$refs.heading.hide(), 0);

      if (Array.isArray(this.$refs.sercards)) {
        const cards = this.$refs.sercards.map(el => el?.$el || el);
        gsap.set(cards, { opacity: 0, y: 50 });
      }

      return tl;
    }
  }
};
