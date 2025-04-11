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


interface WatchedMoviesDTO {
  id : number;
  movieId : number;
  stoppedAt : Time;
}

export interface Movie {
  id: number;
  title: string;
  overview: string;

  vote_average: number;
  release_year: string;
  poster_path: string;

  genre_ids: number[];

  runtime: number;
  genres: GenreModel[];
  credits: Credits;
  subtitles: Map<string, string>;

  watchedMovies: WatchedMoviesDTO;
}

export interface MovieThumbnail {
  id: number;
  title: string;

  release_year: number;
  poster_path: string;
  runtime: Time;
  watchedMovies: Time;
  genres: GenreModel[];
}