import WebglApp from '@/webgl/index_old';

export default {
    beforeDestroy() {
        if (this.$root.webglApp) {
            this.$root.webglApp.destroy();
            this.$root.webglApp = null;
        }
    },

    mounted() {
        // Ensure canvas has proper dimensions
        if (this.$refs.canvas) {
            this.$refs.canvas.style.width = '100%';
            this.$refs.canvas.style.height = '100%';
            this.$refs.canvas.style.display = 'block';
        }
    },

    methods: {
        /**
         * Public
         */
        setup(debug = false) {
            if (this.$root.webglApp) return;
            
            if (!this.$refs.canvas) {
                console.error('Canvas element not found');
                return;
            }

            try {
                this.$root.webglApp = new WebglApp({
                    canvas: this.$refs.canvas,
                    scrollContainer: this.$refs.scrollContainer,
                    nuxtRoot: this.$root,
                    debug,
                });
                console.log('✅ WebGL initialized successfully');
            } catch (error) {
                console.error('❌ WebGL initialization failed:', error);
            }
        },
    },
};
