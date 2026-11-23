/* Resolve before paint; only the appearance preference is persisted. */
(() => {
  const key = 'fermi-appearance';
  const media = matchMedia('(prefers-color-scheme: dark)');
  let choice = 'system';
  try { const saved = localStorage.getItem(key); if (['light','dark','system'].includes(saved)) choice = saved; } catch {}
  const apply = () => {
    const dark = choice === 'dark' || (choice === 'system' && media.matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.dataset.appearance = choice;
    document.querySelectorAll('select[data-appearance]').forEach(select => {
      select.value = choice;
      const trigger = select.parentElement.querySelector('.doc-select-trigger');
      if (trigger) {
        trigger.querySelector('span').textContent = select.selectedOptions[0].text;
        trigger.setAttribute('aria-label', `外观：${select.selectedOptions[0].text}`);
      }
    });
    document.querySelectorAll('.sidebar-brand-logo, .mobile-auth-logo, .mobile-drawer-logo').forEach(img => {
      img.dataset.lightSrc ||= img.getAttribute('src');
      img.src = dark ? `assets/fermiverse-${img.classList.contains('mobile-drawer-logo') ? 'wordmark' : 'bilingual'}-dark.svg` : img.dataset.lightSrc;
    });
  };
  window.FermiTheme = {
    get: () => choice,
    set: next => {
      if (!['light','dark','system'].includes(next)) return;
      choice = next;
      try { localStorage.setItem(key,next); } catch {}
      apply();
    }
  };
  media.addEventListener('change', () => { if (choice === 'system') apply(); });
  apply();
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('select[data-appearance]')?.addEventListener('change', e => FermiTheme.set(e.target.value));
    apply();
  });
})();
