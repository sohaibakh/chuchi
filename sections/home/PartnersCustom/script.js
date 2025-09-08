import Heading from '@/components/Heading';

import one from '@/assets/images/clients/aramco-logo.png'
import two from '@/assets/images/clients/masar.png'
import three from '@/assets/images/clients/machinestalk.png'
import four from '@/assets/images/clients/MDLbeast-1.png'
import five from '@/assets/images/clients/misk_logo.png'
import six from '@/assets/images/clients/Noor_Riyadh_Logo.png'
import seven from '@/assets/images/clients/king-abdullah-economic-city-large.png'
import eight from '@/assets/images/clients/Ministry_of_Hajj_and_Umrah_Logo.png'
import nine from '@/assets/images/clients/Ministry-of-Media.png'
import ten from '@/assets/images/clients/RCMC logo.png'
import eleven from '@/assets/images/clients/saudi_cable_logo.png'
import twelve from '@/assets/images/clients/Saudi_Ministry_of_Culture_Logo.png'
import thirteen from '@/assets/images/clients/snb logo.png'
import fourteen from '@/assets/images/clients/stc logo.png'
import fifteen from '@/assets/images/clients/um alqura logo.png'

let gsap = null;

export default {
  name: 'SectionPartnersCustom',

  components: { Heading },

  props: {
    data: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      logos: [
        { logo: one, link: 'https://example.com' },
        { logo: two, link: '' },
        { logo: three, link: 'https://another.com' },
        // { logo: four, link: 'https://another.com' },
        { logo: five, link: 'https://another.com' },
        { logo: six, link: 'https://another.com' },
        { logo: seven, link: 'https://another.com' },
        { logo: eight, link: 'https://another.com' },
        { logo: nine, link: 'https://another.com' },
        { logo: ten, link: 'https://another.com' },
        { logo: eleven, link: 'https://another.com' },
        { logo: twelve, link: 'https://another.com' },
        { logo: thirteen, link: 'https://another.com' },
        { logo: fourteen, link: 'https://another.com' },
        { logo: fifteen, link: 'https://another.com' },
      ],
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
    // Heading text only (Our Clients → عملاؤنا)
    headingText() {
      return this.isArabic ? 'عملاؤنا' : 'Our Clients';
    },
  },

  mounted() {
    if (process.client) {
      this._setupIntersectionObserver();
    }
  },

  methods: {
    _setupIntersectionObserver() {
      this._io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          this._io.disconnect();
          this.backgroundShow(() => {}, 1);
        }
      }, { threshold: 0.3 });

      this._io.observe(this.$el);
    },

    async backgroundShow(done, direction) {
      if (!gsap) gsap = (await import('gsap')).default;

      const tl = gsap.timeline({ onComplete: done });

      if (this.$refs.heading?.show) {
        tl.add(this.$refs.heading.show(), 0);
      }

      const items = this.$el.querySelectorAll('.logos > li');
      if (items.length) {
        tl.fromTo(items,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            stagger: 0.1,
          },
          0.3
        );
      }

      return tl;
    },

    async backgroundHide(done) {
      if (!gsap) gsap = (await import('gsap')).default;

      const tl = gsap.timeline({ onComplete: done });

      if (this.$refs.heading?.hide) {
        tl.add(this.$refs.heading.hide(), 0);
      }

      return tl;
    }
  }
};
