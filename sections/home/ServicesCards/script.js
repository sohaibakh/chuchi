import gsap from 'gsap';

import sample from '@/assets/images/services/interactive.PNG';
import sample2 from '@/assets/images/services/concept-design.png';

import Heading from '@/components/Heading';

export default {
  name: 'SectionServicesCards',

  components: {
    Heading,
  },

  data() {
    return {
      slides: [
        { title: 'Interactive', image: sample, slug: 'human-interaction' },
        { title: 'Concept Design', image: sample2, slug: 'concept-design-experiential-content' },
      ]
    };
  },

  mounted() {
    this._setupIntersectionObserver();
  },

  methods: {
    _setupIntersectionObserver() {
      this._io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          this._io.disconnect(); // Run once
          this.backgroundShow(() => {}, 1);
        }
      }, { threshold: 0.25 });

      this._io.observe(this.$el);
    },

    backgroundShow(done, direction) {
      const tl = gsap.timeline({ onComplete: done });

      // Animate heading
      if (this.$refs.heading?.show) {
        tl.add(this.$refs.heading.show(), 0);
      }

      // Animate cards
      if (Array.isArray(this.$refs.sercards)) {
        const cards = this.$refs.sercards.map(el => el?.$el || el); // ensure real DOM
        tl.fromTo(
          cards,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            stagger: 0.15,
          },
          0.3
        );
      }

      return tl;
    },

    backgroundHide(done) {
      const tl = gsap.timeline({ onComplete: done });

      // Hide heading
      if (this.$refs.heading?.hide) {
        tl.add(this.$refs.heading.hide(), 0);
      }

      // Hide cards
      if (Array.isArray(this.$refs.sercards)) {
        const cards = this.$refs.sercards.map(el => el?.$el || el);
        gsap.set(cards, { opacity: 0, y: 50 });
      }

      return tl;
    }
  }
};
