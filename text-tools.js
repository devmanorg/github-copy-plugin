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
