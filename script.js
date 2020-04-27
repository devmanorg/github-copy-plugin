function handleKeyUp(e) {
    if (e.altKey && e.keyCode == 67){ // Latin or Cyrillic key C
        copyMarkdownSnippet(e.shiftKey);
    }
}

function dedent(text) {
  let lines = text.split('\n');

  let indents = [];
  for (let line of lines){
    if (!line.trim()){
        continue;
    }
    let indentSize = line.length - line.trimLeft().length;
    indents.push(indentSize);
  }

  if (!indents.length){
    indents.push(0);
  }
  let minIndent = Math.min(...indents);

  let formattedLines = lines.map(line => line.substring(minIndent));

  return formattedLines.join('\n');
}

function trimRightEachLine(text) {
  let lines = text.split('\n');

  let formattedLines = lines.map(line => line.trimRight());

  return formattedLines.join('\n');
}

function removeBlankLines(text){
  return text.replace(/\n+/g, '\n').replace(/^\n/, '').replace(/\n$/, '');
}

function addIndentBeforeOctothorpe(text){
  // FIXME workaround for devman reviewer UI bug - add single whitespace before #
  if (text.search(/^#/m) < 0){
    return text;
  }

  return text.replace(/^/gm, ' ');  // add whitespace to every line to not broke Python code
}

function prepareCodeSnippet(text){
    let preparedText = trimRightEachLine(text);
    preparedText = dedent(preparedText);
    preparedText = removeBlankLines(preparedText);
    preparedText = addIndentBeforeOctothorpe(preparedText);
    return preparedText;
}

function readHighlightedLines(){
  // Read code lines highlighted on GitHub page, return multiline string
  const lines = document.querySelectorAll('.js-file-line-container .js-file-line.highlighted');
  const map = Array.prototype.map;
  const codeLines = map.call(lines, line => line.innerText);
  return codeLines.join('\n');
}

async function copyMarkdownSnippet(quitMode=false){
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
  console.log('copied');
}

// register the handler
document.addEventListener('keyup', handleKeyUp, false);