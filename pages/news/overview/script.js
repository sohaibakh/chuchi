// Vendor
import gsap from 'gsap';

// Plugins
import axios from '@/plugins/axios';

// Components
import Page from '@/components/Page';
import SmoothScroll from '@/components/SmoothScroll';

// Sections
import SectionHeader from '@/sections/news-overview/Header';
import SectionNews from '@/sections/news-overview/News';
import SectionFooter from '@/sections/shared/Footer';

export default {
    extends: Page,

    asyncData({ app, query, store }) {
        const locale = app.i18n.locale;
        const activeCategory = query.category || store.state.news.activeCategory;

        return axios.get(`page/news?per_page=5&page=1&${activeCategory ? `category=${activeCategory}` : ''}&lang=${locale}`).then((res) => {
            console.log('📰 News API Response:', {
                statusCode: res.status,
                hasItems: !!res.data.items,
                itemsCount: res.data.items?.length || 0,
                items: res.data.items,
                categories: res.data.categories,
                pagination: res.data.pagination
            });
            
            if (!res.data.items || res.data.items.length === 0) {
                console.warn('⚠️ No news items returned from API');
            }

            return {
                data: res.data,
                metadata: res.data.seo,
                categories: res.data.categories,
                items: res.data.items || [],
                category: activeCategory || store.state.news.activeCategory,
                pagination: res.data.pagination,
            };
        }).catch((error) => {
            console.error('❌ News API Error:', error);
            return {
                data: {},
                metadata: {},
                categories: [],
                items: [],
                category: activeCategory || store.state.news.activeCategory,
                pagination: {},
            };
        });
    },

    data() {
        return {};
    },

    components: {
        SectionHeader,
        SectionNews,
        SectionFooter,
        SmoothScroll,
    },

    created() {
        this.scrollTriggers = true;
    },

    methods: {
        transitionIn() {
            this.$refs.header.transitionIn();
            this.$refs.news.show();
            this.$root.theNavigation.show();
            if (this.$root.webglApp) this.$root.webglApp.showScene('empty');
        },

        transitionOut(done) {
            const timeline = new gsap.timeline({ onComplete: done });
            timeline.to(this.$el, 0.8, { alpha: 0, ease: 'sine.inOut' }, 0);
        },
    },
};
