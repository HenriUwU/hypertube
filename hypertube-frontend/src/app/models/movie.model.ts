import { Time } from "@angular/common";

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

export interface Movie {
  id: number;
  title: string;
  overview: string;

  imdbRating: number;
  release_date: string;
  poster_path: string;

  runtime: number;
  genres: GenreModel[];
  credits: Credits;
  subtitles: Map<string, string>;

  stoppedAt: Time;
}

export interface MovieThumbnail {
  id: number;
  title: string;

  release_date: number;
  poster_path: string;
  runtime: number;
  stoppedAt: Time;
  genres: GenreModel[];
  imdbRating: number;
}