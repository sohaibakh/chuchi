// Vendor
import gsap from 'gsap';

// Components
import SectionAbout from '@/components/SectionAbout';

export default {
    name: 'ProFour',
    extends: SectionAbout,

    methods: {
        backgroundShow(done, direction) {
            this._timelineBackgroundShow = new gsap.timeline({ onComplete: done });
            this._timelineBackgroundShow.add(this.$refs.heading.show(), 0.7);
            this._timelineBackgroundShow.fromTo(this.$refs.body, {
                opacity: 0,
                y: 10
            }, {
                opacity: 1, 
                y: 0,
                duration: 1, ease: 'power2.out' 
            }, 0.9);
            console.log(this.$refs)
            return this._timelineBackgroundShow;
        },
    },
};
