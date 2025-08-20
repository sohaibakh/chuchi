// Vendor
import gsap from 'gsap';

// Components
import SectionAbout from '@/components/SectionAbout';
import Heading from '@/components/Heading';

export default {
  name: 'SectionProcessHead',
  extends: SectionAbout,
  components: { Heading },

  methods: {
    backgroundShow(done, direction) {
      const tl = gsap.timeline({ onComplete: done });
      // trigger both headings; stagger slightly
      if (this.$refs.headingTop?.show) tl.add(this.$refs.headingTop.show(), 0.4);
      if (this.$refs.headingSub?.show) tl.add(this.$refs.headingSub.show(), 0.55);
      this._timelineBackgroundShow = tl;
      return tl;
    },
  },
};
