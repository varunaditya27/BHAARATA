import { Suspense } from "react";
import { AtlasView } from "@/components/atlas/AtlasView";
import { PageTransition } from "@/components/primitives/PageTransition";

export const metadata = {
  title: "Atlas — BHĀRATA",
};

export default function AtlasPage() {
  return (
    <PageTransition>
    <Suspense fallback={<div className="h-[calc(100vh-65px)] bg-paper" />}>
      <AtlasView />
    </Suspense>
    </PageTransition>
  );
}
