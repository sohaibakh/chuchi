import gsap from 'gsap';

export default {
  mounted() {
    // Only include refs that actually exist (listItem3 is commented in your template)
    this.items = [
      this.$refs.listItem1,
      this.$refs.listItem2,
      this.$refs.listItem3, // commented out in markup
      this.$refs.listItem4,
      this.$refs.listItem5
    ].filter(Boolean);

    // Move the whole menu node to <body> so it’s not inside the transformed .navigation
    if (process.client) {
      document.body.appendChild(this.$el);
    }
  },

  methods: {
    show() {
      if (this.timelineIn) this.timelineIn.kill();
      if (this.timelineOut) this.timelineOut.kill();

      this.timelineIn = gsap.timeline();
      this.timelineIn.set(this.$el, { clearProps: 'transform' }); // ensure no inherited transforms
      this.timelineIn.to(this.$refs.background, 0.6, { scaleY: 1, ease: 'power3.inOut' });
      this.timelineIn.to(this.items, 0.5, { autoAlpha: 1, ease: 'power2.out', stagger: 0.08 }, 0.15);
      this.timelineIn.fromTo(this.items, 0.5, { y: 30 }, { y: 0, ease: 'power2.out', stagger: 0.08 }, 0.15);

      this.$el.style.pointerEvents = 'all';
      this.lockScroll();
    },

    hide() {
      if (this.timelineOut) this.timelineOut.kill();
      if (this.timelineIn) this.timelineIn.kill();

      this.timelineOut = gsap.timeline();
      this.timelineOut.to(this.items, 0.35, { autoAlpha: 0, ease: 'power2.inOut' }, 0);
      this.timelineOut.to(this.$refs.background, 0.5, { scaleY: 0, ease: 'power3.inOut' }, 0.1);

      this.$el.style.pointerEvents = 'none';
      this.unlockScroll();
    },

    lockScroll() {
      if (this.$root.scrollManager) this.$root.scrollManager.lockScroll();
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    },

    unlockScroll() {
      if (this.$root.scrollManager) this.$root.scrollManager.unlockScroll();
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    },

    linkClickHander() {
      this.hide();
    },
  },
};
