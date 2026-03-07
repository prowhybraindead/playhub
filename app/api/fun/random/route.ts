import { NextResponse } from "next/server";
import { fetchJson } from "@/lib/external-api";

type Pokemon = { name: string; sprites?: { other?: { "official-artwork"?: { front_default?: string } } } };
type Nasa = { title?: string; explanation?: string; url?: string };
type Cat = { url: string };
type Dog = { message: string };
type Fox = { image: string };
type Joke = { setup?: string; punchline?: string };
type Fact = { text?: string };

export async function GET() {
  try {
    const pokemonId = Math.floor(Math.random() * 151) + 1;
    const [pokemon, nasa, cat, dog, fox, joke, fact] = await Promise.all([
      fetchJson<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`, 3600),
      fetchJson<Nasa>("https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY", 3600),
      fetchJson<Cat[]>("https://api.thecatapi.com/v1/images/search", 600),
      fetchJson<Dog>("https://dog.ceo/api/breeds/image/random", 600),
      fetchJson<Fox>("https://randomfox.ca/floof/", 600),
      fetchJson<Joke>("https://official-joke-api.appspot.com/random_joke", 600),
      fetchJson<Fact>("https://uselessfacts.jsph.pl/api/v2/facts/random?language=en", 600)
    ]);

    return NextResponse.json({
      pokemon: {
        name: pokemon.name,
        image: pokemon.sprites?.other?.["official-artwork"]?.front_default ?? null
      },
      nasa: {
        title: nasa.title ?? "NASA APOD",
        image: nasa.url ?? null,
        description: nasa.explanation ?? ""
      },
      animals: {
        cat: cat[0]?.url ?? null,
        dog: dog.message ?? null,
        fox: fox.image ?? null
      },
      joke: joke.setup && joke.punchline ? `${joke.setup} — ${joke.punchline}` : "",
      fact: fact.text ?? ""
    });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Fun feed unavailable" }, { status: 500 });
  }
}
