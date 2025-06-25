// SectionIndustries.vue

import gsap from 'gsap';
import SectionAbout from '@/components/SectionAbout';
import Heading from '@/components/Heading';

export default {
  name: 'SectionIndustries',
  extends: SectionAbout,

  components: {
    Heading
  },

  data() {
    return {
      // track which box is hovered
      hoveredIndex: null,

      // list of industries with their images
      industries: [
        { name: 'Finance',       image: require('@/assets/images/industries/crown.JPG') },
        { name: 'Healthcare',    image: require('@/assets/images/industries/image.png') },
        { name: 'Real Estate',   image: require('@/assets/images/industries/image2.png') },
        { name: 'Education',     image: require('@/assets/images/industries/image3.png') },
        { name: 'Hospitality',   image: require('@/assets/images/industries/image4.png') },
        { name: 'Manufacturing', image: require('@/assets/images/industries/ithra.jpg') },
        // …add more as needed
      ]
    };
  },

  methods: {
    transitionIn() {
      const tl = gsap.timeline();
      tl.set(this.$el, { opacity: 1 }, 0);
      tl.add(this.$refs.heading.show(), 0);
      return tl;
    },

    backgroundShow(done, direction) {
      const tl = gsap.timeline({ onComplete: done });
      tl.add(this.$refs.heading.show(), 0.7);
      return tl;
    },

    backgroundHide() {
      return gsap.timeline();
    }
  }
};

