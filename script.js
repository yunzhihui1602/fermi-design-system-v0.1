const navLinks = [...document.querySelectorAll('.nav-link')];
const sections = [...document.querySelectorAll('.doc-section')];
const searchInput = document.querySelector('#docSearch');
const searchPopover = document.querySelector('#searchPopover');
const toast = document.querySelector('#toast');

const iconGallery = document.querySelector('#iconGallery');
const iconSearch = document.querySelector('#iconSearch');
const iconCount = document.querySelector('#iconCount');

const getIconDisplayName = (name) => {
  if (name === 'Name=Icon, Property 2=Close, Property 3=Property 371' || name === 'Icon / Close / Base') return '关闭';
  return name
    .replace(/^Name=/, '')
    .replace(/^Type=/, '')
    .replace(/^Property 1=/, '');
};

const renderIconLibrary = (query = '') => {
  if (!iconGallery || !window.FERMI_ICONS) return;
  const keyword = query.trim().toLowerCase();
  const icons = window.FERMI_ICONS.filter((icon) => (
    `${icon.name} ${getIconDisplayName(icon.name)}`.toLowerCase().includes(keyword)
  ));
  iconGallery.innerHTML = icons.map((icon) => `
    <button type="button" class="icon-item" data-figma-node="${icon.id}" title="点击复制 SVG">
      <span class="icon-art" aria-hidden="true">${icon.svg}</span>
      <span class="icon-item-details"><b>${getIconDisplayName(icon.name)}</b><small>${icon.width} × ${icon.height}px</small></span>
      <code>${icon.id}</code>
    </button>
  `).join('');
  iconCount.textContent = `${icons.length} 个图标`;
};

renderIconLibrary();
iconSearch?.addEventListener('input', () => renderIconLibrary(iconSearch.value));

const FIGMA_ICON_BINDINGS = {
  '#i-search': 'Name=搜索',
  '#i-chevron': 'Name=下',
  '#i-copy': 'Name=复制',
  '#i-success-status': 'Type=Success',
  '#i-close': 'Icon / Close / Base',
  '#i-plus': 'Name=添加',
  '#i-grid': 'Name=表格默认',
  '#i-book': 'Name=文件',
  '#i-code': 'Name=研发',
  '#i-alert': 'Type=Warning',
  '#i-info': 'Type=Info',
  '#i-users': 'Name=客户信息',
  '#i-key': 'Property 1=Password',
  '#i-arrow': 'Name=右',
  '#i-filter': 'Name=筛选'
};

const bindFigmaIcons = (root = document) => {
  if (!window.FERMI_ICONS) return;
  const iconMap = new Map(window.FERMI_ICONS.map((icon) => [icon.name, icon]));
  const replaceWithFigmaIcon = (svg, componentName) => {
    const source = iconMap.get(componentName);
    if (!source) return;
    const template = document.createElement('template');
    const keepNativeColor = componentName === 'Icon / Send / Base';
    template.innerHTML = keepNativeColor ? source.svg : source.svg
      .replace(/fill="#[0-9A-Fa-f]{3,8}"/g, 'fill="currentColor"')
      .replace(/stroke="#[0-9A-Fa-f]{3,8}"/g, 'stroke="currentColor"');
    const replacement = template.content.firstElementChild;
    replacement.setAttribute('aria-hidden', 'true');
    svg.replaceWith(replacement);
  };
  root.querySelectorAll('svg > use').forEach((use) => {
    const componentName = FIGMA_ICON_BINDINGS[use.getAttribute('href')];
    if (!componentName) return;
    replaceWithFigmaIcon(use.parentElement, componentName);
  });
  root.querySelectorAll('svg[data-figma-icon]').forEach((svg) => replaceWithFigmaIcon(svg, svg.dataset.figmaIcon));
};

bindFigmaIcons();

