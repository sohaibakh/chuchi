// Vendors
import gsap from 'gsap';
import InertiaPlugin from '@/vendor/gsap/InertiaPlugin';
import SplitText from '@/vendor/gsap/SplitText';

// Utils
import lerp from '@/utils/math/lerp';
import device from '@/utils/device';
import WindowResizeObserver from '@/utils/WindowResizeObserver';

// Components
import Section from '@/components/Section';
import Arrow from '@/assets/images/icons/arrow-right.svg?inline';

const MAX_OVERDRAG_DISTANCE = 300;
const MAX_OVERDRAG_DISTANCETOUCH = 100;

const CLICK_TRESHOLD = 3;

export default {
    extends: Section,
    
    props: {
        slides: {
          type: Array,
          required: true,
          default: () => []
        }
      },

    data() {
        return {
          allowHover: true,
        };
      },

    components: {
        Arrow,
    },

    mounted() {
        this.positionX = { current: 0, target: 0 };
        this.dragMousePositionX = 0;
        this.deltaX = 0;
        this.activeIndex = null;
        this.touchStartMousePosition = { x: 0, y: 0 };
        this.allowDrag = true;
        // this.direction = this.$i18n.locale === 'en' ? 1 : -1;
        const isRTL = this.$i18n?.locale === 'ar' || document?.dir === 'rtl';
        this.direction = isRTL ? -1 : 1;
        
        // if (this.$root.webglApp) {
        //     this.scene = this.$root.webglApp.getScene('portfolio');
        // }
        
        const waitForSceneAndDOM = () => {
          const scene = this.$root.webglApp?.getScene?.('services');
          const list = this.$refs.list;
      
          if (scene && list) {
            this.scene = scene;
            this.getBounds(); // ✅ safe now
            this.resize();
            this.track();
            this.setupEventListeners(); // ✅ ticker starts now
      
            this.$nextTick(() => {
              this.titles = this.splitTitles();
              this.setActiveItem(0);
              this.setupSlides();
              this.checkIfDragAllowed();
              this.checkIfSlideAllowed();
            });
          } else {
            requestAnimationFrame(waitForSceneAndDOM);
          }
        };
      
        // ⏳ wait until both DOM and scene are ready
        this.$nextTick(() => {
          requestAnimationFrame(waitForSceneAndDOM);
        });
      },

      watch: {
          '$i18n.locale'(val) {
            const isRTL = val === 'ar' || document?.dir === 'rtl';
            this.direction = isRTL ? -1 : 1;
            this.updateItems(); // rebuild slides with correct direction
          }
        },
      

    beforeDestroy() {
        this.removeEventListeners();
        // this.scene.destroySlides();
    },

    methods: {
        /**
         * Public
         */
        hide() {
            this.disableDrag();
            this.disableHover();
        },

        show() {
            this.updateItems();
            this.checkIfDragAllowed();
            this.checkIfSlideAllowed();
            this.enableHover();
        },

        hideItems() {
            this.disableDrag();
            this.disableHover();

            return new Promise((resolve) => {
                const tl = new gsap.timeline({ onComplete: resolve });
                tl.timeScale(1.2);
                tl.to(this.$refs.list, 1.3, { x: -(WindowResizeObserver.width / 3) * this.direction, ease: 'power3.in' });
                tl.to(this.$refs.item, 1, { autoAlpha: 0, ease: 'power3.in' }, 0.3);
                tl.add(this.scene.hideCarouselSlides(), 0.2);
                tl.add(this.$root.webglApp.hideScene(), 0.7);
            });
        },

        showItems() {
            return new Promise((resolve) => {
                const tl = new gsap.timeline({
                    onComplete: () => {
                        resolve();
                        this.checkIfDragAllowed();
                        this.checkIfSlideAllowed();
                        this.enableHover();
                    },
                });
                tl.timeScale(1.2);
                tl.to(this.$refs.item, 0.5, { autoAlpha: 1, ease: 'power3.inOut' });
                tl.fromTo(this.$refs.list, 1.5, { x: (WindowResizeObserver.width / 3) * this.direction }, { x: 0, ease: 'power3.out' }, 0);
                tl.add(this.$root.webglApp.showScene('services'), 0);
                tl.add(this.scene.showCarouselSlides(), 0.2);
            });
        },

        updateItems() {
            this.resetSliderPosition();
            this.$nextTick(this.setupSlides);
        },

        enableDrag() {
            this.allowDrag = true;
        },

        disableDrag() {
            this.allowDrag = false;
        },

        enableHover() {
            this.allowHover = true;
        },

        disableHover() {
            this.allowHover = false;
            this.mouseleaveHandler();
        },

        enableLeftArrow() {
            if (this.disableLeftTween) this.disableLeftTween.kill();

            this.$refs.buttonLeft.style.pointerEvent = 'all';
            this.$refs.buttonLeft.disabled = false;
            this.enableLeftTween = gsap.to(this.$refs.buttonLeft, 0.5, { autoAlpha: 1, x: 0, ease: 'power3.out' });
        },

        disableLeftArrow() {
            if (this.enableLeftTween) this.enableLeftTween.kill();

            this.$refs.buttonLeft.style.pointerEvent = 'none';
            this.$refs.buttonLeft.disabled = true;
            this.disableLeftTween = gsap.to(this.$refs.buttonLeft, 0.5, { autoAlpha: 0, x: 20, ease: 'power3.in' });
        },

        enableRightArrow() {
            if (this.disableRightTween) this.disableRightTween.kill();

            this.$refs.buttonRight.style.pointerEvent = 'all';
            this.$refs.buttonRight.disabled = false;
            this.enableRightTween = gsap.to(this.$refs.buttonRight, 0.5, { autoAlpha: 1, x: 0, ease: 'power3.out' });
        },

        disableRightArrow() {
            if (this.enableRightTween) this.enableRightTween.kill();

            this.$refs.buttonRight.style.pointerEvent = 'none';
            this.$refs.buttonRight.disabled = true;
            this.disableRightTween = gsap.to(this.$refs.buttonRight, 0.5, { autoAlpha: 0, x: -20, ease: 'power3.in' });
        },

        /**
         * Private
         */
        checkIfDragAllowed() {
            if (this.slides.length < 2) {
                this.disableDrag();
            } else {
                this.enableDrag();
            }
        },

        checkIfSlideAllowed() {
            if (this.activeIndex === 0) {
                this.disablePrevious();
            } else {
                this.enablePrevious();
            }

            if (this.activeIndex === this.slides.length - 1) {
                this.disableNext();
            } else {
                this.enableNext();
            }
        },

        disableNext() {
            if (this.direction === 1) {
                this.disableRightArrow();
            } else {
                this.disableLeftArrow();
            }
        },

        enableNext() {
            if (this.direction === 1) {
                this.enableRightArrow();
            } else {
                this.enableLeftArrow();
            }
        },

        disablePrevious() {
            if (this.direction === 1) {
                this.disableLeftArrow();
            } else {
                this.disableRightArrow();
            }
        },

        enablePrevious() {
            if (this.direction === 1) {
                this.enableLeftArrow();
            } else {
                this.enableRightArrow();
            }
        },

        setupSlides() {
            this.scene.destroySlides();
            this.scene.setupSlides(this.slides, this.direction);
        },

        resize(e) {
            this.width = WindowResizeObserver.width;
            this.height = WindowResizeObserver.height;

            this.$el.style.height = `${WindowResizeObserver.viewportHeight}px`;

            this.getBounds();
            this.resetSliderPosition();
        },

        track() {
            const track1 = InertiaPlugin.track(this.positionX, 'target')[0];
            const track2 = InertiaPlugin.track(this.positionX, 'current')[0];
        },

        getBounds() {
            this.listRect = this.$refs.list.getBoundingClientRect();
        },

        getSnapPoint(endValue) {
            const interval = -this.listRect.width * this.direction;
            const snapPoint = Math.round(endValue / interval) * interval;
            const activeIndex = Math.min(Math.max(snapPoint / interval, 0), this.$refs.item.length - 1);
            this.setActiveItem(activeIndex);

            return snapPoint;
        },

        getLimits() {
            const interval = -this.listRect.width;
            let min = interval * (this.$refs.item.length - 1);
            let max = 0;

            if (this.direction === -1) {
                max = interval * (this.$refs.item.length - 1) * -1;
                min = 0;
            }

            return {
                max,
                min,
            };
        },

        resetSliderPosition() {
            this.positionX.target = 0;
            this.positionX.current = 0;

            this.setActiveItem(0);
            this.scene.resetCarouselPosition(0);
            // this.scene.resetCarouselPosition(0 * this.direction);
        },

        updateTargetPosition() {
            const maxOverdragDistance = device.isTouch() ? MAX_OVERDRAG_DISTANCETOUCH : MAX_OVERDRAG_DISTANCE;
            const maxDragDistance = this.listRect.width * (this.$refs.item.length - 1);
            let distance = 0;

            if (this.direction === 1) {
                if (this.positionX.target > 0 && this.deltaX <= 0) {
                    distance = this.positionX.target;
                } else if (this.positionX.target < -maxDragDistance && this.deltaX >= 0) {
                    distance = Math.abs(this.positionX.target - -maxDragDistance);
                }

                const ease = Math.sin(Math.min(distance / maxOverdragDistance, 1) * Math.PI);

                this.positionX.target -= this.deltaX * (1 - ease);
            } else {
                this.positionX.target -= this.deltaX;
            }
        },

        updatePosition() {
            this.positionX.current = lerp(this.positionX.current, this.positionX.target, 0.2);
            const normalizedValue = this.positionX.current / this.listRect.width;

            this.transform(this.$refs.item, this.positionX.current);
            this.updateSliderPosition(normalizedValue);
        },

        updateSliderPosition(x) {
            if (!this.scene) return;

            this.scene.updateCarouselPosition(x);
            // this.scene.updateCarouselPosition(x * this.direction);
        },

        transform(elements, x) {
            if (!elements || !elements.length) return; // ✅ prevent crash
          
            const transform = `matrix3d(1,0,0.00,0,0.00,1,0.00,0,0,0,1,0,${x},0,0,1)`;
          
            for (let i = 0; i < elements.length; i++) {
              const element = elements[i];
              if (!element) continue;
              element.style.transform = transform;
            }
          }
          ,

        throw() {
            this.tween = gsap.to(this.positionX, {
                inertia: {
                    duration: { max: 1 },
                    resistance: 0,
                    current: {
                        min: this.getLimits().min,
                        max: this.getLimits().max,
                        end: this.getSnapPoint,
                    },
                },
                onUpdate: () => {
                    this.positionX.target = this.positionX.current;
                },
            });
        },

        setActiveItem(index) {
            if (index === null || index === undefined || isNaN(index)) return;
            if (this.activeIndex === index) return;
          
            // --- make the CSS "filled" state work immediately ---
            for (let i = 0; i < this.$refs.item.length; i++) {
              this.$refs.item[i].classList.remove('is-active');
            }
            if (this.$refs.item?.[index]) {
              this.$refs.item[index].classList.add('is-active');
            }
          
            // deactivate previous (if any)
            if (this.activeIndex !== null) {
              if (this._setInactiveItemTimeline) this._setInactiveItemTimeline.kill();
              this._setInactiveItemTimeline = gsap.timeline();
          
              const oldTitleEl = this.$refs.title?.[this.activeIndex]?.$el || this.$refs.title?.[this.activeIndex];
              if (oldTitleEl) {
                this._setInactiveItemTimeline.to(oldTitleEl, 0.3, { alpha: 0.3, ease: 'sine.inOut' }, 0);
              }
              if (this.$i18n.locale !== 'ar' && this.titles?.[this.activeIndex]?.chars) {
                const oldChars = this.titles[this.activeIndex].chars;
                this._setInactiveItemTimeline.to(oldChars, 0.6, { webkitTextStrokeColor: 'rgba(245,175,87,1)' }, 0);
                this._setInactiveItemTimeline.to(oldChars, 0.3, { color: 'rgba(245,175,87,0)', ease: 'sine.inOut' }, 0);
              }
            }
          
            this.activeIndex = index;
            this.checkIfSlideAllowed();
          
            // --- ensure first load is filled immediately (no flicker) ---
            const newTitleEl = this.$refs.title?.[this.activeIndex]?.$el || this.$refs.title?.[this.activeIndex];
          
            if (this._setActiveItemTimeline) this._setActiveItemTimeline.kill();
            this._setActiveItemTimeline = gsap.timeline();
          
            if (newTitleEl) {
              // If it's the very first activation, set instantly
              if (this.activeIndex === 0 && !this._activatedOnce) {
                gsap.set(newTitleEl, { alpha: 1 });
                if (this.$i18n.locale !== 'ar' && this.titles?.[0]?.chars) {
                  gsap.set(this.titles[0].chars, {
                    webkitTextStrokeColor: 'rgba(245,175,87,0)',
                    color: 'rgba(245,175,87,1)',
                  });
                }
                this._activatedOnce = true;
              } else {
                // normal animated activation
                this._setActiveItemTimeline.to(newTitleEl, 0.3, { alpha: 1, ease: 'sine.inOut' }, 0);
                if (this.$i18n.locale !== 'ar' && this.titles?.[this.activeIndex]?.chars){
                  const newChars = this.titles[this.activeIndex].chars;
                  this._setActiveItemTimeline.to(newChars, 0.6, { webkitTextStrokeColor: 'rgba(245,175,87,0)' }, 0.4);
                  this._setActiveItemTimeline.to(newChars, 0.3, {
                    color: () => {
                      const a = Math.random() > 0.5 ? 0.6 + 0.4 * Math.random() : 1;
                      return `rgba(245, 175, 87, ${a})`;
                    },
                    ease: 'sine.inOut',
                    stagger: { each: 0.01, from: 'random' },
                  }, 0);
                }
              }
            }
          
            // keep WebGL in sync
            this.scene.setActive(this.activeIndex);
          }
          ,
          
          

        goToIndex(index) {
            if (this.tween) this.tween.kill();
            const interval = -this.listRect.width * this.direction;
            const destination = index * interval;
            gsap.to(this.positionX, 0.5, { target: destination });
            this.setActiveItem(index);
        },

        setupEventListeners() {
            gsap.ticker.add(this.tickHandler);
            window.addEventListener('resize', this.resizeHandler);

            if (device.isTouch()) {
                this.$el.addEventListener('touchstart', this.touchstartHandler);
                this.$el.addEventListener('touchmove', this.touchmoveHandler);
                window.addEventListener('touchend', this.touchendHandler);
            } else {
                this.$el.addEventListener('mousedown', this.touchstartHandler);
                this.$el.addEventListener('mousemove', this.mousemoveHandler);
                window.addEventListener('mouseup', this.touchendHandler);
            }
        },

        removeEventListeners() {
            gsap.ticker.remove(this.tickHandler);
            window.removeEventListener('resize', this.resizeHandler);

            if (device.isTouch()) {
                this.$el.removeEventListener('touchstart', this.touchstartHandler);
                this.$el.removeEventListener('touchmove', this.touchmoveHandler);
                window.removeEventListener('touchend', this.touchendHandler);
            } else {
                this.$el.removeEventListener('mousedown', this.touchstartHandler);
                this.$el.removeEventListener('mousemove', this.mousemoveHandler);
                window.removeEventListener('mouseup', this.touchendHandler);
            }
        },

        splitTitles() {
            if (this.$i18n.locale === 'ar') return [];
          
            const refs = this.$refs.title;
            if (!refs || !refs.length) {
              console.warn('⚠️ No title refs found');
              return [];
            }
          
            return refs
              .map((ref, index) => {
                const el = ref?.$el || ref; // ✅ fallback for DOM or Vue
          
                if (!(el instanceof Element)) {
                  console.warn(`❌ Skip index ${index}: not a DOM element`, el);
                  return null;
                }
          
                try {
                  return new SplitText(el, {
                    type: 'chars',
                    charsClass: 'item-chars',
                  });
                } catch (e) {
                  console.warn(`❌ SplitText failed on index ${index}`, el, e);
                  return null;
                }
              })
              .filter(Boolean);
          }
          
                  
          ,

        /**
         * Handlers
         */
        mousemoveHandler(event) {
            this.touchmoveHandler(event);
        },

        touchstartHandler(event) {
            if (this.tween) this.tween.kill();

            this.disableHover();
            this.isDraging = true;
            // this.$el.style.cursor = 'grabbing';

            const x = event.clientX || event.touches[0].clientX;
            const y = event.clientY || event.touches[0].clientY;
            this.dragMousePositionX = x;
            this.lastMousemovePositionX = null;

            this.touchStartMousePosition = { x, y };
        },

        touchmoveHandler(event) {
            if (!this.allowDrag) return;
            if (!this.isDraging) return;

            const x = event.clientX || event.touches[0].clientX;
            this.deltaX = this.dragMousePositionX - x;
            this.dragMousePositionX = x;
            this.lastMousemovePositionX = x;

            this.scene.dragHandler(this.deltaX);
            // this.scene.dragHandler(this.deltaX * this.direction);

            this.updateTargetPosition();
        },

        touchendHandler(e) {
            if (!this.isDraging) return;

            const x = e.clientX || this.lastMousemovePositionX;

            this.isDraging = false;
            // this.$el.style.cursor = 'grab';

            // this.scene.dragEndHandler(0);
            this.scene.dragEndHandler(0);
            this.enableHover();

            if (e.clientX && this.touchStartMousePosition.x === x) return;
            if (!e.clientX && !this.lastMousemovePositionX) return;

            this.throw();
        },

        projectClickHandler(e) {
            const currentTarget = e.currentTarget;
            const index = parseInt(currentTarget.dataset.index);
            const currentPos = { x: e.clientX, y: e.clientY };
            const distanceX = Math.abs(this.touchStartMousePosition.x - currentPos.x);
            const distanceY = Math.abs(this.touchStartMousePosition.y - currentPos.y);

            if (distanceX <= CLICK_TRESHOLD && distanceY <= CLICK_TRESHOLD) {
                const url = e.currentTarget.dataset.link;

                if (index === this.activeIndex) {
                    this.$router.push(url);
                } else {
                    this.goToIndex(index);
                    setTimeout(() => {
                        this.$router.push(url);
                    }, 500);
                }
            }
        },

        mouseenterHandler(e) {
            if (!this.allowHover) return;

            const element = e.currentTarget;
            const index = parseInt(element.dataset.index);

            if (index !== this.activeIndex) return;
            this.isHovering = true;

            if (this.mouseenterTimeline) this.mouseenterTimeline.kill();
            if (this.mouseleaveTimeline) this.mouseleaveTimeline.kill();

            this.mouseenterTimeline = new gsap.timeline();

            for (let i = 0; i < this.$refs.hoverContainer.length; i++) {
                const item = this.$refs.hoverContainer[i];
                if (item === element) continue;
                this.mouseenterTimeline.to(item, 0.4, { alpha: 0.5, ease: 'sine.inOut' }, 0);
            }

            this.scene.hoverAnimationIn();
        },

        mouseleaveHandler(e) {
            if (!this.isHovering) return;
            this.isHovering = false;

            if (this.mouseenterTimeline) this.mouseenterTimeline.kill();
            if (this.mouseleaveTimeline) this.mouseleaveTimeline.kill();

            this.mouseleaveTimeline = new gsap.timeline();
            this.mouseleaveTimeline.to(this.$refs.hoverContainer, 0.4, { alpha: 1, ease: 'sine.inOut' }, 0);

            this.scene.hoverAnimationOut();
        },

        tickHandler() {
            this.updatePosition();
        },

        resizeHandler() {
            this.resize();
        },

        clickNextHandler() {
            const index = this.activeIndex + this.direction;
            if (index > this.$refs.item.length - 1) return;
            this.goToIndex(index);
        },

        clickPreviousHandler() {
            const index = this.activeIndex - this.direction;
            if (index < 0) return;
            this.goToIndex(index);
        },
    },
};
