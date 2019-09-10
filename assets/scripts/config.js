document.addEventListener('DOMContentLoaded', evaluateSchedule);

function debounce(fn, milli = 200) {
  let timer;
  return () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(fn, milli);
  };
}

const evaluateScheduleFn = debounce(function () {
  const evalEl = document.querySelector('#evaluate');
  const schedEl = document.querySelector('#schedule');
  try {
    evalEl.innerHTML = cronstrue.toString(schedEl.value);
    schedEl.classList.remove("is-danger");
  } catch (e) {
    evalEl.innerHTML = e
    schedEl.classList.add("is-danger");
  }
})




function evaluateSchedule() {
  evaluateScheduleFn();
}