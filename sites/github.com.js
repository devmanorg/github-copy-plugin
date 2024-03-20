var copyMarkdownSnippetFromGithub = (function(){ // ES6 modules are not supported by Chrome extensions, so closure used instead

  function cleanOctotreeLinkGarbage(url){
    // workaround for https://www.octotree.io/ chrome plugin bug.
    return url.replace(/\?_pjax=[\%\-\w\.\_]+/i, '?')
  }
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function highlightGitHubSeletedLines(){
    let lines = document.querySelectorAll('.js-file-line.highlighted');
    if (lines.length === 0) {
      lines = document.querySelectorAll('div[aria-current]');
    }
    for (let line of lines){
      highlightElement(line);  // launch multiple coroutines in parallel
    }
  }

  function convertLineElToText(lineEl){
    let spans = lineEl.querySelectorAll('span');
    let textFragments = Array.prototype.map.call(spans, span => span.getAttribute('data-code-text'))
    return textFragments.join('')
  }

  function readHighlightedLines(){
    // Read code lines highlighted on GitHub page, return multiline string
    let lines = document.querySelectorAll('.js-file-line-container .js-file-line.highlighted');
    if (lines.length === 0) {
      lines = document.querySelectorAll('div[aria-current]');
    }
    const codeLines = Array.prototype.map.call(lines, convertLineElToText);
    return codeLines.join('\n');
  }

  async function copyMarkdownSnippet(quitMode=false){
    let link = window.location.href;
    let filePath;
    let fileURL, linesCode;
    if (link.includes('commits')){
      filePath = 'commits';
    }
    else{
      // trigger GitHub switch to canonical url with commit hash
      document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'y'}));
      link = cleanOctotreeLinkGarbage(window.location.href);
      [fileURL, linesCode] = link.split('#');
      filePath = fileURL.split(/\/[a-z0-9]{40,}\//)[1] || 'README';
      filePath = filePath.split('?')[0];
    }

    if (filePath.length > 40){
      let startIndex = filePath.length - 41;
      filePath = `…${filePath.substring(startIndex)}`;
    }

    let selection = document.getSelection().toString();
    if (!selection) {
      selection = document.activeElement.value.substring(
        document.activeElement.selectionStart,
        document.activeElement.selectionEnd
      )
    }

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
          `${DELIMITER}\n` +
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
        `${DELIMITER}\n`+
        `[_${filePath}${positionSuffix}_](${reviewLink})\n` +
        `\`\`\`${syntax}\n${preparedCodeSnippet}\n` +
        `\`\`\`\n`
      )
    }
    await navigator.clipboard.writeText(markdownSnippet);

    // Show which snippet was copied
    if (selection){
      await highlightSelection();
    } else if (codeLinesAreSelected){
      await highlightGitHubSeletedLines();
    }

  }

  return copyMarkdownSnippet;
})();
