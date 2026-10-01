import type { InputService } from '../contracts/input';
import type { UiCommands, UiService } from '../contracts/ui';
import { strings } from '../content/strings.en';
import { uiStyles } from './styles';

export function createUiService(root: HTMLElement, commands: UiCommands, input: InputService): UiService {
  const events = new AbortController();
  const options = { signal: events.signal };
  const shell = document.createElement('div');
  shell.className = 'lw-ui';
  const style = document.createElement('style');
  style.textContent = uiStyles;
  const top = document.createElement('div');
  top.className = 'lw-top';
  const world = document.createElement('span');
  world.className = 'lw-world';
  const button = (text: string, click: () => void, muted = false) => {
    const element = document.createElement('button');
    element.type = 'button';
    element.textContent = text;
    if (muted) element.className = 'lw-muted';
    element.addEventListener('click', click, options);
    return element;
  };
  const pause = button(strings.pause, () => openPause());
  top.append(world, pause);
  const hint = document.createElement('p');
  hint.className = 'lw-hint';
  hint.hidden = true;
  hint.setAttribute('role', 'status');
  const prompt = document.createElement('div');
  prompt.className = 'lw-prompt';
  prompt.hidden = true;
  const promptText = document.createElement('span');
  const actionKey = document.createElement('kbd');
  actionKey.textContent = strings.actionKey;
  actionKey.style.cssText = 'border:1px solid #fff5d650;border-radius:5px;padding:2px 8px;font:600 13px system-ui';
  const hold = document.createElement('span');
  hold.className = 'lw-hold';
  hold.hidden = true;
  hold.setAttribute('role', 'progressbar');
  hold.setAttribute('aria-valuemin', '0');
  hold.setAttribute('aria-valuemax', '100');
  prompt.append(hold, promptText, actionKey);
  const backdrop = document.createElement('div');
  backdrop.className = 'lw-modal-backdrop';
  backdrop.hidden = true;
  const panel = document.createElement('section');
  panel.className = 'lw-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  backdrop.append(panel);
  const loading = document.createElement('div');
  loading.className = 'lw-loading';
  loading.hidden = true;
  loading.setAttribute('role', 'status');
  const spinner = document.createElement('div');
  spinner.className = 'lw-spinner';
  spinner.setAttribute('aria-hidden', 'true');
  const loadingText = document.createElement('span');
  loading.append(spinner, loadingText);
  shell.append(style, top, hint, prompt, backdrop, loading);
  root.append(shell);
  let modal: 'pause' | 'reflection' | 'confirm' | null = null;
  let modalRelease: (() => void) | null = null;
  let loadRelease: (() => void) | null = null;
  let previousFocus: HTMLElement | null = null;
  const inertState = new Map<HTMLElement, boolean>();

  const setOutsideInert = (value: boolean) => {
    if (value) {
      const elements: Element[] = [];
      let branch: HTMLElement | null = shell;
      while (branch?.parentElement) {
        elements.push(...[...branch.parentElement.children].filter(element => element !== branch));
        branch = branch.parentElement;
        if (branch === document.body) break;
      }
      for (const element of elements) {
        if (!(element instanceof HTMLElement) || element === shell || element.contains(shell)) continue;
        if (!inertState.has(element)) inertState.set(element, element.inert);
        element.inert = true;
      }
      top.inert = hint.inert = prompt.inert = true;
    } else {
      for (const [element, previous] of inertState) element.inert = previous;
      inertState.clear();
      top.inert = hint.inert = prompt.inert = false;
    }
  };
  const beginModal = (kind: typeof modal) => {
    if (!modalRelease) {
      previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      modalRelease = input.lock('ui-modal');
      setOutsideInert(true);
    }
    modal = kind;
    backdrop.hidden = false;
    panel.replaceChildren();
  };
  const closeModal = () => {
    const wasPause = modal === 'pause' || modal === 'confirm';
    modal = null;
    backdrop.hidden = true;
    panel.replaceChildren();
    modalRelease?.();
    modalRelease = null;
    if (!loadRelease) setOutsideInert(false);
    if (wasPause) commands.pause(false);
    if (!loadRelease) previousFocus?.focus();
    previousFocus = null;
  };
  const heading = (text: string) => {
    const element = document.createElement('h1');
    element.id = 'lw-dialog-title';
    element.textContent = text;
    panel.setAttribute('aria-labelledby', element.id);
    panel.append(element);
  };
  const focusFirst = () => panel.querySelector<HTMLElement>('textarea,button')?.focus();
  const confirm = (text: string, action: () => void) => {
    beginModal('confirm');
    heading(text);
    const buttons = document.createElement('div');
    buttons.className = 'lw-buttons';
    buttons.append(button(strings.cancel, openPause, true), button(strings.confirm, () => { action(); closeModal(); }));
    panel.append(buttons);
    focusFirst();
  };
  function openPause() {
    if (loadRelease || modal === 'reflection') return;
    beginModal('pause');
    commands.pause(true);
    heading(strings.pause);
    const menu = document.createElement('div');
    menu.className = 'lw-menu';
    menu.append(button(strings.resume, closeModal), button(strings.newGame, () => confirm(strings.confirmNew, commands.newGame), true), button(strings.delete, () => confirm(strings.confirmDelete, commands.deleteReflections), true));
    panel.append(menu);
    focusFirst();
  }
  window.addEventListener('keydown', event => {
    if (event.code === 'Escape' && !event.repeat) {
      event.preventDefault();
      if (modal === 'pause') closeModal();
      else if (modal === 'confirm') openPause();
      else if (modal === null) openPause();
    }
    if (event.key !== 'Tab' || modal === null) return;
    const items = [...panel.querySelectorAll<HTMLElement>('button,textarea,[tabindex="0"]')].filter(element => !element.hasAttribute('disabled'));
    const first = items[0];
    const last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }, options);
  return {
    prompt(text, isHold = false) { prompt.hidden = text === null; promptText.textContent = text ?? ''; actionKey.hidden = input.isTouch(); hold.hidden = !isHold; hold.style.setProperty('--progress', '0'); },
    hold(progress) { const value = Math.max(0, Math.min(1, progress)); hold.style.setProperty('--progress', String(value)); hold.setAttribute('aria-valuenow', String(Math.round(value * 100))); },
    reflection(text) {
      if (modal === 'reflection') return;
      if (modal === 'pause' || modal === 'confirm') commands.pause(false);
      beginModal('reflection');
      heading(strings.question);
      const help = document.createElement('p');
      help.id = 'lw-reflection-help';
      help.textContent = strings.reflectionHelp;
      const answer = document.createElement('textarea');
      answer.maxLength = 2000;
      answer.value = text.slice(0, 2000);
      answer.setAttribute('aria-label', strings.words);
      answer.setAttribute('aria-describedby', help.id);
      const count = document.createElement('span');
      count.className = 'lw-count';
      const updateCount = () => { count.textContent = `${answer.value.length} / 2000`; };
      updateCount();
      answer.addEventListener('input', updateCount, options);
      const buttons = document.createElement('div');
      buttons.className = 'lw-buttons';
      buttons.append(button(strings.save, () => { commands.saveReflection(answer.value.slice(0, 2000)); closeModal(); }), button(strings.skip, () => { commands.skipReflection(); closeModal(); }, true));
      panel.append(help, answer, count, buttons);
      focusFirst();
    },
    closeReflection() { if (modal === 'reflection') closeModal(); },
    loading(visible, text = strings.loading) {
      loading.hidden = !visible;
      loadingText.textContent = text;
      if (visible && !loadRelease) { loadRelease = input.lock('ui-loading'); setOutsideInert(true); backdrop.inert = true; }
      if (!visible && loadRelease) { loadRelease(); loadRelease = null; backdrop.inert = false; if (!modalRelease) setOutsideInert(false); }
    },
    hint(text) { hint.textContent = text; hint.hidden = !text; },
    world(name) { world.textContent = name; },
    dispose() { events.abort(); modalRelease?.(); loadRelease?.(); setOutsideInert(false); shell.remove(); },
  };
}
