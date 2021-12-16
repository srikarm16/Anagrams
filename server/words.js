const wordSet = new Set();
const wordMap = new Map();

const wordsInit = () => {
  const fs = require("fs");
  const text = fs.readFileSync("words_alpha.txt").toString('utf-8');
  const textByLine = text.split("\n");
  
  textByLine.forEach((word) => {
    word = word.trim();
    if (word.length > 2) {
      wordSet.add(word);
  
      if (!wordMap.get(word.length))
        wordMap.set(word.length, []);
  
      wordMap.get(word.length).push(word);
    }
  });
}

const isValidWord = (word) => { // return a boolean
  return wordSet.has(word);
}

const getScrambledLetters = (wordLen) => {
  const words = wordMap.get(wordLen);
  const randomIndex = Math.floor(Math.random() * words.length);
  const randomWord = words[randomIndex];

  // console.log("Random Word: " + randomWord);

  const randomWordArr = randomWord.split("");
  const len = randomWordArr.length;
  for (let i = 0; i < len; i++) {
    const i1 = Math.floor(Math.random() * len);
    const i2 = Math.floor(Math.random() * len);

    const letter = randomWordArr[i1];
    randomWordArr[i1] = randomWordArr[i2];
    randomWordArr[i2] = letter;
  }
  
  // console.log(`Random Word after: ${randomWordArr.toString()}`);

  return randomWordArr;
}

module.exports = { wordsInit, isValidWord, getScrambledLetters };