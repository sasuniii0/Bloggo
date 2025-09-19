// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Carousel logic
const track = document.getElementById('track');
const slides = Array.from(track.children);
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const dotsWrap = document.getElementById('dots');

let index = 0;
let timer = null;

// Build dots
slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.setAttribute('aria-label', `Go to slide ${i+1}`);
    dot.addEventListener('click', () => goTo(i, true));
    dotsWrap.appendChild(dot);
});

function update(){
    const width = track.clientWidth;
    track.style.transform = `translateX(-${index * width}px)`;
    [...dotsWrap.children].forEach((d, i) => d.setAttribute('aria-current', i===index));
}

function goTo(i, user=false){
    index = (i + slides.length) % slides.length;
    update();
    if(user){ resetAutoplay(); }
}

function next(){ goTo(index+1); }
function prev(){ goTo(index-1); }

nextBtn.addEventListener('click', () => next());
prevBtn.addEventListener('click', () => prev());

// Autoplay
function startAutoplay(){ timer = setInterval(next, 4000); }
function stopAutoplay(){ clearInterval(timer); }
function resetAutoplay(){ stopAutoplay(); startAutoplay(); }

const carousel = document.getElementById('carousel');
carousel.addEventListener('mouseenter', stopAutoplay);
carousel.addEventListener('mouseleave', startAutoplay);

window.addEventListener('resize', update);

// Init
goTo(0);
startAutoplay();

// Demo CTA clicks (replace with real routes)
document.getElementById('signup-btn').addEventListener('click', () => {
    Swal.fire({
        icon: 'info',
        title: 'Navigation',
        text: 'Route to /signup',
        confirmButtonText: 'OK'
    });
});

document.getElementById('login-btn').addEventListener('click', () => {
    Swal.fire({
        icon: 'info',
        title: 'Navigation',
        text: 'Route to /login',
        confirmButtonText: 'OK'
    });
});

document.getElementById('cta-start').addEventListener('click', () => {
    Swal.fire({
        icon: 'info',
        title: 'Navigation',
        text: 'Route to /editor/new',
        confirmButtonText: 'OK'
    });
});

document.getElementById('cta-join').addEventListener('click', () => {
    Swal.fire({
        icon: 'info',
        title: 'Navigation',
        text: 'Route to /register',
        confirmButtonText: 'OK'
    });
});

document.getElementById('google-auth').addEventListener('click', () => {
    Swal.fire({
        icon: 'info',
        title: 'OAuth',
        text: 'Google OAuth',
        confirmButtonText: 'OK'
    });
});

document.getElementById('facebook-auth').addEventListener('click', () => {
    Swal.fire({
        icon: 'info',
        title: 'OAuth',
        text: 'Facebook OAuth',
        confirmButtonText: 'OK'
    });
});

document.getElementById('linkedin-auth').addEventListener('click', () => {
    Swal.fire({
        icon: 'info',
        title: 'OAuth',
        text: 'LinkedIn OAuth',
        confirmButtonText: 'OK'
    });
});
    // Set current year
    document.getElementById('year').textContent = new Date().getFullYear();

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

    // Add intersection observer for animations
    const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

    const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

    // Observe category cards
    document.querySelectorAll('.cat-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

