// Vendor
import gsap from 'gsap';

// Components
import SectionAbout from '@/components/SectionAbout';
import Heading from '@/components/Heading';
import Body from '@/components/Body';

export default {
  name: 'AboutInfo',
  extends: SectionAbout,

  components: {
    Heading,
    Body,
  },


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

    // Localized heading
    // headingText() {
    //   return this.isArabic ? 'ماذا نفعل' : 'What Do We Do';
    // },

    // // Localized body
    // bodyText() {
    //   return this.isArabic
    //     ? 'نصمم ونبني تجارب يستمتع بها الناس ويتذكرونها ويشاركونها.'
    //     : 'We design and build experiences that people enjoy, remember, and share.';
    // },
  },

  methods: {
    backgroundShow(done, direction) {
      this._timelineBackgroundShow = new gsap.timeline({ onComplete: done });
      if (this.$refs.heading?.show) {
        this._timelineBackgroundShow.add(this.$refs.heading.show(), 0.7);
      }
      
      this._timelineBackgroundShow.add(this.$refs.body.showAll(direction), 0.7);


      // If you want to animate body too, uncomment below:
      if (this.$refs.body?.$el) {
        this._timelineBackgroundShow.fromTo(
          this.$refs.body.$el,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
          0.85
        );
      }
      return this._timelineBackgroundShow;
    },
  },
};