const padDatePart = (value) => String(value).padStart(2, '0');
const formatCalendarDate = (date) => `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
const createCalendarDate = (year, month, day) => new Date(year, month, day, 12);

document.querySelectorAll('[data-date-picker]').forEach((panel) => {
  const mode = panel.dataset.datePicker;
  const title = panel.querySelector('[data-calendar-title]');
  const grid = panel.querySelector('.date-calendar-grid');
  const selection = panel.querySelector('.date-selection');
  const shortcuts = [...panel.querySelectorAll('[data-range]')];
  const anchor = createCalendarDate(2026, 9, 15);
  const state = {
    year: 2026,
    month: 9,
    start: mode === 'range' ? createCalendarDate(2026, 9, 12) : anchor,
    end: mode === 'range' ? createCalendarDate(2026, 9, 18) : null
  };

  const sameDate = (a, b) => a && b && formatCalendarDate(a) === formatCalendarDate(b);
  const updateSelectionText = () => {
    if (!state.start) { selection.textContent = '请选择日期'; return; }
    selection.textContent = mode === 'range' && state.end
      ? `已选择：${formatCalendarDate(state.start)} 至 ${formatCalendarDate(state.end)}`
      : `已选择：${formatCalendarDate(state.start)}`;
  };

  const renderCalendar = () => {
    title.textContent = `${state.year} 年 ${state.month + 1} 月`;
    const firstDay = createCalendarDate(state.year, state.month, 1);
    const mondayOffset = (firstDay.getDay() + 6) % 7;
    const lastDay = new Date(state.year, state.month + 1, 0).getDate();
    const cellCount = Math.ceil((mondayOffset + lastDay) / 7) * 7;
    const startDate = createCalendarDate(state.year, state.month, 1 - mondayOffset);
    grid.innerHTML = '';
    for (let index = 0; index < cellCount; index += 1) {
      const date = createCalendarDate(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + index);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'date-day';
      button.textContent = date.getDate();
      button.dataset.date = formatCalendarDate(date);
      button.setAttribute('role', 'gridcell');
      button.setAttribute('aria-label', formatCalendarDate(date));
      if (date.getMonth() !== state.month) button.classList.add('outside');
      if (mode === 'range' && state.start && state.end && date > state.start && date < state.end) button.classList.add('in-range');
      if (sameDate(date, state.start) || sameDate(date, state.end)) button.classList.add('selected');
      grid.appendChild(button);
    }
    updateSelectionText();
  };

  panel.addEventListener('click', (event) => {
    const monthButton = event.target.closest('[data-month-step]');
    if (monthButton) {
      const next = createCalendarDate(state.year, state.month + Number(monthButton.dataset.monthStep), 1);
      state.year = next.getFullYear();
      state.month = next.getMonth();
      renderCalendar();
      return;
    }

    const shortcut = event.target.closest('[data-range]');
    if (shortcut) {
      shortcuts.forEach((button) => button.classList.toggle('active', button === shortcut));
      const key = shortcut.dataset.range;
      state.year = 2026;
      state.month = 9;
      if (key === 'today') { state.start = anchor; state.end = null; }
      if (key === '7') { state.start = createCalendarDate(2026, 9, 12); state.end = createCalendarDate(2026, 9, 18); }
      if (key === '30') { state.start = createCalendarDate(2026, 9, 1); state.end = createCalendarDate(2026, 9, 30); }
      if (key === 'month') { state.start = createCalendarDate(2026, 9, 1); state.end = createCalendarDate(2026, 9, 31); }
      if (key === 'custom') { state.start = null; state.end = null; }
      if (mode === 'single' && state.start) state.end = null;
      renderCalendar();
      return;
    }

    const day = event.target.closest('.date-day');
    if (!day) return;
    const picked = new Date(`${day.dataset.date}T12:00:00`);
    shortcuts.forEach((button) => button.classList.remove('active'));
    if (mode === 'single') {
      state.start = picked;
      state.end = null;
    } else if (!state.start || state.end) {
      state.start = picked;
      state.end = null;
    } else {
      state.end = picked;
      if (state.end < state.start) [state.start, state.end] = [state.end, state.start];
    }
    state.year = picked.getFullYear();
    state.month = picked.getMonth();
    renderCalendar();
  });

  renderCalendar();
});

document.querySelectorAll('[data-date-trigger]').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    trigger.classList.add('focus');
    document.querySelector('[data-date-picker="single"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});

document.querySelector('[data-quick-range-demo]')?.addEventListener('click', (event) => {
  const button = event.target.closest('button:not(:disabled)');
  if (!button) return;
  event.currentTarget.querySelectorAll('button').forEach((item) => {
    item.classList.toggle('selected', item === button);
    item.setAttribute('aria-pressed', String(item === button));
  });
});

const switchPlayground = document.querySelector('[data-switch-playground]');
if (switchPlayground) {
  const input = switchPlayground.querySelector('[data-switch-input]');
  const lock = switchPlayground.querySelector('[data-switch-lock]');
  const sync = () => { input.disabled = lock.checked; };
  lock.addEventListener('change', sync);
  sync();
}

const modelDiscoveryBoard = document.querySelector('.model-discovery-board');
if (modelDiscoveryBoard) {
  const modelRows = [...modelDiscoveryBoard.querySelectorAll('[data-model-row]')];
  const modelCount = modelDiscoveryBoard.querySelector('[data-model-count]');
  const modelSummary = modelDiscoveryBoard.querySelector('[data-model-summary]');
  const addModels = modelDiscoveryBoard.querySelector('[data-add-models]');
  const modelSearch = modelDiscoveryBoard.querySelector('[data-model-search]');
  const modelTypeTrigger = modelDiscoveryBoard.querySelector('[data-model-type-trigger]');
  const modelTypeMenu = document.querySelector('#modelTypeMenu');
  let activeModelType = 'all';
  const applyModelFilters = () => {
    const keyword = modelSearch?.value.trim().toLowerCase() || '';
    modelRows.forEach((row) => {
      const matchesKeyword = !keyword || row.textContent.toLowerCase().includes(keyword);
      const matchesType = activeModelType === 'all' || row.dataset.modelType === activeModelType;
      row.hidden = !(matchesKeyword && matchesType);
    });
  };
  const placeModelTypeMenu = () => {
    if (!modelTypeMenu || !modelTypeTrigger) return;
    const rect = modelTypeTrigger.getBoundingClientRect();
    const menuWidth = 220;
    const menuHeight = modelTypeMenu.offsetHeight || 120;
    const left = Math.min(rect.left, window.innerWidth - menuWidth - 12);
    const below = rect.bottom + 6;
    const top = below + menuHeight <= window.innerHeight - 12 ? below : rect.top - menuHeight - 6;
    modelTypeMenu.style.left = `${Math.max(12, left)}px`;
    modelTypeMenu.style.top = `${Math.max(12, top)}px`;
  };
  const updateModelSelection = () => {
    const selected = modelRows.filter((row) => row.querySelector('input[type="checkbox"]').checked).length;
    modelRows.forEach((row) => row.classList.toggle('selected', row.querySelector('input[type="checkbox"]').checked));
    modelCount.textContent = `已选 ${selected} / ${modelRows.length}`;
    modelSummary.textContent = `已选 ${selected} 个模型，可继续选择或手动添加模型。`;
    addModels.textContent = `添加已选（${selected}）`;
    addModels.disabled = selected === 0;
  };
  modelRows.forEach((row) => row.querySelector('input[type="checkbox"]').addEventListener('change', updateModelSelection));
  modelSearch?.addEventListener('input', applyModelFilters);
  modelTypeTrigger?.addEventListener('click', () => {
    if (!modelTypeMenu) return;
    if (modelTypeMenu.matches(':popover-open')) {
      modelTypeMenu.hidePopover();
      return;
    }
    modelTypeMenu.querySelectorAll('[data-model-type-option]').forEach((option) => {
      const selected = option.dataset.modelTypeOption === activeModelType;
      option.classList.toggle('selected', selected);
      option.setAttribute('aria-selected', String(selected));
    });
    modelTypeTrigger.classList.add('open');
    modelTypeTrigger.setAttribute('aria-expanded', 'true');
    placeModelTypeMenu();
    modelTypeMenu.showPopover();
  });
  modelTypeMenu?.addEventListener('toggle', (event) => {
    if (event.newState !== 'closed') return;
    modelTypeTrigger?.classList.remove('open');
    modelTypeTrigger?.setAttribute('aria-expanded', 'false');
  });
  modelTypeMenu?.querySelectorAll('[data-model-type-option]').forEach((option) => {
    option.addEventListener('click', () => {
      activeModelType = option.dataset.modelTypeOption;
      const value = modelTypeTrigger?.querySelector('[data-model-type-value]');
      if (value) value.textContent = option.querySelector('span')?.textContent || '全部模型类型';
      applyModelFilters();
      modelTypeMenu.hidePopover();
      modelTypeTrigger?.focus();
    });
  });
  modelDiscoveryBoard.querySelector('[data-refresh-models]')?.addEventListener('click', () => showToast('模型列表已刷新'));
  addModels?.addEventListener('click', () => showToast(`${addModels.textContent} 已加入配置`));
  modelDiscoveryBoard.querySelectorAll('[data-restore-price]').forEach((button) => {
    button.addEventListener('click', () => {
      const row = button.closest('.model-price-row');
      row.querySelectorAll('input').forEach((input) => { input.value = '等自动拉取'; input.disabled = true; });
      const source = row.querySelector('span:nth-of-type(2)');
      if (source) source.textContent = '自动 · 待接入';
      button.textContent = '已恢复自动';
      button.disabled = true;
    });
  });
  updateModelSelection();
}

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 1600);
};

iconGallery?.addEventListener('click', async (event) => {
  const button = event.target.closest('button.icon-item');
  const icon = window.FERMI_ICONS?.find(({ id }) => id === button?.dataset.figmaNode);
  if (!icon) return;

  try {
    await navigator.clipboard.writeText(icon.svg);
    showToast(`已复制「${getIconDisplayName(icon.name)}」SVG`);
  } catch {
    showToast('复制失败，请检查浏览器的剪贴板权限');
  }
});

const observer = new IntersectionObserver((entries) => {
  const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
}, { rootMargin: '-22% 0px -65% 0px', threshold: [0, .2, .6] });
sections.forEach((section) => observer.observe(section));

document.querySelectorAll('.spec-tabs').forEach((tabs) => {
  tabs.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-tab]');
    if (!button) return;
    tabs.querySelectorAll('button').forEach((item) => item.classList.toggle('active', item === button));
    const card = tabs.closest('.component-card');
    card.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.toggle('active', panel.id === button.dataset.tab));
  });
});

document.querySelectorAll('.switch, .workspace-switch').forEach((control) => {
  control.setAttribute('role', 'switch');
  control.setAttribute('aria-checked', String(control.classList.contains('active')));
  control.addEventListener('click', () => {
    if (control.disabled) return;
    control.classList.toggle('active');
    control.setAttribute('aria-checked', String(control.classList.contains('active')));
    control.closest('.tool-card')?.classList.toggle('enabled', control.classList.contains('active'));
  });
});

document.querySelectorAll('.appearance-state').forEach((state) => {
  const options = [...state.querySelectorAll('.appearance-option')];
  const label = state.querySelector(':scope > small');
  options.forEach((option) => {
    option.setAttribute('role', 'button');
    option.setAttribute('tabindex', '0');
    option.setAttribute('aria-pressed', String(option.classList.contains('active')));
    const selectMode = () => {
      options.forEach((item) => {
        const active = item === option;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      if (label) {
        const value = option.textContent.trim();
        label.textContent = `Current=${value === '浅色' ? 'Light' : value === '深色' ? 'Dark' : 'System'}`;
      }
    };
    option.addEventListener('click', selectMode);
    option.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      selectMode();
    });
  });
});

document.querySelectorAll('.core-card-row').forEach((row) => {
  const cards = [...row.querySelectorAll('.core-card:not(:first-child)')];
  cards.forEach((card) => {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-pressed', String(card.classList.contains('selected')));
    const selectCard = () => {
      cards.forEach((item) => {
        const selected = item === card;
        item.classList.toggle('selected', selected);
        item.classList.toggle('interactive', !selected);
        item.setAttribute('aria-pressed', String(selected));
        const stateLabel = item.querySelector('small');
        if (stateLabel) stateLabel.textContent = selected ? 'State=Selected' : 'State=Interactive';
        const title = item.querySelector('h4');
        if (title) title.textContent = selected ? '已选中卡片' : '可交互卡片';
      });
    };
    card.addEventListener('click', selectCard);
    card.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      selectCard();
    });
  });
});

document.querySelectorAll('.demo-tabs').forEach((tabs) => {
  tabs.setAttribute('role', 'tablist');
  tabs.querySelectorAll('button:not(:disabled)').forEach((button) => {
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', String(button.classList.contains('active')));
    button.addEventListener('click', () => {
      tabs.querySelectorAll('button').forEach((item) => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
      });
      const status = tabs.parentElement.querySelector('[data-header-status]');
      if (status) status.textContent = `当前标签：${button.textContent.trim()}`;
    });
  });
});

document.querySelectorAll('.chip-row').forEach((group) => {
  const buttons = [...group.querySelectorAll('button:not(:disabled)')];
  buttons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.classList.contains('selected')));
    button.addEventListener('click', () => {
      buttons.forEach((item) => {
        const selected = item === button;
        item.classList.toggle('selected', selected);
        item.classList.remove('hover');
        item.setAttribute('aria-pressed', String(selected));
      });
    });
  });
});

const filterToolbar = document.querySelector('[data-filter-toolbar]');
if (filterToolbar) {
  const { keyword, state, range } = filterToolbar.elements;
  const reset = filterToolbar.querySelector('[type="reset"]');
  const status = filterToolbar.parentElement.querySelector('[data-filter-count]');
  const records = Array.from({ length: 126 }, (_, index) => ({
    name: index < 18 ? '锂电池实验' : '材料分析',
    state: index < 18 || index % 2 === 0 ? 'running' : 'done',
    age: index < 18 ? index % 7 : 7 + index % 35,
  }));
  const refresh = () => {
    const query = keyword.value.trim();
    const conditions = [query, state.value, range.value].filter(Boolean).length;
    const count = records.filter((record) => (!query || record.name.includes(query)) &&
      (!state.value || record.state === state.value) &&
      (!range.value || record.age < Number(range.value))).length;
    status.textContent = `${conditions ? `已应用 ${conditions} 个条件` : '未应用筛选条件'} · 共 ${count} 条结果`;
    reset.disabled = conditions === 0;
    reset.textContent = conditions ? '重置筛选' : '暂无筛选';
  };
  filterToolbar.addEventListener('input', refresh);
  filterToolbar.addEventListener('change', refresh);
  filterToolbar.addEventListener('reset', () => queueMicrotask(refresh));
  filterToolbar.addEventListener('submit', (event) => event.preventDefault());
  refresh();
}

document.querySelectorAll('[data-number-demo]').forEach((control) => {
  const input = control.querySelector('[data-number-value]');
  const minimum = Number.parseFloat(control.dataset.min ?? '0');
  const maximum = Number.parseFloat(control.dataset.max ?? 'Infinity');
  const step = Number.parseFloat(control.dataset.step ?? '1');
  const actionButtons = [...control.querySelectorAll('[data-number-action]')];
  if (!(input instanceof HTMLInputElement) || control.classList.contains('disabled')) return;

  const clampValue = (candidate) => Math.min(maximum, Math.max(minimum, candidate));
  const updateStepAvailability = () => {
    const current = Number.parseFloat(input.value);
    actionButtons.forEach((button) => {
      const atMinimum = button.dataset.numberAction === 'decrease' && Number.isFinite(current) && current <= minimum;
      const atMaximum = button.dataset.numberAction === 'increase' && Number.isFinite(current) && current >= maximum;
      button.disabled = atMinimum || atMaximum;
      button.title = atMinimum ? '已达到最小值' : atMaximum ? '已达到最大值' : '';
    });
  };

  const commitValue = () => {
    const parsed = Number.parseFloat(input.value);
    input.value = String(clampValue(Number.isFinite(parsed) ? parsed : minimum));
    control.classList.remove('focus');
    updateStepAvailability();
  };

  input.addEventListener('input', () => {
    control.classList.remove('focus');
    updateStepAvailability();
  });
  input.addEventListener('blur', commitValue);

  actionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const current = Number.parseFloat(input.value) || 0;
      const direction = button.dataset.numberAction === 'increase' ? 1 : -1;
      input.value = String(clampValue(current + direction * step));
      control.classList.add('focus');
      updateStepAvailability();
    });
  });

  updateStepAvailability();
});

document.querySelectorAll('[data-core-input]').forEach((input) => {
  const updateInputState = () => {
    const hasValue = input.value.trim().length > 0;
    input.classList.toggle('filled', hasValue);

    if (!input.hasAttribute('data-required')) return;
    const invalid = !hasValue;
    input.classList.toggle('error', invalid);
    input.setAttribute('aria-invalid', String(invalid));
    const note = input.parentElement?.querySelector('.core-input-note');
    note?.classList.toggle('error', invalid);
    if (note) note.textContent = invalid ? '内容不能为空' : '';
  };

  input.addEventListener('input', updateInputState);
  input.addEventListener('blur', updateInputState);
});

document.querySelectorAll('[data-textarea-playground]').forEach((playground) => {
  const control = playground.querySelector('[data-textarea-demo]');
  const textarea = control.querySelector('textarea');
  const counter = control.querySelector('[data-textarea-count]');
  const error = playground.querySelector('[data-textarea-error]');
  const lock = playground.querySelector('[data-textarea-lock]');

  const update = (validate = false) => {
    const invalid = validate && !textarea.disabled && !textarea.value.trim();
    counter.textContent = `${textarea.value.length} / ${textarea.maxLength}`;
    control.classList.toggle('error', invalid);
    textarea.setAttribute('aria-invalid', String(invalid));
    error.hidden = !invalid;
  };

  const syncDisabled = () => {
    textarea.disabled = lock.checked;
    control.classList.toggle('disabled', lock.checked);
    update();
  };

  textarea.addEventListener('input', () => update());
  textarea.addEventListener('blur', () => update(true));
  lock.addEventListener('change', syncDisabled);
  syncDisabled();
});

document.querySelectorAll('[data-number-playground]').forEach((playground) => {
  const control = playground.querySelector('[data-number-input]');
  const input = control.querySelector('[data-number-value]');
  const lock = playground.querySelector('[data-number-lock]');
  const buttons = [...control.querySelectorAll('[data-number-action]')];
  const minimum = Number(input.min);
  const maximum = Number(input.max);

  const syncButtons = () => {
    buttons.forEach((button) => {
      const increase = button.dataset.numberAction === 'increase';
      const atLimit = increase ? input.valueAsNumber >= maximum : input.valueAsNumber <= minimum;
      button.disabled = input.disabled || atLimit;
      button.title = input.disabled ? '数值控件已禁用' : atLimit ? (increase ? '已达到最大值' : '已达到最小值') : '';
    });
  };

  const commit = (offset = 0) => {
    const value = Number.isFinite(input.valueAsNumber) ? Math.round(input.valueAsNumber) : minimum;
    input.value = String(Math.min(maximum, Math.max(minimum, value + offset)));
    syncButtons();
  };

  input.addEventListener('input', syncButtons);
  input.addEventListener('blur', () => commit());
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      input.focus();
      commit(button.dataset.numberAction === 'increase' ? 1 : -1);
    });
  });
  const syncDisabled = () => {
    input.disabled = lock.checked;
    control.classList.toggle('disabled', lock.checked);
    syncButtons();
  };
  lock.addEventListener('change', syncDisabled);
  syncDisabled();
});

const uploadFileInput = document.querySelector('[data-upload-input]');
const uploadLock = document.querySelector('[data-upload-lock]');
const uploadTrigger = document.querySelector('[data-upload-trigger]');
const showFiles = (files) => {
  if (!files.length || uploadLock?.checked) return;
  uploadTrigger.querySelector('b').textContent = files[0].name;
  uploadTrigger.querySelector('small').textContent = `已选择 ${files.length} 个文件`;
};
if (uploadTrigger && uploadLock) {
  const syncLock = () => {
    uploadTrigger.classList.toggle('disabled', uploadLock.checked);
    uploadTrigger.setAttribute('aria-disabled', String(uploadLock.checked));
    uploadTrigger.tabIndex = uploadLock.checked ? -1 : 0;
    uploadFileInput.disabled = uploadLock.checked;
  };
  uploadLock.addEventListener('change', syncLock);
  syncLock();
  uploadTrigger.addEventListener('dragover', (event) => {
    event.preventDefault();
    if (!uploadLock.checked) uploadTrigger.classList.add('dragging');
  });
  uploadTrigger.addEventListener('dragleave', (event) => {
    if (!uploadTrigger.contains(event.relatedTarget)) uploadTrigger.classList.remove('dragging');
  });
  uploadTrigger.addEventListener('drop', (event) => {
    event.preventDefault();
    uploadTrigger.classList.remove('dragging');
    showFiles(event.dataTransfer.files);
  });
}
document.querySelectorAll('[data-upload-trigger]').forEach((trigger) => {
  const openFilePicker = () => { if (trigger.getAttribute('aria-disabled') !== 'true') uploadFileInput?.click(); };
  trigger.addEventListener('click', openFilePicker);
  trigger.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    openFilePicker();
  });
});

uploadFileInput?.addEventListener('change', () => {
  const selectedFile = uploadFileInput.files?.[0];
  if (!selectedFile) return;
  document.querySelectorAll('[data-upload-trigger]').forEach((trigger) => {
    const label = trigger.querySelector('b');
    const state = trigger.querySelector('small');
    if (label) label.textContent = selectedFile.name;
    if (state) state.textContent = uploadFileInput.files.length > 1
      ? `已选择 ${uploadFileInput.files.length} 个文件`
      : '已选择';
  });
});

document.querySelectorAll('.pagination').forEach((pagination) => {
  const pages = [...pagination.querySelectorAll('button')].filter((button) => /^\d+$/.test(button.textContent.trim()));
  const previous = [...pagination.querySelectorAll('button')].find((button) => button.textContent.trim() === '上一页');
  const next = [...pagination.querySelectorAll('button')].find((button) => button.textContent.trim() === '下一页');
  const selectPage = (page) => {
    pages.forEach((item) => {
      const current = item === page;
      item.classList.toggle('current', current);
      item.setAttribute('aria-current', current ? 'page' : 'false');
    });
    const index = pages.indexOf(page);
    if (previous) previous.disabled = index === 0;
    if (next) next.disabled = index === pages.length - 1;
    const status = pagination.parentElement.querySelector('[data-page-status]');
    if (status) status.textContent = `第 ${index + 1} / ${pages.length} 页 · ${index === 0 ? 'Start' : index === pages.length - 1 ? 'End' : 'Middle'}`;
  };
  pages.forEach((page) => page.addEventListener('click', () => selectPage(page)));
  previous?.addEventListener('click', () => {
    const index = pages.findIndex((page) => page.classList.contains('current'));
    if (index > 0) selectPage(pages[index - 1]);
  });
  next?.addEventListener('click', () => {
    const index = pages.findIndex((page) => page.classList.contains('current'));
    if (index < pages.length - 1) selectPage(pages[index + 1]);
  });
});

document.querySelector('.table-toolbar input')?.addEventListener('input', (event) => {
  const keyword = event.target.value.trim().toLowerCase();
  document.querySelectorAll('.data-table .tr:not(.th)').forEach((row) => {
    row.hidden = Boolean(keyword) && !row.textContent.toLowerCase().includes(keyword);
  });
});

const promptModelMenu = document.querySelector('#promptModelMenu');
const tooltipPosition = document.querySelector('[data-tooltip-position]');
tooltipPosition?.addEventListener('change', () => {
  tooltipPosition.closest('.tooltip-playground').querySelector('.tooltip-anchor').dataset.position = tooltipPosition.value;
});

const headerDemo = document.querySelector('.navigation-page-header');
if (headerDemo) {
  const kind = headerDemo.querySelector('[data-header-variant]');
  const level = headerDemo.querySelector('[data-crumb-variant]');
  const back = headerDemo.querySelector('[data-header-back]');
  const breadcrumb = headerDemo.querySelector('.breadcrumb');
  const middle = breadcrumb.children[2];
  const divider = breadcrumb.children[3];
  const sync = () => {
    back.hidden = kind.value !== 'back';
    headerDemo.querySelectorAll('.page-title-row > .button').forEach((button) => { button.hidden = kind.value !== 'actions'; });
    middle.hidden = level.value === '2';
    divider.toggleAttribute('hidden', middle.hidden);
    middle.textContent = level.value === 'overflow' ? '…' : '固态电池研发';
  };
  kind.addEventListener('change', sync);
  level.addEventListener('change', sync);
  back.addEventListener('click', () => headerDemo.querySelector('.demo-tabs button').click());
  sync();
}

const permissionDemo = document.querySelector('[data-permission-demo]');
if (permissionDemo) {
  const gate = permissionDemo.querySelector('[data-gate-state]');
  const notice = permissionDemo.querySelector('[data-notice-state]');
  const action = permissionDemo.querySelector('[data-gate-action]');
  const states = {
    request: ['申请访问权限', '提交后由项目管理员审批。', '申请权限'],
    pending: ['正在等待审批', '权限申请已提交。', '审批中'],
    denied: ['申请未通过', '可联系管理员或重新申请。', '重新申请'],
    readonly: ['只读访问', '可查看内容，编辑操作不可用。', '不可编辑'],
  };
  const notices = { readonly: '只读模式：编辑操作暂不可用。', approval: '审批通知：请等待管理员处理。', expired: '访问权限已过期，请重新申请。' };
  const sync = () => {
    const [title, copy, label] = states[gate.value];
    permissionDemo.querySelector('[data-gate-title]').textContent = title;
    permissionDemo.querySelector('[data-gate-copy]').textContent = copy;
    action.textContent = label;
    action.disabled = gate.value === 'pending' || gate.value === 'readonly';
    permissionDemo.querySelector('[data-notice-copy]').textContent = notices[notice.value];
  };
  gate.addEventListener('change', sync);
  notice.addEventListener('change', sync);
  action.addEventListener('click', () => { gate.value = 'pending'; notice.value = 'approval'; sync(); gate.focus(); });
  sync();
}

const bulkDemo = document.querySelector('[data-bulk-demo]');
if (bulkDemo) {
  const selection = bulkDemo.querySelector('input');
  const clear = bulkDemo.querySelector('[data-bulk-clear]');
  const submit = bulkDemo.querySelector('[data-bulk-submit]');
  const status = bulkDemo.querySelector('[role="status"]');
  const sync = () => {
    clear.disabled = submit.disabled = !selection.checked;
    status.textContent = selection.checked ? '已选择 3 项' : '未选择成员';
  };
  selection.addEventListener('change', sync);
  clear.addEventListener('click', () => { selection.checked = false; sync(); selection.focus(); });
  submit.addEventListener('click', () => {
    selection.disabled = clear.disabled = submit.disabled = true;
    status.textContent = '处理中…';
    setTimeout(() => {
      selection.disabled = selection.checked = false;
      sync();
      status.textContent = '批量停用完成（演示）';
    }, 900);
  });
  sync();
}

document.querySelectorAll('.chart-grid > .component-card').forEach((card) => {
  const trend = Boolean(card.querySelector('.trend-chart'));
  const label = document.createElement('label');
  const select = document.createElement('select');
  label.className = 'chart-demo-mode';
  label.append('图表模式 ', select);
  for (const [value, text] of [['single', '单系列'], ['compare', '对比'], trend ? ['hover', '查看数据点'] : ['threshold', '阈值']]) {
    select.add(new Option(text, value));
  }
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.className = 'component-demo-status';
  status.hidden = true;
  card.querySelector('.chart-head').after(label);
  card.append(status);
  const sync = () => {
    card.dataset.chartMode = select.value;
    status.hidden = select.value !== 'hover';
    status.textContent = select.value === 'hover' ? '将鼠标移到趋势图上查看采样点。' : '';
  };
  select.value = 'compare';
  select.addEventListener('change', sync);
  card.querySelector('.trend-chart svg')?.addEventListener('pointermove', (event) => {
    if (select.value !== 'hover') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const index = Math.max(0, Math.min(6, Math.round((event.clientX - bounds.left) / bounds.width * 6)));
    status.textContent = `采样点 ${index + 1} · 实验值 ${[12, 24, 19, 37, 31, 50, 43][index]} °C`;
  });
  sync();
});
document.querySelectorAll('.preset-row .preset-card > button').forEach((button, _, buttons) => {
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => {
    const activate = button.getAttribute('aria-pressed') === 'false';
    buttons.forEach((option) => {
      const selected = activate && option === button;
      option.setAttribute('aria-pressed', String(selected));
      option.closest('.preset-card').classList.toggle('selected', selected);
      option.textContent = selected ? '已选择' : '开始使用';
    });
  });
});
const checkboxPlayground = document.querySelector('[data-checkbox-playground]');
if (checkboxPlayground) {
  const all = checkboxPlayground.querySelector('[data-check-all]');
  const items = [...checkboxPlayground.querySelectorAll('[data-check-item]')];
  const lock = checkboxPlayground.parentElement.querySelector('[data-check-lock]');
  const sync = () => {
    const count = items.filter((item) => item.checked).length;
    all.checked = count === items.length;
    all.indeterminate = count > 0 && count < items.length;
  };
  all.addEventListener('change', () => {
    items.forEach((item) => { item.checked = all.checked; });
    sync();
  });
  items.forEach((item) => item.addEventListener('change', sync));
  lock.addEventListener('change', () => { checkboxPlayground.disabled = lock.checked; });
  checkboxPlayground.disabled = lock.checked;
  sync();
}
const feedbackPlayground = document.querySelector('[data-feedback-playground]');
if (feedbackPlayground) {
  const menus = [...feedbackPlayground.querySelectorAll('details')];
  const status = feedbackPlayground.querySelector('[data-playground-status]');
  const confirmation = feedbackPlayground.querySelector('dialog');
  confirmation.addEventListener('close', () => {
    if (confirmation.returnValue === 'delete') showToast('已删除任务（演示）');
  });
  const close = (menu, restoreFocus = false) => {
    menu.open = false;
    if (restoreFocus) menu.querySelector('summary').focus();
  };
  feedbackPlayground.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    const menu = button?.closest('details');
    if (!menu || button.disabled) return;
    if (button.hasAttribute('data-delete-task')) {
      close(menu, true);
      confirmation.returnValue = '';
      confirmation.showModal();
      return;
    }
    if (button.hasAttribute('data-menu-choice')) {
      menu.querySelectorAll('[data-menu-choice]').forEach((option) => {
        option.classList.toggle('selected', option === button);
        option.setAttribute('aria-pressed', String(option === button));
      });
      menu.querySelector('[data-menu-value]').textContent = button.textContent;
    }
    status.textContent = button.dataset.demoMessage ?? `已选择 ${button.textContent}`;
    if (status.textContent) showToast(status.textContent);
    close(menu, true);
  });
  document.addEventListener('click', (event) => {
    menus.filter((menu) => menu.open && !menu.contains(event.target)).forEach((menu) => close(menu));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const menu = menus.find((item) => item.open && item.contains(document.activeElement));
    if (menu) close(menu, true);
  });
}
const controlBar = document.querySelector('[data-control-bar]');
if (controlBar) {
  const picker = controlBar.querySelector('input[type="file"]');
  const searchTool = controlBar.querySelector('.tool-chip');
  const send = controlBar.querySelector('.control-send');
  const stop = controlBar.querySelector('.control-stop');
  const model = controlBar.querySelector('.prompt-model');
  const result = controlBar.nextElementSibling;
  let timer;
  const setRunning = (running) => {
    send.hidden = running;
    stop.hidden = !running;
    picker.disabled = searchTool.disabled = model.disabled = running;
    send.disabled = !picker.files.length;
  };
  searchTool.addEventListener('click', () => {
    const enabled = searchTool.classList.toggle('active');
    searchTool.setAttribute('aria-pressed', String(enabled));
  });
  picker.addEventListener('change', () => {
    send.disabled = !picker.files.length;
    result.textContent = picker.files[0]?.name ?? '';
  });
  controlBar.addEventListener('submit', (event) => {
    event.preventDefault();
    if (send.disabled || send.hidden) return;
    setRunning(true);
    stop.focus();
    result.textContent = '正在处理附件…';
    timer = setTimeout(() => {
      const restoreFocus = document.activeElement === stop;
      setRunning(false);
      if (restoreFocus) send.focus();
      result.textContent = '附件处理完成（演示）。';
    }, 1800);
  });
  stop.addEventListener('click', () => {
    clearTimeout(timer);
    setRunning(false);
    send.focus();
    result.textContent = '已停止处理。';
  });
}
const emptyPlayground = document.querySelector('[data-empty-playground]');
if (emptyPlayground) {
  const choice = emptyPlayground.querySelector('[data-empty-choice]');
  const size = emptyPlayground.querySelector('[data-empty-size]');
  const preview = emptyPlayground.querySelector('.empty-state-preview');
  const icon = preview.querySelector('.empty-state-icon');
  const title = emptyPlayground.querySelector('[data-empty-title]');
  const message = emptyPlayground.querySelector('[data-empty-message]');
  const action = emptyPlayground.querySelector('[data-empty-action]');
  const variants = {
    'no-data': ['暂无数据', '当前项目还没有可展示的数据。', '导入数据'],
    'no-result': ['未找到匹配结果', '请调整关键词或筛选条件后重试。', '清除筛选'],
    'first-use': ['开始创建第一个研发任务', '配置数据与工具后即可开始运行。', '创建任务'],
    'load-error': ['数据加载失败', '请检查网络状态后重新加载。', '重新加载'],
  };
  const compactVariants = {
    'no-data': ['暂无数据', '当前区域暂无内容', '添加数据'],
    'no-result': ['没有匹配结果', '调整关键词后重试', '清除筛选'],
    'load-error': ['加载失败', '检查网络后重新加载', '重新加载'],
  };
  const update = () => {
    const compact = size.value === 'compact';
    const firstUse = choice.querySelector('[value="first-use"]');
    firstUse.disabled = compact;
    if (compact && choice.value === 'first-use') choice.value = 'no-data';
    const [heading, copy, label] = (compact ? compactVariants : variants)[choice.value];
    const primary = !compact && ['no-data', 'first-use'].includes(choice.value);
    const error = choice.value === 'load-error' || (!compact && choice.value !== 'first-use');
    preview.dataset.size = size.value;
    icon.classList.toggle('error', error);
    action.classList.toggle('primary', primary);
    action.classList.toggle('secondary', !primary);
    title.textContent = heading;
    message.textContent = copy;
    action.textContent = label;
  };
  choice.addEventListener('change', update);
  size.addEventListener('change', update);
  update();
  action.addEventListener('click', () => {
    if (['no-result', 'load-error'].includes(choice.value)) {
      choice.value = 'no-data';
      update();
      choice.focus();
    } else {
      message.textContent = `已触发「${action.textContent}」（组件演示）。`;
    }
  });
}
document.querySelectorAll('[data-width-demo]').forEach((demo) => {
  const width = demo.querySelector('[data-preview-width]');
  const preview = demo.querySelector('[data-width-preview]');
  const update = () => { preview.style.setProperty('--preview-width', width.value); };
  width.addEventListener('change', update);
  update();
});

const agentFlow = document.querySelector('[data-agent-flow]');
if (agentFlow) {
  const find = (selector) => agentFlow.querySelector(selector);
  const form = find('form');
  const prompt = find('[data-flow-prompt]');
  const file = find('[data-flow-file]');
  const outcome = find('[data-flow-outcome]');
  const send = find('[type="submit"]');
  const stop = find('[data-flow-stop]');
  const retry = find('[data-flow-retry]');
  const remove = find('[data-flow-remove]');
  const navigation = find('[data-flow-nav]');
  const preview = find('[data-width-preview]');
  const sessions = [...agentFlow.querySelectorAll('[data-flow-session]')];
  const message = find('[data-flow-message]');
  const sessionMessages = new Map();
  let activeSession = sessions[0];
  let taskTimer;
  let fileTimer;
  let busy = false;
  let attachment = '';
  let fileState = '';

  const refresh = () => {
    send.hidden = busy;
    send.disabled = !(prompt.value.trim() || attachment) || ['uploading', 'error'].includes(fileState);
    stop.hidden = !busy;
    prompt.readOnly = busy;
    form.classList.toggle('has-draft', Boolean(prompt.value.trim() || attachment));
    file.disabled = outcome.disabled = remove.disabled = busy;
    find('.prompt-model').disabled = busy;
    sessions.forEach((session) => { session.disabled = busy; });
  };
  const showTask = (state, message) => {
    const task = find('[data-flow-task]');
    task.hidden = false;
    task.className = `task-card agent-flow-task ${state}`;
    find('[data-flow-status]').textContent = message;
    retry.hidden = !['failed', 'cancelled'].includes(state);
    refresh();
  };
  const showFile = (state, message) => {
    fileState = state;
    find('[data-flow-attachment]').hidden = !attachment;
    find('[data-flow-file-name]').textContent = attachment;
    const status = find('[data-flow-file-status]').parentElement;
    status.className = `attachment-status ${state === 'error' ? 'danger' : state === 'parsed' ? 'success' : 'info'}`;
    status.querySelector('[data-flow-file-status]').textContent = message;
    status.querySelector('[data-flow-spinner]').hidden = state !== 'uploading';
    refresh();
  };
  const start = (fail) => {
    if (busy || send.disabled) return;
    const submitted = prompt.value.trim() || attachment;
    sessionMessages.set(activeSession, submitted);
    message.textContent = submitted;
    message.hidden = false;
    busy = true;
    showTask('queued', '任务排队中');
    taskTimer = setTimeout(() => {
      showTask('running', '正在生成结果…');
      taskTimer = setTimeout(() => {
        busy = false;
        showTask(fail ? 'failed' : 'success', fail ? '任务失败，可重新运行。' : '任务已完成（模拟）。');
      }, 1800);
    }, 450);
  };
  prompt.addEventListener('input', refresh);
  navigation.addEventListener('click', () => {
    const open = preview.classList.toggle('sessions-open');
    navigation.setAttribute('aria-expanded', String(open));
    if (open && !activeSession.disabled) activeSession.focus();
  });
  sessions.forEach((session) => session.addEventListener('click', () => {
    if (session !== activeSession) {
      activeSession.removeAttribute('aria-current');
      activeSession = session;
      session.setAttribute('aria-current', 'true');
      find('[data-flow-session-title]').textContent = session.textContent.trim();
      message.textContent = sessionMessages.get(session) ?? '';
      message.hidden = !message.textContent;
      find('[data-flow-task]').hidden = true;
      prompt.value = '';
      remove.click();
    }
    preview.classList.remove('sessions-open');
    navigation.setAttribute('aria-expanded', 'false');
    if (navigation.offsetWidth) navigation.focus();
  }));
  file.addEventListener('change', () => {
    if (!file.files[0]) return;
    clearTimeout(fileTimer);
    attachment = file.files[0].name;
    const fail = outcome.value === 'attachment-error';
    showFile('uploading', '上传中');
    fileTimer = setTimeout(() => {
      if (fail) { showFile('error', '附件处理失败'); return; }
      showFile('ready', '待解析');
      fileTimer = setTimeout(() => showFile('parsed', '已解析'), 700);
    }, 650);
  });
  remove.addEventListener('click', () => {
    clearTimeout(fileTimer);
    attachment = file.value = '';
    showFile('', '');
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    start(outcome.value === 'failed');
  });
  stop.addEventListener('click', () => {
    clearTimeout(taskTimer);
    busy = false;
    showTask('cancelled', '任务已取消，可重新运行。');
    retry.focus();
  });
  retry.addEventListener('click', () => start(false));
  refresh();
}
let activePromptModel = null;

const placePromptModelMenu = (trigger) => {
  if (!promptModelMenu) return;
  const rect = trigger.getBoundingClientRect();
  const { width: menuWidth, height: menuHeight } = promptModelMenu.getBoundingClientRect();
  const left = Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 12);
  promptModelMenu.style.left = `${Math.max(12, left)}px`;
  const top = rect.top - menuHeight - 6;
  promptModelMenu.style.top = `${Math.max(12, top)}px`;
};

document.querySelectorAll('.prompt-model:not(:disabled)').forEach((button) => {
  button.setAttribute('aria-haspopup', 'menu');
  button.setAttribute('aria-controls', 'promptModelMenu');
  button.setAttribute('aria-expanded', 'false');
  button.addEventListener('click', () => {
    if (!promptModelMenu) return;
    if (activePromptModel === button && promptModelMenu.matches(':popover-open')) {
      promptModelMenu.hidePopover();
      return;
    }
    activePromptModel?.setAttribute('aria-expanded', 'false');
    activePromptModel = button;
    const current = button.querySelector('span')?.textContent.trim();
    promptModelMenu.querySelectorAll('[data-model-option]').forEach((option) => {
      const selected = option.dataset.modelOption === current;
      option.classList.toggle('selected', selected);
      option.setAttribute('aria-checked', String(selected));
    });
    promptModelMenu.classList.toggle('prompt-model-mobile', Boolean(button.closest('.mobile-agent-phone')));
    if (!promptModelMenu.matches(':popover-open')) promptModelMenu.showPopover({ source: button });
    placePromptModelMenu(button);
    button.setAttribute('aria-expanded', 'true');
  });
});

promptModelMenu?.addEventListener('toggle', (event) => {
  if (event.newState === 'closed') activePromptModel?.setAttribute('aria-expanded', 'false');
});

promptModelMenu?.querySelectorAll('[data-model-option]').forEach((option) => {
  option.addEventListener('click', () => {
    const label = activePromptModel?.querySelector('span');
    if (label) label.textContent = option.dataset.modelOption;
    promptModelMenu.hidePopover();
    activePromptModel?.focus();
  });
});

const coreSelectMenu = document.querySelector('#coreSelectMenu');
let activeCoreSelect = null;

const placeCoreSelectMenu = (trigger) => {
  if (!coreSelectMenu) return;
  const rect = trigger.getBoundingClientRect();
  const menuWidth = 280;
  const left = Math.min(rect.left, window.innerWidth - menuWidth - 12);
  const menuHeight = coreSelectMenu.offsetHeight || 120;
  const below = rect.bottom + 6;
  const top = below + menuHeight <= window.innerHeight - 12 ? below : rect.top - menuHeight - 6;
  coreSelectMenu.style.left = `${Math.max(12, left)}px`;
  coreSelectMenu.style.top = `${Math.max(12, top)}px`;
};

document.querySelectorAll('[data-core-select]').forEach((button) => {
  button.setAttribute('aria-haspopup', 'listbox');
  button.setAttribute('aria-expanded', 'false');
  button.addEventListener('click', () => {
    if (!coreSelectMenu) return;
    if (activeCoreSelect === button && coreSelectMenu.matches(':popover-open')) {
      coreSelectMenu.hidePopover();
      return;
    }
    activeCoreSelect?.classList.remove('open');
    activeCoreSelect?.setAttribute('aria-expanded', 'false');
    activeCoreSelect = button;
    const current = button.dataset.coreSelectCurrent || '';
    coreSelectMenu.querySelectorAll('[data-core-select-option]').forEach((option) => {
      const selected = option.dataset.coreSelectOption === current;
      option.classList.toggle('selected', selected);
      option.setAttribute('aria-selected', String(selected));
    });
    button.classList.add('open');
    button.setAttribute('aria-expanded', 'true');
    placeCoreSelectMenu(button);
    coreSelectMenu.showPopover();
  });
});

coreSelectMenu?.addEventListener('toggle', (event) => {
  if (event.newState !== 'closed') return;
  activeCoreSelect?.classList.remove('open');
  activeCoreSelect?.setAttribute('aria-expanded', 'false');
});

coreSelectMenu?.querySelectorAll('[data-core-select-option]').forEach((option) => {
  option.addEventListener('click', () => {
    if (!activeCoreSelect) return;
    const value = option.dataset.coreSelectOption;
    const label = activeCoreSelect.querySelector('[data-core-select-value]');
    activeCoreSelect.dataset.coreSelectCurrent = value;
    activeCoreSelect.classList.add('selected');
    if (label) label.textContent = `已选：${value}`;
    coreSelectMenu.hidePopover();
    activeCoreSelect.focus();
  });
});

const accountTrigger = document.querySelector('[data-account-trigger]');
document.querySelectorAll('.conversation-menu').forEach((menu) => {
  const trigger = menu.previousElementSibling;
  const placeMenu = () => {
    if (!menu.matches(':popover-open')) return;
    const anchor = trigger.getBoundingClientRect();
    const { width, height } = menu.getBoundingClientRect();
    const left = Math.min(anchor.left - 8, window.innerWidth - width - 8);
    const above = anchor.top - height - 4;
    menu.style.left = `${Math.max(8, left)}px`;
    menu.style.top = `${above >= 8 ? above : Math.max(8, Math.min(anchor.bottom + 4, window.innerHeight - height - 8))}px`;
  };
  menu.addEventListener('toggle', placeMenu);
  window.addEventListener('resize', placeMenu);
  window.addEventListener('scroll', placeMenu, { capture: true, passive: true });
  menu.addEventListener('click', (event) => {
    const action = event.target.closest('button');
    if (!action) return;
    menu.closest('.navigation-block').querySelector('.workspace-action-result').textContent =
      `已选择「${action.textContent.trim()}」（组件演示）`;
    menu.hidePopover();
    trigger.focus();
  });
});
const workspaceMenus = [...document.querySelectorAll('.workspace-action-menu')];
for (const menu of workspaceMenus) {
  const trigger = menu.querySelector('summary');
  menu.addEventListener('toggle', () => {
    if (menu.open) workspaceMenus.filter((other) => other !== menu).forEach((other) => { other.open = false; });
  });
  menu.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      const status = menu.closest('.navigation-block')?.querySelector('.workspace-action-result');
      if (status) status.textContent = `已选择「${button.textContent.trim()}」（组件演示）`;
      menu.open = false;
      trigger.focus();
    });
  });
}
document.addEventListener('click', (event) => {
  workspaceMenus.filter((menu) => menu.open && !menu.contains(event.target)).forEach((menu) => { menu.open = false; });
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  const menu = workspaceMenus.find((item) => item.open);
  if (!menu) return;
  menu.open = false;
  menu.querySelector('summary').focus();
});
const accountDemoMenu = document.querySelector('#accountDemoMenu');

const placeAccountMenu = () => {
  if (!accountTrigger || !accountDemoMenu) return;
  const rect = accountTrigger.getBoundingClientRect();
  const menuWidth = 220;
  const left = Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 12);
  const menuHeight = accountDemoMenu.querySelectorAll('button').length * 34 + 14;
  const top = rect.bottom + menuHeight + 12 < window.innerHeight ? rect.bottom + 6 : rect.top - menuHeight - 6;
  accountDemoMenu.style.left = `${Math.max(12, left)}px`;
  accountDemoMenu.style.top = `${Math.max(12, top)}px`;
};

accountTrigger?.addEventListener('click', () => {
  placeAccountMenu();
});

accountDemoMenu?.addEventListener('toggle', (event) => {
  const open = event.newState === 'open';
  accountTrigger?.classList.toggle('open', open);
  accountTrigger?.setAttribute('aria-expanded', String(open));
});

accountDemoMenu?.querySelectorAll('button').forEach((item) => {
  item.addEventListener('click', () => accountDemoMenu.hidePopover());
});

const statusSelect = document.querySelector('[data-status-select]');
const statusSelectMenu = document.querySelector('#statusSelectMenu');

const placeStatusSelectMenu = () => {
  if (!statusSelect || !statusSelectMenu) return;
  const rect = statusSelect.getBoundingClientRect();
  statusSelectMenu.style.width = `${rect.width}px`;
  statusSelectMenu.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - rect.width - 12))}px`;
  statusSelectMenu.style.top = `${rect.bottom + 6}px`;
};

