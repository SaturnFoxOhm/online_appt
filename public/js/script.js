window.addEventListener('resize', function() {
    var checkElement = document.getElementById('check');
    if (checkElement) {
        if (window.matchMedia('(min-width: 845px)').matches) {
            checkElement.checked = false;
        }
    }
}, true);

const sr = ScrollReveal ({
    distance: '65px',
    duration: 2600,
    delay: 450,
    reset: true
});

sr.reveal('.intro-text', {delay:200, origin: 'top'});
sr.reveal('.intro-img', {delay:500, origin: 'top'});
sr.reveal('.about-topic', {delay:200, origin: 'bottom'});
sr.reveal('.about-subtopic', {delay:200, origin: 'bottom'});
sr.reveal('.about-img', {delay:500, origin: 'left'});
sr.reveal('.about-text', {delay:700, origin: 'right'});