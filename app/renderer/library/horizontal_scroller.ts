let el: HTMLElement | null = null;

function scrollHorizontally(e: WheelEvent & { wheelDelta?: number; detail?: number }) {
    e.preventDefault();
    if (el) el.scrollLeft -= ((e as { wheelDelta?: number }).wheelDelta || -(e.detail ?? 0)) * 0.5;
}

function init(set_el: HTMLElement | null) {
    if (!set_el) {
        return;
    }

    el = set_el;
    if (el.addEventListener) {
        el.addEventListener("mousewheel", scrollHorizontally as EventListener, false);
        el.addEventListener("DOMMouseScroll", scrollHorizontally as EventListener, false);
    } else {
        (
            el as unknown as { attachEvent: (event: string, handler: EventListener) => void }
        ).attachEvent("onmousewheel", scrollHorizontally as EventListener);
    }
}

export default init;
