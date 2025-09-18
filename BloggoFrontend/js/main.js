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


