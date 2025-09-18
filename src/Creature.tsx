import happy from "./assets/img/happy-tamagotchi_transparent.gif";
import sad from "./assets/img/eating-tamagotchi_transparent.gif";
import eating from "./assets/img/eating-tamagotchi_transparent.gif";
import neutral from "./assets/img/neutral-tamagotchi_transparent.gif";

const images = {
  happy,
  sad,
  eating,
  neutral,
} as const;

interface Props {
  mood: keyof typeof images;
}
export default function Creature({ mood }: Props) {
  return <img src={images[mood]} />;
}
