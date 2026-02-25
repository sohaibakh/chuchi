// Vendor
import gsap from 'gsap';
import Page from '@/components/Page';
// import ScrollControl from '@/components/ScrollControlServices'; // This version should now handle only free scroll
import RegisterServicesImages from '@/utils/RegisterServicesImages';
// Sections
import ServicesSlider from '@/sections/services/ServicesSlider';
import SectionFooter from '@/sections/shared/Footer';
import ResourceLoader from '@/utils/ResourceLoader';
// Plugins
import axios from '@/plugins/axios';

export default {
  extends: Page,

  components: {
    ServicesSlider,
    SectionFooter,
  },

  async asyncData({ app }) {
    const locale = app.i18n.locale;
    const res = await axios.get(`page/services?lang=${locale}`);
  
  
    return {
      metadata: res.data.seo,
      servicesData: res.data.items, // ✅ fix: use 'items' instead of 'sections'
    };
  }
  ,

  data() {
    return {
      isReady: false,
      texturesReady: false,
      lang: this.$i18n.locale
    };
  },

  watch: {
      '$i18n.locale'(val) {
        this.lang = val; // keep the :class binding in sync
      }
  },

  async created() {
    this.scrollTriggers = true;

    await RegisterServicesImages(this.servicesData)
    this.texturesReady = true;
  },

  mounted() {
    this.isReady = true; // allow rendering of slider when scene is ready
    // if (this.servicesData?.length) {
    //   RegisterServicesImages(this.servicesData);
    // }
  },

  methods: {
    transitionIn() {
      const timeline = new gsap.timeline();
      if (this.$root.webglApp) timeline.add(this.$root.webglApp.showScene('services'), 0);
      timeline.to(this.$el, 1.3, { alpha: 1, ease: 'sine.inOut' }, 0.5);
      timeline.add(this.$root.theNavigation.show(), 1);
      if (this.$root.customCursor) {
        timeline.add(this.$root.customCursor.show(), 1);
        timeline.call(() => {
          if (this.$root.customCursor.enableClickAndHold) this.$root.customCursor.enableClickAndHold();
        }, null, 1);
      }
      this.isReady = true;           
  },

  transitionOut(done) {
      const timeline = new gsap.timeline({ onComplete: done });
      if (this.$root.webglApp) timeline.add(this.$root.webglApp.hideScene('services'), 0);
      timeline.to(this.$el, 1, { alpha: 0, ease: 'sine.inOut' }, 0);
  },
  },
};
