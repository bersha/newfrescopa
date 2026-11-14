import { decorateMain } from '../../scripts/scripts.js';
import { loadSections, readBlockConfig } from '../../scripts/aem.js';

/*
 * OF1 generative assistant. The block is a thin mount for the source's own
 * assistant service (third-party embed passthrough): the worker's client SDK
 * renders the landing UI (title, input, suggestion chips) and streams generated
 * sections; this block supplies the config and the EDS decoration hook, and
 * of1.css skins the UI in the Fréscopa brand.
 * Config rows: api-endpoint · domain · engine (optional: title, subtitle, placeholder).
 */

const WORKER = 'https://of1-gen-web-service.franklin-prod.workers.dev';

// Streamed sections arrive as authored HTML; decorate and load them like page sections.
async function decorateAndLoad(sectionHtml) {
  const main = document.createElement('main');
  main.innerHTML = `<div>${sectionHtml}</div>`;
  decorateMain(main);
  await loadSections(main);
  return [...main.querySelectorAll(':scope > div')];
}

function resolveDomain() {
  const meta = document.querySelector('meta[name="domain"]')?.content;
  if (meta?.includes('--')) return meta;
  const host = window.location.hostname;
  if (/\.aem\.(page|live)$/.test(host)) return host.replace(/\.aem\.(page|live)$/, '');
  return meta || host;
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  config['api-endpoint'] = config['api-endpoint'] || WORKER;
  config.domain = config.domain || resolveDomain();

  if (!document.querySelector('meta[name="domain"]')) {
    const meta = document.createElement('meta');
    meta.name = 'domain';
    meta.content = config.domain;
    document.head.append(meta);
  }

  block.textContent = '';
  try {
    const { init } = await import(`${config['api-endpoint']}/sdk/of1-client.js`);
    await init(block, config, { decorateAndLoad });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('of1: assistant service unavailable', e);
  }
}
