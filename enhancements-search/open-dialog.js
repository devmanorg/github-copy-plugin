let modal_dialog = '<style>\n' +
  '.hide{\n' +
  '    display: none;\n' +
  '}\n' +
  '.modal{\n' +
  '    /*display: none;*/\n' +
  '    position: fixed;\n' +
  '    width: 100%;\n' +
  '    height: 100%;\n' +
  '    background-color: rgba(0,0,0,0.3);\n' +
  '    top:0;\n' +
  '    left: 0;\n' +
  '}\n' +
  '.modal-body{\n' +
  '    min-height: 100%;\n' +
  '    display: flex;\n' +
  '    align-items: center;\n' +
  '    justify-content: center;\n' +
  '    padding: 30px 10px;\n' +
  '}\n' +
  '\n' +
  '.modal-content{\n' +
  '    background-color: white;\n' +
  '    color: #000;\n' +
  '    max-width: 800px;\n' +
  '    padding: 20px;\n' +
  '}\n' +
  '.modal-header{\n' +
  '    display: flex;\n' +
  '    justify-content: space-between;\n' +
  '    font-size: 20px;\n' +
  '    max-height: 50px;\n' +
  '    margin: 5px;\n' +
  '    border-bottom: 1px #eee;\n' +
  '}\n' +
  '.modal-close{\n' +
  '    background-color: transparent;\n' +
  '    border: 0;\n' +
  '    font-size: 20px;\n' +
  '}\n' +
  '.modal-header h5{\n' +
  '    margin: 0;\n' +
  '}\n' +
  '.modal-main{\n' +
  '    width: 100%;\n' +
  '    font-size: 10px;\n' +
  '    margin: 10px 0;\n' +
  '}\n' +
  '.modal-input{\n' +
  '    margin-bottom: 10px;\n' +
  '}\n' +
  '.modal-main h6{\n' +
  '    margin: 5px;\n' +
  '    color: #495057;\n' +

  '}\n' +
  '.modal-main input{\n' +
  '    width: 100%;\n' +
  '}\n' +
  '.modal-main button{\n' +
  '    width: 100%;\n' +
  '    max-height: 50px;\n' +
  '    font-size: 20px;\n' +
  '    text-align: left;\n' +
  '    position: relative;\n' +
  '    display: block;\n' +
  '    padding: .75rem 1.25rem;\n' +
  '    background-color: #fff;\n' +
  '    border: 1px solid rgba(0,0,0,.125);\n' +
  '}\n' +
  '</style>\n' +
  '  <div class="modal-body">\n' +
  '\n' +
  '    <div class="modal-content">\n' +
  '      <div class="modal-header">\n' +
  '        <h5 class="modal-title">Типичные улучшения</h5>\n' +
  '        <button type="button" class="close modal-close" data-dismiss="modal" aria-label="Close">\n' +
  '          <span aria-hidden="true">&times;</span>\n' +
  '        </button>\n' +
  '      </div>\n' +
  '\n' +
  '      <div class="modal-main">\n' +
  '        <div class="modal-input" style="min-width: 400px;">\n' +
  '            <input type="text" id="common-error-search" tabindex="1" class="form-control" autocomplete="off"/>\n' +
  '              <kbd class="bg-transparent text-muted">Enter</kbd>, чтобы добавить новое улучшение.\n' +
  '        </div>\n' +
  '        <div id="tags-available" style="min-width: 150px;">\n' +
  '        </div>\n' +
  '      </div>\n' +
  '    </div>\n' +
  '\n' +
  '</div>';

function createEnhBlock(title, url){
  let enhBlock = document.createElement("div");
  let enhTemplate = `<button type="button" tabindex="2" url="${url}">
    <h6>${title}</h6></button>`;
  enhBlock.innerHTML = enhTemplate;
  return enhBlock;
}

let openDialog = (async function(){
  let shadowBox = document.getElementById("find-enhancement")
  if (shadowBox) {
    shadowBox.classList.toggle("hide");
    let query_field = shadowBox.shadowRoot.querySelector("#common-error-search");
    query_field.focus();
    return;
  }
  else {
    shadowBox = document.createElement("div");
    shadowBox.id = "find-enhancement";
    // Добавлен для обхода обработки горячих клавиш на githab
    // Github перехватывает событие keydown
    // Игнорирует если target - select, input, textarea, editable
    shadowBox.contentEditable = "true";
    let shadowRoot = shadowBox.attachShadow({mode: 'open'});
    let dialog = document.createElement("div");
    dialog.classList.add("modal");
    dialog.innerHTML = modal_dialog;
    shadowRoot.append(dialog);
    document.body.append(shadowBox);
  }

  let query_field = shadowBox.shadowRoot.querySelector("#common-error-search");
  let enhBlocks = shadowBox.shadowRoot.querySelectorAll("button");

  query_field.addEventListener("input", inputHandler, {capture: false, composed: false});
  query_field.focus();

  enhBlocks.forEach((enhBlock) => {
    enhBlock.addEventListener("click", handleEnter);
  })
  chrome.runtime.onMessage.addListener(handle_response);

})

async function handle_response (message, sender, sendResponse){
  let domain = message.domain;
  let enhancements = message.enhancements;
  let shadowBox = document.querySelector("#find-enhancement");
  let enhancements_block = shadowBox.shadowRoot.querySelector("#tags-available");
  enhancements_block.innerHTML = "";
  enhancements.forEach(function (enhancement, i ,enhancements){
    let enhBlock = createEnhBlock(enhancement["text"], domain + enhancement["url"]);
    enhBlock.querySelector("button").addEventListener("click", handleEnter);
    enhancements_block.append(enhBlock);
  })
  return true;
}

async function handleEnter(e){
  e.preventDefault();

  let enhAction = this.querySelector("h6").innerText;
  let enhUrl = this.getAttribute("url");

  let snippet = (
    `[${enhAction}](${enhUrl})`
  )
  await navigator.clipboard.writeText(snippet);
  let dialog = document.getElementById("find-enhancement");
  if (dialog){
    dialog.classList.add("hide");
  }

}

async function inputHandler(e){
  e.preventDefault();
  let query = e.target.value
  let enhancements = document.getElementById('tags-available');
  if (query.length >= 3){
    chrome.runtime.sendMessage({ msg: "getEnhancement", query: query });
  }
}
