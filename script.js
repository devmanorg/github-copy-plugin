function addJS(url){
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;    

  document.head.appendChild(script);
}

function delay(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

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
        continue
    }
    let indentSize = line.length - line.trimLeft().length;
    indents.push(indentSize);
  }

  if (!indents.length){
    indents.push(0)
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

async function prepareCodeSnippet(){
  document.getElementById('js-copy-lines').dispatchEvent(new Event('click'));

  // wait till async copy operation will be finished
  await delay(250);

  return await navigator.clipboard.readText();
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

  let markdownSnippet = '';
  if (quitMode){
    markdownSnippet = (
        `<hr/>\n` +
        `*Файл [${filePath}](${link}) :*\n`
    );
  } else {
    let codeSnippet = '';

    // copy code
    let codeLinesAreSelected = Boolean(linesCode);
    if (codeLinesAreSelected){
      codeSnippet = await prepareCodeSnippet();
    } else {
      codeSnippet = window.getSelection().toString();
    }

    let preparedCodeSnippet = trimRightEachLine(codeSnippet);
    preparedCodeSnippet = dedent(preparedCodeSnippet);
    preparedCodeSnippet = removeBlankLines(preparedCodeSnippet);
    preparedCodeSnippet = addIndentBeforeOctothorpe(preparedCodeSnippet);

    markdownSnippet = (
      `<hr/>\n`+
      `*Файл [${filePath}](${link})${codeLinesAreSelected && ':'+linesCode || ''} :*\n` +
      `\`\`\`\n${preparedCodeSnippet}\n` +
      `\`\`\`\n`
    )
  }
  await navigator.clipboard.writeText(markdownSnippet);
  console.log('copied');
}

// register the handler
document.addEventListener('keyup', handleKeyUp, false);