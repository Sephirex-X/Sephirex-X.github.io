class BeforeAfter {
    constructor(enteryObject) {

        const beforeAfterContainer = document.querySelector(enteryObject.id);
        const before = beforeAfterContainer.querySelector('.bal-before');
        const beforeText = beforeAfterContainer.querySelector('.bal-beforePosition');
        const afterText = beforeAfterContainer.querySelector('.bal-afterPosition');
        const handle = beforeAfterContainer.querySelector('.bal-handle');
        var widthChange = 0;

        beforeAfterContainer.querySelector('.bal-before-inset').setAttribute("style", "width: " + beforeAfterContainer.offsetWidth + "px;")
        window.onresize = function () {
            beforeAfterContainer.querySelector('.bal-before-inset').setAttribute("style", "width: " + beforeAfterContainer.offsetWidth + "px;")
        }
        before.setAttribute('style', "width: 50%;");
        handle.setAttribute('style', "left: 50%;");

        //touch screen event listener
        beforeAfterContainer.addEventListener("touchstart", (e) => {

            beforeAfterContainer.addEventListener("touchmove", (e2) => {
                let containerWidth = beforeAfterContainer.offsetWidth;
                let currentPoint = e2.changedTouches[0].clientX;

                let startOfDiv = beforeAfterContainer.offsetLeft;

                let modifiedCurrentPoint = currentPoint - startOfDiv;

                if (modifiedCurrentPoint > 10 && modifiedCurrentPoint < beforeAfterContainer.offsetWidth - 10) {
                    let newWidth = modifiedCurrentPoint * 100 / containerWidth;

                    before.setAttribute('style', "width:" + newWidth + "%;");
                    afterText.setAttribute('style', "z-index: 1;");
                    handle.setAttribute('style', "left:" + newWidth + "%;");
                }
            });
        });

        //mouse move event listener
        beforeAfterContainer.addEventListener('mousemove', (e) => {
            let containerWidth = beforeAfterContainer.offsetWidth;
            widthChange = e.offsetX;
            let newWidth = widthChange * 100 / containerWidth;

            if (e.offsetX > 10 && e.offsetX < beforeAfterContainer.offsetWidth - 10) {
                before.setAttribute('style', "width:" + newWidth + "%;");
                afterText.setAttribute('style', "z-index:" + "1;");
                handle.setAttribute('style', "left:" + newWidth + "%;");
            }
        })

    }
}

document.addEventListener('DOMContentLoaded', () => {
    const videos = document.querySelectorAll('video');

    const loadVideoSources = (video) => {
        if (video.dataset.loaded === 'true') {
            return;
        }

        const lazySources = video.querySelectorAll('source[data-src]');
        lazySources.forEach((source) => {
            source.src = source.dataset.src;
            source.removeAttribute('data-src');
        });

        if (lazySources.length > 0) {
            video.load();
        }

        video.dataset.loaded = 'true';
    };

    const applyPlaybackRate = (video) => {
        const playbackRate = parseFloat(video.dataset.playbackRate || '1');

        if (Number.isFinite(playbackRate)) {
            video.playbackRate = playbackRate;
        }

        video.addEventListener('loadedmetadata', () => {
            const rate = parseFloat(video.dataset.playbackRate || '1');
            if (Number.isFinite(rate)) {
                video.playbackRate = rate;
            }
        }, { once: true });
    };

    videos.forEach((video) => {
        applyPlaybackRate(video);
    });

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    loadVideoSources(video);
                    const playPromise = video.play();
                    if (playPromise) {
                        playPromise.catch(() => {});
                    }
                } else {
                    video.pause();
                }
            });
        }, {
            rootMargin: '200px 0px',
            threshold: 0.25,
        });

        videos.forEach((video) => {
            if (video.muted && video.loop) {
                observer.observe(video);
            }
        });
    } else {
        videos.forEach(loadVideoSources);
    }
});
