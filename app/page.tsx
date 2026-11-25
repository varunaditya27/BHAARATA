import { HomeClosing } from "@/components/home/HomeClosing";
import { HomeFilm } from "@/components/home/HomeFilm";

export default function Home() {
  return (
    <>
      <div>
        <HomeFilm />
        <HomeClosing />
      </div>
    </>
  );
}
