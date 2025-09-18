import { useState, useEffect } from "react";
import SumoryGame from "./SumoryGame";
import { generateValues } from "./helpers/sumory-random";
import { shuffle } from "./helpers/aux";
import classnames from "classnames";
import "./styles/app.scss";

// FIXME get language list from i18n
const langs = ["en", "de"];

interface Config {
  cardValues?: number[];
  languages?: Record<string, string>;
  defaultLanguage?: string;
}

interface Props {
  config: Config;
}

export default function SumoryApp(props: Props) {
  const CARD_COUNT = 21;
  const TURNS = 10;
  const { config } = props;

  const resetCardValues = () =>
    config.cardValues && config.cardValues.length === CARD_COUNT
      ? shuffle(config.cardValues)
      : generateValues(CARD_COUNT);

  const [language, setLanguage] = useState(config.defaultLanguage || "en");
  const [strings, setStrings] = useState<Record<string, string>>({});
  const [cardValues, setCardValues] = useState(resetCardValues());
  const [gameNumber, setGameNumber] = useState(1);
  const [gameStatus, setGameStatus] = useState({ score: 0, turnsLeft: TURNS });
  const [analysisVisible, setAnalysisVisible] = useState(false);
  const [resettingGame, setResettingGame] = useState(false);
  // const analysisTimer = useRef(null);

  const instructions =
    (strings.instructions &&
      strings.instructions.replace("%turns", "" + TURNS)) ||
    "";

  useEffect(
    () => {
      // IMAGINARY.i18n.setLang(language).then(() => {
      //   setStrings(IMAGINARY.i18n.getStrings());
      // });
    },
    [] /* Run on first render only */
  );

  function handleLanguageChange() {
    const index = langs.indexOf(language);
    const code = langs[(index + 1) % langs.length];
    setLanguage(code);
    // IMAGINARY.i18n.setLang(code).then(() => {
    //   setStrings(IMAGINARY.i18n.getStrings());
    // });
  }

  function handleGameUpdate(newSum: number, newTurnsLeft: number) {
    setGameStatus({ score: newSum, turnsLeft: newTurnsLeft });
  }

  function handleGameOver() {
    //   setTimeout(() => {
    //     setAnalysisVisible(true);
    //     analysisTimer.current = setTimeout(() => {
    //       restart();
    //     }, (config.analysisTimeout || 60) * 1000);
    //   }, 1000);
  }

  function restart() {
    // clearTimeout(analysisTimer.current);
    setResettingGame(true);
    setTimeout(() => {
      setGameNumber(gameNumber + 1);
      setGameStatus({ score: 0, turnsLeft: TURNS });
      setCardValues(resetCardValues());
      setAnalysisVisible(false);
      setResettingGame(false);
    }, 1000);
  }

  function handleRestartButton() {
    if (!resettingGame) {
      restart();
    }
  }

  // noinspection JSAnnotator
  return (
    <div
      className={classnames("sumory-app", {
        "sumory-app-with-analysis": analysisVisible,
      })}
    >
      <div className="content">
        <main>
          <div className="header">
            <div className="instructions">{instructions}</div>
          </div>
          <SumoryGame
            key={gameNumber}
            values={cardValues}
            turns={TURNS}
            resetting={resettingGame}
            onUpdate={handleGameUpdate}
            onGameOver={handleGameOver}
            config={config}
          />
        </main>
        <div className="sidebar">
          <div className="status">
            <div className="status-box status-turns">
              <div className="label">{strings.draws}</div>
              <div className="value">{gameStatus.turnsLeft}</div>
            </div>
            <div className="status-box status-sum">
              <div className="label">{strings.sum}</div>
              <div className="value">{gameStatus.score}</div>
            </div>
            <img src="/assets/img/happy-tamagotchi_transparent.gif" />
          </div>
        </div>
      </div>
      <div className="util-menu">
        <button type="button" className="restart" onClick={handleRestartButton}>
          <span className="fas fa-redo-alt fa-lg" />
        </button>
        <button type="button" onClick={handleLanguageChange}>
          {language.toUpperCase()}
        </button>
      </div>
    </div>
  );
}
