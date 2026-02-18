import "./App.css";
import React, { useState, useEffect, useCallback, useRef } from "react";
import ButtonComponent from "./components/ButtonComponent";
import LetterButton from "./components/LetterButton";
import InputComponent from "./components/InputComponent";
import ResetButton from "./components/ResetButton";
import WordList from "./components/WordList";
import DefinitionsList from "./components/DefinitionsList";
import { fetchWordDefinition } from "./utils/api";

function App() {
  const [input, setInput] = useState("");
  const [letters, setLetters] = useState([]);
  const [words, setWords] = useState([]);
  const [cont, setCont] = useState(0);
  const [isValidWord, setIsValidWord] = useState(true);
  const inputRef = useRef(null);
  const [activeWordButton, setActiveWordButton] = useState(null);
  const [definitions, setDefinitions] = useState([]);
  const [showDefinitions, setShowDefinitions] = useState(false);
  const [gameMode, setGameMode] = useState(null);
  const [, setShowLetterInput] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isStoredGame, setIsStoredGame] = useState(false);
  const [introductionLetterText, setIntroductionLetterText] = useState("");
  const [, setCurrentLetterIndex] = useState(0);
  const [letterInput, setLetterInput] = useState("");
  const [choosePhase, setChoosePhase] = useState("input");
  const [letterToReplace, setLetterToReplace] = useState("");
  const [, setLetterChoosen] = useState(false);

  /**
   *
   * @function saveData
   * @description Persists data to React state and localStorage synchronously
   * @param {function} setData React state setter function
   * @param {string} key localStorage key
   * @param {any|function} value New value or function returning new value
   * @returns {void}
   */
  const saveData = useCallback((setData, key, value) => {
    setData((prevData) => {
      const newValue = typeof value === "function" ? value(prevData) : value;
      localStorage.setItem(key, JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  /**
   *
   * @function handleClear
   * @description Clears the main input field and sets focus
   * @returns {void}
   */
  const handleClear = useCallback(() => {
    setInput("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  /**
   *
   * @function handleResult
   * @description Validates submitted word, fetches definition, handles duplicates
   * @returns {void}
   */
  const handleResult = useCallback(() => {
    let word = input.toString().toUpperCase();

    if (word.length === 0) {
      return;
    } else if (!words.includes(word)) {
      fetchWordDefinition(word)
        .then((data) => {
          saveData(setWords, "words", (prevWords) => [...prevWords, word]);
          saveData(setCont, "cont", (prevCont) => prevCont + 1);
          handleClear();
          setActiveWordButton(words.length);
          setDefinitions(data);
          setShowDefinitions(true);
        })
        .catch((error) => {
          console.log("Error: ", error);
          setIsValidWord(false);
        });
    } else if (words.includes(word)) {
      const inputElement = inputRef.current;
      setTimeout(() => {
        inputElement.classList.add("shakeError");
      }, 10);
      setTimeout(() => {
        setInput("");
        setIsValidWord(true);
        inputElement.classList.remove("shakeError");
      }, 400);
    }
  }, [
    input,
    words,
    saveData,
    handleClear,
    setIsValidWord,
    setWords,
    setCont,
    setActiveWordButton,
    setDefinitions,
    setShowDefinitions,
  ]);

  /**
   *
   * @function generateRandomLetters
   * @description Generates 7 random letters including at least one vowel, stores in state and localStorage
   * @returns {void}
   */
  const generateRandomLetters = useCallback(() => {
    let randomLetters = [];

    const vocals = "AEIOU";
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const vocalAleatoria = vocals[Math.floor(Math.random() * vocals.length)];
    randomLetters.push(vocalAleatoria);

    while (randomLetters.length < 7) {
      const randomLetter =
        alphabet[Math.floor(Math.random() * alphabet.length)];
      if (!randomLetters.includes(randomLetter)) {
        randomLetters.push(randomLetter);
      }
    }
    randomLetters = randomLetters.sort(() => Math.random() - 0.5);

    setLetters(randomLetters);
    saveData(setLetters, "letters", randomLetters);
    setGameStarted(true);
  }, [saveData, setLetters]);

  /**
   *
   * @function chooseLetters
   * @description Starts custom letter selection mode, resets state
   * @returns {void}
   */
  const chooseLetters = useCallback(() => {
    setGameMode("choose");
    setLetters([]);
    setLetterInput("");
    setCurrentLetterIndex(0);
    setChoosePhase("input");
    setIntroductionLetterText("Introduce the first letter");
    setShowLetterInput(true);
    setGameStarted(false);
  }, []);

  /**
   *
   * @function handleChooseLetterChange
   * @description Updates letter input state in choose mode
   * @param {Event} e Input change event
   * @returns {void}
   */
  const handleChooseLetterChange = (e) => {
    setLetterInput(e.target.value.toUpperCase());
  };

  /**
   *
   * @function handleChooseLetterSubmit
   * @description Handles submission of letters in choose mode based on current phase
   * @returns {void}
   */
  const handleChooseLetterSubmit = useCallback(
    (e) => {
      const value = letterInput.toUpperCase();
      const VOWELS = ["A", "E", "I", "O", "U"];

      if (choosePhase === "askChange") {
        if (value === "S") {
          setLetterInput("");
          setChoosePhase("chooseOld");
          setIntroductionLetterText("Introduce the letter you want to change");
        } else if (value === "N") {
          saveData(setLetters, "letters", letters);
          setShowLetterInput(false);
          setGameStarted(true);
        }
        return;
      }

      if (choosePhase === "chooseOld") {
        if (!/^[A-ZÑ]$/.test(value)) return;

        if (!letters.includes(value)) {
          setLetterInput("");
          return;
        }

        setLetterToReplace(value);
        setLetterInput("");
        setChoosePhase("chooseNew");

        const hasVowel = letters.some((l) => VOWELS.includes(l));

        if (!hasVowel) {
          setIntroductionLetterText("You must replace it with a vowel");
        } else {
          setIntroductionLetterText("Introduce the new letter");
        }

        return;
      }

      if (choosePhase === "chooseNew") {
        if (!/^[A-ZÑ]$/.test(value)) return;
        if (letters.includes(value)) return;

        const hasVowel = letters.some((l) => VOWELS.includes(l));

        if (!hasVowel && !VOWELS.includes(value)) {
          setLetterInput("");
          return;
        }

        const isOldVowel = VOWELS.includes(letterToReplace);
        const isNewVowel = VOWELS.includes(value);

        if (isOldVowel && !isNewVowel) {
          const vowelCount = letters.filter((l) => VOWELS.includes(l)).length;
          if (vowelCount === 1) return;
        }

        setLetters((prev) => {
          const updated = [...prev];
          const index = updated.indexOf(letterToReplace);
          updated[index] = value;
          return updated;
        });

        setLetterInput("");
        setLetterToReplace("");
        setChoosePhase("askChange");
        setIntroductionLetterText(
          "Do you want to change another letter? (S / N)",
        );
        return;
      }

      if (!/^[A-ZÑ]$/.test(value)) return;
      if (letters.includes(value)) return;

      const newLetters = [...letters, value];
      setLetters(newLetters);
      setLetterInput("");

      const texts = [
        "Introduce the first letter",
        "Introduce the second letter",
        "Introduce the third letter",
        "Introduce the fourth letter",
        "Introduce the fifth letter",
        "Introduce the sixth letter",
        "Introduce the seventh letter",
      ];

      if (newLetters.length < 7) {
        setLetterChoosen(true);
        setIntroductionLetterText(texts[newLetters.length]);
      } else {
        const hasVowel = newLetters.some((l) => VOWELS.includes(l));
        if (!hasVowel) {
          setChoosePhase("chooseOld");
          setIntroductionLetterText(
            "You must replace one letter with a vowel. Choose which letter to change",
          );
          return;
        }

        setChoosePhase("askChange");
        setIntroductionLetterText("Do you want to change a letter? (S / N)");
      }
    },
    [
      letterInput,
      choosePhase,
      letters,
      letterToReplace,
      setLetters,
      setLetterInput,
      setChoosePhase,
      setLetterToReplace,
      setIntroductionLetterText,
      setLetterChoosen,
      saveData,
      setShowLetterInput,
      setGameStarted,
    ],
  );

  /**
   *
   * @function loadSavedGame
   * @description Loads saved game from localStorage
   * @returns {void}
   */
  const loadSavedGame = useCallback(() => {
    const storedLetters = localStorage.getItem("letters");
    setIsStoredGame(true);
    setGameStarted(true);
    const parsedLetters = JSON.parse(storedLetters);
    setLetters(parsedLetters);

    const storedWords = localStorage.getItem("words");
    if (storedWords) {
      const parsedWords = JSON.parse(storedWords);
      setWords(parsedWords);
    }

    const storedCont = localStorage.getItem("cont");
    if (storedCont !== null) {
      setCont(Number(storedCont));
    } else {
      setCont(0);
    }
  }, [setIsStoredGame, setWords, setCont, setLetters]);

  /**
   *
   * @function handleClick
   * @description Adds letter to input when letter button is clicked
   * @param {string} value Letter clicked
   * @returns {void}
   */
  const handleClick = (value) => {
    if (!gameStarted) return;
    setInput((prevInput) => prevInput + value);
  };

  /**
   *
   * @function resetGame
   * @description Resets game state and clears localStorage
   * @returns {void}
   */
  const resetGame = () => {
    setGameMode(null);
    setShowLetterInput(false);
    setGameStarted(false);
    setIsStoredGame(false);

    setCont(0);
    setWords([]);
    setLetters([]);
    setDefinitions([]);
    setShowDefinitions(false);

    localStorage.removeItem("letters");
    localStorage.removeItem("words");
    localStorage.removeItem("cont");

    setChoosePhase("input");
    setLetterToReplace("");
    setLetterInput("");
    setLetterChoosen(false);
    setIntroductionLetterText("Introduce the first letter");

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  /**
   *
   * @function requestInfo
   * @description Fetches definition for a given word
   * @param {string} word Word to fetch definition for
   * @returns {void}
   */
  const requestInfo = (word) => {
    fetchWordDefinition(word)
      .then((data) => {
        setDefinitions(data);
        setShowDefinitions(true);
      })
      .catch((error) => {
        console.log("Error: ", error);
      });
  };

  /**
   *
   * @function handleClickWord
   * @description Handles click on word from found words list
   * @param {string} word Word clicked
   * @param {number} index Index of the word
   * @returns {void}
   */
  const handleClickWord = (word, index) => {
    setActiveWordButton(index);
    requestInfo(word);
  };

  /**
   *
   * @function useInvalidWordShakeEffect
   * @description Handles invalid word state by triggering a shake animation and clearing the input
   * @returns {void} Cleans up by resetting the input and removing the animation class
   */
  useEffect(() => {
    if (!isValidWord && inputRef.current) {
      const inputElement = inputRef.current;

      inputElement.classList.remove("shakeError");

      setTimeout(() => {
        inputElement.classList.add("shakeError");
      }, 10);

      setTimeout(() => {
        setInput("");
        setIsValidWord(true);
      }, 400);
    }
  }, [isValidWord]);

  /**
   *
   * @function useInitializeGameState
   * @description Initializes the game state from localStorage when the app loads
   * @returns {void} Sets letters, words, counter, game mode and gameStarted to initial values
   */
  useEffect(() => {
    const storedLetters = localStorage.getItem("letters");
    if (storedLetters && storedLetters.length > 0) {
      setIsStoredGame(true);
    }

    setLetters([]);
    setWords([]);
    setCont(0);
    setGameMode(null);
    setGameStarted(false);
  }, []);

  /**
   *
   * @function useGlobalKeyListener
   * @description Sets up and cleans up a global keyboard listener for game input and choose-letter mode
   * @returns {void} Cleanup removes the listener
   */
  useEffect(() => {
    const handleGlobalKey = (event) => {
      const key = event.key.toUpperCase();
      if (gameMode === "choose" && !gameStarted) {
        if (/^[A-ZÑ]$/.test(key)) {
          event.preventDefault();
          if (choosePhase === "askChange") {
            if (key === "S" || key === "N") {
              setLetterInput(key);
            }
            return;
          }

          if (choosePhase === "chooseOld") {
            if (letters.includes(key)) {
              setLetterInput(key);
            }
            return;
          }

          if (choosePhase === "chooseNew") {
            if (!letters.includes(key)) {
              setLetterInput(key);
            }
            return;
          }

          if (!letters.includes(key)) {
            setLetterInput(key);
          }
          return;
        }

        if (event.key === "Enter") {
          event.preventDefault();
          handleChooseLetterSubmit();
          return;
        }
      }

      if (gameStarted) {
        if (/^[A-ZÑ]$/.test(key) && letters.includes(key)) {
          event.preventDefault();
          setInput((prev) => prev + key);
        } else if (event.key === "Enter") {
          event.preventDefault();
          handleResult();
        } else if (event.key === "Backspace") {
          event.preventDefault();
          setInput((prev) => prev.slice(0, -1));
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [
    gameMode,
    gameStarted,
    letters,
    handleChooseLetterSubmit,
    handleResult,
    choosePhase,
  ]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Find the words</h1>
        <p style={{ visibility: gameStarted ? "visible" : "hidden" }}>
          Number of words found: {cont}
        </p>
      </header>
      <main className="App-main">
        {!gameStarted && gameMode === null && (
          <div className="gameMode">
            <h3>What mode of game do you want?</h3>
            <div className="gameMode-buttons">
              <ButtonComponent
                label="Random letters"
                onClick={() => {
                  setGameMode("random");
                  generateRandomLetters();
                }}
              />
              <ButtonComponent
                label="Choose letters"
                onClick={() => {
                  setGameMode("choose");
                  chooseLetters();
                }}
              />
              {isStoredGame && (
                <ButtonComponent
                  label="Continue previous game"
                  onClick={loadSavedGame}
                />
              )}
            </div>
          </div>
        )}
        {!gameStarted && gameMode === "choose" && (
          <div className="choose-letters">
            <p className="letter-introduction-text">{introductionLetterText}</p>
            <input
              type="text"
              maxLength={1}
              value={letterInput}
              onChange={handleChooseLetterChange}
              onKeyDown={handleChooseLetterSubmit}
              autoFocus
            />
            <div className="letters-container">
              {letters.map((letra, index) => (
                <LetterButton key={index} letra={letra} />
              ))}
            </div>
          </div>
        )}
        {gameStarted && (
          <>
            <div className="game">
              <InputComponent
                input={input}
                isValidWord={isValidWord}
                onChange={() => {}}
                inputRef={inputRef}
                allowedLetters={letters}
              />
              <div className="controls-container">
                <ResetButton onClick={resetGame} />
                <div className="letters-container">
                  {letters.map((letra, index) => (
                    <LetterButton
                      key={index}
                      letra={letra}
                      onClick={handleClick}
                    />
                  ))}
                </div>
              </div>
              <ButtonComponent label="Enter" onClick={handleResult} />
              <ButtonComponent label="Clean" onClick={handleClear} />
              <div className="words">
                {words.map((word, index) => (
                  <WordList
                    key={index}
                    word={word}
                    onClick={() => handleClickWord(word, index)}
                    className={
                      activeWordButton === index
                        ? "word-button word-button-focus"
                        : "word-button"
                    }
                  />
                ))}
              </div>
            </div>
            <DefinitionsList
              definitions={definitions}
              showDefinitions={showDefinitions}
            />
          </>
        )}
      </main>
      <footer>
        <p>&copy;2026 Selene Alarcón - Web developer</p>
        <ul>
          <li>
            <a href="https://github.com/Selenealarcon">
              <img
                src={`${process.env.PUBLIC_URL}//github.svg`}
                alt="Github profile of Selene Alarcón"
                title="Github profile"
                class="svg-icon"
              />
            </a>
          </li>
          <li>
            <a href="https://www.linkedin.com/in/selene-alarcon/">
              <img
                src={`${process.env.PUBLIC_URL}/linkedin.svg`}
                alt="LinkedIn profile of Selene Alarcón"
                title="LinkedIn profile"
                class="svg-icon"
              />
            </a>
          </li>
        </ul>
      </footer>
    </div>
  );
}

export default App;
