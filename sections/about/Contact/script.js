// Vendor
import gsap from 'gsap';

// Components
import SectionAbout from '@/components/SectionAbout';
import ButtonArrow from '@/components/ButtonArrow';
import Heading from '@/components/Heading';

export default {
  name: 'AboutContact',
  extends: SectionAbout,

  components: {
    ButtonArrow,
    Heading,
  },

  props: {
    data: {
      type: Object,
      required: true
    }
  },

  computed: {
    // Detect Arabic/RTL
    // isArabic() {
    //   return (
    //     (this.$i18n && this.$i18n.locale === 'ar') ||
    //     (typeof document !== 'undefined' && document.documentElement.dir === 'rtl') ||
    //     (this.$root && this.$root.$data && this.$root.$data.isArabic === true)
    //   );
    // },
    // // Localized heading: "A powerful idea deserves a space of its own"
    // headingText() {
    //   return this.isArabic
    //     ? 'الفكرة القوية تستحق مساحةً خاصة بها'
    //     : 'A powerful idea deserves a space of its own';
    // },
  },

  mounted() {
    if (this.$refs.button?.$el) {
      this.$refs.button.$el.addEventListener('click', this.clickContactHandler);
    }
  },

  beforeDestroy() {
    if (this.$refs.button?.$el) {
      this.$refs.button.$el.removeEventListener('click', this.clickContactHandler);
    }
  },

  methods: {
    backgroundShow(done, direction) {
      this._timelineBackgroundShow = new gsap.timeline({ onComplete: done });
      if (this.$refs.heading?.show) {
        this._timelineBackgroundShow.add(this.$refs.heading.show(), 0.7);
      }
      if (this.$refs.button?.$el) {
        this._timelineBackgroundShow.fromTo(
          this.$refs.button.$el,
          1,
          { alpha: 0 },
          { alpha: 1, ease: 'power1.inOut' },
          0.7
        );
      }
      return this._timelineBackgroundShow;
    },

    // Analytics
    clickContactHandler() {
      this.$ga?.event?.({
        eventCategory: 'click',
        eventAction: 'click contact button on footer about',
      });
    },
  },
};
