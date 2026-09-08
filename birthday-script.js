// Confetti Animation
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let confetti = [];

class Confetti {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height - canvas.height;
        this.size = Math.random() * 3 + 2;
        this.speedY = Math.random() * 3 + 2;
        this.speedX = (Math.random() - 0.5) * 4;
        this.color = ['#ff1744', '#ff6b9d', '#9c27b0', '#ffd700', '#ff69b4'][Math.floor(Math.random() * 5)];
        this.rotation = Math.random() * Math.PI;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
        this.speedY += 0.1; // gravity

        if (this.y > canvas.height) {
            return false;
        }
        return true;
    }
}

// Create confetti on page load
function createConfetti() {
    for (let i = 0; i < 100; i++) {
        confetti.push(new Confetti());
    }
}

function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = confetti.length - 1; i >= 0; i--) {
        confetti[i].draw();
        if (!confetti[i].update()) {
            confetti.splice(i, 1);
        }
    }

    if (confetti.length > 0) {
        requestAnimationFrame(animateConfetti);
    }
}

// Floating hearts animation
function createFloatingHearts() {
    const container = document.querySelector('.floating-hearts');
    const hearts = ['❤️', '💕', '💖', '💗', '💝'];

    function createHeart() {
        const heart = document.createElement('div');
        heart.className = 'heart-float';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDuration = (Math.random() * 3 + 4) + 's';
        heart.style.animationDelay = Math.random() * 2 + 's';

        container.appendChild(heart);

        setTimeout(() => heart.remove(), 7000);
    }

    // Create hearts every 500ms
    setInterval(createHeart, 500);
}

// Scroll animations
function observeElements() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInDown 0.8s ease-out forwards';
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll(
        '.gallery-section, .message-section, .reasons-section, .wishes-section, .countdown-section, .final-message'
    ).forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

// Smooth scroll for navigation
function smoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Initialize on page load
window.addEventListener('load', () => {
    createConfetti();
    animateConfetti();
    createFloatingHearts();
    observeElements();
    smoothScroll();

    // Add celebration animation
    playBirthdayAnimation();
});

// Birthday animation on load
function playBirthdayAnimation() {
    const greetingCard = document.querySelector('.greeting-card');
    greetingCard.style.animation = 'scaleIn 0.8s ease-out';

    // Create extra confetti bursts when certain elements come into view
    setTimeout(() => createConfetti(), 1000);
    setTimeout(() => createConfetti(), 3000);
}

// Keyboard shortcut to trigger confetti
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
        createConfetti();
        animateConfetti();
    }
});

// Music/sound effect (optional)
// Uncomment to add birthday song
/*
function playBirthdayMusic() {
    const audio = new Audio('path/to/birthday-song.mp3');
    audio.play().catch(e => console.log('Audio play failed:', e));
}

window.addEventListener('load', () => {
    playBirthdayMusic();
});
*/

// Create particles on mouse move (optional fun feature)
document.addEventListener('mousemove', (e) => {
    // You can add sparkle effects here
});

// Love message on specific time
function showTimeBasedMessage() {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 12) {
        console.log('Good morning, my love! 🌅');
    } else if (hour >= 12 && hour < 18) {
        console.log('Good afternoon! Hope your day is amazing! 🌞');
    } else {
        console.log('Good evening! 🌙 Hope you had the best birthday!');
    }
}

window.addEventListener('load', showTimeBasedMessage);

// Prevent scrolling on load to show hero section
window.addEventListener('load', () => {
    window.scrollTo(0, 0);
});
