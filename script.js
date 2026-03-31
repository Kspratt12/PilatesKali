// ===== Hero Video Crossfade =====
const heroVideos = document.querySelectorAll('.hero__video');
const heroPoster = document.querySelector('.hero__poster');
let currentVideo = 0;
let isTransitioning = false;

// Hide poster once first video starts playing
if (heroVideos[0] && heroPoster) {
  heroVideos[0].addEventListener('playing', () => {
    heroVideos[0].classList.add('active');
    heroPoster.classList.add('hidden');
  }, { once: true });
}

function rotateVideo() {
  if (isTransitioning) return;
  isTransitioning = true;

  const current = heroVideos[currentVideo];
  const nextIndex = (currentVideo + 1) % heroVideos.length;
  const next = heroVideos[nextIndex];

  // Lazy load video source if not loaded yet
  if (!next.src && next.dataset.src) {
    next.src = next.dataset.src;
    next.load();
  }

  // Play next video from start
  next.currentTime = 0;
  next.play().catch(() => {});

  // Crossfade
  next.classList.add('active');
  current.classList.remove('active');

  // After transition completes, pause old and reset state
  setTimeout(() => {
    current.pause();
    current.currentTime = 0;
    currentVideo = nextIndex;
    isTransitioning = false;
  }, 1600);
}

if (heroVideos.length > 1) {
  // When each video ends naturally, rotate to next
  heroVideos.forEach(video => {
    video.addEventListener('ended', () => {
      rotateVideo();
    });
  });

  // On mobile some browsers won't autoplay - force first video
  heroVideos[0].play().catch(() => {
    // If autoplay blocked, fall back to poster image and use interval
    setInterval(rotateVideo, 6000);
  });
}

// Navigation scroll effect
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    nav.classList.add('nav--scrolled');
  } else {
    nav.classList.remove('nav--scrolled');
  }
});

// Mobile menu toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  navToggle.classList.toggle('active');
});

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    navToggle.classList.remove('active');
  });
});

// Close mobile menu on outside click
document.addEventListener('click', (e) => {
  if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
    navLinks.classList.remove('active');
    navToggle.classList.remove('active');
  }
});

// Scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.about__content, .about__image, .service-card, .pricing-card, .studio__card, .contact__info, .contact__map, .cta__inner, .section-header, .location__content, .location__image, .contact__top').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

document.querySelectorAll('.services__grid, .pricing__grid, .studio__grid').forEach(grid => {
  grid.querySelectorAll('.fade-in').forEach((item, index) => {
    item.style.transitionDelay = `${index * 0.1}s`;
  });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinks.querySelectorAll('a:not(.btn)').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

// ===== Gallery Slideshow =====
const galleryTrack = document.getElementById('galleryTrack');
const galleryPrev = document.getElementById('galleryPrev');
const galleryNext = document.getElementById('galleryNext');
const galleryDots = document.getElementById('galleryDots');

if (galleryTrack) {
  const slides = galleryTrack.querySelectorAll('.gallery__slide');
  const isMobile = window.innerWidth <= 768;
  const slidesPerView = isMobile ? 1 : 3;
  const totalPages = Math.ceil(slides.length / slidesPerView);
  let currentPage = 0;

  // Create dots
  for (let i = 0; i < totalPages; i++) {
    const dot = document.createElement('button');
    dot.className = `gallery__dot${i === 0 ? ' active' : ''}`;
    dot.addEventListener('click', () => goToPage(i));
    galleryDots.appendChild(dot);
  }

  function goToPage(page) {
    currentPage = page;
    const slideWidth = slides[0].offsetWidth + 20; // width + gap
    galleryTrack.style.transform = `translateX(-${currentPage * slidesPerView * slideWidth}px)`;

    // Update dots
    galleryDots.querySelectorAll('.gallery__dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentPage);
    });

    // Play video if visible
    slides.forEach((slide, i) => {
      const video = slide.querySelector('video');
      if (!video) return;
      const visibleStart = currentPage * slidesPerView;
      const visibleEnd = visibleStart + slidesPerView;
      if (i >= visibleStart && i < visibleEnd) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }

  galleryNext.addEventListener('click', () => {
    goToPage((currentPage + 1) % totalPages);
  });

  galleryPrev.addEventListener('click', () => {
    goToPage((currentPage - 1 + totalPages) % totalPages);
  });

  // Auto-advance every 5 seconds
  let galleryInterval = setInterval(() => {
    goToPage((currentPage + 1) % totalPages);
  }, 5000);

  // Pause auto-advance on hover
  galleryTrack.addEventListener('mouseenter', () => clearInterval(galleryInterval));
  galleryTrack.addEventListener('mouseleave', () => {
    galleryInterval = setInterval(() => {
      goToPage((currentPage + 1) % totalPages);
    }, 5000);
  });

  // Touch swipe support
  let touchStartX = 0;
  galleryTrack.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    clearInterval(galleryInterval);
  });

  galleryTrack.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToPage((currentPage + 1) % totalPages);
      else goToPage((currentPage - 1 + totalPages) % totalPages);
    }
  });
}

