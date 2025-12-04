// Vendor
import gsap from 'gsap';

// Assets
import Logo from '@/assets/logo-png.png';

import Twitter from '@/assets/images/icons/twitter.svg?inline';
import Medium from '@/assets/images/icons/medium.svg?inline';
import LinkedIn from '@/assets/images/icons/linkedin.svg?inline';
import Youtube from '@/assets/images/icons/youtube.svg?inline';
import Instagram from '@/assets/images/icons/instagram.svg?inline';

export default {

    props: ['scrollType'],
    name: 'SectionFooter',

    components: {
        Twitter,
        Medium,
        LinkedIn,
        Youtube,
        Instagram,
    },

    data() {
        return {
            logoSrc: Logo
        }
    },

    methods: {
        show() {
            const timeline = new gsap.timeline();

            timeline.to(this.$refs.content, 0.5, { alpha: 1, ease: 'power1.inOut' });
        },

        socialsClickHandler(e) {
            // Analytics
            this.$ga.event({
                eventCategory: 'click',
                eventAction: `click social link : ${e.currentTarget.dataset.socialName}`,
            });
        },

        clickIGHanlder() {
            this.$ga.event({
                eventCategory: 'click',
                eventAction: 'Go to Immersive Garden website',
            });
        },
    },
};
