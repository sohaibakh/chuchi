import gsap from 'gsap';

export default {
  data() {
    return {
      steps: ['Discover', 'Design', 'Develop', 'Deploy', 'Evaluate'],
      dotRefs: [],
      timeline: null,
    };
  },

  mounted() {
    this.$nextTick(() => {
      // Safely get dot references after DOM has rendered
      this.dotRefs = Array.from(this.$el.querySelectorAll('.timeline-dot'));

      if (!this.dotRefs.length) {
        console.warn('No timeline-dot elements found.');
        return;
      }

      this.positionDots();
      this.animateTimeline();
    });
  },

  beforeDestroy() {
    // Kill animation to avoid memory leaks or duplicated animation on route change
    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }
  },

  methods: {
    positionDots() {
      const track = this.$el.querySelector('.timeline-track');
      if (!track) return;

      const trackWidth = track.offsetWidth;

      this.dotRefs.forEach((dot, index) => {
        if (!dot) return;
        const left = (index / (this.steps.length - 1)) * 100;
        dot.style.left = `${left}%`;
      });
    },

    animateTimeline() {
      const progressBar = this.$refs.progressBar;
      const dots = this.dotRefs;
      const stepsCount = this.steps.length;

      if (!progressBar || !progressBar.parentElement) {
        console.warn('Progress bar or its container not found.');
        return;
      }

      const updateDots = () => {
        const progressWidth = progressBar.offsetWidth;
        const totalWidth = progressBar.parentElement.offsetWidth;

        dots.forEach((dot, index) => {
          if (!dot) return;

          const dotPos = (index / (stepsCount - 1)) * totalWidth;
          const isActive = progressWidth >= dotPos - 10;

          dot.style.backgroundColor = isActive ? '#f69f33' : '#ffffff';
          dot.style.borderColor = isActive ? '#f69f33' : '#c0c0c0';
        });
      };

      this.timeline = gsap.timeline({
        repeat: -1,
        yoyo: true,
        defaults: { ease: 'none' },
        onUpdate: updateDots,
      });

      this.timeline.to(progressBar, {
        width: '100%',
        duration: 8,
      });
    },
  },
};
