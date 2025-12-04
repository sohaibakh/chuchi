// Vendor
import gsap from 'gsap';
import SplitText from '@/vendor/gsap/SplitText';

// Utils
import WindowResizeObserver from '@/utils/WindowResizeObserver';

// Store
import { PRELOADER_ASSETS_LOADED, PRELOADER_COMPLETED } from '@/store';

export default {
    props: ['data', 'tag', 'preserveLineBreak', 'isCustomTriggered'],

    data() {
        return {
            lang: this.$i18n.locale,
        };
    },

    mounted() {
        this.isInView = false;
        this.isShowCompleted = false;
        this.isHideCompleted = false;
        this.isDestroyed = false;

        // PRELOADER → start splitting
        if (
            this.$store.state.preloader === PRELOADER_COMPLETED ||
            this.$store.state.preloader === PRELOADER_ASSETS_LOADED
        ) {
            requestAnimationFrame(() => this.start());
        }

        this.setupEventListeners();
    },

    beforeDestroy() {
        this.isDestroyed = true;
        this.removeEventListeners();
    },

    methods: {
        /* ---------------------------------------------------------
         *  PUBLIC — SHOW ANIMATION
         * --------------------------------------------------------- */
        show() {
            if (this.timelineShow) this.timelineShow.kill();

            this.timelineShow = new gsap.timeline({ onComplete: this.showCompleteHandler });

            const translateX = 100;
            const staggerOptions = { each: 0.04, from: 'random' };

            for (let i = 0; i < this.lines.length; i++) {
                const line = this.lines[i];
                const direction = i % 2 === 0 ? 1 : -1;
                this.timelineShow.fromTo(
                    line,
                    1.5,
                    { x: translateX * direction },
                    { x: 0, ease: 'power4.out' },
                    0.05 * i
                );
            }

            if (this.lang === 'ar') {
                this.timelineShow.fromTo(
                    this.lines,
                    1.2,
                    { alpha: 0 },
                    { alpha: 1, ease: 'power2.inOut', stagger: 0.04 },
                    0
                );
            } else {
                this.timelineShow.fromTo(
                    this.letters,
                    1.2,
                    { alpha: 0 },
                    {
                        alpha: () => (Math.random() > 0.5 ? 0.6 + 0.4 * Math.random() : 1),
                        ease: 'power2.inOut',
                        stagger: staggerOptions,
                    },
                    0
                );
            }

            return this.timelineShow;
        },

        /* ---------------------------------------------------------
         * PUBLIC — HIDE ANIMATION
         * --------------------------------------------------------- */
        hide() {
            if (this.timelineHide) this.timelineHide.kill();
            if (this.timelineShow) this.timelineShow.kill();

            this.timelineHide = new gsap.timeline({ onComplete: this.hideCompleteHandler });

            const translateX = 10;
            const staggerOptions = { each: 0.04, from: 'random' };

            for (let i = 0; i < this.lines.length; i++) {
                const line = this.lines[i];
                const direction = i % 2 === 0 ? 1 : -1;
                this.timelineHide.to(
                    line,
                    1,
                    { x: translateX * direction, ease: 'sine.inOut' },
                    0.05 * i
                );
            }

            if (this.lang === 'ar') {
                this.timelineHide.to(
                    this.lines,
                    0.8,
                    { alpha: 0, ease: 'power2.inOut', stagger: 0.04 },
                    0
                );
            } else {
                this.timelineHide.to(
                    this.letters,
                    0.8,
                    { alpha: 0, ease: 'power2.inOut', stagger: staggerOptions },
                    0
                );
            }

            return this.timelineHide;
        },

        /* ---------------------------------------------------------
         * PRIVATE — START SPLITTING
         * --------------------------------------------------------- */
        start() {
            if (this.isSplitting) return;
            this.isSplitting = true;

            requestAnimationFrame(() => {
                this.safeSplit();
                this.$el.style.opacity = 1;

                // If NOT custom triggered → observe scroll
                if (!this.isCustomTriggered) {
                    this.setupIntersectionObserver();
                } else {
                    // HERO CASE → show immediately
                    this.show();
                }

                this.isSplitting = false;
            });
        },

        /* ---------------------------------------------------------
         * PRIVATE — SAFE SPLITTING (fixes mobile issues)
         * --------------------------------------------------------- */
        safeSplit() {
            const el = this.$el;

            // Revert previous splits
            try {
                this.splitedLines?.revert?.();
                this.letterSplits?.forEach(s => s?.revert?.());
            } catch (e) {
                console.warn("SplitText revert failed:", e);
            }

            el.style.visibility = "visible";
            el.style.opacity = 1;
            el.style.transform = "none";

            // Split lines
            try {
                if (this.preserveLineBreak) this.splitString();
                this.splitedLines = new SplitText(el, {
                    type: "lines",
                    linesClass: "gsap-lines"
                });
                this.lines = this.splitedLines.lines;
            } catch (e) {
                console.error("SplitText line split failed:", e);
                return;
            }

            // Split chars
            this.letters = [];
            this.letterSplits = [];

            if (this.lang !== "ar") {
                for (let line of this.lines) {
                    try {
                        const split = new SplitText(line, {
                            type: "chars",
                            charsClass: "chars"
                        });
                        this.letterSplits.push(split);
                        this.letters.push(split.chars);
                    } catch (e) {
                        console.error("SplitText char split failed:", e);
                    }
                }
            }

            requestAnimationFrame(() => {
                el.style.transform = "";
            });
        },

        /* ---------------------------------------------------------
         * LINE SPLITTING
         * --------------------------------------------------------- */
        splitLines() {
            const el = this.$el;

            if (this.preserveLineBreak) this.splitString();

            this.splitedLines = new SplitText(el, {
                type: "lines",
                linesClass: "gsap-lines"
            });

            return this.splitedLines.lines;
        },

        splitString() {
            const el = this.$el;
            el.innerHTML = '';
            const lines = this.data.split('\n');

            for (let line of lines) {
                const div = document.createElement('div');
                div.className = 'line';
                div.innerHTML = line;
                el.appendChild(div);
            }
        },

        splitLetters() {
            if (this.lang === 'ar') return;

            const letters = [];

            for (let line of this.lines) {
                const split = new SplitText(line, { type: 'chars', charsClass: 'chars' });
                letters.push(split.chars);
            }

            return letters;
        },

        /* ---------------------------------------------------------
         * OBSERVER
         * --------------------------------------------------------- */
        setupIntersectionObserver() {
            if (this.isCustomTriggered) return;

            const options = { threshold: 0.2 };
            this.intersectionObserver = new IntersectionObserver(this.observerHandler, options);
            this.intersectionObserver.observe(this.$el);
        },

        observerHandler(entry, observer) {
            if (this.isInView) return;

            if (entry[0].isIntersecting) {
                this.isInView = true;
                this.show();
                observer.disconnect();
            }

            if (!this.lines || !this.letters) {
                setTimeout(() => this.observerHandler(entry, observer), 50);
            }
        },

        /* ---------------------------------------------------------
         * RESIZE + EVENTS
         * --------------------------------------------------------- */
        resize() {},

        revertSplits() {
            this.splitedLines?.revert?.();
        },

        setupEventListeners() {
            WindowResizeObserver.addEventListener('resize', this.resizeHandler);
            this.$store.watch((state) => state.preloader, this.preloaderChangeHandler);
        },

        removeEventListeners() {
            WindowResizeObserver.removeEventListener('resize', this.resizeHandler);
        },

        /* ---------------------------------------------------------
         * HANDLERS
         * --------------------------------------------------------- */
        preloaderChangeHandler(state) {
            if (this.isDestroyed) return;

            if (state === PRELOADER_COMPLETED) {
                this.start();
            }
        },

        resizeHandler() {
            this.resize();
        },

        showCompleteHandler() {
            this.isShowCompleted = true;
        },

        hideCompleteHandler() {
            this.isHideCompleted = true;
        },
    },
};
