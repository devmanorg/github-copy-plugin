var copyMarkdownSnippetFromReplIt = (function(){ // ES6 modules are not supported by Chrome extensions, so closure used instead

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function highlightReplitSeletedLines(){
    let elements = document.querySelectorAll('.view-overlays .selected-text');
    for (let element of elements){
      highlightElement(element);  // launch multiple coroutines in parallel
    }
  }

  async function copyMarkdownSnippet(quitMode=false){
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

    await highlightReplitSeletedLines();
  }

  return copyMarkdownSnippet;

})();