// ===== AI Chat Widget =====
const chatResponses = {
  pricing: `Here's our pricing:\n\n<strong>Private Sessions:</strong>\n- Intro: $50\n- Single: $75\n- 4-Pack: $292\n- 8-Pack: $568\n\n<strong>Duet Sessions:</strong>\n- Intro: $49\n- Single: $55\n- 4-Pack: $192\n- 8-Pack: $372\n\n<strong>Equipment Classes:</strong>\n- Drop-in: $35\n- 4-Pack: $136\n- 8-Pack: $256\n\nAll 4-packs expire 1 month from first class. 8-packs expire 45 days.`,

  services: `We offer several types of Pilates training:\n\n<strong>Private Sessions</strong> - One-on-one personalized instruction tailored to your goals.\n\n<strong>Duet Sessions</strong> - Train with a partner or friend for semi-private instruction.\n\n<strong>Equipment Classes</strong> - Small group classes using our full range of equipment.\n\n<strong>Mat Pilates</strong> - Classic mat work for core strength and flexibility.\n\nAll sessions are taught by Kali, a nationally certified Pilates instructor!`,

  location: `We're located in <strong>Downtown Apex, NC</strong>!\n\n<strong>Address:</strong> 309 N Salem St, Apex, NC 27502\n\n<strong>Parking:</strong> 3 spots behind our building, plus plenty of additional parking off of Templeton Street.\n\nWe'd love to see you at the studio!`,

  intro: `Yes! We offer intro sessions for new clients:\n\n- <strong>Intro Private Session:</strong> $50 (regularly $75)\n- <strong>Intro Duet Session:</strong> $49 (regularly $55)\n\nIt's the perfect way to experience Salem Street Pilates and see what we're all about. You can book directly through our MindBody page!`,

  equipment: `Our studio features comprehensive Pilates equipment:\n\n- <strong>Reformer</strong> - Versatile and effective for all levels\n- <strong>Cadillac</strong> - Full trapeze table for deep stretching\n- <strong>Wunda Chair</strong> - Great for balance and coordination\n- <strong>Ladder Barrel</strong> - Perfect for spinal articulation\n- <strong>Mat</strong> - Classic Pilates foundation\n- Plus various small equipment\n\nKali is certified in all of these modalities!`,

  book: `Booking is easy! You can:\n\n1. <strong>Book online</strong> through our MindBody page - click "Book a Class" at the top of this page\n2. <strong>Call us</strong> at 303-842-1630\n3. <strong>Email</strong> SalemStPilates@gmail.com\n\nWe recommend starting with an Intro Session ($49-$50) to get the full experience!`,

  hours: `Here are our studio hours:\n\n<strong>Monday:</strong> 8 AM - 6:30 PM\n<strong>Tuesday:</strong> 8 AM - 6:30 PM\n<strong>Wednesday:</strong> 8 AM - 6:30 PM\n<strong>Thursday:</strong> 8 AM - 6:30 PM\n<strong>Friday:</strong> 8 AM - 6:30 PM\n<strong>Saturday:</strong> 9 AM - 1 PM\n<strong>Sunday:</strong> Closed\n\nYou can book through our MindBody page or call us at 303-842-1630!`,

  about: `Hi! I'm Kali, the owner and instructor at Salem Street Pilates.\n\nI'm a comprehensive Nationally Certified Pilates instructor specializing in Mat, Reformer, Cadillac, Wunda Chair, Ladder Barrel and small equipment.\n\nAs a classical ballet dancer and dance instructor, my understanding of body movement has played a vital role in my teaching. I believe Pilates is for everyone!`,

  default: `Great question! Here's what I can help you with:\n\n- Pricing information\n- Our services and class types\n- Studio location and parking\n- Intro session details\n- Equipment we use\n- How to book\n\nFeel free to ask about any of these, or contact us directly at 303-842-1630!`
};

