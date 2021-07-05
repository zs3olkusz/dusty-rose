export function js(el: any): void {
  for (const node of el.children) {
    const s = node.innerText
      .replace(/(\/\/.*)/g, '<em>$1</em>')
      .replace(
        /\b(new|if|else|do|while|switch|for|in|of|continue|break|return|typeof|function|var|const|let|\.length|\.\w+)(?=[^\w])/g,
        '<strong>$1</strong>'
      )
      .replace(/(".*?"|'.*?'|`.*?`)/g, '<strong><em>$1</em></strong>')
      .replace(/\b(\d+)/g, '<em><strong>$1</strong></em>');

    node.innerHTML = s.split('\n').join('<br/>');
  }
}
