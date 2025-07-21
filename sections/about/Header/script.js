// Vendor
import gsap from 'gsap';

// Components
import SectionAbout from '@/components/SectionAbout';
import Heading from '@/components/Heading';

// Assets
import ScrollArrow from '@/assets/images/icons/scroll-arrow.svg?inline';
import Body from '@/components/Body';

export default {
    name: 'AboutHeader',
    extends: SectionAbout,

    components: {
        Heading,
        ScrollArrow,
        Body
    },

    methods: {
        /**
         * Public
         */
        transitionIn() {
            this._timelineTransitionIn = new gsap.timeline();
            this._timelineTransitionIn.set(this.$el, { alpha: 1 }, 0);
            // this._timelineTransitionIn.add(this.$refs.heading.show(), 0);
            // this._timelineBackgroundShow.add(this.$refs.body.showAll(1), 0);

            this._timelineTransitionIn.fromTo(this.$refs.scrollArrow, 0.7, { alpha: 0 }, { alpha: 1, ease: 'sine.inOut' }, 1);
            return this._timelineTransitionIn;
        },

        backgroundShow(done, direction) {
            this._timelineBackgroundShow = new gsap.timeline({ onComplete: done });
            this._timelineBackgroundShow.add(this.$refs.heading.show(), 0.7);
           
            if (this.$refs.body?.$el) {
                this._timelineBackgroundShow.fromTo(
                  this.$refs.body.$el,
                  { opacity: 0, y: 40 },
                  { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
                  0.9 // Start at 0 (together with heading)
                );
              }

            return this._timelineBackgroundShow;
        },

        backgroundHide() {
            this._timelineBackgroundHide = new gsap.timeline();
            this._timelineBackgroundHide.to(this.$refs.scrollArrow, 0.7, { alpha: 0, ease: 'sine.inOut' }, 0);
            return this._timelineBackgroundHide;
        },
    },
};
