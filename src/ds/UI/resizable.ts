export function resizable(): void {
  const resizer = document.getElementById('resizer');
  const aside = document.getElementsByTagName('aside')[0];
  const main = document.getElementsByTagName('main')[0];

  let x = 0;
  let y = 0;
  let asideWidth = 0;

  const mouseDownHandler = (e: MouseEvent): void => {
    // Get the current mouse position
    x = e.clientX;
    y = e.clientY;

    asideWidth = aside.getBoundingClientRect().width;

    // Attach the listeners to `document`
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  };

  const mouseMoveHandler = (e: MouseEvent): void => {
    // How far the mouse has been moved
    const dx = e.clientX - x;
    const dy = e.clientY - y;

    const newLeftWidth =
      ((asideWidth + dx) * 100) /
      (resizer.parentNode as HTMLElement).getBoundingClientRect().width;
    aside.style.width = `${newLeftWidth}%`;

    resizer.style.cursor = 'col-resize';
    document.body.style.cursor = 'col-resize';

    aside.style.userSelect = 'none';
    aside.style.pointerEvents = 'none';

    main.style.userSelect = 'none';
    main.style.pointerEvents = 'none';
  };

  const mouseUpHandler = (): void => {
    resizer.style.removeProperty('cursor');
    document.body.style.removeProperty('cursor');

    aside.style.removeProperty('user-select');
    aside.style.removeProperty('pointer-events');

    main.style.removeProperty('user-select');
    main.style.removeProperty('pointer-events');

    // Remove the handlers of `mousemove` and `mouseup`
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
  };

  // Attach the handler
  resizer.addEventListener('mousedown', mouseDownHandler);
}
