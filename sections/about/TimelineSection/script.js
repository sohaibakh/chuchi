import gsap from 'gsap';

export default {
  data() {
    return {
      steps: ['Discover', 'Design', 'Develop', 'Deploy', 'Evaluate'],
      dotRefs: [],
    };
  },

  mounted() {
    this.positionDots();
    this.animateTimeline();
  },

  methods: {
    positionDots() {
      // evenly space dots
      const track = this.$el.querySelector('.timeline-track');
      const trackWidth = track.offsetWidth;

      this.dotRefs.forEach((dot, index) => {
        const left = (index / (this.steps.length - 1)) * 100;
        dot.style.left = `${left}%`;
      });
    },

    animateTimeline() {
      const progressBar = this.$refs.progressBar;
      const dots = this.dotRefs;

      console.log('dots:', dots)
      const stepsCount = this.steps.length;
  
      const updateDots = () => {
        const progressWidth = progressBar.offsetWidth;
        const totalWidth = progressBar.parentElement.offsetWidth;
  
        dots.forEach((dot, index) => {
          const dotPos = (index / (stepsCount - 1)) * totalWidth;
          const isActive = progressWidth >= dotPos - 10  ; // 1px buffer
  
          dot.style.backgroundColor = isActive ? '#f69f33' : '#ffffff';
          dot.style.borderColor = isActive ? '#f69f33' : '#c0c0c0';

        });
      };
  
      const timeline = gsap.timeline({
        repeat: -1,
        yoyo: true,
        defaults: { ease: 'none' },
        onUpdate: updateDots,
        // onComplete: () => {
        //   // ✅ Ensure last dot is colored when bar completes
        //   const lastDot = dots[dots.length - 1];
        //   lastDot.style.backgroundColor = '#006cd0';
        //   lastDot.style.borderColor = '#006cd0';
        // },
        // onReverseComplete: () => {
        //   // ✅ Ensure first dot is colored on reverse complete
        //   const firstDot = dots[0];
        //   firstDot.style.backgroundColor = '#006cd0';
        //   firstDot.style.borderColor = '#006cd0';
        // },
      });
  
      timeline.to(progressBar, {
        width: '100%',
        duration: 8,
      });
    },
  },
};
