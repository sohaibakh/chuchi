// Compontents
import ButtonArrow from '@/components/ButtonArrow';
import GridNews from '@/components/GridNews';

export default {
    props: ['data', 'scrollType'],

    components: {
        ButtonArrow,
        GridNews,
    },

    mounted() {
        console.log('[SectionNews] data:', this.data); // Should be an array
    },

    methods: {
        show() {
            this.$refs.grid.show();
        },
    },
};
