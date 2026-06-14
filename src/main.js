import './style.css';
import { initPetals } from './petals.js';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize 3D Petals
  initPetals('webgl-canvas');

  // 2. Initial Page Load Animation
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
    const text = messageEl.innerText;
    messageEl.innerHTML = '';
    const words = text.split(' ');
    words.forEach(word => {
      const span = document.createElement('span');
      span.innerText = word + ' ';
      span.style.opacity = '0';
      span.style.display = 'inline-block';
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
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
    } else {
      audio.play().then(() => {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
      }).catch(err => console.log('Audio playback failed', err));
    }
    isPlaying = !isPlaying;
  });

  // Optional: Auto-play on first scroll/interaction if not yet played
  const startAudioOnInteraction = () => {
    if (!isPlaying) {
      audio.play().then(() => {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        isPlaying = true;
      }).catch(() => {
        // Autoplay blocked, wait for manual click
      });
      window.removeEventListener('scroll', startAudioOnInteraction);
      window.removeEventListener('click', startAudioOnInteraction);
    }
  };
  
  window.addEventListener('scroll', startAudioOnInteraction, { once: true });
  window.addEventListener('click', startAudioOnInteraction, { once: true });
});