statusSelect?.addEventListener('click', () => {
  if (!statusSelectMenu) return;
  if (statusSelectMenu.matches(':popover-open')) {
    statusSelectMenu.hidePopover();
    return;
  }
  const current = statusSelect.querySelector('[data-status-select-value]')?.textContent.trim();
  statusSelectMenu.querySelectorAll('[data-status-option]').forEach((option) => {
    const selected = option.dataset.statusOption === current;
    option.classList.toggle('selected', selected);
    option.setAttribute('aria-selected', String(selected));
  });
  placeStatusSelectMenu();
  statusSelect.classList.add('open');
  statusSelect.setAttribute('aria-expanded', 'true');
  statusSelectMenu.showPopover();
});

statusSelectMenu?.addEventListener('toggle', (event) => {
  if (event.newState !== 'closed') return;
  statusSelect?.classList.remove('open');
  statusSelect?.setAttribute('aria-expanded', 'false');
});

statusSelectMenu?.querySelectorAll('[data-status-option]').forEach((option) => {
  option.addEventListener('click', () => {
    const value = statusSelect?.querySelector('[data-status-select-value]');
    if (value) value.textContent = option.dataset.statusOption;
    statusSelectMenu.hidePopover();
    statusSelect?.focus();
  });
});

document.querySelectorAll('[data-copyable-field]').forEach((field) => {
  const value = field.querySelector('.router-field-value');
  const button = field.querySelector('.router-field-action');
  button?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(value?.textContent.trim() || '');
      field.classList.add('copied');
      const control = field.querySelector('.router-field-control');
      if (control && !control.querySelector('.router-field-status')) {
        const status = document.createElement('span');
        status.className = 'router-field-status';
        status.textContent = '已复制';
        control.insertBefore(status, button);
      }
      showToast('已复制到剪贴板');
    } catch {
      showToast('复制失败，请手动复制');
    }
  });
});

