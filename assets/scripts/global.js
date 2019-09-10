/*document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('[href="/logout"]').addEventListener('click', (e) => confirm('logout?') ? true : e.preventDefault())
});*/

document.addEventListener('DOMContentLoaded', () => {
  for (let el of document.querySelectorAll('.navbar-burger')) {
    el.addEventListener('click', () => {
      el.classList.toggle('is-active');
      document.getElementById(el.dataset.target)
        .classList.toggle('is-active');
    });
  }
});