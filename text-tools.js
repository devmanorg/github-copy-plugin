// Три тире -- это горизонтальная полоса в Markdown. Пробелы между тире специально добавлены,
// чтобы markdown не воспринял случайно эти три подчёркивания как заголовок.
const DELIMITER = '- - -';

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

function removeRedundantBlankLines(text){
  return text.replace(/\n{2,}/g, '\n\n').replace(/^\n+/, '').replace(/\n+$/, '');
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
    preparedText = removeRedundantBlankLines(preparedText);
    preparedText = addIndentBeforeOctothorpe(preparedText);
    return preparedText;
}

const FILES_TYPE = [
  { path: '.py', type: 'python' },
  { path: '.js', type: 'js' },
  { path: '.html', type: 'html' },
  { path: '.svg', type: 'markup' },
  { path: '.xml', type: 'markup' },
  { path: '.css', type: 'css' },
  { path: '.sh', type: 'bash' },
  { path: 'Dockerfile', type: 'dockerfile' },
  { path: '.diff', type: 'diff' },
  { path: '.json', type: 'json' },
  { path: '.md', type: 'md' },
  { path: '.yml', type: 'yaml' },
  { path: '.yaml', type: 'yaml' },
  { path: '.sql', type: 'sql' },
  { path: '.editorconfig', type: 'editorconfig' },
  { path: '.toml', type: 'toml' },
  { path: '.ini', type: 'ini' },
]

function detectSyntaxByFilename(filename){
  const file = FILES_TYPE.find(fileType => filename.includes(fileType.path));
  if (file) {
    return file.type;
  }
  return '';
}
