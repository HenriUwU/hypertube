import { Time } from "@angular/common";

export interface Movie {
  id: number;
  title: string;
  englishTitle: string;
  overview: string;
  imdb_id: string;

  vote_average: number;
  release_date: string;
  poster_path: string;
  backdrop_path: string;

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
  // stoppedAt: Time;
  stoppedAt: string;
  genres: GenreModel[];
  vote_average: number;
}

export interface Subtitles {
  title: string,
  language: string,
  url: string
}
export interface GenreModel {
    id: number;
    name: string;
}

export interface PersonModel {
  id: number;
  name: string;
  character?: string;
  job?: string;
  profile_path?: string;
}

export interface WatchedMoviesDTO {
  userId: number;
  movieId: number;
  watchedAt: string;
}

  export interface Credits {
    cast: PersonModel[];
    crew: PersonModel[];
  }

  export interface MovieDTO {
    id: number;
    title: string;
    overview: string;
    rating: number;
    releaseDate: string;
    thumbnail: string;
    genreIds: number[];
    runtime: number;
    genres: GenreModel[];
    credits: Credits;
    subtitles: Record<string, string>;
    watchedMovies: WatchedMoviesDTO;
  }

  export interface SearchMovie {
    query: string;
    page: number;
    genresIds: number[];
  }
