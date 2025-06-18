// Vendor
import gsap from 'gsap';

// Compontents
import SectionHome from '@/components/SectionHome';
import Heading from '@/components/Heading';
import Body from '@/components/Body';
import axios from '@/plugins/axios';
// import ButtonUnderlined from '@/components/ButtonUnderlined';

export default {
    extends: SectionHome,

    components: {
        Heading,
        Body,
        // ButtonUnderlined,
    },

    

    mounted() {
        // this.setupEventListeners();
        this._setupIntersectionObserver();
    },

    beforeDestroy() {
        this.removeEventListeners();
    },

    methods: {
        _setupIntersectionObserver() {
            this._io = new IntersectionObserver(
              (entries) => {
                if (entries[0].isIntersecting) {
                  this._io.disconnect()
                  // direction = 1 to mimic “forward” scroll
                  this.backgroundShow(/* done */ () => {}, /* direction */ 1)
                }
              },
              { threshold: 0.25 }
            )
            this._io.observe(this.$el)
          },
        /**
         * Public
         */
         backgroundShow(done, direction) {
            if (this.timelineHide) this.timelineHide.kill();
          
            const delay = direction > 0 ? 0.6 : 0.8;
            this.timelineShow = gsap.timeline({ delay, onComplete: done });
          
            // Make sure section is visible
            this.timelineShow.set(this.$el, { alpha: 1 }, 0);
          
            // Animate heading
            if (this.$refs.heading?.show) {
              this.timelineShow.add(this.$refs.heading.show(), 0); // Start at 0
            }
          
            // Animate body in parallel
            if (this.$refs.body?.$el) {
              this.timelineShow.fromTo(
                this.$refs.body.$el,
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
                0.5 // Start at 0 (together with heading)
              );
            }
          
            return this.timelineShow;
          }
          
          
          
          ,

          backgroundHide(done, direction) {
            if (this.timelineShow) this.timelineShow.kill();
          
            const delay = direction > 0 ? 0 : 0;
            this.timelineHide = gsap.timeline({ delay, onComplete: done });
          
            // Fade out entire section (optional)
            this.timelineHide.to(this.$el, { alpha: 0, duration: 0.5 }, 0.4);
          
            // Hide heading via its method
            if (this.$refs.heading?.hide) {
              this.$refs.heading.hide();
            }
          
            // Instantly hide body to prevent re-flash
            if (this.$refs.body?.$el) {
              gsap.set(this.$refs.body.$el, {
                opacity: 0,
                y: 40
              });
            }
          
            return this.timelineHide;
          }
          
          ,
        setupEventListeners() {
            // this.$refs.cta.$el.addEventListener('click', this.ctaClickHandler);
            // this.$refs.cta.$el.addEventListener('mouseenter', this.ctaMouseenterHandler);
            // this.$refs.cta.$el.addEventListener('mouseleave', this.ctaMouseleaveHandler);
        },

        removeEventListeners() {
            // this.$refs.cta.$el.removeEventListener('click', this.ctaClickHandler);
            // this.$refs.cta.$el.removeEventListener('mouseenter', this.ctaMouseenterHandler);
            // this.$refs.cta.$el.removeEventListener('mouseleave', this.ctaMouseleaveHandler);
        },

    
    },
};
