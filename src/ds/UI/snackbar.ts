const snackbar = document.getElementById('snackbar');

/** Close snackbar by removing class */
const close = () => snackbar.classList.remove('show');

/** Show snackbar with given title and message */
export function showSnackbar(title: string, description: string): void {
  snackbar.querySelector('#title').textContent = title;
  snackbar.querySelector('#description').textContent = description;

  snackbar.classList.add('show');

  snackbar.addEventListener('click', close);

  // After 3 seconds, remove the show class from snackbar
  setTimeout(() => {
    close();
    snackbar.removeEventListener('click', close);
  }, 4000);
}
