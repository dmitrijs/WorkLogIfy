let el;

function scrollHorizontally(e) {
    e = window.event || e;
    e.preventDefault();
    el.scrollLeft -= (e.wheelDelta || -e.detail) * 0.5;
}

function init(set_el) {
    if (!set_el) {
        return;
    }

    el = set_el;
    if (el.addEventListener) {
        el.addEventListener('mousewheel', scrollHorizontally, false);
        el.addEventListener('DOMMouseScroll', scrollHorizontally, false);
    } else {
        el.attachEvent('onmousewheel', scrollHorizontally);
    }
}

export default init;