// Vendor
import gsap from 'gsap';

// Components
import SectionAbout from '@/components/SectionAbout';
import Heading from '@/components/Heading';
import Body from '@/components/Body';

// Assets
import ScrollArrow from '@/assets/images/icons/scroll-arrow.svg?inline';

export default {
  name: 'AboutHeader',
  extends: SectionAbout,

  components: {
    Heading,
    ScrollArrow,
    Body
  },

  props: {
    data: {
      type: Object,
      required: false,
      default: () => ({}),
    },
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

    // Localized heading
    // headingText() {
    //   return this.isArabic ? 'من نحن' : 'Who we are';
    // },

    // // Localized body copy
    // bodyText() {
    //   return this.isArabic
    //     ? 'نحن شركة تصميم تجارب وُلدت في السعودية.\nنحوّل الأفكار إلى واقع مُعاش—نمزج بين سرد القصص والتصميم والتقنية لصناعة مساحات يمكن للناس أن يشعروا بها حقًا.\nمن المعارض التفاعلية إلى التفعيلات الرقمية، نصنع بيئات تدفع الناس للتفكير والاستكشاف والتواصل.'
    //     : 'We’re a Saudi-born experience design company.\nWe turn ideas into immersive realities—blending storytelling, design, and technology to create spaces people can truly feel.\nFrom interactive exhibits to digital activations, we craft environments that move people to think, explore, and connect.';
    // },
  },

  methods: {
    /**
     * Public
     */
    transitionIn() {
      this._timelineTransitionIn = new gsap.timeline();
      this._timelineTransitionIn.set(this.$el, { alpha: 1 }, 0);

      // Fade in scroll arrow
      this._timelineTransitionIn.fromTo(
        this.$refs.scrollArrow,
        0.7,
        { alpha: 0 },
        { alpha: 1, ease: 'sine.inOut' },
        1
      );
      return this._timelineTransitionIn;
    },

    backgroundShow(done, direction) {
      this._timelineBackgroundShow = new gsap.timeline({ onComplete: done });

      // Animate heading
      if (this.$refs.heading?.show) {
        this._timelineBackgroundShow.add(this.$refs.heading.show(), 0.7);
      }

      this._timelineBackgroundShow.add(this.$refs.body.showAll(direction), 0.7);


      // Animate body
      if (this.$refs.body?.$el) {
        this._timelineBackgroundShow.fromTo(
          this.$refs.body.$el,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
          0.9
        );
      }

      return this._timelineBackgroundShow;
    },

    backgroundHide() {
      this._timelineBackgroundHide = new gsap.timeline();
      this._timelineBackgroundHide.to(
        this.$refs.scrollArrow,
        0.7,
        { alpha: 0, ease: 'sine.inOut' },
        0
      );
      return this._timelineBackgroundHide;
    },
  },
};
