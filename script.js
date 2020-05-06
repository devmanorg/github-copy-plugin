async function handleKeyUp(e) {
  if (e.altKey && e.keyCode == 67){ // Latin or Cyrillic key C
    e.preventDefault();
    e.stopPropagation();

    try {
      if (window.location.host == 'github.com'){
        await copyMarkdownSnippetFromGithub(e.shiftKey);
      } else {
        await copyMarkdownSnippetFromOtherSite();
      }
      console.log('copied');
    } catch (e) {
      console.error(e);
      if (e instanceof DOMException){
        alert(e.message);
      } else {
        alert('Copy plugin is broken');
      }
    }
  }
}

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
        `<hr/>\n` +
        `*Файл [${filePath}](${reviewLink})${positionSuffix}.*\n`
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
      `<hr/>\n`+
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
    `<hr/>\n`+
    `*[Source: ${window.location.hostname}](${window.location.href}).*\n` +
    `\`\`\`\n${preparedCodeSnippet}\n` +
    `\`\`\`\n`
  )
  await navigator.clipboard.writeText(markdownSnippet);
}

// register the handler
document.addEventListener('keyup', handleKeyUp, false);