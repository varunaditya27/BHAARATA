import { PageTransition } from "@/components/primitives/PageTransition";
import { HomeClosing } from "@/components/home/HomeClosing";
import { HomeFilm } from "@/components/home/HomeFilm";

export default function Home() {
  return (
    <PageTransition>
      <div>
        <HomeFilm />
        <HomeClosing />
      </div>
    </PageTransition>
  );
}
