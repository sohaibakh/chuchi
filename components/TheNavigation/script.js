// Vendor
import gsap from 'gsap';

// Plugins
import { EventBus } from '@/plugins/event-bus';

// Components
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ButtonHamburger from '@/components/ButtonHamburger';
import MenuMobile from '@/components/MenuMobile';

// Assets
import Logo from '@/assets/logo-png.png';

// Constants
const TOP_OFFSET = 120;

export default {
    name: 'TheNavigation',

    components: {
        LanguageSwitcher,
        ButtonHamburger,
        // Logo,
        MenuMobile,
    },
    data() {
      return {
        logoSrc: Logo, // ✅ make it available to template
      };
    },

    mounted() {
        this.isMenuMobileOpen = false;
        this.isVisible = true;
        this.previousScrollPosition = 0;
        this.setupEventListeners();
    },

    updated() {
        this.$root.menuMobile = this.$refs.menuMobile;
    },

    beforeDestroy() {
        this.removeEventListeners();
    },

    methods: {
        /**
         * Public
         */
        
        show() {
            this.timelineShow = new gsap.timeline();
            this.timelineShow.to(this.$el, 1.5, { alpha: 1, ease: 'sine.inOut' }, 0);
            return this.timelineShow;
        },

        fadeIn() {
            if (this.timelineFadeOut) this.timelineFadeOut.kill();
            this.timelineFadeIn = new gsap.timeline();
            this.timelineFadeIn.to(this.$el, 0.9, { alpha: 1, ease: 'power2.out' }, 0);
        },

        fadeOut() {
            if (this.timelineFadeIn) this.timelineFadeIn.kill();
            this.timelineFadeOut = new gsap.timeline();
            this.timelineFadeOut.to(this.$el, 0.9, { alpha: 0, ease: 'sine.inOut' }, 0);
        },

        focusFadeIn() {
            if (this.timelineFocusFadeOut) this.timelineFocusFadeOut.kill();
            this.timelineFocusFadeIn = new gsap.timeline();
            this.timelineFocusFadeIn.to(this.$el, 0.33, { alpha: 1, ease: 'sine.inOut' }, 0.1);
        },

        focusFadeOut() {
            if (this.timelineFocusFadeIn) this.timelineFocusFadeIn.kill();
            this.timelineFocusFadeOut = new gsap.timeline();
            this.timelineFocusFadeOut.to(this.$el, 0.33, { alpha: 0, ease: 'sine.inOut' }, 0);
        },

        /**
         * Private
         */
        // scrollShow() {
        //     if (this.isVisible) return;
        //     this.isVisible = true;

        //     if (this.timelineScrollHide) this.timelineScrollHide.kill();
        //     this.timelineScrollShow = new gsap.timeline();
        //     this.timelineScrollShow.to(this.$el, 0.9, { alpha: 1, ease: 'power2.out' }, 0);
        // },

        // scrollHide() {
        //     if (!this.isVisible) return;
        //     this.isVisible = false;

        //     if (this.timelineScrollShow) this.timelineScrollShow.kill();
        //     this.timelineScrollHide = new gsap.timeline();
        //     this.timelineScrollHide.to(this.$el, 0.9, { alpha: 0, ease: 'sine.inOut' }, 0);
        // },

        scrollHide() {
            if (!this.isVisible) return;
            this.isVisible = false;
          
            gsap.to(this.$el, {
              y: -100,
              opacity: 0,
              duration: 0.6,
              ease: 'power2.out',
              overwrite: true,
            });
          },
          
          scrollShow() {
            if (this.isVisible) return;
            this.isVisible = true;
          
            gsap.to(this.$el, {
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: 'power2.out',
              overwrite: true,
            });
          },
          

        /**
         * Event Listeners
         */
        setupEventListeners() {
            this.$refs.buttonHamburger.$el.addEventListener('click', this.burgerClickHandler);
            // this.$refs.langSwitcher.$on('switch-language', this.switchLangerChangeHandler);
            EventBus.$on('scroll', this.scrollHandler);
            // EventBus.$on('stepscroll', this.stepScrollHandler);
        },

        removeEventListeners() {
            this.$refs.buttonHamburger.$el.removeEventListener('click', this.burgerClickHandler);
            EventBus.$off('scroll', this.scrollHandler);
            // EventBus.$off('stepscroll', this.stepScrollHandler);
        },

        /**
         * Handlers
         */
        // scrollHandler(position) {
        //     if (position.y > TOP_OFFSET) {
        //         const delta = position.y - this.previousScrollPosition;
        //         if (delta > 0) {
        //             this.scrollHide();
        //         } else {
        //             this.scrollShow();
        //         }
        //     } else {
        //         this.scrollShow();
        //     }

        //     this.previousScrollPosition = position.y;
        // },
        scrollHandler(position) {
            // Keep navigation fixed at top - always set y to 0
            gsap.to(this.$el, {
              y: 0,
              duration: 0.2,
              ease: 'power1.out',
              overwrite: true,
            });
          }
          
          ,
          

        stepScrollHandler(e) {
            if (e.delta > 0) {
                this.scrollHide();
            } else {
                this.scrollShow();
            }
        },

        burgerClickHandler() {
            if (this.isMenuMobileOpen) {
                this.isMenuMobileOpen = false;
                this.$refs.menuMobile.hide();
            } else {
                this.isMenuMobileOpen = true;
                this.$refs.menuMobile.show();
            }
        },

        // switchLangerChangeHandler() {
        //     gsap.to(
        //         this.$el,
        //         0.2,
        //         {
        //             alpha: 0,
        //             ease: 'sine.inOut',
        //             onComplete: () => {
        //                 if (this.$i18n.locale === 'en') {
        //                     this.$i18n.setLocale('ar');
        //                 } else {
        //                     this.$i18n.setLocale('en');
        //                 }
        //             },
        //         },
        //         0
        //     );
        // },
        async switchLanguageChangeHandler() {
            // fade optional
            gsap.to(this.$el, { opacity: 0, duration: 0.2, ease: 'sine.inOut' })
        
            const newLocale = this.$i18n.locale === 'en' ? 'ar' : 'en'
        
            // navigate to the same route in the new locale
            const path = this.switchLocalePath(newLocale) // nuxt-i18n helper
            await this.$router.push(path)
        
            // if your nuxt-i18n version needs it, keep in sync:
            if (this.$i18n.locale !== newLocale) {
              await this.$i18n.setLocale(newLocale)
            }
        
            gsap.to(this.$el, { opacity: 1, duration: 0.2, ease: 'sine.inOut' })
          },
        

        logoClickHandler() {
            if (this.$root.menuMobile) {
                this.$root.menuMobile.hide();
            }
        },
    },
};
