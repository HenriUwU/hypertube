interface GenreModel {
  id: number;
  name: string;
}

interface PersonModel {
  id: number;
  name: string;
  character: string;
  profilePath: string;
}

interface Credits {
  cast: PersonModel[];
  crew: PersonModel[];
}

export interface MovieDTO {
  id: number;
  title: string;
  overview: string;
  vote_average: number;
  release_date: string;
  poster_path: string;
  runtime: number;
  genres: GenreModel[];
  credits: Credits;
  subtitles: Map<string, string>;
}