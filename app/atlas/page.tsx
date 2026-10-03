import { Suspense } from "react";
import { AtlasView } from "@/components/atlas/AtlasView";

export const metadata = {
  title: "Atlas — BHĀRATA",
};

export default function AtlasPage() {
  return (
    <Suspense fallback={<div className="h-[calc(100vh-65px)] bg-paper" />}>
      <AtlasView />
    </Suspense>
  );
}
