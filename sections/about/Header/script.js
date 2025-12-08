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
      default: () => ({})
    },
  },

  data() {
    return {
      ready: false // 🔥 Section readiness flag
    };
  },

  mounted() {
    // Wait one frame for DOM & child refs
    this.$nextTick(() => {
      this.ready = true;
    });
  },

  computed: {
    isArabic() {
      return (
        (this.$i18n && this.$i18n.locale === 'ar') ||
        (typeof document !== 'undefined' && document.documentElement.dir === 'rtl') ||
        (this.$root && this.$root.$data && this.$root.$data.isArabic === true)
      );
    }
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

    /**
     * SAFE BACKGROUND SHOW
     * Ensures Heading & Body are ready before animating.
     */
    backgroundShow(done, direction) {
      const heading = this.$refs.heading;
      const body = this.$refs.body;

      // 🔥 WAIT until everything is truly ready
      if (
        !this.ready ||
        !heading ||
        !body ||
        !heading.isReady ||     // Heading sets this flag internally
        !body.ready             // Body sets this flag internally
      ) {
        console.warn('[AboutHeader] backgroundShow() called early → retrying...');

        setTimeout(() => {
          this.backgroundShow(done, direction);
        }, 30);

        return; // ⛔ stop here
      }

      // 🔥 SAFE TO ANIMATE NOW
      this._timelineBackgroundShow = new gsap.timeline({ onComplete: done });

      // Heading animation
      if (typeof heading.show === 'function') {
        this._timelineBackgroundShow.add(() => heading.show(), 0.7);
      }

      // Body animation
      if (typeof body.showAll === 'function') {
        this._timelineBackgroundShow.add(() => body.showAll(direction), 0.7);
      }

      // Body fade-in
      if (body.$el) {
        this._timelineBackgroundShow.fromTo(
          body.$el,
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