document.querySelectorAll('[data-secret-field]').forEach((field) => {
  const value = field.querySelector('.router-field-value');
  const button = field.querySelector('.router-field-action');
  let visible = false;
  button?.addEventListener('click', () => {
    visible = !visible;
    if (value) value.textContent = visible ? field.dataset.secretValue : 'sk-9f2c••••••••••••3c3d';
    button.setAttribute('aria-label', visible ? '隐藏 API 密钥' : '显示 API 密钥');
  });
});

document.querySelectorAll('.key-record:not(.revoked)').forEach((record) => {
  const buttons = [...record.querySelectorAll(':scope > button')];
  const revoke = buttons.find((button) => button.textContent.trim() === '撤销');
  revoke?.addEventListener('click', () => {
    record.classList.add('revoked');
    const status = record.querySelector('.status');
    if (status) {
      status.className = 'status danger';
      status.textContent = '已撤销';
    }
    const copy = buttons.find((button) => button.textContent.trim() === '复制');
    if (copy) copy.disabled = true;
    revoke.textContent = '已撤销';
    revoke.disabled = true;
    showToast('密钥已撤销');
  });
});

document.querySelectorAll('.action-matrix button, .data-table .actions button').forEach((button) => {
  button.addEventListener('click', () => showToast(`已触发：${button.textContent.trim()}`));
});

