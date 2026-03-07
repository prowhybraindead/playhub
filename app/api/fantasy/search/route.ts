import { NextRequest, NextResponse } from "next/server";
import { fetchJson } from "@/lib/external-api";

type Universe = "starwars" | "got" | "lotr" | "dune";

export async function GET(request: NextRequest) {
  const universe = (request.nextUrl.searchParams.get("universe") ?? "starwars") as Universe;
  const query = request.nextUrl.searchParams.get("query")?.trim().toLowerCase() ?? "";
  const safeUniverse: Universe = ["starwars", "got", "lotr", "dune"].includes(universe) ? universe : "starwars";

  try {
    if (safeUniverse === "starwars") {
      const data = await fetchJson<Array<any>>("https://swapi.info/api/people", 1800);
      const filtered = data.filter((person) => person.name?.toLowerCase().includes(query)).slice(0, 18);
      return NextResponse.json({
        items: filtered.map((person, index) => ({
          id: `sw-${index}`,
          title: person.name,
          subtitle: "Star Wars",
          description: `Birth year: ${person.birth_year ?? "Unknown"} • Gender: ${person.gender ?? "Unknown"}`,
          quote: "Do. Or do not. There is no try.",
          extra: `Height: ${person.height ?? "Unknown"}`
        }))
      });
    }

    if (safeUniverse === "got") {
      const data = await fetchJson<Array<any>>("https://anapioficeandfire.com/api/characters?page=1&pageSize=50", 1800);
      const filtered = data.filter((item) => item.name && item.name.toLowerCase().includes(query)).slice(0, 18);
      return NextResponse.json({
        items: filtered.map((person) => ({
          id: person.url,
          title: person.name,
          subtitle: "Game of Thrones",
          description: `Culture: ${person.culture || "Unknown"} • Born: ${person.born || "Unknown"}`,
          quote: "When you play the game of thrones, you win or you die.",
          extra: `Aliases: ${(person.aliases ?? []).filter(Boolean).slice(0, 3).join(", ") || "None"}`
        }))
      });
    }

    const fallbackCharacters = safeUniverse === "lotr"
      ? [
          { id: "lotr-1", title: "Gandalf", subtitle: "Lord of the Rings", description: "Maiar wizard and guide of the Fellowship.", quote: "All we have to decide is what to do with the time that is given us." },
          { id: "lotr-2", title: "Aragorn", subtitle: "Lord of the Rings", description: "Ranger of the North and heir of Isildur.", quote: "A day may come when the courage of men fails, but it is not this day." },
          { id: "lotr-3", title: "Galadriel", subtitle: "Lord of the Rings", description: "Lady of Lothlórien with great foresight.", quote: "Even the smallest person can change the course of the future." },
          { id: "lotr-4", title: "Frodo Baggins", subtitle: "Lord of the Rings", description: "Hobbit of the Shire and Ring-bearer.", quote: "I will take the Ring, though I do not know the way." },
          { id: "lotr-5", title: "Samwise Gamgee", subtitle: "Lord of the Rings", description: "Loyal gardener and friend of Frodo.", quote: "I can't carry it for you, but I can carry you." },
          { id: "lotr-6", title: "Legolas", subtitle: "Lord of the Rings", description: "Elven prince of Mirkwood and skilled archer.", quote: "They're taking the hobbits to Isengard!" },
          { id: "lotr-7", title: "Gimli", subtitle: "Lord of the Rings", description: "Dwarven warrior, son of Glóin.", quote: "Certainty of death. Small chance of success. What are we waiting for?" },
          { id: "lotr-8", title: "Gollum", subtitle: "Lord of the Rings", description: "Corrupted by the One Ring over centuries.", quote: "My precious!" },
          { id: "lotr-9", title: "Elrond", subtitle: "Lord of the Rings", description: "Half-elven Lord of Rivendell.", quote: "Men are weak. The blood of Númenor is all but spent." },
          { id: "lotr-10", title: "Sauron", subtitle: "Lord of the Rings", description: "The Dark Lord of Mordor.", quote: "There is no life in the void, only death." }
        ]
      : [
          { id: "dune-1", title: "Paul Atreides", subtitle: "Dune", description: "Heir of House Atreides and the Kwisatz Haderach.", quote: "Fear is the mind-killer." },
          { id: "dune-2", title: "Lady Jessica", subtitle: "Dune", description: "Bene Gesserit adept and mother of Paul.", quote: "Hope clouds observation." },
          { id: "dune-3", title: "Chani", subtitle: "Dune", description: "Fremen warrior and Paul's partner.", quote: "Without change, something sleeps inside us, and seldom awakens." },
          { id: "dune-4", title: "Duke Leto Atreides", subtitle: "Dune", description: "Noble leader of House Atreides.", quote: "A person needs new experiences. They jar something deep inside, allowing him to grow." },
          { id: "dune-5", title: "Baron Vladimir Harkonnen", subtitle: "Dune", description: "Ruthless and cunning head of House Harkonnen.", quote: "The spice must flow." },
          { id: "dune-6", title: "Duncan Idaho", subtitle: "Dune", description: "Swordmaster of the Ginaz and loyal Atreides retainer.", quote: "I am not a hero. I am a servant." },
          { id: "dune-7", title: "Gurney Halleck", subtitle: "Dune", description: "Warmaster of House Atreides and talented musician.", quote: "What has mood to do with it? You fight when the necessity arises—no matter the mood." },
          { id: "dune-8", title: "Stilgar", subtitle: "Dune", description: "Naib of Sietch Tabr and Fremen leader.", quote: "You have much to teach us... and we have much to teach you." },
          { id: "dune-9", title: "Feyd-Rautha Harkonnen", subtitle: "Dune", description: "The Baron's charismatic and deadly nephew.", quote: "I will kill this Atreides with my own hands." },
          { id: "dune-10", title: "Alia Atreides", subtitle: "Dune", description: "Sister of Paul, born with ancestral memories.", quote: "I am a messenger from the future." }
        ];

    const filtered = fallbackCharacters.filter((item) => item.title.toLowerCase().includes(query || ""));
    return NextResponse.json({ items: filtered });
  } catch (error) {
    return NextResponse.json({ items: [], message: error instanceof Error ? error.message : "Fantasy search failed" }, { status: 500 });
  }
}
