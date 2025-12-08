// Vendor
import gsap from "gsap";
import SplitText from "@/vendor/gsap/SplitText";

// Utils
import WindowResizeObserver from "@/utils/WindowResizeObserver";

// Store
import { PRELOADER_ASSETS_LOADED, PRELOADER_COMPLETED } from "@/store";

export default {
  props: ["data", "tag", "preserveLineBreak", "isCustomTriggered"],

  data() {
    return {
      lang: this.$i18n.locale,
      isReady: false,       // 🔥 TRUE only after safeSplit
      isSplitting: false,
      isDestroyed: false,
      isInView: false,
      isShowCompleted: false,
      isHideCompleted: false,
    };
  },

  /* ---------------------------------------------------------
   *  LIFECYCLE
   * --------------------------------------------------------- */
  mounted() {
    if (
      this.$store.state.preloader === PRELOADER_COMPLETED ||
      this.$store.state.preloader === PRELOADER_ASSETS_LOADED
    ) {
      requestAnimationFrame(() => this.initializeSplitProcess());
    }

    this.setupEventListeners();
  },

  beforeDestroy() {
    this.isDestroyed = true;
    this.removeEventListeners();
  },

  /* ---------------------------------------------------------
   *  METHODS
   * --------------------------------------------------------- */
  methods: {
    /* ---------------------------------------------------------
     *  SAFE ASYNC INITIAL SPLIT
     * --------------------------------------------------------- */
    initializeSplitProcess() {
      if (this.isSplitting) return;
      this.isSplitting = true;

      requestAnimationFrame(() => {
        this.safeSplit();
        this.setupIntersectionObserver();
        this.$el.style.opacity = 1;

        this.isSplitting = false;
        this.isReady = true; // 🔥 NOW READY
      });
    },

    /* ---------------------------------------------------------
     *  SAFE SPLIT PROCESS (revert old → split lines → split chars)
     * --------------------------------------------------------- */
    safeSplit() {
      const el = this.$el;

      // Revert old splits
      try {
        if (this.splitedLines?.revert) this.splitedLines.revert();
        if (this.letterSplits)
          this.letterSplits.forEach((s) => s?.revert && s.revert());
      } catch (e) {
        console.warn("[Heading] revert failed:", e);
      }

      // Ensure DOM state is ready
      el.style.visibility = "visible";
      el.style.opacity = 1;
      el.style.transform = "none";

      // SPLIT LINES
      try {
        if (this.preserveLineBreak) this.splitString();

        this.splitedLines = new SplitText(el, {
          type: "lines",
          linesClass: "gsap-lines",
        });

        this.lines = this.splitedLines.lines || [];
      } catch (e) {
        console.error("[Heading] line split failed:", e);
        this.lines = [];
        return;
      }

      // SPLIT LETTERS
      this.letterSplits = [];
      this.letters = [];

      if (this.lang !== "ar") {
        for (let line of this.lines) {
          try {
            const split = new SplitText(line, {
              type: "chars",
              charsClass: "chars",
            });
            this.letterSplits.push(split);
            this.letters.push(split.chars);
          } catch (e) {
            console.error("[Heading] character split failed:", e);
          }
        }
      }

      requestAnimationFrame(() => {
        el.style.transform = "";
      });
    },

    /* ---------------------------------------------------------
     *  SHOW() — SAFE WITH RETRY LOGIC
     * --------------------------------------------------------- */
    show() {
      if (!this.isReady || !this.lines || !this.lines.length) {
        console.warn("[Heading] show() before ready → retrying…");
        setTimeout(() => this.show(), 30);
        return;
      }

      if (this.timelineShow) this.timelineShow.kill();

      this.timelineShow = new gsap.timeline({
        onComplete: this.showCompleteHandler,
      });

      const translateX = 100;

      // Animate each line
      for (let i = 0; i < this.lines.length; i++) {
        const line = this.lines[i];
        const dir = i % 2 === 0 ? 1 : -1;

        this.timelineShow.fromTo(
          line,
          1.5,
          { x: translateX * dir },
          { x: 0, ease: "power4.out" },
          0.05 * i
        );
      }

      // Arabic = no letters, do fade instead
      if (this.lang === "ar") {
        this.timelineShow.fromTo(
          this.lines,
          1.2,
          { alpha: 0 },
          { alpha: 1, ease: "power2.inOut", stagger: 0.04 },
          0
        );
      } else {
        // Fancy letter animation
        this.timelineShow.fromTo(
          this.letters,
          1.2,
          { alpha: 0 },
          {
            alpha: () =>
              Math.random() > 0.5 ? 0.6 + 0.4 * Math.random() : 1,
            ease: "power2.inOut",
            stagger: { each: 0.04, from: "random" },
          },
          0
        );
      }

      return this.timelineShow;
    },

    /* ---------------------------------------------------------
     *  HIDE
     * --------------------------------------------------------- */
    hide() {
      if (this.timelineHide) this.timelineHide.kill();
      if (this.timelineShow) this.timelineShow.kill();

      this.timelineHide = new gsap.timeline({
        onComplete: this.hideCompleteHandler,
      });

      const translateX = 10;
      const stagger = { each: 0.04, from: "random" };

      for (let i = 0; i < this.lines.length; i++) {
        const dir = i % 2 === 0 ? 1 : -1;
        this.timelineHide.to(
          this.lines[i],
          1,
          { x: translateX * dir, ease: "sine.inOut" },
          0.05 * i
        );
      }

      if (this.lang === "ar") {
        this.timelineHide.to(
          this.lines,
          0.8,
          { alpha: 0, ease: "power2.inOut", stagger: 0.04 },
          0
        );
      } else {
        this.timelineHide.to(
          this.letters,
          0.8,
          { alpha: 0, ease: "power2.inOut", stagger },
          0
        );
      }

      return this.timelineHide;
    },

    /* ---------------------------------------------------------
     *  SPLIT UTILITIES
     * --------------------------------------------------------- */
    splitLines() {
      const el = this.$el;

      if (this.preserveLineBreak) {
        this.splitString();
      }

      this.splitedLines = new SplitText(el, {
        type: "lines",
        linesClass: "gsap-lines",
      });

      return this.splitedLines.lines;
    },

    splitString() {
      const el = this.$el;

      el.innerHTML = "";
      const lines = this.data.split("\n");

      for (let l of lines) {
        const div = document.createElement("div");
        div.className = "line";
        div.innerHTML = l;
        el.appendChild(div);
      }
    },

    splitLetters() {
      if (this.lang === "ar") return [];

      const out = [];
      for (let line of this.lines) {
        const split = new SplitText(line, {
          type: "chars",
          charsClass: "chars",
        });
        out.push(split.chars);
      }
      return out;
    },

    /* ---------------------------------------------------------
     *  OBSERVER
     * --------------------------------------------------------- */
    setupIntersectionObserver() {
      if (this.isCustomTriggered) return;

      const options = { threshold: 0.2 };

      this.intersectionObserver = new IntersectionObserver(
        this.observerHandler,
        options
      );

      this.intersectionObserver.observe(this.$el);
    },

    observerHandler(entry, observer) {
      if (this.isInView) return;

      if (entry[0].isIntersecting) {
        this.isInView = true;
        this.show();
        observer.disconnect();
      }
    },

    /* ---------------------------------------------------------
     *  EVENT HANDLERS
     * --------------------------------------------------------- */
    setupEventListeners() {
      WindowResizeObserver.addEventListener("resize", this.resizeHandler);
      this.$store.watch((s) => s.preloader, this.preloaderChangeHandler);
    },

    removeEventListeners() {
      WindowResizeObserver.removeEventListener("resize", this.resizeHandler);
    },

    preloaderChangeHandler(state) {
      if (this.isDestroyed) return;
      if (state === PRELOADER_COMPLETED) {
        this.initializeSplitProcess();
      }
    },

    resize() {},
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
