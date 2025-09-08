// SectionIndustries.vue
import gsap from 'gsap';
import SectionAbout from '@/components/SectionAbout';
import Heading from '@/components/Heading';

export default {
  name: 'SectionIndustries',
  extends: SectionAbout,

  components: { Heading },

  data() {
    return {
      hoveredIndex: null,
      industries: [
        { name: 'Finance',       nameAr: 'المالية',         image: require('@/assets/images/industries/crown.JPG') },
        { name: 'Healthcare',    nameAr: 'الرعاية الصحية',  image: require('@/assets/images/industries/image.png') },
        { name: 'Real Estate',   nameAr: 'العقارات',        image: require('@/assets/images/industries/image2.png') },
        { name: 'Education',     nameAr: 'التعليم',         image: require('@/assets/images/industries/image3.png') },
        { name: 'Hospitality',   nameAr: 'الضيافة',         image: require('@/assets/images/industries/image4.png') },
        { name: 'Manufacturing', nameAr: 'التصنيع',         image: require('@/assets/images/industries/ithra.jpg') },
        // …add more as needed
      ]
    };
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

    // Localized heading
    headingText() {
      return this.isArabic ? 'القطاعات التي نخدمها' : 'Industries We Serve';
    },

    // Localized industries list
    localizedIndustries() {
      return this.industries.map(it => ({
        ...it,
        name: this.isArabic ? (it.nameAr || it.name) : it.name
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
