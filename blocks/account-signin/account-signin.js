/**
 * Account sign-in (demo form, no backend).
 * Row 1: [field label] [placeholder]   Row 2: [button label]
 * Submitting is prevented — the source page is a client-only demo.
 */
export default function decorate(block) {
  const [fieldRow, buttonRow] = block.children;
  const cell = (row, i) => row?.children[i]?.textContent.trim() || '';
  const id = 'account-signin-email';

  const form = document.createElement('form');
  form.className = 'account-signin-form';
  form.noValidate = true;

  const label = document.createElement('label');
  label.className = 'account-signin-label';
  label.htmlFor = id;
  label.textContent = cell(fieldRow, 0) || 'Email';

  const input = document.createElement('input');
  input.className = 'account-signin-input';
  input.type = 'email';
  input.id = id;
  input.name = 'email';
  input.autocomplete = 'email';
  input.placeholder = cell(fieldRow, 1) || 'you@example.com';

  const button = document.createElement('button');
  button.className = 'account-signin-submit';
  button.type = 'submit';
  button.textContent = (cell(buttonRow, 0) || 'Continue').replace(/\s*→\s*$/, '');
  const arrow = document.createElement('span');
  arrow.className = 'account-signin-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '→';
  button.append(arrow);

  form.addEventListener('submit', (e) => e.preventDefault());
  form.append(label, input, button);
  block.replaceChildren(form);
}
