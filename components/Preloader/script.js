// Vendor
import gsap from 'gsap';

// Plugins
import axios from '@/plugins/axios';

// Utils
import ResourceLoader from '@/utils/ResourceLoader.js';

// Components
import CookiesMessage from '@/components/CookiesMessage';

// Store
import { PRELOADER_STARTED, PRELOADER_ASSETS_LOADED, PRELOADER_COMPLETED } from '@/store';

// Resources
import resources from '@/resources.js';

export default {
  components: {
    CookiesMessage,
  },

  fetch() {
    const locale = this.$i18n.locale;
    return axios.get(`page/portfolio?lang=${locale}`).then((res) => {
      this.$store.commit('portfolio/items', res.data.items);
      this.$store.commit('portfolio/categories', res.data.categories);
      this.portfolioItems = res.data.items;
      return {
        items: res.data.items,
      };
    });
  },

  data() {
    return {
      portfolioItems: [],
    };
  },

  created() {
    this.isTimelineShowComplete = false;
    this.isQueueComplete = false;
  },

  mounted() {
    this.lockScroll();
    this.$store.commit('preloader', PRELOADER_STARTED);
    this.addPortfolioImages();
    this.loadResources();
    this.setupEventListeners();
    this.show();
    if (!this.$refs.video) {
      // No video available → auto-complete timeline show step
      this.isTimelineShowComplete = true;
    }
  },

  beforeDestroy() {
    this.removeEventListeners();
  },

  methods: {
    setupEventListeners() {
      this.$root.resourceLoader.addEventListener('complete', this.loadResourcesCompleteHandler);
    },

    removeEventListeners() {
      this.$root.resourceLoader.removeEventListener('complete', this.loadResourcesCompleteHandler);
    },

    addPortfolioImages() {
      for (let i = 0; i < this.portfolioItems.length; i++) {
        const image = this.portfolioItems[i].image.sizes['1920x0'];
        resources.push({
          type: 'image',
          name: this.portfolioItems[i].slug,
          absolutePath: image.url,
        });
      }
    },

    loadResources() {
      const basePath = this.$router.options.base === '/' ? '' : this.$router.options.base;
      this.$root.resourceLoader = new ResourceLoader(resources, basePath);
    },

    show() {
      const timeline = gsap.timeline({ delay: 0.5 });
    
      // Only animate video if it exists
      if (this.$refs.video) {
        timeline.fromTo(
          this.$refs.video,
          { opacity: 0 },
          { opacity: 1, duration: 1, ease: 'power2.out' },
          0
        );
      }
    
      timeline.call(this.timelineShowCompleteHandler, null, 2.0);
    },

    hide() {
      const timeline = gsap.timeline({ onComplete: this.hideCompleteHandler });
      timeline.add(this.$refs.cookiesMessage.hide(), 0);
      timeline.to(this.$el, 1, { autoAlpha: 0, ease: 'sine.inOut' }, 1);
    },

    showIntro() {
      const timeline = gsap.timeline();
      timeline.add(this.$refs.cookiesMessage.show(), 0.1);
      this.unlockScroll();
    },

    lockScroll() {
      if (this.$root.scrollManager) this.$root.scrollManager.lockScroll();
    },

    unlockScroll() {
      if (this.$root.scrollManager) this.$root.scrollManager.unlockScroll();
    },

    loadResourcesCompleteHandler() {
      this.isQueueComplete = true;
      if (this.isTimelineShowComplete) {
        this.$store.commit('preloader', PRELOADER_ASSETS_LOADED);
        this.showIntro();
        this.hide();
      }
    },

    // timelineShowCompleteHandler() {
    //   this.isTimelineShowComplete = true;
    //   if (this.isQueueComplete) {
    //     this.$store.commit('preloader', PRELOADER_ASSETS_LOADED);
    //     this.showIntro();
    //     this.hide();
    //   } else {
        
    //   }
    // },

    timelineShowCompleteHandler() {
      this.isTimelineShowComplete = true;
      if (this.isQueueComplete) {
        this.$store.commit('preloader', PRELOADER_ASSETS_LOADED);
        this.showIntro();
        this.hide();
      } else {
            
      }
    },
    

    hideCompleteHandler() {
      if (this.$refs.video) this.$refs.video.pause();
      this.$el.style.display = 'none';
      this.$store.commit('preloader', PRELOADER_COMPLETED);
    },
  },
};
