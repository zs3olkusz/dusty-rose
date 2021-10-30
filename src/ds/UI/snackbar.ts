const snackbar = document.getElementById('snackbar');

// close snackbar by removing class
const close = () => snackbar.classList.remove('show');

export function showSnackbar(title: string, description: string): void {
  snackbar.querySelector('#title').textContent = title;
  snackbar.querySelector('#description').textContent = description;

  snackbar.classList.add('show');

  snackbar.addEventListener('click', close);

  // After 3 seconds, remove the show class from snackbar
  setTimeout(() => {
    close();
    snackbar.removeEventListener('click', close);
  }, 3000);
}
