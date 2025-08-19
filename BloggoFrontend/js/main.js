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
document.getElementById('signup-btn').addEventListener('click', ()=>alert('Route to /signup'));
document.getElementById('login-btn').addEventListener('click', ()=>alert('Route to /login'));
document.getElementById('cta-start').addEventListener('click', ()=>alert('Route to /editor/new'));
document.getElementById('cta-join').addEventListener('click', ()=>alert('Route to /register'));
document.getElementById('google-auth').addEventListener('click', ()=>alert('Google OAuth'));
document.getElementById('facebook-auth').addEventListener('click', ()=>alert('Facebook OAuth'));
document.getElementById('linkedin-auth').addEventListener('click', ()=>alert('LinkedIn OAuth'));