const permissionControls = [...document.querySelectorAll('[data-partial-permission]')];
const permissionRole = document.querySelector('[data-permission-role]');
const updatePermissionMatrix = () => {
  const selected = permissionControls.filter((input) => input.checked).length;
  if (permissionRole) {
    permissionRole.textContent = selected === 3 ? '管理员' : selected > 0 ? '部分管理权限' : '普通成员';
    permissionRole.className = `status ${selected === 3 ? 'success' : selected > 0 ? 'info' : 'neutral'}`;
  }
  permissionControls.forEach((input) => {
    const label = input.closest('label');
    const text = label?.lastChild;
    if (text?.nodeType === Node.TEXT_NODE) text.nodeValue = input.checked ? '按授权' : '未授权';
  });
};
permissionControls.forEach((input) => input.addEventListener('change', updatePermissionMatrix));
updatePermissionMatrix();

document.querySelectorAll('.channel-actions button').forEach((button) => {
  button.addEventListener('click', () => {
    const row = button.closest('.channel-row');
    if (button.classList.contains('enable-channel')) {
      const status = row.querySelector('.channel-status');
      status.className = 'channel-status enabled';
      status.innerHTML = '<i></i>启用';
      button.remove();
      showToast('渠道已启用');
      return;
    }
    showToast(`已触发：${button.getAttribute('aria-label') || button.textContent.trim()}`);
  });
});

