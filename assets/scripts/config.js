document.addEventListener('DOMContentLoaded', function() {
    evaluateSchedule();
    const runonceEl = document.querySelector('#runonce');
    runonceEl.addEventListener('click', function() {
        if (this.checked) {
            document.querySelector('.schedule').style.opacity = 0.5;
            document.querySelector('.schedule input').disabled = true;
        } else {
            document.querySelector('.schedule').style.opacity = 1;
            document.querySelector('.schedule input').disabled = false;
        }
    });
});

function debounce(fn, milli = 200) {
    let timer;
    return () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(fn, milli);
    };
}

const evaluateScheduleFn = debounce(function() {
    const evalEl = document.querySelector('#evaluate');
    const schedEl = document.querySelector('#schedule');
    try {
        evalEl.innerHTML = cronstrue.toString(schedEl.value);
        schedEl.classList.remove('is-danger');
    } catch (e) {
        evalEl.innerHTML = e;
        schedEl.classList.add('is-danger');
    }
});

function evaluateSchedule() {
    evaluateScheduleFn();
}
