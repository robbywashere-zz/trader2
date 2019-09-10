const is = (className, bool) => bool ? "is-" + className : "";
module.exports = (pages) => ({
  active,
  enabled
}) => /*html*/ `<nav class="navbar is-primary" >
    <div class="container">
        <div class="navbar-brand">
            <div id="indicator" class="${enabled ? 'on' : 'off' }"></div>
            <a href="/home" class="navbar-item">
               Trader 
            </a>
        </div>
        <div class="navbar-menu" id="navMenu">
            <div class="navbar-start">
              ${pages.map(p=> `<a href="/${p}" class="navbar-item ${is('active',p===active)}">${p}</a>`).join('')}
              <a href="/logout" onclick="return confirm('logout?')" class="navbar-item">logout</a>
            </div>
        </div>
    </div>
</nav>`