document.querySelectorAll('[data-secret-confirmation]').forEach((card) => {
  const checkbox = card.querySelector('[data-secret-checkbox]');
  const title = card.querySelector('header b');
  const description = card.querySelector('header small');
  const status = card.querySelector('.status');
  checkbox?.addEventListener('change', () => {
    const confirmed = checkbox.checked;
    card.classList.toggle('pending', !confirmed);
    card.classList.toggle('confirmed', confirmed);
    title.textContent = confirmed ? '完整密钥已保存' : '请立即复制保存完整密钥';
    description.textContent = confirmed ? '可以安全关闭当前结果，后续只展示脱敏值。' : '关闭后将无法再次查看，忘记只能重新创建。';
    status.className = `status ${confirmed ? 'success' : 'warning'}`;
    status.innerHTML = `<i></i>${confirmed ? '已确认' : '等待确认'}`;
  });
});

document.querySelectorAll('.alert button').forEach((button) => {
  button.addEventListener('click', () => button.closest('.alert').remove());
});

document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      showToast('已复制变量');
    } catch {
      showToast('复制失败，请手动复制');
    }
  });
});

const transactionSpecimen = document.querySelector('#transaction-modal');
const transactionDialog = document.querySelector('#transactionDialog');
if (transactionSpecimen && transactionDialog) {
  const form = transactionDialog.querySelector('form');
  const body = form.querySelector('.tx-body');
  const submit = form.querySelector('[data-tx-submit]');
  const dismiss = form.querySelectorAll('[data-tx-dismiss]');
  const currency = new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' });
  const cases = new Map([...document.querySelectorAll('template[data-tx-case]')].map(template => [template.dataset.txCase, template]));
  let activeCase;
  let opener;

  const sync = () => {
    const match = body.querySelector('[data-tx-match]');
    const ack = body.querySelector('[data-tx-ack]');
    if (match) {
      const invalid = Boolean(match.value) && match.value !== match.dataset.txMatch;
      match.setCustomValidity(match.value !== match.dataset.txMatch ? '请输入匹配的名称' : '');
      match.setAttribute('aria-invalid', String(invalid));
      match.classList.toggle('error', invalid);
      body.querySelector('.tx-error').hidden = !invalid;
    }
    const amount = body.querySelector('[data-tx-amount]');
    if (amount) {
      const valid = amount.validity.valid;
      body.querySelector('[data-tx-preview]').textContent = valid ? currency.format(amount.valueAsNumber) : '—';
      const difference = body.querySelector('[data-tx-difference]');
      if (difference) {
        const delta = amount.valueAsNumber - 10000;
        difference.textContent = !valid ? '—' : delta === 0 ? '额度未变化' :
          `${delta > 0 ? '增加' : '减少'} ${currency.format(Math.abs(delta))}`;
      }
    }
    const locked = Boolean(ack && !ack.checked);
    dismiss.forEach(button => { button.disabled = locked; });
    submit.disabled = locked || !form.checkValidity();
  };
  const render = (type) => {
    const template = cases.get(type);
    activeCase = type;
    transactionDialog.dataset.type = type;
    transactionDialog.dataset.state = template.dataset.state;
    form.querySelector('#transactionTitle').textContent = template.dataset.title;
    form.querySelector('#transactionDescription').textContent = template.dataset.description;
    submit.textContent = template.dataset.action;
    submit.classList.toggle('tx-danger', template.hasAttribute('data-danger'));
    const content = template.content.cloneNode(true);
    bindFigmaIcons(content);
    body.replaceChildren(content);
    body.scrollTop = 0;
    sync();
  };
  transactionSpecimen.querySelectorAll('[data-tx-open]').forEach(button => {
    button.addEventListener('click', () => {
      opener = button;
      render(button.dataset.txOpen);
      transactionDialog.showModal();
      (body.querySelector('input:not([readonly])') ?? dismiss[1]).focus();
    });
  });
  transactionSpecimen.querySelectorAll('[data-tx-row-demo]').forEach(demo => {
    const select = demo.querySelector('[data-tx-size]');
    select.addEventListener('change', () => { demo.querySelector('[data-size]').dataset.size = select.value; });
  });
  const stepNumber = (event) => {
    const button = event.target.closest('[data-tx-step]');
    if (!button) return;
    const input = button.closest('.base-number').querySelector('input');
    if (button.dataset.txStep === 'up') input.stepUp();
    else input.stepDown();
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };
  transactionSpecimen.addEventListener('click', stepNumber);
  form.addEventListener('click', stepNumber);
  form.addEventListener('input', sync);
  form.addEventListener('change', sync);
  form.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-tx-copy]');
    if (!button) return;
    const secret = form.querySelector('#tx-secret');
    const caption = body.querySelector('.tx-caption');
    try {
      await navigator.clipboard.writeText(secret.value);
      caption.textContent = '已复制演示密钥。';
    } catch {
      secret.focus();
      secret.select();
      caption.textContent = '已选中演示密钥，请手动复制。';
    }
  });
  dismiss.forEach(button => button.addEventListener('click', () => transactionDialog.close()));
  transactionDialog.addEventListener('cancel', (event) => {
    if (dismiss[0].disabled) event.preventDefault();
  });
  transactionDialog.addEventListener('close', () => {
    body.replaceChildren();
    opener?.focus();
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    sync();
    if (submit.disabled) return;
    if (activeCase === 'CreateKey') {
      render('SecretCreated');
      body.querySelector('[data-tx-ack]').focus();
      return;
    }
    const title = cases.get(activeCase).dataset.title;
    transactionDialog.close();
    showToast(`${title} · 已完成演示`);
  });
}

