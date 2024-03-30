function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function highlightElement(element){
  element.style.setProperty('background-color', '#badbcc', 'important');

  await sleep(50);

  element.style['transition'] = 'background-color 0.2s ease-in';
  element.style['backgroundColor'] = '';

  await sleep(350);

  element.style['transition'] = '';
}

async function highlightSelection(){
  let head = document.head;
  let styleEl = document.createElement('style');
  styleEl.type = 'text/css';
  styleEl.appendChild(document.createTextNode(`
    ::selection {
      background-color: #badbcc !important;
    }
  `));

  head.appendChild(styleEl);

  await sleep(400);  // FIXME background animation removed because works strange

  head.removeChild(styleEl);
}
