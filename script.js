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
    if (event.ctrlKey && event.code == 'KeyQ'){
      event.preventDefault();

      await dialog.openDialog();
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
} else if (window.location.host == 'repl.it' || window.location.host == 'replit.com'){
  console.log('CopyPlugin: Repl.it detected');
  initReplIt();
} else {
  console.log('CopyPlugin: Unknown site, so activate default behaviour');
  initNonameSite();
}
