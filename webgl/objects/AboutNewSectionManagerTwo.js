import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Color, Vector3, Box3, QuadraticBezierCurve3 } from 'three';

// Register the plugin
gsap.registerPlugin(ScrollTrigger);
const sectionPositions = {
  ProcessNew: { x:0, y:0, z: 2 },
  Step1: {x:0, y:0, z: 8 },
  Step2: { x:8, y:0, z: 16 },
  Step3: { x:8, y:0, z: 24 },
  Step4: { x:0,y:0,z: 32 }
};


export default {
  
  _scrollHandler({ y }) {
    const sections =
    this._nuxtRoot && this._nuxtRoot.sectionsInfo
      ? this._nuxtRoot.sectionsInfo
      : null;

    if (!sections) return;
  
    const triggerY = window.innerHeight * 0.85;
  
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const el =
      section &&
      section.component &&
      section.component.$el
        ? section.component.$el
        : null;
      if (!el) continue;
  
      const rect = el.getBoundingClientRect();
  
      if (rect.top <= triggerY && rect.bottom >= triggerY) {
        if (this._lastDOMSectionIndex !== i) {
          const direction = i > (this._lastDOMSectionIndex || 0) ? 1 : -1;
          this._lastDOMSectionIndex = i;
  
          const name =
          section &&
          section.component &&
          section.component.$options &&
          section.component.$options.name
            ? section.component.$options.name
            : `Unknown_${i}`;

          console.log(`[📍 DOM] Active Section: ${name}`);
  
          const fn = `_show${name}`;
          if (typeof this[fn] === 'function') {
            const tl = this[fn](direction);
        
            // Determine if backgroundShow exists
            var hasBg =
                section &&
                section.component &&
                typeof section.component.backgroundShow === 'function';
        
            // If GSAP timeline
            if (tl && typeof tl.then === 'undefined' && typeof tl.eventCallback === 'function') {
                tl.call(function () {
                    if (hasBg) {
                        section.component.backgroundShow(function(){}, direction);
                    }
                }, null, 0.01);
            } 
            else {
                // Fallback (non-timeline)
                if (hasBg) {
                    section.component.backgroundShow(function(){}, direction);
                }
            }
        }
        else {
            // No section animation; still call backgroundShow
            if (
                section &&
                section.component &&
                typeof section.component.backgroundShow === 'function'
            ) {
                section.component.backgroundShow(function(){}, direction);
            }
        }
        
        }
        break;
      }
    }
  }
  ,

  _showAboutHeader() {
    if (this._lastSection === 'AboutHeader') return;
    this._lastSection = 'AboutHeader';
  
    const tl = gsap.timeline();
    tl.to(this.position, 
      { x: this._locale === 'en' ? 1.38 : -3.1, duration: 1.5, ease: 'power2.inOut' });

  },

  _showAboutIntro() {
    if (this._lastSection === 'section0') return;
    this._lastSection = 'section0';

    const spinner = this._components ? this._components.spinner : null;

    if (spinner) {
      gsap.to(spinner.position, {
        x: this._locale === 'en' ? -1.38 : -3.1, // or whatever "perfect" position you saw in Info
        y: 0,
        z: 0,
        duration: 1.5,
        ease: 'power2.inOut',
      });
    }
  
    const tl = gsap.timeline();
    tl.to(this.position, { x: -1.38, duration: 1.5, ease: 'power2.inOut' });
  
    tl.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Color.value, {
      r: 31 / 255, g: 22 / 255, b: 68 / 255, duration: 2
    }, 0);
    tl.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength, { value: 0.36, duration: 2 }, 0);
    tl.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Position.value, { x: 0.78, y: 0, duration: 2 }, 0);
    tl.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Scale, { value: 1.06, duration: 2 }, 0);
  
    tl.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Color.value, {
      r: 47 / 255, g: 15 / 255, b: 15 / 255, duration: 2
    }, 0);
    tl.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Strength, { value: 0.19, duration: 2 }, 0);
    tl.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Position.value, { x: 0.04, y: 1, duration: 2 }, 0);
    tl.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Scale, { value: 0.81, duration: 2 }, 0);
  }
  ,

  _showAboutInfo() {
    if (this._lastSection === 'section1') return;
    this._lastSection = 'section1';
  
    const tl = gsap.timeline();
    tl.to(this.position, 
      { x: this._locale === 'en' ? -3.38 : 2.38, duration: 1.5, ease: 'power2.inOut' });
  
    tl.to(this._camera.position, {
      z: 9.34, y: 1.24,
      duration: 1.5, ease: 'power2.inOut',
      onUpdate: () => this._camera.lookAt(this._cameraTarget)
    }, 0);
  },


  
_showSectionAboutPartners() {
  this._lastSection = 'SectionProcessHead';
  const tl = gsap.timeline();

  tl.to(this.position, 
    { x: this._locale === 'en' ? -15.38 : 5.6, duration: 1.5, ease: 'power2.inOut' });
  
    return tl;
},

_showSectionIndustries() {
  this._lastSection = 'SectionIndustries';
  const tl = gsap.timeline();

  tl.to(this.position, 
    { x: this._locale === 'en' ? -15.38 : 5.6, duration: 1.5, ease: 'power2.inOut' });
  
    return tl;
},

  _showAboutContact() {
    this._lastSection = 'AboutContact';
    const tl = gsap.timeline();

  tl.to(this.position, 
    { x: this._locale === 'en' ? -3.38 : 2.38, duration: 1.5, ease: 'power2.inOut' });
  
    return tl;
  }
};
