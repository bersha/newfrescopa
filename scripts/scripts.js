import {
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  buildBlock,
  readBlockConfig,
  toClassName,
} from './aem.js';

if (window.trustedTypes && window.trustedTypes.createPolicy) {
  const innerTT = window.trustedTypes.createPolicy('tt-inner', {
    createHTML: (s) => s, // avoid stack overflow
  });

  window.trustedTypes.createPolicy('default', {
    createHTML: (input, type, sink) => {
      let processedInput = input;
      if (/srcdoc\s*=/i.test(processedInput)) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('iframe[srcdoc]').forEach((el) => el.removeAttribute('srcdoc'));
        processedInput = doc.body.innerHTML;
      }
      if (sink.includes('createContextualFragment') || sink.includes('Document write')) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('script').forEach((el) => el.remove());
        processedInput = doc.body.innerHTML;
      }
      return processedInput;
    },
    createScriptURL: (input) => input,
    createScript: (input) => input,
  });
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Turns `/widgets/...` links into widget blocks.
 * @param {Element} main The container element
 */
function buildWidgetAutoBlocks(main) {
  const widgetLinks = [...main.querySelectorAll('a[href*="/widgets/"]')];
  widgetLinks.forEach((link) => {
    if (link.closest('.widget')) return;
    const newLink = link.cloneNode(true);
    const widgetBlock = buildBlock('widget', { elems: [newLink] });
    const p = link.closest('p');
    if (
      p
      && p.querySelectorAll('a').length === 1
      && p.querySelector('a') === link
      && p.textContent.trim() === link.textContent.trim()
    ) {
      p.replaceWith(widgetBlock);
    } else {
      link.replaceWith(widgetBlock);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }
    buildWidgetAutoBlocks(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Applies `section-metadata` blocks: `style` values become section classes,
 * other keys become data attributes. The block itself is removed.
 * @param {Element} main The main element
 */
function decorateSectionMetadata(main) {
  main.querySelectorAll(':scope > .section .section-metadata').forEach((meta) => {
    const section = meta.closest('.section');
    const config = readBlockConfig(meta);
    Object.entries(config).forEach(([key, value]) => {
      if (key === 'style') {
        value.split(',').map((style) => toClassName(style.trim())).filter(Boolean)
          .forEach((style) => section.classList.add(style));
      } else {
        const prop = toClassName(key).replace(/-([a-z])/g, (m) => m[1].toUpperCase());
        section.dataset[prop] = value;
      }
    });
    const wrapper = meta.parentElement;
    meta.remove();
    if (wrapper?.classList.contains('section-metadata-wrapper') && !wrapper.children.length) {
      wrapper.remove();
    }
  });
}

/**
 * Scroll reveal: default-content children and blocks of every section after
 * the first fade and rise in as they enter the viewport.
 * @param {Element} main The main element
 */
function decorateScrollReveal(main) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  [...main.querySelectorAll(':scope > .section')].slice(1).forEach((section) => {
    const targets = [
      ...section.querySelectorAll(':scope > .default-content-wrapper > *'),
      ...section.querySelectorAll(':scope > div[class$="-wrapper"] > .block'),
    ];
    targets.forEach((el, i) => {
      el.classList.add('reveal');
      el.style.setProperty('--reveal-delay', `${Math.min(i * 0.08, 0.32)}s`);
      observer.observe(el);
    });
  });
}

/**
 * Builds a breadcrumb nav from [label, href] pairs; the last crumb is current.
 * @param {string} className nav class
 * @param {Array<[string, string|null]>} crumbs label/href pairs
 * @returns {HTMLElement} the breadcrumb nav
 */
function buildBreadcrumb(className, crumbs) {
  const nav = document.createElement('nav');
  nav.className = className;
  nav.setAttribute('aria-label', 'Breadcrumb');
  crumbs.forEach(([label, href], i) => {
    if (i > 0) {
      const sep = document.createElement('span');
      sep.setAttribute('aria-hidden', 'true');
      sep.textContent = '/';
      nav.append(sep);
    }
    const crumb = document.createElement(href ? 'a' : 'span');
    if (href) crumb.href = href;
    if (i === crumbs.length - 1) crumb.setAttribute('aria-current', 'page');
    crumb.textContent = label;
    nav.append(crumb);
  });
  return nav;
}

/**
 * Catalogue pages (with a machine-filter bar): "Home / <Page>" breadcrumb
 * above the intro heading, the label derived from the URL.
 * @param {Element} main The main element
 */
/**
 * The page's own path: the canonical URL's path when present (prototype and preview
 * hosts serve the page under another URL), else the location's.
 * @returns {string}
 */
export function pagePath() {
  const canonical = document.querySelector('link[rel="canonical"]')?.href;
  try {
    if (canonical) return new URL(canonical).pathname;
  } catch (e) { /* malformed canonical: fall back */ }
  return window.location.pathname;
}

function decorateCatalogueBreadcrumb(main) {
  if (!main.querySelector('.machine-filter')) return;
  const intro = [...main.querySelectorAll(':scope > .section')].find((s) => s.querySelector('h1'));
  const wrapper = intro?.querySelector('.default-content-wrapper');
  if (!wrapper?.querySelector('h1')) return;
  const pathname = pagePath();
  const label = (pathname.replace(/\/$/, '').split('/').pop() || '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  wrapper.prepend(buildBreadcrumb('page-breadcrumb', [
    ['Home', pathname.replace(/[^/]+$/, '')],
    [label, null],
  ]));
}

/**
 * Machine-catalogue band heads: eyebrow / heading / lede on the left and the
 * trailing paragraph as a "How they differ" note on the right.
 * @param {Element} main The main element
 */
function decorateMachineBandHeads(main) {
  main.querySelectorAll(':scope > .section:has(.cards-machine) > .default-content-wrapper').forEach((wrapper) => {
    const kids = [...wrapper.children];
    const paragraphs = kids.filter((el) => el.tagName === 'P');
    if (!kids.some((el) => el.tagName === 'H2') || paragraphs.length < 2) return;
    const note = paragraphs[paragraphs.length - 1];

    const copy = document.createElement('div');
    copy.className = 'section-head-copy';
    copy.append(...kids.filter((el) => el !== note));

    const aside = document.createElement('div');
    aside.className = 'section-head-note';
    const label = document.createElement('span');
    label.className = 'section-head-note-label';
    label.textContent = 'How they differ';
    aside.append(label, note);

    wrapper.classList.add('section-head-split');
    wrapper.append(copy, aside);
  });
}

/**
 * Journal article: turns the flat "The Journal / Category" paragraph into a
 * breadcrumb and groups the header copy and top byline into `.article-header`.
 * @param {Element} main The main element
 */
function decorateArticleHeader(main) {
  const section = main.querySelector(':scope > .section:has(.article-byline)');
  const copy = section?.querySelector(':scope > .default-content-wrapper');
  const crumb = copy?.querySelector(':scope > p:first-child');
  if (!crumb || !crumb.textContent.includes('/')) return;

  const parts = crumb.textContent.split('/').map((s) => s.trim()).filter(Boolean);
  const blogHref = pagePath().replace(/[^/]+$/, 'blog');
  crumb.replaceWith(buildBreadcrumb('article-breadcrumb', parts.map((p, i) => [p, i === 0 ? blogHref : null])));

  const header = document.createElement('div');
  header.className = 'article-header';
  section.insertBefore(header, copy);
  header.append(copy);
  const byline = section.querySelector(':scope > .article-byline-wrapper');
  if (byline) header.append(byline);
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateSectionMetadata(main);
  decorateBlocks(main);
  decorateButtons(main);
  decorateCatalogueBreadcrumb(main);
  decorateMachineBandHeads(main);
  decorateArticleHeader(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  import('./martech.js').then((m) => m.loadConsent());
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('body > header'));

  const main = doc.querySelector('main');
  await loadSections(main);
  decorateScrollReveal(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('body > footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  import('./martech.js').then((m) => m.loadTags());
  import('./consent-check.js');
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
