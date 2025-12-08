// Vendor
import gsap from 'gsap';

// Assets
import IconTop from '@/assets/images/news/external-arrow-top.svg?inline';
import IconRight from '@/assets/images/news/external-arrow-right.svg?inline';

export default {
    props: ['data', 'isReady'],

    data() {
        return {
            isInView: false,
            lang: this.$i18n.locale,
        };
    },

    components: {
        IconTop,
        IconRight,
    },

    computed: {
        date() {
            const date = this.data.date;
            const normalizedDateComponents = date.split(' ')[0].split('-');
            const normalizedDate = normalizedDateComponents.join('/');
            const dateString = new Date(normalizedDate).toDateString();
            const dateComponents = dateString.split(' ');
            const month = dateComponents[1];
            const dayNumber = dateComponents[2];
            const year = dateComponents[3];
    
            return `${month} ${dayNumber} ${year}`;
        },
    
        src() {
            const img = this.data?.image;
            if (!img) return '';
    
            const sizes = img.sizes || {};
    
            // Preferred size
            if (sizes['1920x0']?.url) return sizes['1920x0'].url;
    
            // Try other large sizes
            const fallbackKey = Object.keys(sizes).sort((a, b) => {
                const aw = sizes[a].width || 0;
                const bw = sizes[b].width || 0;
                return bw - aw; // largest first
            })[0];
    
            if (fallbackKey && sizes[fallbackKey]?.url) {
                return sizes[fallbackKey].url;
            }
    
            // Final fallback (base image URL)
            return img.url || '';
        },
    
        srcset() {
            const img = this.data?.image;
            if (!img || !img.sizes) return '';
    
            const sizes = img.sizes;
            let srcset = '';
    
            for (const key in sizes) {
                const image = sizes[key];
                if (image?.url && image?.width) {
                    srcset += `${image.url} ${image.width}w,`;
                }
            }
    
            return srcset.slice(0, -1);
        }
    }
    ,

    mounted() {
        this.setupIntersectionObserver();
    },

    methods: {
        /**
         * Public
         */
        show() {
            gsap.to(this.$el, 1, { alpha: 1, ease: 'power1.in' });
        },

        /**
         * Private
         */
        setupIntersectionObserver() {
            const options = { threshold: 0.2 };

            this.intersectionObserver = new IntersectionObserver(this.observerHandler, options);
            this.intersectionObserver.observe(this.$el);
        },

        /**
         * Handlers
         */
        observerHandler(entry, observer) {
            // if (!this.isReady) return;
            if (this.isInView) return;

            if (entry[0].isIntersecting) {
                this.isInView = true;
                this.show();
                observer.disconnect();
            }
        },
    },
};
