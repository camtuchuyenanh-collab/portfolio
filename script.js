const navLinks = [...document.querySelectorAll('.nav-link')];
const sections = [...document.querySelectorAll('[data-section]')];
const menu = document.querySelector('.navigation');
const menuToggle = document.querySelector('[data-menu-toggle]');
const themeToggle = document.querySelector('[data-theme-toggle]');
const searchDialog = document.querySelector('[data-search-dialog]');
const searchInput = document.querySelector('[data-search-input]');
const searchResults = document.querySelector('[data-search-results]');
const searchHint = document.querySelector('[data-search-hint]');

document.querySelector('[data-year]').textContent = new Date().getFullYear();

const savedTheme = localStorage.getItem('cam-tu-theme');
if (savedTheme === 'dark') document.body.classList.add('dark');
themeToggle.setAttribute('aria-label', document.body.classList.contains('dark') ? 'Switch to light mode' : 'Switch to dark mode');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const dark = document.body.classList.contains('dark');
  localStorage.setItem('cam-tu-theme', dark ? 'dark' : 'light');
  themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
});

menuToggle.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
navLinks.forEach(link => link.addEventListener('click', () => {
  navLinks.forEach(item => item.classList.toggle('active', item === link));
  menu.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

const sectionObserver = new IntersectionObserver(entries => {
  const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  navLinks.forEach(link => link.classList.toggle('active', link.hash === `#${visible.target.id}`));
}, { rootMargin: '-20% 0px -65% 0px', threshold: [0, .15, .4] });
sections.forEach(section => sectionObserver.observe(section));

const openSearch = () => {
  if (!searchDialog.open) searchDialog.showModal();
  searchInput.focus();
};
document.querySelector('[data-open-search]').addEventListener('click', openSearch);
document.addEventListener('keydown', event => {
  if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    event.preventDefault(); openSearch();
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault(); openSearch();
  }
});
searchDialog.addEventListener('click', event => {
  if (event.target === searchDialog) searchDialog.close();
});

const searchable = sections.map(section => ({
  id: section.id,
  title: section.querySelector('.eyebrow')?.textContent ?? section.id,
  text: section.innerText.toLowerCase(),
}));
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  searchResults.replaceChildren();
  if (!query) { searchHint.textContent = 'Search the sections on this page.'; return; }
  const matches = searchable.filter(item => item.text.includes(query) || item.title.toLowerCase().includes(query));
  searchHint.textContent = matches.length ? `${matches.length} section${matches.length === 1 ? '' : 's'} found` : 'No matching sections. Try another keyword.';
  matches.forEach(item => {
    const link = document.createElement('a');
    link.className = 'search-result';
    link.href = `#${item.id}`;
    link.innerHTML = `${item.title}<small>Open section</small>`;
    link.addEventListener('click', () => searchDialog.close());
    searchResults.append(link);
  });
});
