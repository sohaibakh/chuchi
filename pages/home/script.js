// Vendor
import gsap from 'gsap';

// Plugins
import axios from '@/plugins/axios';

// Components
import Page from '@/components/Page';
import ScrollControl from '@/components/ScrollControlHomeNew';

// Sections
import SectionHeader from '@/sections/home/Header';
import SectionSlider from '@/sections/home/Slider';
import SectionKnowledge from '@/sections/home/Knowledge';
import SectionImmersion from '@/sections/home/Immersion';
import SectionPortfolio from '@/sections/home/Portfolio';
import SectionServicesCards from '@/sections/home/ServicesCards';
import SectionNews from '@/sections/shared/News';
import SectionFooter from '@/sections/shared/Footer';
import SectionFormCta from '@/sections/home/FormCta';
import SectionHeroVideo from '@/sections/home/Video';
import SectionPartnersCustom from '@/sections/home/PartnersCustom';

export default {
  extends: Page,

  components: {
    ScrollControl,
    SectionHeader,
    SectionSlider,
    SectionKnowledge,
    SectionImmersion,
    SectionPortfolio,
    SectionServicesCards,
    SectionFormCta,
    SectionPartnersCustom,
    SectionNews,
    SectionFooter,
    SectionHeroVideo
  },

  async asyncData({ app }) {
    const locale = app.i18n.locale;
    const res = await axios.get(`page/home?lang=${locale}`);
    const resPortfolio = await axios.get(`page/portfolio?lang=${locale}`);
    const resServices = await axios.get(`page/services?lang=${locale}`);

    console.log('services: ', resServices.data.items);
    const servicesItems = resServices.data.items;

    const portfolioItems = resPortfolio.data.items;
    const slides = portfolioItems.map(project => ({
      title: project.title,
      image: (project.image && project.image.sizes && project.image.sizes['1920x0'] && project.image.sizes['1920x0'].url) || '',
      slug: project.slug
    }));

    const sectionClientsRaw = res.data.sections.section_clients;

    const section_clients = {
      title: sectionClientsRaw.title,
      logos: (sectionClientsRaw.brand_logo || []).map(item => ({
        logo: (item.logo && item.logo.url) || item.logo,
        link: item.link || ''
      }))
    };

    return {
      metadata: res.data.seo,
      ...res.data.sections,
      slides,
      hero: {
        videoUrl: res.data.sections.section_video,
      },
      section_clients,
      servicesItems
    };
  },

  created() {
    this.scrollTriggers = true;
  },

  mounted() {
    this.$root.scrollControl = this.$refs.scrollControl;
  },

  methods: {
    transitionIn(done, routInfo) {
      const sc = this.$refs.scrollControl;
      const header = this.$refs.header;

      if (!sc) {
        console.warn("ScrollControl not ready yet, retrying…");
        this.$nextTick(() => {
          if (this.$refs.scrollControl && typeof this.$refs.scrollControl.enable === "function") {
            this.$refs.scrollControl.enable();
          }
        });
      } else {
        if (typeof sc.enable === "function") sc.enable();
      }

      this.disablePageBounce();

      const delay = routInfo.previous === null ? 0 : 0;
      const timeline = new gsap.timeline({ onComplete: done, delay });

      if (this.$root.webglApp) {
        timeline.add(this.$root.webglApp.showScene('home'), 0);
      }

      if (this.$refs.header && typeof this.$refs.header.transitionIn === "function") {
        timeline.add(this.$refs.header.transitionIn(), 0.5);
      } else {
        console.warn("Header not ready, retrying…");
        this.$nextTick(() => {
          if (this.$refs.header && typeof this.$refs.header.transitionIn === "function") {
            this.$refs.header.transitionIn();
          }
        });
      }

      timeline.add(this.$root.theNavigation.show(), 1);

      if (this.$root.customCursor) {
        timeline.add(this.$root.customCursor.show(), 2);
        timeline.call(() => {
          if (this.$root.customCursor.enableClickAndHold) this.$root.customCursor.enableClickAndHold();
        }, null, 2);
        timeline.call(() => {
          if (this.$root.customCursor.showIconA) this.$root.customCursor.showIconA();
        }, null, 2);
      }
    },

    transitionOut(done) {
      this.enablePageBounce();

      const timeline = new gsap.timeline({ onComplete: done });

      if (this.$root.webglApp) {
        timeline.add(this.$root.webglApp.hideScene(), 0);
      }

      timeline.to(this.$el, 0.8, { alpha: 0, ease: 'sine.inOut' }, 0);

      if (this.$root.webglBackground && this.$root.webglBackground.$el) {
        timeline.set(this.$root.webglBackground.$el, { opacity: 1 }, 0.8);
      }

      timeline.call(() => {
        const homeScene = this.$root.webglApp && this.$root.webglApp.getScene('home');
        if (homeScene && homeScene._container && homeScene._container.position) {
          homeScene._container.position.y = 0;
        }
      }, null, 0.8);

      if (this.$root.customCursor) {
        if (this.$root.customCursor.disableClickAndHold)
          this.$root.customCursor.disableClickAndHold();

        if (this.$root.customCursor.hide)
          this.$root.customCursor.hide();
      }
    },

    enablePageBounce() {
      document.documentElement.classList.remove('prevent-bounce');
    },

    disablePageBounce() {
      document.documentElement.classList.add('prevent-bounce');
    },
  },
};
