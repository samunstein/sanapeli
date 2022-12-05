import { useRef } from 'react';
import { useState } from 'react';
import './App.css';
import allWords from './filtered.json';
import {WordData, WordInfo} from './WordInfo';

interface AppState {
  sanapeliWord: string | undefined;
  showSanapeliSolutions: boolean;
  wordSearched: boolean;
  foundWord: WordData | undefined;
  suggestedWord: WordData | undefined;
  suggestDifficulty: number;
  suggestSearched: boolean;
}

const wordList: ReadonlyArray<WordData> = allWords as ReadonlyArray<WordData>

function App() {
  const initialState: AppState = {
    showSanapeliSolutions: false, sanapeliWord: undefined, foundWord: undefined, suggestedWord: undefined, wordSearched: false, suggestDifficulty: 2, suggestSearched: false
  }
  const [state, setState] = useState<AppState>(initialState)

  const sanapeliInput = useRef<HTMLInputElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const suggestInput = useRef<HTMLInputElement>(null);

  function getSanapeliInputText(): string {
    return sanapeliInput.current ? sanapeliInput.current.value : "";
  }

  function getSearchInputText(): string {
    return searchInput.current ? searchInput.current.value : "";
  }

  function getSuggestInputText(): string {
    return suggestInput.current ? suggestInput.current.value : "";
  }

  function sanapeliSearch(): void {
    setState(prev => {
      return {...prev, sanapeliWord: getSanapeliInputText(), showSanapeliSolutions: prev.sanapeliWord === getSanapeliInputText()}
    });
  }

  function wordSearch(): void {
    const word = getSearchInputText();
    setState(prev => {
      return {...prev, foundWord: wordList.find(w => w.word === word), wordSearched: true}
    });
  }

  function isSubWord(smaller: string, bigger: string, canBeSame: boolean = false): boolean {
    const letters = new Set(smaller);
    if (!canBeSame && smaller === bigger) return false;
    for (let l of letters) {
      if (smaller.split(l).length > bigger.split(l).length) return false;
    }
    return true;
  }

  function getSubWords(word: string): ReadonlyArray<WordData> {
    return wordList.filter(smaller => isSubWord(smaller.word, word));
  }

  function searchWikisanakirja(): void {
    const word = getSearchInputText();
    window.open("https://fi.wiktionary.org/wiki/" + word, "_blank");
  }

  function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
  }

  function chooseDifficulty(num: number) {
    setState(prev => {
      return {...prev, suggestDifficulty: num}
    });
  }

  function clearSearch(): void {
    if (state.wordSearched) {
      setState(prev => {
        return {...prev, wordSearched: false}
      });
    }
  }

  function clearSuggest(): void {
    if (state.suggestSearched) {
      setState(prev => {
        return {...prev, suggestSearched: false}
      });
    }
  }

  function randomWord(): void {
    let min = 0, max = 0;

    if (state.suggestDifficulty === 0) {
      min = 1;
      max = 20;
    } else if (state.suggestDifficulty === 1) {
      min = 21;
      max = 49;
    } else if (state.suggestDifficulty === 2) {
      min = 50;
      max = 85;
    } else if (state.suggestDifficulty === 3) {
      min = 86;
      max = 130;
    } else if (state.suggestDifficulty === 4) {
      min = 131;
      max = Infinity;
    }

    const letters = getSuggestInputText();

    const eligible = wordList.filter(w => w.count >= min && w.count <= max).filter(w => isSubWord(letters, w.word, true));
    const choiceIndx = getRandomInt(0, eligible.length);
    setState(prev => {
      return {...prev, suggestedWord: eligible[choiceIndx], suggestSearched: true}
    });
  }

  return (
    <div className="App">
      <div className="sanapeli-area">
        <input type="text" ref={sanapeliInput} defaultValue="" onKeyDown={e => e.key === "Enter" ? sanapeliSearch() : ""} />
        <button onClick={_ => sanapeliSearch()}>Hae alisanat!</button>
        {state.sanapeliWord !== undefined ? 
          `Sanoja: ${getSubWords(state.sanapeliWord).length}`
        : <></>}
        <div className="sanapeli-result-area">
          {state.sanapeliWord !== undefined && state.showSanapeliSolutions ? 
            getSubWords(state.sanapeliWord).map(w => <WordInfo data={w} initClosed={true} />)
          : <></>}
        </div>
      </div>
      <div className="search-area">
        <div className="search">
          <input type="text" ref={searchInput} defaultValue="" onKeyDown={e => e.key === "Enter" ? wordSearch() : ""} onChange={() => clearSearch()} />
          <button onClick={_ => wordSearch()}>Onko tämä olemassa?</button>
          {state.wordSearched ? 
            state.foundWord !== undefined ? "Joo!" : <span>Ei! <button onClick={() => searchWikisanakirja()}>Tarkista!</button></span>
          : <></>}
          {state.wordSearched ? 
            state.foundWord !== undefined ? <WordInfo initClosed={false} data={state.foundWord}></WordInfo> : <></>
          : <></>}
        </div>
        
        <div className="suggest">
          Arvo joku sana:
          <div>
            <input type="radio" value="0" name="diff" onClick={() => chooseDifficulty(0)} checked={state.suggestDifficulty === 0} /> Huono
            <input type="radio" value="1" name="diff" onClick={() => chooseDifficulty(1)} checked={state.suggestDifficulty === 1} /> Meh
            <input type="radio" value="1" name="diff" onClick={() => chooseDifficulty(2)} checked={state.suggestDifficulty === 2} /> OK
            <input type="radio" value="1" name="diff" onClick={() => chooseDifficulty(3)} checked={state.suggestDifficulty === 3} /> Hyvä
            <input type="radio" value="2" name="diff" onClick={() => chooseDifficulty(4)} checked={state.suggestDifficulty === 4} /> Tosi hyvä
          </div>
          <div>
            <span>Sisältäen kirjaimet: </span><input type="text" ref={suggestInput} defaultValue="" onKeyDown={e => e.key === "Enter" ? randomWord() : ""} onChange={() => clearSuggest()} />
          </div>
          <button onClick={() => randomWord()}>Arvo!</button>
          {state.suggestSearched ? ( state.suggestedWord !== undefined ? <WordInfo initClosed={false} data={state.suggestedWord}></WordInfo> : <div>Eioo</div> ) : <></>}
          
        </div>
      </div>
    </div>
  );
}

export default App;
