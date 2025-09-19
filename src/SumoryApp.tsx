import { useMemo, useRef, useState } from "react";
import SumoryGame from "./SumoryGame";
import { generateValues } from "./helpers/sumory-random";
import { shuffle } from "./helpers/aux";
import classnames from "classnames";
import "./styles/app.scss";
import Creature from "./Creature";
import { calculateStrategiesDeterministically } from "./helpers/sumory-strategy";

// FIXME get language list from i18n
const langs = ["en", "de"];

interface Config {
  cardValues?: number[];
  languages: { [lang: string]: Record<string, string> };
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
  const [strings, setStrings] = useState<Record<string, string>>(
    config.languages[language]
  );
  const [cardValues, setCardValues] = useState(resetCardValues());
  const [gameNumber, setGameNumber] = useState(1);
  const [gameStatus, setGameStatus] = useState({ score: 0, turnsLeft: TURNS });
  const [resettingGame, setResettingGame] = useState(false);
  const [creatureMood, setCreatureMood] = useState("neutral");
  const [gameEnded, setGameEnded] = useState(false);
  const moodTimeout = useRef(-1);
  // const analysisTimer = useRef(null);

  const strategy = useMemo(
    () => calculateStrategiesDeterministically(cardValues, TURNS),
    [cardValues, TURNS]
  );
  const best = Math.max(...strategy);

  const instructions =
    (strings.instructions &&
      strings.instructions.replace("%turns", "" + TURNS)) ||
    "";

  function handleLanguageChange() {
    const index = langs.indexOf(language);
    const code = langs[(index + 1) % langs.length];
    setLanguage(code);
    setStrings(config.languages[code]);
  }

  function handleGameUpdate(newSum: number, newTurnsLeft: number) {
    setGameStatus({ score: newSum, turnsLeft: newTurnsLeft });
    // FIXME control gif playback
    setCreatureMood("eating");
    if (moodTimeout.current !== -1) {
      clearTimeout(moodTimeout.current);
    }
    moodTimeout.current = setTimeout(() => {
      setCreatureMood("neutral");
    }, 1500);
  }

  function handleGameOver() {
    setGameEnded(true);
    //   setTimeout(() => {
    //     setAnalysisVisible(true);
    //     analysisTimer.current = setTimeout(() => {
    //       restart();
    //     }, (config.analysisTimeout || 60) * 1000);
    //   }, 1000);
  }

  function restart() {
    setResettingGame(true);
    setGameEnded(false);
    setTimeout(() => {
      setGameNumber(gameNumber + 1);
      setGameStatus({ score: 0, turnsLeft: TURNS });
      setCardValues(resetCardValues());
      setResettingGame(false);
    }, 1000);
  }

  function handleRestart() {
    if (!resettingGame) {
      restart();
    }
  }

  return (
    <div className={classnames("sumory-app", { "game-ended": gameEnded })}>
      <div className="content">
        <main>
          <div className="header">
            <div className="instructions">{instructions}</div>
          </div>
          <div className="game-container">
            <SumoryGame
              key={gameNumber}
              values={cardValues}
              turns={TURNS}
              resetting={resettingGame}
              onUpdate={handleGameUpdate}
              onGameOver={handleGameOver}
              config={config}
            />
            <EndScreen
              strings={strings}
              userScore={gameStatus.score}
              best={best}
              onPlayAgain={handleRestart}
            />
          </div>
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
            <Creature mood={creatureMood as any} />
          </div>
        </div>
      </div>
      <div className="util-menu">
        <button type="button" className="restart" onClick={handleRestart}>
          <img src="arrow.svg" />
        </button>
        <button type="button" onClick={handleLanguageChange}>
          {language.toUpperCase()}
        </button>
      </div>
    </div>
  );
}

interface EndScreenProps {
  strings: any;
  userScore: number;
  best: number;
  onPlayAgain?: () => void;
  onLearnMore?: () => void;
}

function EndScreen({
  strings,
  userScore,
  best,
  onPlayAgain,
  onLearnMore,
}: EndScreenProps) {
  return (
    <div className="ending">
      <div className="result">
        <div>
          <div>
            {strings.final_result} {userScore}
          </div>
          <span
            dangerouslySetInnerHTML={{
              __html:
                userScore > best
                  ? `${
                      (strings.result_better &&
                        strings.result_better.replace(
                          "%percentage",
                          ((userScore / best) * 100 - 100).toFixed(1)
                        )) ||
                      ""
                    }`
                  : `${
                      (strings.result_worse &&
                        strings.result_worse.replace(
                          "%percentage",
                          ((userScore / best) * -100 + 100).toFixed(1)
                        )) ||
                      ""
                    }`,
            }}
          />
        </div>
        <Creature mood={userScore > best ? "happy" : "sad"} />
      </div>
      <div className="buttons">
        <button onClick={onPlayAgain}>{strings.play_again}</button>
        <button onClick={onLearnMore}>{strings.learn_more}</button>
      </div>
    </div>
  );
}
