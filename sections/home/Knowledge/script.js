// Vendor
import gsap from 'gsap';

// Components
import SectionHome from '@/components/SectionHome';
import Heading from '@/components/Heading';
import Body from '@/components/Body';
// import ButtonUnderlined from '@/components/ButtonUnderlined';

export default {
  extends: SectionHome,
  name: 'SectionKnowledge',
  props: {
    data: { type: Object, required: false },
  },
  components: {
    Heading,
    Body,
    // ButtonUnderlined,
  },

  computed: {
    // Check if Arabic mode is active
    isArabic() {
      return (
        (this.$i18n && this.$i18n.locale === 'ar') ||
        (typeof document !== 'undefined' && document.documentElement.dir === 'rtl') ||
        (this.$root && this.$root.$data && this.$root.$data.isArabic === true)
      );
    },

    // Hard-coded content for both languages
    // t() {
    //   if (this.isArabic) {
    //     return {
    //       title: 'من سرد القصص إلى عيش القصص',
    //       description:
    //         'نؤمن بتحويل سرد القصص إلى عيشها فعليًا عبر مزج تصميم المفهوم والمحتوى التجريبي مع الخدمات التفاعلية بسلاسة.',
    //       // ctaLabel: 'اعرف أكثر',
    //       // ctaLink: '/ar/learn-more'
    //     };
    //   }
    //   return {
    //     title: 'Storytelling to Story-Living',
    //     description:
    //       'We believe in transforming storytelling into story-living by seamlessly blending concept design and experiential content with interactive services.',
    //     // ctaLabel: 'Learn more',
    //     // ctaLink: '/learn-more'
    //   };
    // },
  },

  mounted() {
    this._setupIntersectionObserver();
  },

  beforeDestroy() {
    this.removeEventListeners();
  },

  methods: {
    _setupIntersectionObserver() {
      this._io = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            this._io.disconnect();
            // direction = 1 to mimic “forward” scroll
            this.backgroundShow(() => {}, 1);
          }
        },
        { threshold: 0.25 }
      );
      this._io.observe(this.$el);
    },

    /**
     * Public
     */
    backgroundShow(done, direction) {
      if (this.timelineHide) this.timelineHide.kill();

      const delay = direction > 0 ? 0.6 : 0.8;
      this.timelineShow = gsap.timeline({ delay, onComplete: done });

      // Make sure section is visible
      this.timelineShow.set(this.$el, { alpha: 1 }, 0);

      // Animate heading
      if (this.$refs.heading.show) {
        this.timelineShow.add(this.$refs.heading.show(), 0); // Start at 0
      }

      this.timelineShow.add(this.$refs.body.showBlock(0), 0.6);


      // Animate body in parallel
      if (this.$refs.body.$el) {
        this.timelineShow.fromTo(
          this.$refs.body.$el,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
          0.5 // Start slightly after heading
        );
      }

      return this.timelineShow;
    },

    backgroundHide(done, direction) {
      if (this.timelineShow) this.timelineShow.kill();

      const delay = direction > 0 ? 0 : 0;
      this.timelineHide = gsap.timeline({ delay, onComplete: done });

      // Fade out entire section
      this.timelineHide.to(this.$el, { alpha: 0, duration: 0.5 }, 0.4);

      // Hide heading via its method
      if (this.$refs.heading.hide) {
        this.$refs.heading.hide();
      }

      // Instantly hide body to prevent re-flash
      if (this.$refs.body.$el) {
        gsap.set(this.$refs.body.$el, {
          opacity: 0,
          y: 40,
        });
      }

      return this.timelineHide;
    },

    setupEventListeners() {
      // Example if CTA needed:
      // this.$refs.cta.$el.addEventListener('click', this.ctaClickHandler);
      // this.$refs.cta.$el.addEventListener('mouseenter', this.ctaMouseenterHandler);
      // this.$refs.cta.$el.addEventListener('mouseleave', this.ctaMouseleaveHandler);
    },

    removeEventListeners() {
      // Example cleanup:
      // this.$refs.cta.$el.removeEventListener('click', this.ctaClickHandler);
      // this.$refs.cta.$el.removeEventListener('mouseenter', this.ctaMouseenterHandler);
      // this.$refs.cta.$el.removeEventListener('mouseleave', this.ctaMouseleaveHandler);
    },
  },
};