function matchResponse(input) {
  const lower = input.toLowerCase();

  if (lower.match(/pric|cost|how much|rate|fee|package|pack/)) return chatResponses.pricing;
  if (lower.match(/service|offer|class|type|what do you/)) return chatResponses.services;
  if (lower.match(/where|location|address|directions|parking|find you|downtown/)) return chatResponses.location;
  if (lower.match(/intro|first time|beginner|new client|try|start/)) return chatResponses.intro;
  if (lower.match(/equipment|reformer|cadillac|chair|barrel|machine/)) return chatResponses.equipment;
  if (lower.match(/book|schedule|appointment|reserve|sign up|register/)) return chatResponses.book;
  if (lower.match(/hour|open|close|when|time|schedule/)) return chatResponses.hours;
  if (lower.match(/about|kali|instructor|teacher|who|owner|background/)) return chatResponses.about;
  if (lower.match(/hi|hello|hey|good morning|good afternoon/)) return `Hello! Welcome to Salem Street Pilates! How can I help you today? You can ask me about our services, pricing, location, or how to book your first session!`;
  if (lower.match(/thank|thanks/)) return `You're welcome! If you have any other questions, feel free to ask. We'd love to see you at the studio!`;

  return chatResponses.default;
}

const chat = document.getElementById('chat');
const chatToggle = document.getElementById('chatToggle');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatSuggestions = document.getElementById('chatSuggestions');

chatToggle.addEventListener('click', () => {
  chat.classList.toggle('active');
  if (chat.classList.contains('active')) {
    chatInput.focus();
  }
});

function addMessage(text, type) {
  const msg = document.createElement('div');
  msg.className = `chat__message chat__message--${type}`;
  msg.innerHTML = `<p>${text}</p>`;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
  const typing = document.createElement('div');
  typing.className = 'chat__message chat__message--typing';
  typing.id = 'typingIndicator';
  typing.innerHTML = '<span></span><span></span><span></span>';
  chatMessages.appendChild(typing);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTyping() {
  const typing = document.getElementById('typingIndicator');
  if (typing) typing.remove();
}

function handleSend(text) {
  if (!text.trim()) return;

  addMessage(text, 'user');
  chatInput.value = '';
  chatSuggestions.style.display = 'none';

  showTyping();

  // Simulate AI thinking delay
  setTimeout(() => {
    removeTyping();
    const response = matchResponse(text);
    addMessage(response.replace(/\n/g, '<br>'), 'bot');
  }, 800 + Math.random() * 600);
}

chatSend.addEventListener('click', () => handleSend(chatInput.value));
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSend(chatInput.value);
});

// Suggestion buttons
document.querySelectorAll('.chat__suggestion').forEach(btn => {
  btn.addEventListener('click', () => {
    const question = btn.textContent;
    handleSend(question);
  });
});

// Auto-open chat after 5 seconds with a bounce
setTimeout(() => {
  if (!chat.classList.contains('active')) {
    chatToggle.style.animation = 'chatBounce 0.6s ease';
    setTimeout(() => chatToggle.style.animation = '', 600);
  }
}, 5000);
