var copyMarkdownSnippetFromReplIt = (function(){ // ES6 modules are not supported by Chrome extensions, so closure used instead

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function highlightReplitSeletedLines(){
    let elements = document.querySelectorAll('.view-overlays .selected-text, .ace_selection');
    for (let element of elements){
      highlightElement(element);  // launch multiple coroutines in parallel
    }
  }

  function* collectFolders(node){
    while (true){
      node = node.parentNode.closest('.dir-node:not(.root-node)');

      if (!node){
        return;
      }

      const folderMenuItem = node.querySelector('[title]');

      if (!folderMenuItem){
        return;
      }

      yield folderMenuItem.title;
    }
  }

  async function copyMarkdownSnippet(quitMode=false){
    let link = window.location.href;
    let [replURL, filePath] = link.split('#');

    if (!filePath){
      // If Repl is belong to someone else UI will differ, so alternative logic used
      const fileNode = document.querySelector('.node.active.interactive [title]');

      if (fileNode){
        const filePathParts = [
          ...Array.from(collectFolders(fileNode)).reverse(),
          fileNode.title,
        ];
        filePath = filePathParts.join('/');
      }
    }

    filePath = filePath || '?';

    let markdownSnippet = '';

    if (quitMode){
      markdownSnippet = (
          `---\n` +
          `Файл [${filePath}](${link}).\n`
      );
    } else {

      document.execCommand("copy"); // getSelection returns truncated text for large code snippets
      let codeSnippet = await navigator.clipboard.readText();

      let preparedCodeSnippet = prepareCodeSnippet(codeSnippet);
      let syntax = detectSyntaxByFilename(filePath);

      markdownSnippet = (
        `---\n`+
        `[_${filePath}_](${link})\n` +
        `\`\`\`${syntax}\n${preparedCodeSnippet}\n` +
        `\`\`\`\n`
      )
    }
    await navigator.clipboard.writeText(markdownSnippet);

    await highlightReplitSeletedLines();
  }

  return copyMarkdownSnippet;

})();
