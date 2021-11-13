import { Dusty } from '../../../types';

const dialogEl = document.getElementById('dialog');
const formEl = document.getElementById('form');
const labelEl = document.getElementById('label');
const cancelBtn = document.getElementById('cancel');
const okBtn = document.getElementById('ok');

export class Dialog {
  constructor(private _options: Dusty.DialogOptions) {
    labelEl.textContent = this._options.label;

    if (this._options?.buttonLabels?.ok) {
      okBtn.textContent = this._options.buttonLabels.ok;
    }

    if (this._options?.buttonLabels?.cancel) {
      cancelBtn.textContent = this._options.buttonLabels.cancel;
    }

    formEl.addEventListener('submit', () => {
      this._submitForm();
    });

    cancelBtn.addEventListener('click', () => {
      this._cancel();
    });

    okBtn.addEventListener('click', () => {
      this._submitForm();
    });

    const dataContainerElement = document.querySelector('#data-container');
    dataContainerElement.innerHTML = '';

    let dataElement;
    if (this._options.type === 'input') {
      dataElement = this._createInput();
    } else {
      dataElement = this._createSelect();
    }

    dataContainerElement.append(dataElement);
    dataElement.setAttribute('id', 'data');

    this._open();
    dataElement.focus();
  }

  /** Create dialog's input in DOM */
  private _createInput(): HTMLInputElement {
    const dataElement = document.createElement('input');
    dataElement.setAttribute('type', 'text');
    dataElement.placeholder = this._options.placeholder;

    if (this._options.value) {
      dataElement.value = this._options.value;
    } else {
      dataElement.value = '';
    }

    if (
      this._options.inputAttrs &&
      typeof this._options.inputAttrs === 'object'
    ) {
      for (const k in this._options.inputAttrs) {
        if (
          !Object.prototype.hasOwnProperty.call(this._options.inputAttrs, k)
        ) {
          continue;
        }

        dataElement.setAttribute(k, this._options.inputAttrs[k]);
      }
    }

    dataElement.addEventListener('keyup', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this._cancel();
      }
    });

    dataElement.addEventListener('keypress', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        this._submitForm();
      }
    });

    return dataElement;
  }

  /** Create dialog's select input in DOM */
  private _createSelect(): HTMLSelectElement {
    const dataElement = document.createElement('select');
    let optionElement;

    for (const k in this._options.selectOptions) {
      if (
        !Object.prototype.hasOwnProperty.call(this._options.selectOptions, k)
      ) {
        continue;
      }

      optionElement = document.createElement('option');
      optionElement.setAttribute('value', k);
      optionElement.textContent = this._options.selectOptions[k];
      if (k === this._options.value) {
        optionElement.setAttribute('selected', 'selected');
      }

      dataElement.append(optionElement);
    }

    return dataElement;
  }

  /** Open dialog */
  private _open(): void {
    dialogEl.classList.add('open');
  }

  /** Close dialog */
  private _close(): void {
    dialogEl.classList.remove('open');
  }

  /** Submit dialog form and close it */
  private _submitForm(): void {
    this._setValue();
    this._close();

    this._options.callback(this._options.value);
  }

  /** Set input value */
  private _setValue(): void {
    const dataEl = document.getElementById('data');

    this._options.value = (
      dataEl as HTMLInputElement | HTMLSelectElement
    ).value;
  }

  /** Cancel dialog */
  private _cancel(): void {
    this._close();
    this._options.value = null;
  }
}
