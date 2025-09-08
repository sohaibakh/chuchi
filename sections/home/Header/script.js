// Vendor
import gsap from 'gsap';

// Utils
import WindowResizeObserver from '@/utils/WindowResizeObserver';

// Components
import SectionHome from '@/components/SectionHome';
import ScrollIndicator from '@/components/ScrollIndicator';
// import ButtonBlock from '@/components/ButtonBlock';
import Heading from '@/components/Heading';
import video from '@/assets/images/video3.mp4';
export default {
  extends: SectionHome,

  components: {
    ScrollIndicator,
    // ButtonBlock,
    Heading,
  },

  mounted() {
    this.isTransitionInComplete = false;
    this.setupEventListeners();
    this.resize();

    // Attempt autoplay on iOS/Safari quirks
    const v = this.$refs.video;
    if (v && v.paused) {
      v.muted = true; // ensure muted for autoplay policies
      v.play().catch(() => {});
    }
  },

  computed: {
    videoSrcMp4() {
        return this.data?.videoUrl ?? video
      }
  },

  beforeDestroy() {
    this.removeEventListeners();
  },

  methods: {
    /**
     * Public
     */
    transitionIn() {
      const timelineIn = new gsap.timeline({ onComplete: this.transitionInCompleteHandler });
      timelineIn.set(this.$el, { alpha: 1 }, 0);

      // Fade in video & scroll indicator
      if (this.$refs.video) {
        timelineIn.fromTo(this.$refs.video, { alpha: 0 }, { alpha: 1, duration: 1.2, ease: 'sine.inOut' }, 0);
      }
      if (this.$refs.scrollIndicator?.show) {
        timelineIn.add(this.$refs.scrollIndicator.show(), 0.6);
      }

      return timelineIn;
    },

    backgroundShow(done, direction) {
      if (this.timelineHide) this.timelineHide.kill();

      const delay = direction > 0 ? 0 : 0.2;
      this.timelineShow = new gsap.timeline({ delay, onComplete: done });
      this.timelineShow.set(this.$el, { alpha: 1 }, 0);

      if (this.$refs.video) {
        this.timelineShow.fromTo(this.$refs.video, { alpha: 0 }, { alpha: 1, duration: 1.0, ease: 'sine.inOut' }, 0);
      }
      // If you want scroll indicator to appear here, uncomment:
      // if (this.$refs.scrollIndicator?.show) this.timelineShow.add(this.$refs.scrollIndicator.show(), 0.5);

      return this.timelineShow;
    },

    backgroundHide(done, direction) {
      if (this.timelineShow) this.timelineShow.kill();

      const delay = direction > 0 ? 0 : 0;
      this.timelineHide = new gsap.timeline({ delay, onComplete: done });

      if (this.$refs.scrollIndicator?.$el) {
        this.timelineHide.to(this.$refs.scrollIndicator.$el, { alpha: 0, duration: 0.3 }, 0);
      }
      if (this.$refs.video) {
        this.timelineHide.to(this.$refs.video, { alpha: 0, duration: 0.5, ease: 'sine.inOut' }, 0.2);
      }
      this.timelineHide.to(this.$el, { alpha: 0, duration: 0.4 }, 0.4);

      this.timelineHide.timeScale(1.2);
      return this.timelineHide;
    },

    focus() {
      if (!this.isTransitionInComplete) return;
      if (this.timelineUnfocus) this.timelineUnfocus.kill();

      this.timelineFocus = new gsap.timeline();
      this.timelineFocus.to(this.$el, { scale: 1.045, duration: 0.55, ease: 'power4.out' }, 0);
      this.timelineFocus.to(this.$el, { alpha: 0, duration: 0.17, ease: 'sine.inOut' }, 0);
      return this.timelineFocus;
    },

    unfocus() {
      if (!this.isTransitionInComplete) return;
      if (this.timelineFocus) this.timelineFocus.kill();

      this.timelineUnfocus = new gsap.timeline();
      this.timelineUnfocus.to(this.$el, { scale: 1, duration: 0.75, ease: 'power3.out' }, 0);
      this.timelineUnfocus.to(this.$el, { alpha: 1, duration: 0.19, ease: 'sine.inOut' }, 0);
      return this.timelineUnfocus;
    },

    /**
     * Private
     */
    setupEventListeners() {
      WindowResizeObserver.addEventListener('resize', this.resizeHandler);
    },

    removeEventListeners() {
      WindowResizeObserver.removeEventListener('resize', this.resizeHandler);
    },

    /**
     * Resize
     */
    resize() {
      // keep scroll indicator positioning relative to the full content area
      this.$refs.scrollIndicator?.resize?.(this.$refs.content);
    },

    /**
     * Handlers
     */
    resizeHandler() {
      this.resize();
    },

    transitionInCompleteHandler() {
      this.isTransitionInComplete = true;
    },
  },
};
