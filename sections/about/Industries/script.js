// SectionIndustries.vue
import gsap from 'gsap';
import SectionAbout from '@/components/SectionAbout';
import Heading from '@/components/Heading';

export default {
  name: 'SectionIndustries',
  extends: SectionAbout,

  components: { Heading },

  props: {
    data: {
      type: Object,
      required: false,
      default: () => ({})
    }
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

    // // Localized heading
    // headingText() {
    //   return this.isArabic ? 'القطاعات التي نخدمها' : 'Industries We Serve';
    // },

    // Localized industries list
    localizedIndustries() {
      if (!this.data?.industry_item) return [];
      return this.data.industry_item.map((it) => ({
        title: this.isArabic ? it.title_ar || it.title : it.title || it.name,
        image: it.image
      }));
    }
  },

  methods: {
    transitionIn() {
      const tl = gsap.timeline();
      tl.set(this.$el, { opacity: 1 }, 0);
      if (this.$refs.heading?.show) tl.add(this.$refs.heading.show(), 0);
      return tl;
    },

    backgroundShow(done) {
      const tl = gsap.timeline({ onComplete: done });
      if (this.$refs.heading?.show) tl.add(this.$refs.heading.show(), 0.7);
      return tl;
    },

    backgroundHide() {
      return gsap.timeline();
    }
  }
};