const drawer = document.querySelector('#drawer');
const openDrawer = () => { drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); };
const closeDrawer = () => { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); };
document.querySelector('[data-open-drawer]').addEventListener('click', openDrawer);
document.querySelector('[data-close-drawer]').addEventListener('click', closeDrawer);

const renderSearchResults = () => {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) { searchPopover.hidden = true; return; }
  const matches = sections.filter((section) => `${section.dataset.search || ''} ${section.textContent}`.toLowerCase().includes(query)).slice(0, 7);
  searchPopover.innerHTML = matches.length
    ? matches.map((section) => `<a href="#${section.id}"><span>${section.querySelector('h1,h2')?.textContent.trim()}</span><small>跳转</small></a>`).join('')
    : '<div class="search-empty">没有匹配的组件或规范</div>';
  searchPopover.hidden = false;
};
searchInput.addEventListener('input', renderSearchResults);
searchPopover.addEventListener('click', () => { searchInput.value = ''; searchPopover.hidden = true; });
document.addEventListener('click', (event) => { if (!event.target.closest('.doc-search') && !event.target.closest('.search-popover')) searchPopover.hidden = true; });
document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); searchInput.focus(); }
  if (event.key === 'Escape') { closeDrawer(); searchPopover.hidden = true; }
});

const mobileAgent = document.querySelector('[data-mobile-agent]');
if (mobileAgent) {
  const find = (selector) => mobileAgent.querySelector(selector);
  const all = (selector) => [...mobileAgent.querySelectorAll(selector)];
  const phone = find('.mobile-agent-phone');
  const app = find('.mobile-agent-app');
  const drawer = find('.mobile-drawer-layer');
  const opener = find('[data-mobile-open]');
  const search = find('.mobile-drawer input');
  const searchToggle = find('[data-mobile-search]');
  const sessions = all('[data-mobile-session]');
  const scroll = find('.mobile-agent-scroll');
  const list = find('.mobile-message-list');
  const exampleAnswer = find('[data-mobile-example-answer]');
  const answerFooter = find('[data-mobile-answer-footer]');
  bindFigmaIcons(exampleAnswer.content);
  bindFigmaIcons(answerFooter.content);
  const jump = find('[data-mobile-jump]');
  const composer = find('.mobile-composer');
  const draft = composer.querySelector('textarea');
  const file = composer.querySelector('input');
  const attachment = find('.mobile-attachment');
  const send = find('.mobile-send');
  const stop = find('[data-mobile-stop]');
  const work = find('.mobile-work-cards');
  const welcome = find('.mobile-welcome');
  const auth = find('.mobile-auth-screen');
  const authForm = find('.mobile-auth-form');
  const email = authForm.elements.email;
  const code = authForm.elements.code;
  const authStatus = find('.mobile-auth-status');
  const submit = authForm.querySelector('[type="submit"]');
  const resend = find('[data-mobile-resend]');
  const skip = find('[data-mobile-skip]');
  const threads = new Map();
  let active = sessions[0].dataset.mobileSession;
  let newCount = 0;
  let mode = 'chat';
  let timer;
  let pending;
  let authTimer;
  let resendTimer;
  let step = 'email';

  const current = () => threads.get(active) ?? [];
  const syncComposer = () => {
    send.hidden = Boolean(pending);
    stop.hidden = !pending;
    send.disabled = !draft.value.trim() && !file.files.length;
  };
  const goLatest = () => { scroll.scrollTop = scroll.scrollHeight; jump.hidden = true; };
  const render = () => {
    work.hidden = mode !== 'work';
    welcome.hidden = mode === 'work' || current().length > 0;
    list.replaceChildren();
    for (const message of current()) {
      const item = document.createElement('div');
      item.className = 'mobile-message ' + message.role;
      const richExample = message.example && message.done;
      if (richExample) item.append(exampleAnswer.content.cloneNode(true));
      else item.textContent = message.text;
      list.append(item);
      if (message.role === 'assistant' && message.done) {
        const footer = answerFooter.content.firstElementChild.cloneNode(true);
        if (!richExample) footer.querySelector('small').remove();
        footer.querySelector('[data-mobile-copy]').addEventListener('click', async () => {
          const reply = richExample
            ? [...item.querySelectorAll(':scope > p, :scope > blockquote, :scope > h4, :scope > ul')].map(block => block.innerText).join('\n\n')
            : message.text;
          try { await navigator.clipboard.writeText(reply); showToast('已复制'); }
          catch { showToast('无法写入剪贴板'); }
        });
        const regenerate = footer.querySelector('[data-mobile-regenerate]');
        regenerate.disabled = Boolean(pending);
        regenerate.addEventListener('click', () => {
          const previous = message.text;
          pending = message;
          message.done = false;
          message.text = '正在生成…';
          render();
          timer = setTimeout(() => finish(false, previous), 1400);
        });
        item.append(footer);
      }
    }
    syncComposer();
  };
  find('[data-phone-width]').addEventListener('change', event => phone.style.setProperty('--phone-width', event.target.value + 'px'));
  const toggleDrawer = (open, restore = true) => {
    drawer.hidden = !open;
    app.inert = open;
    opener.setAttribute('aria-expanded', String(open));
    if (open) {
      if (search.hidden) searchToggle.focus();
      else search.focus();
    }
    else if (restore) opener.focus();
  };
  opener.addEventListener('click', () => toggleDrawer(true));
  all('[data-mobile-close], .mobile-backdrop').forEach(button => button.addEventListener('click', () => toggleDrawer(false)));
  searchToggle.addEventListener('click', () => {
    search.hidden = !search.hidden;
    searchToggle.setAttribute('aria-expanded', String(!search.hidden));
    if (!search.hidden) search.focus();
    else {
      search.value = '';
      search.dispatchEvent(new Event('input'));
    }
  });
  search.addEventListener('input', () => {
    const query = search.value.trim().toLowerCase();
    sessions.forEach(button => {
      button.hidden = !button.textContent.toLowerCase().includes(query);
      button.previousElementSibling.hidden = button.hidden;
    });
    find('[data-mobile-no-sessions]').hidden = sessions.some(button => !button.hidden);
  });
  const openThread = (key) => {
    active = key;
    sessions.forEach(button => {
      const selected = button.dataset.mobileSession === key;
      button.setAttribute('aria-current', String(selected));
      button.classList.toggle('current', selected);
    });
    draft.value = '';
    file.value = '';
    attachment.hidden = true;
    toggleDrawer(false);
    find('[data-mobile-mode="chat"]').click();
    scroll.scrollTop = 0;
  };
  threads.set(active, [
    {role: 'user', text: active},
    {role: 'assistant', example: true, done: true}
  ]);
  threads.set('实验数据分析', [{role:'assistant', text:'请添加实验记录，我可以帮你整理结果与待复核项。', done:true}]);
  sessions.forEach(button => button.addEventListener('click', () => openThread(button.dataset.mobileSession)));
  find('[data-mobile-new]').addEventListener('click', () => openThread('新对话 ' + ++newCount));
  all('[data-mobile-mode]').forEach(button => button.addEventListener('click', () => {
    mode = button.dataset.mobileMode;
    all('[data-mobile-mode]').forEach(control => control.setAttribute('aria-pressed', String(control === button)));
    render();
  }));
  all('[data-mobile-destination]').forEach(button => button.addEventListener('click', () => {
    toggleDrawer(false);
    if (button.dataset.mobileDestination === 'work') {
      find('[data-mobile-mode="work"]').click();
    } else {
      find('[data-mobile-mode="chat"]').click();
      draft.value = '请对比以下模型：';
      syncComposer();
      find('.mobile-composer .prompt-model').click();
    }
  }));
  all('.mobile-work-card').forEach(button => button.addEventListener('click', () => {
    draft.value = button.querySelector('strong').textContent;
    syncComposer();
    draft.focus();
  }));
  scroll.addEventListener('scroll', () => { jump.hidden = scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight < 64; });
  jump.addEventListener('click', goLatest);
  draft.addEventListener('input', syncComposer);
  file.addEventListener('change', () => {
    attachment.textContent = file.files[0]?.name ?? '';
    attachment.hidden = !file.files.length;
    syncComposer();
  });
  const finish = (stopped, reply = '已收到请求。可继续补充实验条件，或让我将关键发现整理成清单。（演示）') => {
    pending.text = stopped ? '已停止生成。' : reply;
    pending.done = !stopped;
    pending = null;
    render();
  };
  stop.addEventListener('click', () => { clearTimeout(timer); finish(true); });
  composer.addEventListener('submit', event => {
    event.preventDefault();
    if (pending || send.disabled) return;
    const messages = current();
    messages.push({role:'user', text:[draft.value.trim(), file.files[0]?.name].filter(Boolean).join('\n')});
    pending = {role:'assistant', text:'正在生成…'};
    messages.push(pending);
    threads.set(active, messages);
    draft.value = '';
    file.value = '';
    attachment.hidden = true;
    render();
    goLatest();
    timer = setTimeout(() => finish(false), 1400);
  });
  const setAuthStep = (next) => {
    step = next;
    authForm.dataset.authStep = next;
    const titles = {email:'', code:'查看收件箱', passkey:'设置通行密钥'};
    const copy = {email:'使用演示邮箱继续。此流程在浏览器内模拟。', code:'输入演示验证码 123456。', passkey:'下次可通过设备验证快速登录。'};
    const heading = authForm.querySelector('h3');
    heading.textContent = titles[next];
    heading.hidden = next === 'email';
    authForm.querySelector('h3 + p').textContent = copy[next];
    email.disabled = email.parentElement.hidden = next !== 'email';
    code.disabled = code.parentElement.hidden = next !== 'code';
    resend.hidden = next !== 'code';
    skip.hidden = next !== 'passkey';
    submit.textContent = next === 'passkey' ? '设置通行密钥' : '继续';
    submit.disabled = false;
    code.classList.remove('error');
    code.removeAttribute('aria-invalid');
    authStatus.classList.remove('error');
    authStatus.textContent = '';
  };
  const closeAuth = () => {
    clearTimeout(authTimer);
    clearTimeout(resendTimer);
    resend.disabled = false;
    auth.hidden = true;
    app.inert = false;
    opener.focus();
  };
  const login = () => {
    find('.mobile-agent-header [data-mobile-auth]').textContent = '账户';
    closeAuth();
    showToast('已完成演示登录');
  };
  all('[data-mobile-auth]').forEach(button => button.addEventListener('click', () => {
    if (!drawer.hidden) toggleDrawer(false, false);
    app.inert = true;
    auth.hidden = false;
    code.value = '';
    setAuthStep('email');
    email.focus();
  }));
  find('[data-mobile-back]').addEventListener('click', () => {
    if (step === 'email') closeAuth();
    else { clearTimeout(authTimer); clearTimeout(resendTimer); resend.disabled = false; setAuthStep(step === 'passkey' ? 'code' : 'email'); }
  });
  phone.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !drawer.hidden) toggleDrawer(false);
    else if (event.key === 'Escape' && !auth.hidden) closeAuth();
  });
  code.addEventListener('input', () => {
    code.classList.remove('error');
    code.removeAttribute('aria-invalid');
    authStatus.classList.remove('error');
    authStatus.textContent = '';
  });
  resend.addEventListener('click', () => {
    resend.disabled = true;
    authStatus.textContent = '已重新发送演示验证码。';
    resendTimer = setTimeout(() => { resend.disabled = false; }, 3000);
  });
  skip.addEventListener('click', login);
  authForm.addEventListener('submit', event => {
    event.preventDefault();
    if (step === 'email') { setAuthStep('code'); code.focus(); return; }
    if (step === 'passkey') { login(); return; }
    submit.disabled = true;
    authStatus.textContent = '正在验证…';
    authTimer = setTimeout(() => {
      if (code.value.trim() === '123456') setAuthStep('passkey');
      else {
        code.classList.add('error');
        code.setAttribute('aria-invalid', 'true');
        authStatus.classList.add('error');
        authStatus.textContent = '验证码有误，请重试。';
        submit.disabled = false;
        code.focus();
      }
    }, 500);
  });
  render();
}
