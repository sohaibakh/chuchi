// Vendor
import gsap from 'gsap';
import { RoughEase } from '@/vendor/gsap/EasePack';
import SplitText from '@/vendor/gsap/SplitText';
import InertiaPlugin from '@/vendor/gsap/InertiaPlugin';
import CustomEase from '@/vendor/gsap/CustomEase';
// import ScrollTrigger from '@/vendor/gsap/ScrollTrigger';

// Utils
import device from '@/utils/device';
import browser from '@/utils/Browser';

// Components
import TheNavigation from '@/components/TheNavigation';
import TheVideoOverlay from '@/components/TheVideoOverlay';
import Preloader from '@/components/Preloader';
import WebglBackground from '@/components/WebglBackground';
import CustomCursor from '@/components/CustomCursor';
// import ButtonMute from '@/components/ButtonMute';

// Store
import { PRELOADER_ASSETS_LOADED, PRELOADER_COMPLETED } from '@/store';

// GSAP plugins
gsap.registerPlugin(RoughEase);
gsap.registerPlugin(SplitText);
gsap.registerPlugin(InertiaPlugin);
gsap.registerPlugin(CustomEase);
// gsap.registerPlugin(ScrollTrigger);

export default {
    components: {
        TheNavigation,
        Preloader,
        WebglBackground,
        CustomCursor,
        TheVideoOverlay,
        // ButtonMute,
    },

    watch: {
        $route(from, to) {
            const previous = to.name ? to.name.split('__')[0] : '';
            const current = from.name ? from.name.split('__')[0] : '';
            this.$store.commit('router/previous', previous);
            this.$store.commit('router/current', current);
        },
    },

    data() {
        return {
            isTouch: device.isTouch(),
        };
    },

    created() {
        this.$root.environment = process.env.NODE_ENV;
        if (this.$route.name) {
            this.$store.commit('router/current', this.$route.name.split('__')[0]);
        }
    },

    mounted() {
        // Apply browser-specific class to body for targeted CSS overrides (e.g. .safari)
        if (process.client && browser && typeof browser.getClassName === 'function') {
            const cls = browser.getClassName();
            if (cls) document.body.classList.add(cls);
        }
        this.setupEventListeners();
    },

    updated() {
        this.$root.customCursor = this.$refs.customCursor;
        this.$root.theNavigation = this.$refs.theNavigation;
        // this.$root.buttonMute = this.$refs.buttonMute;
        this.$root.theVideoOverlay = this.$refs.theVideoOverlay;
        if (this.$store.state.preloader === PRELOADER_COMPLETED) {
            this.setupWebglBackground();
        }
    },

    methods: {
        /**
         * Private
         */
        setupEventListeners() {
            this.$store.watch((state) => state.preloader, this.preloaderChangeHandler);
        },

        setupWebglBackground() {
            this.$refs.webglBackground.setup();
            this.$root.webglBackground = this.$refs.webglBackground;
        },

        /**
         * Handlers
         */
         preloaderChangeHandler(state) {
            if (state === PRELOADER_ASSETS_LOADED) {
                // WebGL can initialize early, but not interactive yet
                this.setupWebglBackground();
            }
        
            if (state === PRELOADER_COMPLETED) {
                // Fully unlock scroll
                if (this.$root.scrollManager) {

                    if (typeof this.$root.scrollManager.unlockScroll === "function") {
                        this.$root.scrollManager.unlockScroll();
                    }
                
                    if (typeof this.$root.scrollManager.enable === "function") {
                        this.$root.scrollManager.enable();
                    }
                }
                
                // Setup WebGL if not done already
                this.setupWebglBackground();
            }
        }
        ,
    },
};

/**
 * Clears console on reload
 */
// if (module.hot) {
//     module.hot.accept();
//     module.hot.addStatusHandler((status) => {
//         if (status === 'prepare') console.clear();
//     });
// }
