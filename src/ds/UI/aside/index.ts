export function initFileStruct(): void {
  const togglers = document.getElementsByClassName('caret');

  for (let i = 0; i < togglers.length; i++) {
    togglers[i].addEventListener('click', function () {
      this.parentElement.querySelector('.nested').classList.toggle('active');
      this.classList.toggle('caret-down');
    });
  }
}
