var copyMarkdownSnippetFromOtherSite = (function(){ // ES6 modules are not supported by Chrome extensions, so closure used instead

  async function copyMarkdownSnippet(quitMode=false){
    let link = window.location.href;

    let lastNamePart = window.location.href.split('/').slice(-1)[0];
    let pageName = `${window.location.hostname}/…/${lastNamePart}`;

    let markdownSnippet = '';

    if (quitMode){
      markdownSnippet = (
          `${DELIMITER}\n` +
          `[${pageName}](${link}).\n`
      );
    } else {
      let codeSnippet = window.getSelection().toString();

      let preparedCodeSnippet = prepareCodeSnippet(codeSnippet);

      let syntax = '';

      // disabled if .md file because it is rendered on GitHub as HTML, not markdown.
      if (!pageName.endsWith('.md')){
        syntax = detectSyntaxByFilename(pageName);
      }

      markdownSnippet = (
        `${DELIMITER}\n`+
        `[_${pageName}_](${link})\n` +
        `\`\`\`${syntax}\n${preparedCodeSnippet}\n` +
        `\`\`\`\n`
      )
    }
    await navigator.clipboard.writeText(markdownSnippet);

    await highlightSelection();
  }
  return copyMarkdownSnippet;

})();
