// Мобильное меню: бургер открывает, клик мимо пунктов меню, крестик или Esc закрывают.
{
  const nav = document.querySelector('.site-nav');
  const toggle = nav.querySelector('.site-nav__toggle');
  const menu = nav.querySelector('.site-nav__menu');
  const closeButton = nav.querySelector('.site-nav__close');

  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (open) closeButton.focus();
    else if (menu.contains(document.activeElement)) toggle.focus();
  };

  toggle.addEventListener('click', () => setMenu(true));

  menu.addEventListener('click', (event) => {
    if (nav.classList.contains('is-open') && !event.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) setMenu(false);
  });

  // Back button can restore the page from cache with the menu still open.
  window.addEventListener('pageshow', () => setMenu(false));
}
