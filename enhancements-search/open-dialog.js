let modal_dialog = `
<style>
  .hide{
      display: none;
  }
  .modal{
      /*display: none;*/
      z-index: 2147483647;  /* max possible value */
      position: fixed;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.3);
      top:0;
      left: 0;
  }
  .modal-body{
      min-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 30px 10px;
  }

  .modal-content{
      background-color: white;
      color: #000;
      max-width: 800px;
      padding: 20px;
  }
  .modal-header{
      display: flex;
      justify-content: space-between;
      font-size: 20px;
      max-height: 50px;
      margin: 5px;
      border-bottom: 1px #eee;
  }
  .modal-close{
      background-color: transparent;
      border: 0;
      font-size: 20px;
  }
  .modal-header h5{
      margin: 0;
  }
  .modal-main{
      width: 100%;
      font-size: 10px;
      margin: 10px 0;
  }
  .modal-input{
      margin-bottom: 10px;
  }
  .modal-main h6{
      margin: 5px;
      color: #495057;

  }
  .modal-main input{
      width: 100%;
  }
  .modal-main button{
      width: 100%;
      max-height: 50px;
      font-size: 20px;
      text-align: left;
      position: relative;
      display: block;
      padding: .75rem 1.25rem;
      background-color: #fff;
      border: 1px solid rgba(0,0,0,.125);
  }
</style>
<div class="modal-body">
  <div class="modal-content">
    <div class="modal-header">
      <h5 class="modal-title">Типичные улучшения</h5>
      <button type="button" class="close modal-close js-close-modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>

    <div class="modal-main">
      <div class="modal-input" style="min-width: 400px;">
          <input type="text" id="common-error-search" tabindex="1" class="form-control" autocomplete="off"/>
            <kbd class="bg-transparent text-muted">Enter</kbd>, чтобы выбрать улучшение. Для поиска по тегу начните название с собаки <code>@</code>.
      </div>
      <div id="tags-available" style="min-width: 150px;">
      </div>
    </div>
  </div>
</div>
`;

function createEnhBlock(title, url){
  let enhBlock = document.createElement("div");
  let enhTemplate = `<button class="js-enh" type="button" tabindex="2" url="${url}">
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
    // Добавлен для обхода обработки горячих клавиш на GitHub
    // GitHub перехватывает событие keydown
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
  let enhBlocks = shadowBox.shadowRoot.querySelectorAll(".js-enh");
  let closeBtns = shadowBox.shadowRoot.querySelectorAll(".js-close-modal");

  query_field.addEventListener("input", inputHandler, {capture: false, composed: false});
  query_field.focus();

  enhBlocks.forEach((enhBlock) => {
    enhBlock.addEventListener("click", handleEnter);
  });
  closeBtns.forEach((enhBlock) => {
    enhBlock.addEventListener("click", closeModal);
  });
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

  closeModal();
}

function closeModal(){
  let dialog = document.getElementById("find-enhancement");
  if (dialog){
    dialog.classList.add("hide");
  }
  // FIXME cleanup input and search results
}

async function inputHandler(e){
  e.preventDefault();
  let query = e.target.value
  let enhancements = document.getElementById('tags-available');
  if (query.length >= 3){
    chrome.runtime.sendMessage({ msg: "getEnhancement", query: query });
  }
}
