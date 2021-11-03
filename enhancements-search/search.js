const domain = "https://dvmn.org";
const url = "https://dvmn.org/reviews/enhancements/";

let commonErrors;
let commonErrorsChoices;
let availableTags;

async function preloadEnhancement(){
  let response = await fetch(url, {headers: {
    "Accept": "application/json"
  }});
  if (!response.ok) {
    console.log("Ошибка HTTP: " + response.status);
    return;
  }
  let json = await response.json();
  commonErrors = json.enhancements;

  chrome.runtime.onMessage.addListener(handleMessage)

  commonErrorsChoices = commonErrors.map(error => {

    const normalizedForSearchNameWords = splitTextBySearchableWords(error.action.toLowerCase(), 2);
    const normalizedForSearchDescriptionWords = [
      ...splitSlugByWords(error.slug.toLowerCase()),
      ...splitTextBySearchableWords(
        removeLinksProtocol(
          `${error.motivation} ${error.extras}`.toLowerCase()
        )
      ),
    ];
    return {
      id: error.id,
      slug: error.slug,
      text: error.action,
      url: error.url,
      normalizedForSearchNameWords: _.uniq(normalizedForSearchNameWords),
      normalizedForSearchDescriptionWords: _.uniq(normalizedForSearchDescriptionWords),

      tags: error.tags.map(name => ({
        id: name,
        title: name,
        normalizedForSearchText: name.toLowerCase(),
      })),
    };
  })
  availableTags = _.uniqBy(_.flatten(commonErrorsChoices.map(choice => choice.tags)), 'id');
}

preloadEnhancement();

async function handleMessage(message, sender, sendResponse) {
  if (message["msg"] == "getEnhancement") {
    let [filteredChoices, selectedTags] = filterChoices(commonErrorsChoices, message["query"], availableTags)

    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {enhancements: filteredChoices, domain: domain});
    })
  }
}

const FULL_TEXT_SEARCH_MIN_WORD_SIZE = 4;

const searchableWordRegExp = new XRegExp(
  `[\\pL\\d]         # first unicode letter
   [\\pL\\-\\.\\d]*  # anything
   [\\pL\\d]         # last unicode letter
  `, 'x');

function splitTextBySearchableWords(text, minLength = FULL_TEXT_SEARCH_MIN_WORD_SIZE) {
  // XRegExp adds cyrillic support
  let words = [];
  XRegExp.forEach(text, searchableWordRegExp, (match, i) => {
    const word = match[0];
    if (word.length < minLength) {
      return;
    }
    words.push(word);
  });
  return words;
}

function splitQueryByWords(text) {
  // XRegExp adds cyrillic support
  const unicodeWordRegExp = new XRegExp('[\\pL\\d][\\pL\\d\\-\\.]*');
  let words = [];
  XRegExp.forEach(text, unicodeWordRegExp, (match, i) => {
    words.push(match[0]);
  });
  return words;
}

function splitByTagsAndRest(queryWords, availableTags) {
  const selectedTags = new Set();
  const excludedWords = new Set();

  // iterate by words first to save tags order, specified by user
  for (let queryWord of queryWords) {
    const lowerQueryWord = queryWord.toLowerCase()
    let tags = _.filter(availableTags, tag => tag.normalizedForSearchText.startsWith(lowerQueryWord));
    if (tags.length != 1) {
      continue
    }
    selectedTags.add(tags[0]);
    excludedWords.add(queryWord);
  }
  let searchableWords = _.difference(queryWords, Array.from(excludedWords));
  return [
    Array.from(selectedTags),
    searchableWords,
  ];
}

function splitSlugByWords(text) {
  return text.split(/[-_]/);
}

function removeLinksProtocol(text) {
  // Makes it possible to search by words HTTP and HTTPS excluding links
  return text.replace(/https?:\/\//g, '//');
}

function filterChoices(choices, query, availableTags) {
  let queryWords = splitQueryByWords(query);

  if (!queryWords.length) {
    return [choices, []]
  }

  let [selectedTags, searchableWords] = splitByTagsAndRest(queryWords, availableTags)
  let searchableLowerWords = searchableWords.map(word => word.toLowerCase());

  let choicesToRanks = {};
  for (let choice of choices) {
    let rank = [0, 0, 0, 0];
    choicesToRanks[choice.id] = rank;

    if (selectedTags.length) {
      const notFoundTags = _.differenceBy(selectedTags, choice.tags, 'id');
      if (notFoundTags.length) {
        continue;
      }
      rank[0] = selectedTags.length;
    }

    for (let searchableLowerWord of searchableLowerWords) {
      let nameFlag = _.some(choice.normalizedForSearchNameWords, word => word.startsWith(searchableLowerWord));
      if (nameFlag) {
        rank[1] += 1;
        continue
      }

      if (searchableLowerWord.length < FULL_TEXT_SEARCH_MIN_WORD_SIZE) {
        continue
      }

      let descriptionFlag = _.some(choice.normalizedForSearchDescriptionWords, word => _.includes(word, searchableLowerWord));
      if (descriptionFlag) {
        rank[2] += 1;
      }
    }
    rank[3] = rank[0] + rank[1] + rank[2];
  }

  let filteredChoices = choices.filter(choice => choicesToRanks[choice.id][3] >= queryWords.length);
  let sortedChoices = _.sortBy(filteredChoices, choice => choicesToRanks[choice.id]);
  return [_.reverse(sortedChoices), selectedTags];
}
