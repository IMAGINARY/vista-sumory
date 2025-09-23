import { useMemo, useRef, useState } from "react";
import SumoryGame from "./SumoryGame";
import { generateValues } from "./helpers/sumory-random";
import { shuffle } from "./helpers/aux";
import classnames from "classnames";
import "./styles/app.scss";
import Creature from "./Creature";
import { calculateStrategiesDeterministically } from "./helpers/sumory-strategy";
import InfoModal from "./InfoModal";

const langs = ["de", "en"];

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

  const [language, setLanguage] = useState(config.defaultLanguage || "de");
  const [strings, setStrings] = useState<Record<string, string>>(
    config.languages[language]
  );
  const [cardValues, setCardValues] = useState(resetCardValues());
  const [gameNumber, setGameNumber] = useState(1);
  const [gameStatus, setGameStatus] = useState({ score: 0, turnsLeft: TURNS });
  const [resettingGame, setResettingGame] = useState(false);
  const [creatureMood, setCreatureMood] = useState("neutral");
  const [gameEnded, setGameEnded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const moodTimeout = useRef(-1);

  const strategy = useMemo(
    () => calculateStrategiesDeterministically(cardValues, TURNS),
    [cardValues, TURNS]
  );
  const best = Math.max(...strategy);

  const instructions =
    (strings.instructions &&
      strings.instructions.replace("%turns", "" + TURNS)) ||
    "";

  const nextLanguage = (language: string) => {
    const index = langs.indexOf(language);
    return langs[(index + 1) % langs.length];
  };

  function handleLanguageChange() {
    const code = nextLanguage(language);
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
              lang={language}
              strings={strings}
              userScore={gameStatus.score}
              best={best}
              onPlayAgain={handleRestart}
              onLearnMore={() => setModalOpen(true)}
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
          <span>{nextLanguage(language).toUpperCase()}</span>
        </button>
      </div>
      <InfoModal
        strings={strings}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

interface EndScreenProps {
  lang: string;
  strings: any;
  userScore: number;
  best: number;
  onPlayAgain?: () => void;
  onLearnMore?: () => void;
}

function EndScreen({
  lang,
  strings,
  userScore,
  best,
  onPlayAgain,
  onLearnMore,
}: EndScreenProps) {
  const goodScore = userScore > best;
  const formatted = new Intl.NumberFormat(lang, {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(goodScore ? userScore / best - 1 : userScore / best + 1);
  ("12.5%");
  return (
    <div className="ending">
      <div className="result">
        <div>
          <div>
            {strings.final_result} {userScore}
          </div>
          <span
            dangerouslySetInnerHTML={{
              __html: goodScore
                ? `${
                    strings.result_better?.replace("%percentage", formatted) ||
                    ""
                  }`
                : `${
                    strings.result_worse?.replace("%percentage", formatted) ||
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
