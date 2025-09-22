import { useEffect, useRef, useState } from "react";
import classnames from "classnames";
import "./styles/board.scss";
import candy from "./assets/img/candy.png";

interface Props {
  values: number[];
  turns: number;
  onUpdate: (sum: number, turnsLeft: number) => void;
  onGameOver: () => void;
  config: Record<string, any>;
  resetting: boolean;
}

export default function SumoryGame(props: Props) {
  const { values, turns, resetting, onUpdate, onGameOver, config } = props;
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const cardElements = useRef<any[]>([]);
  const [gameOver, setGameOver] = useState(false);

  // Reveal all cards at the end
  const [revealedCount, setRevealedCount] = useState(0);
  const revealedCounter = useRef(0);
  useEffect(() => {
    let intervalId: number = -1;
    if (turnsLeft(selectedCards) === 0) {
      intervalId = setInterval(() => {
        const lowestCardUnturned = values.findIndex(
          (_, i) => i >= revealedCounter.current && !selectedCards.includes(i)
        );
        if (lowestCardUnturned !== -1) {
          revealedCounter.current = lowestCardUnturned + 1;
          setRevealedCount(revealedCounter.current);
        } else {
          clearInterval(intervalId);
          triggerGameOver();
        }
      }, config.cardRevealDelay || 150);
    } else {
      revealedCounter.current = 0;
    }
    return () => clearInterval(intervalId);
  }, [selectedCards]);

  function turnsLeft(selection: number[]) {
    return turns - selection.length;
  }

  function sum(selection: number[]) {
    return selection.reduce((total, cardId) => total + values[cardId], 0);
  }

  function handleCardClicked(i: number) {
    if (turnsLeft(selectedCards) !== 0) {
      const newSelection = [...selectedCards, i];
      setSelectedCards(newSelection);
      if (onUpdate) {
        onUpdate(sum(newSelection), turnsLeft(newSelection));
      }
    }
  }

  function triggerGameOver() {
    setGameOver(true);
    if (onGameOver) {
      onGameOver();
    }
  }

  // Allows to use Array functions to repeat something n times
  // by creating an array with n dummy elements
  const times = (n: number) => [...Array(n)];

  return (
    <div
      className={classnames("sumory-game", {
        "sumory-game-over": gameOver && !resetting,
      })}
    >
      <div className="sumory-board">
        {values.map((value, i) => {
          const timesSelected = selectedCards.reduce(
            (total, sel) => total + (sel === i ? 1 : 0),
            0
          );
          const turned = (timesSelected > 0 || revealedCount > i) && !resetting;
          const text = value > 0 ? `+${value}` : value;
          return (
            <button
              type="button"
              className={classnames("sumory-card", {
                visible: turned,
                selected: timesSelected > 0,
              })}
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              onClick={handleCardClicked.bind(null, i)}
              ref={(el) => {
                cardElements.current[i] = el;
              }}
            >
              <svg className="sumory-card-front" viewBox="-25 -25 50 50">
                <text className="value">{text}</text>
                {/* eslint-disable-next-line react/no-array-index-key */}
                {times(timesSelected).map((_, j) => (
                  <text
                    className={classnames("value-ghost", {
                      "value-ghost-imm": timesSelected > 1,
                    })}
                    key={j}
                  >
                    {text}
                  </text>
                ))}
              </svg>
              <div className="sumory-card-back">
                <img src={candy} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
