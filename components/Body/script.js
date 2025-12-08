// Vendor
import gsap from 'gsap';
import SplitText from '@/vendor/gsap/SplitText';

// Utils
import WindowResizeObserver from '@/utils/WindowResizeObserver';

// Store
import { PRELOADER_COMPLETED, LANGUAGE_SWITCH_FINISHED } from '@/store';

export default {
    props: {
        data: { default: {} },
        large: { default: false },
        triggerOnScroll: { type: Boolean, default: false },
    },

    data() {
        return {
            blocks: null,
            blocksShowCompleted: [],
            ready: false,          // 🔥 NEW — signals when Body is fully ready for animations
            splitting: false,
        };
    },

    mounted() {
        // Start automatically when preloader + language switch are ready
        if (
            this.$store.state.preloader === PRELOADER_COMPLETED &&
            this.$store.state.languageSwitch === LANGUAGE_SWITCH_FINISHED
        ) {
            this.initialize();
        }

        this.setupEventListeners();
    },

    beforeDestroy() {
        this.removeEventListeners();
    },

    methods: {
        /** -------------------------------------------------------
         * INITIALIZE (SAFE) 
         * ------------------------------------------------------*/
        initialize() {
            if (this.splitting) return;
            this.splitting = true;

            requestAnimationFrame(() => {
                this.start();
                this.ready = true;     // 🔥 Mark fully ready after split
                this.splitting = false;
            });
        },

        /** -------------------------------------------------------
         * PUBLIC — Show one block (safe)
         * ------------------------------------------------------*/
        showBlock(index, direction = 1) {
            if (!this.ready || !this.blocks || !this.blocks[index]) {
                console.warn('[Body] showBlock() called before ready.');
                return new gsap.timeline();
            }

            const block = this.blocks[index];
            const lines = block.lines;

            if (!lines || !lines.length) {
                console.warn('[Body] showBlock() found no lines.');
                return new gsap.timeline();
            }

            const tl = new gsap.timeline({
                onComplete: this.showBlockCompleteHandler,
                onCompleteParams: [index],
            });

            // Fade-in block
            tl.fromTo(
                this.$el.children[index],
                1,
                { alpha: 0 },
                { alpha: 1, ease: 'sine.inOut' },
                0
            );

            // Slide lines
            let y = 0;
            if (direction > 0) {
                for (let i = 0; i < lines.length; i++) {
                    y += 70;
                    tl.fromTo(
                        lines[i],
                        2,
                        { y: y + '%' },
                        { y: '0%', ease: 'power3.out' },
                        0
                    );
                }
            } else {
                for (let i = lines.length - 1; i >= 0; i--) {
                    y -= 70;
                    tl.fromTo(
                        lines[i],
                        2,
                        { y: y + '%' },
                        { y: '0%', ease: 'power3.out' },
                        0
                    );
                }
            }

            return tl;
        },

        /** -------------------------------------------------------
         * PUBLIC — Show all blocks (safe)
         * ------------------------------------------------------*/
        showAll(direction = 1) {
            if (!this.ready || !this.blocks) {
                console.warn('[Body] showAll() called before blocks were ready.');
                return new gsap.timeline();
            }

            let allLines = [];

            this.blocks.forEach(block => {
                if (block?.lines?.length) {
                    allLines = allLines.concat(block.lines);
                }
            });

            if (!allLines.length) {
                console.warn('[Body] showAll() found no lines to animate.');
                return new gsap.timeline();
            }

            const tl = new gsap.timeline({
                onComplete: this.showAllCompleteHandler,
            });

            // Fade-in entire body
            tl.fromTo(
                this.$el.children,
                1,
                { alpha: 0 },
                { alpha: 1, ease: 'sine.inOut' },
                0
            );

            // Slide all lines
            let y = 0;

            if (direction > 0) {
                for (let line of allLines) {
                    y += 70;
                    tl.fromTo(
                        line,
                        2,
                        { y: y + '%' },
                        { y: '0%', ease: 'power3.out' },
                        0
                    );
                }
            } else {
                for (let i = allLines.length - 1; i >= 0; i--) {
                    y -= 70;
                    tl.fromTo(
                        allLines[i],
                        2,
                        { y: y + '%' },
                        { y: '0%', ease: 'power3.out' },
                        0
                    );
                }
            }

            return tl;
        },

        /** -------------------------------------------------------
         * SPLIT TEXT INTO BLOCKS + LINES
         * ------------------------------------------------------*/
        start() {
            this.blocksShowCompleted = [];
            this.blocks = this.split();

            if (this.triggerOnScroll) {
                this.setupIntersectionObserver();
            }

            this.resize();
        },

        split() {
            const blocks = [];
            const children = this.$el.children;

            for (let i = 0; i < children.length; i++) {
                const split = new SplitText(children[i], {
                    type: 'lines',
                    linesClass: 'lines',
                });
                blocks.push(split);
            }

            return blocks;
        },

        /** -------------------------------------------------------
         * INTERSECTION OBSERVER
         * ------------------------------------------------------*/
        setupIntersectionObserver() {
            const elements = Array.from(this.$el.children);

            elements.forEach((el, index) => {
                this.intersectionObserver = new IntersectionObserver(
                    (entries, observer) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                this.showBlock(index);
                                observer.disconnect();
                            }
                        });
                    },
                    { threshold: 0.2 }
                );

                this.intersectionObserver.observe(el);
            });
        },

        /** -------------------------------------------------------
         * HANDLERS + UTILITIES
         * ------------------------------------------------------*/
        resize() {},

        resizeHandler() {
            this.resize();
        },

        showBlockCompleteHandler(index) {
            this.blocksShowCompleted.push(index);
        },

        showAllCompleteHandler() {
            this.blocksShowCompleted = this.blocks.map((_, i) => i);
        },

        setupEventListeners() {
            WindowResizeObserver.addEventListener('resize', this.resizeHandler);

            this.$store.watch(
                state => state.preloader,
                this.preloaderChangeHandler
            );

            this.$store.watch(
                state => state.languageSwitch,
                this.languageSwitchChangeHandler
            );
        },

        removeEventListeners() {
            WindowResizeObserver.removeEventListener('resize', this.resizeHandler);
        },

        preloaderChangeHandler(preloader) {
            if (
                preloader === PRELOADER_COMPLETED &&
                this.$store.state.languageSwitch === LANGUAGE_SWITCH_FINISHED
            ) {
                this.initialize();
            }
        },

        languageSwitchChangeHandler(langState) {
            if (
                langState === LANGUAGE_SWITCH_FINISHED &&
                this.$store.state.preloader === PRELOADER_COMPLETED
            ) {
                this.initialize();
            }
        },
    },
};
