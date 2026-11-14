/**
 * Booking form.
 * Row 1: intro copy (eyebrow, heading, text, list of "→benefit" items).
 * Row 2: one paragraph per field, authored as "Label | type | option, option…".
 *   types: text/email/tel/date/… (input), select, toggle (pill buttons),
 *   submit (button); "note | text" is the small print under the form.
 * There is no backend: submit is handled client-side, as on the source.
 */

/* adjacent fields laid out side by side (label prefixes) */
const PAIRS = [['date', 'time'], ['email', 'phone']];

const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function parseSpec(text) {
  const [label = '', type = '', options = ''] = text.split('|').map((s) => s.trim());
  return {
    label,
    type: (type || 'text').toLowerCase(),
    rawType: type,
    options: options.split(',').map((o) => o.trim()).filter(Boolean),
  };
}

function buildField({
  label, type, rawType, options,
}) {
  if (label.toLowerCase() === 'note' || type === 'note') {
    return el('p', 'booking-form-note', label.toLowerCase() === 'note' ? rawType : options.join(', '));
  }

  if (type === 'submit') {
    const button = el('button', 'booking-form-submit');
    button.type = 'submit';
    const arrow = el('span', 'booking-form-submit-arrow', '→');
    arrow.setAttribute('aria-hidden', 'true');
    button.append(el('span', '', label.replace(/→\s*$/, '').trim()), arrow);
    return button;
  }

  const field = el('label', 'booking-form-field');
  field.append(el('span', 'booking-form-label', label));

  if (type === 'select') {
    const select = el('select');
    select.id = slug(label);
    select.append(...options.map((o) => el('option', '', o)));
    field.append(select);
  } else if (type === 'toggle') {
    field.classList.add('booking-form-field--toggle');
    const group = el('div', 'booking-form-toggle');
    group.setAttribute('role', 'group');
    options.forEach((o) => {
      const button = el('button', '', o);
      button.type = 'button';
      button.addEventListener('click', () => {
        button.classList.toggle('is-active');
        button.setAttribute('aria-pressed', button.classList.contains('is-active'));
      });
      group.append(button);
    });
    field.append(group);
  } else {
    const input = el('input');
    input.type = type;
    input.id = slug(label);
    field.append(input);
  }
  return field;
}

function decorateCopy(row) {
  const copy = el('div', 'booking-form-copy');
  if (!row) return copy;
  copy.append(...row.children);
  copy.querySelectorAll('ul li').forEach((li) => {
    const m = li.textContent.trim().match(/^([→▸►·-])\s*(.*)$/);
    if (!m) return;
    const marker = el('span', 'booking-form-marker', m[1]);
    marker.setAttribute('aria-hidden', 'true');
    li.replaceChildren(marker, el('span', '', m[2]));
  });
  return copy;
}

export default function decorate(block) {
  const [copyRow, formRow] = [...block.children];

  const form = el('form', 'booking-form-form');
  form.noValidate = true;

  if (formRow) {
    let sources = [...formRow.children];
    if (sources.length === 1 && sources[0].querySelector('p')) sources = [...sources[0].children];
    const fields = sources
      .map((p) => p.textContent.trim())
      .filter(Boolean)
      .map(parseSpec)
      .map((spec) => ({ key: spec.label.toLowerCase(), node: buildField(spec) }));

    for (let i = 0; i < fields.length; i += 1) {
      const { key, node } = fields[i];
      const pair = PAIRS.find(([a]) => key.startsWith(a));
      const next = fields[i + 1];
      if (pair && next && next.key.startsWith(pair[1])) {
        const row = el('div', 'booking-form-row');
        row.append(node, next.node);
        form.append(row);
        i += 1;
      } else {
        form.append(node);
      }
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.classList.add('is-submitted');
  });

  block.replaceChildren(decorateCopy(copyRow), form);
}
