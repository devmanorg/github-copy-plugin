function readHighlightedLines(){
  // Read code lines highlighted on GitHub page, return multiline string
  const lines = document.querySelectorAll('.js-file-line-container .js-file-line.highlighted');
  const map = Array.prototype.map;
  const codeLines = map.call(lines, line => line.innerText);
  return codeLines.join('\n');
}

async function copyMarkdownSnippetFromGithub(quitMode=false){
  // trigger GitHub switch to canonical url with commit hash
  document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'y'}));
  let link = window.location.href;
  let [fileURL, linesCode] = link.split('#');

  let filePath = fileURL.split(/\/[a-z0-9]{40,}\//)[1] || 'README';

  if (filePath.length > 40){
    let startIndex = filePath.length - 41;
    filePath = `…${filePath.substring(startIndex)}`;
  }

  let selection = window.getSelection().toString();
  let codeLinesAreSelected = Boolean(linesCode) && !selection; // selection has priority
  let reviewLink = selection && fileURL || link;
  const positionSuffix = codeLinesAreSelected && ':'+linesCode || '';

  let markdownSnippet = '';
  if (quitMode){
    markdownSnippet = (
        `---\n` +
        `*Файл [${filePath}](${reviewLink})${positionSuffix}.*\n\n`
    );
  } else {
    let codeSnippet = '';

    // copy code
    if (selection) {
      codeSnippet = selection;
    } else if (codeLinesAreSelected){
      codeSnippet = readHighlightedLines();
    } else {
      alert('Выделите фрагмент текста');
    }

    let preparedCodeSnippet = prepareCodeSnippet(codeSnippet);

    markdownSnippet = (
      `---\n`+
      `*Файл [${filePath}](${reviewLink})${positionSuffix} :*\n` +
      `\`\`\`\n${preparedCodeSnippet}\n` +
      `\`\`\`\n`
    )
  }
  await navigator.clipboard.writeText(markdownSnippet);
}

async function copyMarkdownSnippetFromOtherSite(){
  let link = window.location.href;
  
  let codeSnippet = window.getSelection().toString();

  let preparedCodeSnippet = prepareCodeSnippet(codeSnippet);

  let markdownSnippet = (
    `---\n`+
    `*[Source: ${window.location.hostname}](${link}).*\n` +
    `\`\`\`\n${preparedCodeSnippet}\n` +
    `\`\`\`\n`
  )
  await navigator.clipboard.writeText(markdownSnippet);
}

function wrapWithErrorsHandler(callback){
  async function wrapper(...args) {
    try {
      await callback(...args);
      console.log('copied');
    } catch (error) {
      console.error(error);
      if (error instanceof DOMException){
        alert(error.message);
      } else {
        alert('Copy plugin is broken');
      }
    }
  }
  return wrapper;
}

function initGitHub(){
  async function handleKeyUp(event) {
    if (event.altKey && event.code == 'KeyC'){ // Latin or Cyrillic key C
      event.preventDefault();
      event.stopPropagation();

      await wrapWithErrorsHandler(copyMarkdownSnippetFromGithub)(event.shiftKey);
    }
  }

  document.addEventListener('keyup', handleKeyUp, {
    capture: false,
  });

  window.addEventListener("hashchange",function(event){
    // clear selection when lines of code selected and anchor change
    // otherwise on GitHub plugin will copy old selection and not lines
    document.getSelection().removeAllRanges();
  });
}

function initReplIt(){
  async function handleKeyUp(event) {
    if (event.altKey && event.code == 'KeyC'){ // Latin or Cyrillic key C
      event.preventDefault();
      event.stopPropagation();

      await wrapWithErrorsHandler(copyMarkdownSnippetFromReplIt)();
    }
  }

  document.addEventListener('keyup', handleKeyUp, {
    capture: false,
  });
}

function initNonameSite(){
  async function handleKeyUp(event) {
    if (event.altKey && event.code == 'KeyC'){ // Latin or Cyrillic key C
      event.preventDefault();
      event.stopPropagation();

      await wrapWithErrorsHandler(copyMarkdownSnippetFromOtherSite)();
    }
  }

  document.addEventListener('keyup', handleKeyUp, {
    capture: false,
  });
}

if (window.location.host == 'github.com'){
  console.log('CopyPlugin: GitHub detected');
  initGitHub();
} else if (window.location.host == 'repl.it'){
  console.log('CopyPlugin: Repl.it detected');
  initNonameSite();
} else {
  console.log('CopyPlugin: Unknown site, so activate default behaviour');
  initNonameSite();
}
