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

  data() {
    return {
      hoveredIndex: null,
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

    // Localized industries list
    localizedIndustries() {
      if (!this.data?.industry_item) return [];
      return this.data.industry_item.map((it) => {
        // Check if image exists and is not false/null/empty
        let imageUrl = null;
        
        if (it.image && it.image !== false) {
          imageUrl = it.image.url || it.image;
        } else if (it.image_url) {
          imageUrl = it.image_url;
        } else if (it.photo && it.photo !== false) {
          imageUrl = it.photo.url || it.photo;
        } else if (it.thumbnail && it.thumbnail !== false) {
          imageUrl = it.thumbnail.url || it.thumbnail;
        }

        if (!imageUrl) {
          console.warn(`⚠️ Industry "${it.title}" has no image (image: ${it.image}). To add image, update backend API.`);
        }

        return {
          title: this.isArabic ? it.title_ar || it.title : it.title || it.name,
          image: imageUrl,
          name: it.name,
          rawData: it
        };
      });
    }
  },

  methods: {
    handleImageError(index, industry) {
      console.error(`❌ Failed to load image for industry:`, industry.title, industry.image);
    },

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
