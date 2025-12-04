import gsap from 'gsap'

// Utils
import WindowResizeObserver from '@/utils/WindowResizeObserver'

// Base section
import SectionHome from '@/components/SectionHome'

// Components
import ScrollIndicator from '@/components/ScrollIndicator'

// Fallback asset (Vite/Webpack returns a hashed URL string)
// import fallbackMp4 from '@/assets/images/video3.mp4'
// Optional:
// import fallbackWebm from '@/assets/videos/hero.webm'
// import fallbackPoster from '@/assets/images/hero-poster.jpg'

export default {
  name: 'SectionHeroVideo',
  extends: SectionHome,
  components: { ScrollIndicator },

  props: {
    // Expect: { videoUrl, videoUrlWebm, videoPoster, scroll_down_label }
    data: { type: Object, required: true },
    overlay: { type: Boolean, default: false },
  },

  computed: {
    videoSrcMp4() {
      // prefer CMS value, otherwise fallback
      console.log('check vdo:', this.data)
      return this.data.videoUrl || fallbackMp4
    },
    // videoSrcWebm() {
    //   return this.data?.videoUrlWebm || null
    //   // or: return this.data?.videoUrlWebm || fallbackWebm
    // },

  },

  mounted() {
    this.isTransitionInComplete = false
    this.setupEventListeners()
    this.resize()

    // iOS/Safari autoplay safety
    const v = this.$refs.video
    if (v && v.paused) {
      v.muted = true
      v.play().catch(() => {})
    }
  },

  beforeDestroy() {
    this.removeEventListeners()
  },

  methods: {
    transitionIn() {
      const tl = gsap.timeline({ onComplete: this.transitionInCompleteHandler });
      tl.set(this.$el, { autoAlpha: 1 }, 0);
    
      if (this.$refs && this.$refs.video) {
        tl.fromTo(
          this.$refs.video,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 1.2, ease: 'sine.inOut' },
          0
        );
      }
    
      if (
        this.$refs &&
        this.$refs.scrollIndicator &&
        typeof this.$refs.scrollIndicator.show === 'function'
      ) {
        tl.add(this.$refs.scrollIndicator.show(), 0.6);
      }
    
      return tl;
    }
    ,

    backgroundShow(done, direction) {
      if (this.timelineHide) this.timelineHide.kill()
      const delay = direction > 0 ? 0 : 0.2
      const tl = (this.timelineShow = gsap.timeline({ delay, onComplete: done }))
      tl.set(this.$el, { autoAlpha: 1 }, 0)
      if (this.$refs.video) tl.fromTo(this.$refs.video, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.0, ease: 'sine.inOut' }, 0)
      return tl
    },

    backgroundHide(done, direction) {
      if (this.timelineShow) this.timelineShow.kill();
    
      const tl = (this.timelineHide = gsap.timeline({ onComplete: done }));
    
      if (
        this.$refs &&
        this.$refs.scrollIndicator &&
        this.$refs.scrollIndicator.$el
      ) {
        tl.to(this.$refs.scrollIndicator.$el, { autoAlpha: 0, duration: 0.3 }, 0);
      }
    
      if (this.$refs && this.$refs.video) {
        tl.to(this.$refs.video, { autoAlpha: 0, duration: 0.5, ease: 'sine.inOut' }, 0.2);
      }
    
      tl.to(this.$el, { autoAlpha: 0, duration: 0.4 }, 0.4);
      tl.timeScale(1.2);
    
      return tl;
    },    

    focus() {
      if (!this.isTransitionInComplete) return
      if (this.timelineUnfocus) this.timelineUnfocus.kill()
      const tl = (this.timelineFocus = gsap.timeline())
      tl.to(this.$el, { scale: 1.045, duration: 0.55, ease: 'power4.out' }, 0)
      tl.to(this.$el, { autoAlpha: 0, duration: 0.17, ease: 'sine.inOut' }, 0)
      return tl
    },

    unfocus() {
      if (!this.isTransitionInComplete) return
      if (this.timelineFocus) this.timelineFocus.kill()
      const tl = (this.timelineUnfocus = gsap.timeline())
      tl.to(this.$el, { scale: 1, duration: 0.75, ease: 'power3.out' }, 0)
      tl.to(this.$el, { autoAlpha: 1, duration: 0.19, ease: 'sine.inOut' }, 0)
      return tl
    },

    setupEventListeners() {
      WindowResizeObserver.addEventListener('resize', this.resizeHandler)
    },
    removeEventListeners() {
      WindowResizeObserver.removeEventListener('resize', this.resizeHandler)
    },
    resize() {
      if (
        this.$refs &&
        this.$refs.scrollIndicator &&
        typeof this.$refs.scrollIndicator.resize === 'function'
      ) {
        this.$refs.scrollIndicator.resize(this.$refs.content);
      }
    }
    ,
    resizeHandler() {
      this.resize()
    },
    transitionInCompleteHandler() {
      this.isTransitionInComplete = true
    },
  },
}