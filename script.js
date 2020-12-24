function readHighlightedLines(){
  // Read code lines highlighted on GitHub page, return multiline string
  const lines = document.querySelectorAll('.js-file-line-container .js-file-line.highlighted');
  const map = Array.prototype.map;
  const codeLines = map.call(lines, line => line.innerText);
  return codeLines.join('\n');
}

function detectSyntaxByFilename(filename){
  if (filename.endsWith('.py')){
    return 'python'
  }
  if (filename.endsWith('.js')){
    return 'js'
  }
  if (filename.endsWith('.html')){
    return 'html'
  }
  if (filename.endsWith('.svg')){
    return 'markup'
  }
  if (filename.endsWith('.xml')){
    return 'markup'
  }
  if (filename.endsWith('.css')){
    return 'css'
  }
  if (filename.endsWith('.sh')){
    return 'bash'
  }
  if (filename == 'Dockerfile' || filename.endsWith('/Dockerfile')){
    return 'dockerfile'
  }
  if (filename.endsWith('.diff')){
    return 'diff'
  }
  if (filename.endsWith('.json')){
    return 'json'
  }
  if (filename.endsWith('.md')){
    return 'md'
  }
  if (filename.endsWith('.yaml')){
    return 'yaml'
  }
  if (filename.endsWith('.sql')){
    return 'sql'
  }
  if (filename.endsWith('.editorconfig')){
    return 'editorconfig'
  }
  if (filename.endsWith('.toml')){
    return 'toml'
  }
  if (filename.endsWith('.ini')){
    return 'ini'
  }

  return '';
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
  let positionSuffix = '';
  if (codeLinesAreSelected){
    let match = linesCode.match(/\d+/);
    if (match){
      let firstLineNumber = match[0];
      positionSuffix = `:${firstLineNumber}`
    }
  }

  let markdownSnippet = '';
  if (quitMode){
    markdownSnippet = (
        `---\n` +
        `Файл [${filePath}${positionSuffix}](${reviewLink}).\n`
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
    let syntax = '';

    // disabled if .md file because it is rendered on GitHub as HTML, not markdown.
    if (!filePath.endsWith('.md')){
      syntax = detectSyntaxByFilename(filePath);
    }

    markdownSnippet = (
      `---\n`+
      `[_${filePath}${positionSuffix}_](${reviewLink})\n` +
      `\`\`\`${syntax}\n${preparedCodeSnippet}\n` +
      `\`\`\`\n`
    )
  }
  await navigator.clipboard.writeText(markdownSnippet);
}

async function copyMarkdownSnippetFromReplIt(quitMode=false){
  let link = window.location.href;
  let [replURL, fileName] = link.split('#');

  let markdownSnippet = '';

  if (quitMode){
    markdownSnippet = (
        `---\n` +
        `Файл [${fileName}](${link}).\n`
    );
  } else {

    document.execCommand("copy"); // getSelection returns truncated text for large code snippets
    let codeSnippet = await navigator.clipboard.readText();

    let preparedCodeSnippet = prepareCodeSnippet(codeSnippet);
    let syntax = detectSyntaxByFilename(fileName);

    markdownSnippet = (
      `---\n`+
      `[_${fileName}_](${link})\n` +
      `\`\`\`${syntax}\n${preparedCodeSnippet}\n` +
      `\`\`\`\n`
    )
  }
  await navigator.clipboard.writeText(markdownSnippet);
}

async function copyMarkdownSnippetFromOtherSite(quitMode=false){
  let link = window.location.href;

  let lastNamePart = window.location.href.split('/').slice(-1)[0];
  let pageName = `${window.location.hostname}/…/${lastNamePart}`;

  let markdownSnippet = '';

  if (quitMode){
    markdownSnippet = (
        `---\n` +
        `[${pageName}](${link}).\n`
    );
  } else {
    let codeSnippet = window.getSelection().toString();

    let preparedCodeSnippet = prepareCodeSnippet(codeSnippet);

    markdownSnippet = (
      `---\n`+
      `[_${pageName}_](${link})\n` +
      `\`\`\`\n${preparedCodeSnippet}\n` +
      `\`\`\`\n`
    )
  }
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

      await wrapWithErrorsHandler(copyMarkdownSnippetFromReplIt)(event.shiftKey);
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

      await wrapWithErrorsHandler(copyMarkdownSnippetFromOtherSite)(event.shiftKey);
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
  initReplIt();
} else {
  console.log('CopyPlugin: Unknown site, so activate default behaviour');
  initNonameSite();
}
