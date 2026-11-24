document.querySelectorAll('[data-guide-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    const example = button.closest('.guide-code');
    const status = example.querySelector('[role="status"]');
    try {
      await navigator.clipboard.writeText(example.querySelector('code').textContent);
      status.textContent = '已复制';
    } catch {
      status.textContent = '无法访问剪贴板，请手动复制上方代码。';
    }
  });
});

const channelGuide = document.querySelector('[data-channel-guide]');
const channelDialog = document.querySelector('#channelGuideDialog');

if (channelGuide && channelDialog) {
  const form = channelDialog.querySelector('form');
  const fields = form.querySelector('fieldset');
  const models = form.querySelector('[data-channel-models]');
  const status = form.querySelector('[data-channel-status]');
  const opener = channelGuide.querySelector('[data-channel-open]');
  const submit = form.querySelector('[type="submit"]');
  const reset = form.querySelector('[type="reset"]');
  const cancel = form.querySelector('[data-channel-cancel]');
  const add = form.querySelector('[data-channel-add-model]');
  const template = document.querySelector('#guideChannelModel');
  const names = new Set();
  const modelLimit = 5;
  let modelSequence = 0;

  const showStatus = (message, error = false) => {
    status.textContent = message;
    status.classList.toggle('error', error);
  };

  const clearValidation = () => {
    form.querySelectorAll('input').forEach((input) => input.setCustomValidity(''));
    showStatus('');
  };

  const syncModelButtons = () => {
    const count = models.children.length;
    add.disabled = count >= modelLimit;
    models.querySelectorAll('[data-channel-remove-model]').forEach((button) => {
      button.disabled = count <= 1;
    });
  };

  const addModel = (focus = false) => {
    const row = template.content.firstElementChild.cloneNode(true);
    const input = row.querySelector('input');
    input.id = `guide-model-${++modelSequence}`;
    row.querySelector('label').htmlFor = input.id;
    row.querySelector('button').addEventListener('click', () => {
      row.remove();
      clearValidation();
      syncModelButtons();
      add.focus();
    });
    models.append(row);
    syncModelButtons();
    if (focus) input.focus();
  };

  form.addEventListener('reset', () => {
    models.replaceChildren();
    addModel();
    clearValidation();
  });
  form.addEventListener('input', clearValidation);
  add.addEventListener('click', () => addModel(true));
  opener.addEventListener('click', () => {
    form.reset();
    channelDialog.showModal();
  });
  cancel.addEventListener('click', () => channelDialog.close());
  channelDialog.addEventListener('cancel', (event) => {
    if (submit.disabled) event.preventDefault();
  });
  channelDialog.addEventListener('close', () => opener.focus());

  const invalid = (input, message) => {
    input.setCustomValidity(message);
    input.reportValidity();
    showStatus(message, true);
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submit.disabled) return;
    clearValidation();
    const { channelName, endpoint, protocol, simulateError } = form.elements;
    const name = channelName.value.trim();
    if (!name) return invalid(channelName, '请输入渠道名称。');
    if (names.has(name.toLowerCase())) return invalid(channelName, '该渠道名称已存在。');

    const url = URL.parse(endpoint.value);
    if (!url || url.protocol !== 'https:' || url.username || url.password) {
      return invalid(endpoint, '请输入 HTTPS 地址，地址中请勿包含账号或密码。');
    }

    const usedIds = new Set();
    for (const input of models.querySelectorAll('input')) {
      const id = input.value.trim();
      if (!id) return invalid(input, '请输入模型 ID。');
      if (usedIds.has(id)) return invalid(input, '同一渠道内的模型 ID 不能重复。');
      usedIds.add(id);
    }

    const shouldFail = simulateError.checked;
    const selectedProtocol = protocol.value;
    fields.disabled = submit.disabled = reset.disabled = cancel.disabled = true;
    form.setAttribute('aria-busy', 'true');
    submit.textContent = '保存中…';
    showStatus('正在保存渠道。');

    await new Promise((resolve) => setTimeout(resolve, 500));

    fields.disabled = submit.disabled = reset.disabled = cancel.disabled = false;
    form.removeAttribute('aria-busy');
    submit.textContent = '保存渠道';

    if (shouldFail) {
      simulateError.checked = false;
      showStatus('模拟保存失败。配置已保留，请再次点击保存渠道。', true);
      submit.focus();
      return;
    }

    names.add(name.toLowerCase());
    const row = channelGuide.querySelector('[data-channel-records]').insertRow();
    const rowHeader = document.createElement('th');
    rowHeader.scope = 'row';
    rowHeader.textContent = name;
    row.append(rowHeader);
    row.insertCell().textContent = selectedProtocol;
    row.insertCell().textContent = String(usedIds.size);
    channelGuide.querySelector('[data-channel-result]').textContent = `已新增「${name}」。`;
    channelDialog.close();
  });
}
