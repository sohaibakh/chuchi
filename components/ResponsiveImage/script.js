// Utils
import WindowResizeObserver from '@/utils/WindowResizeObserver';

export default {
    props: ['sizes', 'alt', 'type'],

    computed: {
        // SAFE src – auto-picks best possible image
        src() {
            // sizes missing OR empty → return empty
            if (!this.sizes || Object.keys(this.sizes).length === 0) return '';

            // Preferred key
            if (
                this.sizes['1920x0'] &&
                this.sizes['1920x0'].url
            ) {
                return this.sizes['1920x0'].url;
            }

            // Pick the largest available fallback
            const keys = Object.keys(this.sizes);
            if (keys.length > 0) {
                const sorted = keys.sort((a, b) => {
                    const aw = this.sizes[a].width || 0;
                    const bw = this.sizes[b].width || 0;
                    return bw - aw; // descending: largest first
                });

                const largestKey = sorted[0];
                const img = this.sizes[largestKey];

                if (img && img.url) return img.url;
            }

            return '';
        },

        // SAFE srcset – ignores invalid sizes
        srcset() {
            if (!this.sizes) return '';

            return Object.keys(this.sizes)
                .map(key => {
                    const img = this.sizes[key];
                    if (img && img.url && img.width) {
                        return img.url + ' ' + img.width + 'w';
                    }
                    return '';
                })
                .filter(Boolean)
                .join(',');
        },
    },

    mounted() {
        this.$nextTick(() => {
            if (!this.src || !this.$el || !this.$refs.image) return;

            this.setupEventListeners();
            this.resize();
        });
    },

    beforeDestroy() {
        this.removeEventListeners();
    },

    methods: {
        setupEventListeners() {
            WindowResizeObserver.addEventListener('resize', this.resizeHandler);
        },

        removeEventListeners() {
            WindowResizeObserver.removeEventListener('resize', this.resizeHandler);
        },

        resize() {
            if (this.type === 'cover') {
                this.updateImageCoverSize();
            } else {
                this.updateImageAspectRatio();
            }
        },

        // SAFE cover mode
        updateImageCoverSize() {
            if (!this.$el || !this.$refs.image) return;

            // Try preferred size first
            let image = this.sizes && this.sizes['1920x0'];

            // If missing, fallback to first available size
            if (!image) {
                const keys = Object.keys(this.sizes || {});
                if (keys.length > 0) {
                    image = this.sizes[keys[0]];
                }
            }

            if (!image) return;

            const imageWidth = image.width;
            const imageHeight = image.height;

            const container = this.$el;
            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;

            const scale = Math.max(
                containerWidth / imageWidth,
                containerHeight / imageHeight
            );

            const width = Math.ceil(imageWidth * scale);
            const height = Math.ceil(imageHeight * scale);

            const x = Math.round((containerWidth - width) / 2);
            const y = Math.round((containerHeight - height) / 2);

            const imgRef = this.$refs.image;
            imgRef.style.width = width + 'px';
            imgRef.style.height = height + 'px';
            imgRef.style.top = y + 'px';
            imgRef.style.left = x + 'px';
        },

        // SAFE aspect-ratio mode
        updateImageAspectRatio() {
            let image = this.sizes && this.sizes['1920x0'];

            if (!image) {
                const keys = Object.keys(this.sizes || {});
                if (keys.length > 0) {
                    image = this.sizes[keys[0]];
                }
            }

            if (!image) return;

            const width = image.width || 1;
            const height = image.height || 1;

            const ratio = (height / width) * 100;

            this.$el.style.paddingBottom = ratio + '%';
        },

        resizeHandler() {
            this.resize();
        },
    },
};
