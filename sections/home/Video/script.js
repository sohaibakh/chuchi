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
      // prefer CMS value — fallbackMp4 import is intentionally omitted;
      // return null so the <video> element simply shows nothing (no crash)
      return this.data.videoUrl || null
    },
    // videoSrcWebm() {
    //   return this.data?.videoUrlWebm || null
    // },
  },

  mounted() {
    this.isTransitionInComplete = false
    this.setupEventListeners()
    this.resize()

    // Self-trigger: the Video section is always the first visible section on the
    // homepage. backgroundShow() is normally called by the ScrollControl section
    // trigger — but it never fires for the first section because scrollY starts at 0.
    // This IntersectionObserver ensures backgroundShow() is called as soon as the
    // section enters the viewport (threshold: 0 = fires immediately).
    this.$nextTick(() => {
      this._io = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            this._io.disconnect()
            this.backgroundShow(() => {}, 1)
          }
        },
        { threshold: 0 }
      )
      this._io.observe(this.$el)
    })

    // iOS/Safari autoplay safety
    // Imperatively set attributes Safari requires for inline muted autoplay
    this.$nextTick(() => {
      const v = this.$refs.video
      if (!v) return
      v.muted = true
      v.setAttribute('playsinline', '')
      v.setAttribute('webkit-playsinline', '')

      // Safari sometimes ignores the `loop` attribute after an imperative load()
      // and blocks play() calls made from the `ended` event (autoplay policy).
      // Fix: use `timeupdate` to seek back to 0 *before* the video ends, so
      // playback is never interrupted and Safari never enters the `ended` state.
      this._videoLoopHandler = () => {
        if (!v.duration) return
        if (v.currentTime > 0 && (v.duration - v.currentTime) < 0.3) {
          v.currentTime = 0
        }
      }
      v.addEventListener('timeupdate', this._videoLoopHandler)

      // Safety net: if Safari silently pauses the video (e.g. low-power mode
      // or background tab), restart it every second.
      this._videoWatchdog = setInterval(() => {
        if (v && v.paused && !v.ended) {
          v.play().catch(() => {})
        }
      }, 1000)

      // Force Safari to reload the source before attempting play
      v.load()
      v.play().catch(() => {})
    })
  },

  beforeDestroy() {
    this.removeEventListeners()
    if (this._io) this._io.disconnect()
    // Clean up Safari loop workaround
    const v = this.$refs.video
    if (v && this._videoLoopHandler) {
      v.removeEventListener('timeupdate', this._videoLoopHandler)
    }
    if (this._videoWatchdog) {
      clearInterval(this._videoWatchdog)
    }
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