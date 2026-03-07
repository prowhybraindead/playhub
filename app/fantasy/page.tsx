import { Header } from "@/components/layout/header";
import { FantasyExplorer } from "@/components/fantasy/fantasy-explorer";

export default function FantasyPage() {
  return (
    <>
      <Header title="Fantasy Universe" subtitle="Star Wars, GoT, LOTR, Dune với nhân vật, quote và info chi tiết." />
      <FantasyExplorer />
    </>
  );
}
