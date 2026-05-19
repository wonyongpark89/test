/*
  The Grenfell Curriculum — shared JavaScript
  ------------------------------------------
  - Mobile navigation toggle
  - Automatically sorted selected news cards
  - Resource repository search/filter controls
  - Footer year update
*/

(function () {
  const body = document.body;
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-site-nav]');

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = body.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        body.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && body.classList.contains('nav-open')) {
        body.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
  }

  const year = document.querySelector('[data-current-year]');
  if (year) year.textContent = new Date().getFullYear();

  // Selected updates shown on the home page.
  // Add future updates here; items marked selected: true will be sorted by date and displayed automatically.
  const NEWS_ITEMS = [
    {
      title: 'CPD course launched',
      date: '2026-04-01',
      displayDate: 'April 2026',
      summary: 'The free online course Teaching about Grenfell: Education and Social Justice after Disasters is available on Canvas.',
      href: 'https://canvas.instructure.com/courses/13952145/modules',
      external: true,
      linkText: 'Access the course',
      selected: true
    },
    {
      title: 'Pilot lesson completed in North Kensington',
      date: '2026-02-01',
      displayDate: 'February 2026',
      summary: 'A Year 5 pilot lesson explored remembrance through poetry, structured discussion and careful preparation.',
      href: 'resources/',
      linkText: 'See related outputs',
      selected: true
    },
    {
      title: 'Community recommendations report published',
      date: '2025-07-01',
      displayDate: 'July 2025',
      summary: 'The report sets out community-informed recommendations for what teaching about Grenfell should include and why it matters.',
      href: 'resources/',
      linkText: 'Find the report',
      selected: true
    },
    {
      title: 'Engineering ethics lesson pack added',
      date: '2026-05-19',
      displayDate: 'May 2026',
      summary: 'A KS4 Design &amp; Technology lesson pack, Engineering Ethics: When Buildings Fail, is now available with a scheme of work, slides and student activity sheet.',
      href: 'resources/#repository',
      linkText: 'Download the pack',
      selected: true
    }
  ];

  const newsList = document.querySelector('[data-news-list]');
  if (newsList) {
    const selectedNews = NEWS_ITEMS
      .filter((item) => item.selected)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4);

    newsList.innerHTML = selectedNews.map((item) => {
      const attrs = item.external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `
        <article class="card news-card">
          <h3>${item.title}</h3>
          <p class="meta">${item.displayDate}</p>
          <p>${item.summary}</p>
          <a class="btn secondary" href="${item.href}"${attrs}>${item.linkText}</a>
        </article>`;
    }).join('');
  }

  // Searchable and filterable resources page.
  const resourceList = document.querySelector('[data-resource-list]');
  if (!resourceList) return;

  const cards = Array.from(resourceList.querySelectorAll('[data-resource-card]'));
  const searchInput = document.querySelector('[data-resource-search]');
  const filters = Array.from(document.querySelectorAll('[data-resource-filter]'));
  const resetButton = document.querySelector('[data-resource-reset]');
  const count = document.querySelector('[data-resource-count]');

  function normalise(value) {
    return String(value || '').trim().toLowerCase();
  }

  function splitValues(value) {
    return String(value || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function valueInList(needle, haystack) {
    if (!needle) return true;
    return splitValues(haystack).some((item) => normalise(item) === normalise(needle));
  }

  function populateFilterOptions() {
    filters.forEach((filter) => {
      const key = filter.dataset.resourceFilter;
      const currentValue = filter.value;
      const defaultOption = filter.querySelector('option[value=""]');
      const defaultText = defaultOption ? defaultOption.textContent : 'All';

      const values = Array.from(new Set(cards.flatMap((card) => splitValues(card.dataset[key]))))
        .sort((a, b) => a.localeCompare(b, 'en-GB', { sensitivity: 'base' }));

      filter.innerHTML = '';

      const allOption = document.createElement('option');
      allOption.value = '';
      allOption.textContent = defaultText;
      filter.appendChild(allOption);

      values.forEach((value) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        filter.appendChild(option);
      });

      if (values.includes(currentValue)) filter.value = currentValue;
    });
  }

  function filterCards() {
    const query = normalise(searchInput ? searchInput.value : '');
    const activeFilters = filters.map((filter) => ({
      key: filter.dataset.resourceFilter,
      value: filter.value
    })).filter((filter) => filter.value);

    let visibleCount = 0;

    cards.forEach((card) => {
      const searchableText = normalise(card.dataset.search || card.textContent);
      const matchesQuery = !query || searchableText.includes(query);
      const matchesFilters = activeFilters.every((filter) => valueInList(filter.value, card.dataset[filter.key]));
      const isVisible = matchesQuery && matchesFilters;
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    if (count) {
      const noun = visibleCount === 1 ? 'resource' : 'resources';
      count.textContent = `${visibleCount} ${noun} shown`;
    }
  }

  populateFilterOptions();

  if (searchInput) searchInput.addEventListener('input', filterCards);
  filters.forEach((filter) => filter.addEventListener('change', filterCards));
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      filters.forEach((filter) => { filter.value = ''; });
      filterCards();
    });
  }

  filterCards();
})();