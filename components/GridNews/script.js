// Components
import ButtonNews from '@/components/ButtonNews';

export default {
    props: ['items', 'highlight', 'related'],

    data() {
        return {
            isReady: false,
        };
    },

    components: {
        ButtonNews,
    },

    mounted() {
        console.log('📰 GridNews mounted:', {
            itemsCount: this.items?.length || 0,
            hasItems: !!this.items && this.items.length > 0,
            items: this.items
        });
    },

    watch: {
        items(newItems) {
            console.log('📰 GridNews items updated:', {
                itemsCount: newItems?.length || 0,
                hasItems: !!newItems && newItems.length > 0,
                items: newItems
            });
        }
    },

    beforeDestroy() {},

    methods: {
        /**
         * Public
         */
        show() {
            this.isReady = true;
        },
    },
};
