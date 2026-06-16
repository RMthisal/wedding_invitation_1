import './style.css';
import { initPetals } from './petals.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize 3D Petals
  initPetals('webgl-canvas');

  // 2. Splash Screen & Initial Page Load Animation
  function playHeroAnimation() {
    const tl = gsap.timeline();

    // Reveal Wreath
    tl.fromTo(
      '#hero-wreath',
      { scale: 0.8, opacity: 0, rotation: -30 },
      { scale: 1, opacity: 1, rotation: 0, duration: 2, ease: 'power3.out' }
    )
    // Reveal hero names stagger
    .fromTo(
      '.hero-names .name',
      { y: 30, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 1.2, stagger: 0.2, ease: 'back.out(1.2)' },
      '-=1.5'
    )
    // Reveal ampersand
    .fromTo(
      '.hero-names .amp',
      { scale: 0, opacity: 0, rotation: -90 },
      { scale: 1, opacity: 1, rotation: 0, duration: 0.8, ease: 'back.out(2)' },
      '-=1.2'
    )
    // Date comes from below the wreath
    .fromTo(
      '.hero-date',
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' },
      '-=1'
    );
  }

  const envelopeWrapper = document.querySelector('.envelope-wrapper');
  const splashScreen = document.getElementById('splash-screen');
  let envelopeOpened = false;

  if (envelopeWrapper) {
    envelopeWrapper.addEventListener('click', () => {
      if (envelopeOpened) return;
      envelopeOpened = true;

      // Hide tap instruction
      gsap.to('.tap-instruction', { opacity: 0, duration: 0.3 });

      const envTl = gsap.timeline();

      // 1. Pop Wax Seal & Zoom
      envTl.to('.envelope-wrapper', { scale: 1.05, duration: 0.5, ease: 'power2.out' })
           .to('.wax-seal', { scale: 1.2, opacity: 0, duration: 0.4, ease: 'power2.in' }, '<')
           // 2. Open Flap
           .to('.envelope-flap', { rotateX: 180, duration: 0.8, ease: 'power3.inOut' }, '-=0.1')
           .set('.envelope-flap', { zIndex: 0 }) // Move flap behind letter
           // 3. Slide Letter Completely Out
           .to('.envelope-letter', { y: -160, zIndex: 10, scale: 1.1, duration: 1, ease: 'back.out(1.2)' }, '-=0.2')
           // 4. Envelope falls away while fading
           .to('.envelope', { background: 'transparent', boxShadow: 'none', duration: 0.4 }, '+=0.4')
           .to(['.envelope-pocket', '.envelope-flap'], { y: 200, opacity: 0, duration: 0.8, ease: 'power3.in' }, '<')
           // 5. Letter zooms in massively to fill screen (acting as transition)
           .to('.envelope-letter', { scale: 15, opacity: 0, duration: 1.2, ease: 'power4.inOut' }, '-=0.3')
           // Fade out splash screen wrapper completely
           .to('#splash-screen', { opacity: 0, duration: 0.5 }, '-=0.8')
           .call(() => {
             splashScreen.style.display = 'none';
             document.body.classList.remove('no-scroll');
             playHeroAnimation();
           });
    });
  } else {
    document.body.classList.remove('no-scroll');
    playHeroAnimation();
  }

  // 3. ScrollTrigger Animations for Sections
  const fadeUpElements = document.querySelectorAll('.gsap-fade-up');
  fadeUpElements.forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%', // trigger when top of element hits 80% down the viewport
          toggleActions: 'play none none reverse'
        }
      }
    );
  });

  // SplitText style manual word reveal for the Couple Message
  const messageEl = document.querySelector('.message-text');
  if (messageEl) {
    const text = messageEl.textContent || messageEl.innerText;
    messageEl.innerHTML = '';
    const words = text.trim().split(/\s+/);
    words.forEach(word => {
      const span = document.createElement('span');
      span.innerText = word + ' ';
      span.style.opacity = '0';
      span.style.display = 'inline-block';
      // Add a small margin-right to ensure spaces are respected across all browsers when display is inline-block
      span.style.marginRight = '0.15em'; 
      messageEl.appendChild(span);
    });

    gsap.to('.message-text span', {
      opacity: 1,
      y: 0,
      stagger: 0.1,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.message-text',
        start: 'top 75%'
      }
    });
  }

  // 4. Countdown Timer Logic
  const targetDate = new Date('October 29, 2026 16:00:00').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      document.getElementById('countdown-timer').innerHTML = "<h3>The Celebration Has Begun!</h3>";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const format = (val) => val.toString().padStart(2, '0');

    document.getElementById('cd-days').innerText = format(days);
    document.getElementById('cd-hours').innerText = format(hours);
    document.getElementById('cd-mins').innerText = format(minutes);
    document.getElementById('cd-secs').innerText = format(seconds);
  }
  
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // 5. Audio Control Logic
  const audio = document.getElementById('bg-music');
  const audioToggle = document.getElementById('audio-toggle');
  const playIcon = document.querySelector('.play-icon');
  const pauseIcon = document.querySelector('.pause-icon');
  let isPlaying = false;

  audioToggle.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      // Now paused: show strikethrough (pause-icon), hide normal note (play-icon)
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
    } else {
      audio.play().then(() => {
        // Now playing: show normal note (play-icon), hide strikethrough (pause-icon)
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
      }).catch(err => console.log('Audio playback failed', err));
    }
    isPlaying = !isPlaying;
  });

  // Optional: Auto-play on first scroll/interaction if not yet played
  const startAudioOnInteraction = () => {
    if (!isPlaying) {
      audio.play().then(() => {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        isPlaying = true;
      }).catch((err) => {
        console.log('Autoplay blocked by browser policy:', err);
      });
      // Remove listeners once interaction occurs
      document.removeEventListener('scroll', startAudioOnInteraction);
      document.removeEventListener('click', startAudioOnInteraction);
      document.removeEventListener('touchstart', startAudioOnInteraction);
    }
  };
  
  document.addEventListener('scroll', startAudioOnInteraction, { once: true });
  document.addEventListener('click', startAudioOnInteraction, { once: true });
  document.addEventListener('touchstart', startAudioOnInteraction, { once: true });

  // 6. Scroll Chevron Logic
  const chevron = document.getElementById('scroll-chevron');
  const sections = Array.from(document.querySelectorAll('section, footer'));

  if (chevron) {
    chevron.addEventListener('click', () => {
      // Find the first section whose top is below the current viewport
      const nextSection = sections.find(sec => {
        const rect = sec.getBoundingClientRect();
        return Math.round(rect.top) > 50; // 50px buffer to prevent sticky matching
      });

      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
        
        // Force GSAP ScrollTrigger to update during the native smooth scroll
        // This fixes the issue on browsers that throttle scroll events during smooth scrolling
        let frames = 0;
        function updateGSAP() {
          ScrollTrigger.update();
          frames++;
          if (frames < 120) requestAnimationFrame(updateGSAP); // ~2 seconds of updates
        }
        updateGSAP();
      }
    });

    // Hide chevron when reaching the last section (footer)
    window.addEventListener('scroll', () => {
      const lastSection = sections[sections.length - 1];
      const rect = lastSection.getBoundingClientRect();
      // If the top of the footer is mostly visible in the viewport
      if (rect.top <= window.innerHeight - 50) {
        chevron.style.opacity = '0';
        chevron.style.pointerEvents = 'none';
      } else {
        chevron.style.opacity = '1';
        chevron.style.pointerEvents = 'auto';
      }
    });
  }
});
