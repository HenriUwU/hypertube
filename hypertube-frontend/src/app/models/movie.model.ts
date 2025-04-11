export interface GenreModel {
    id: number;
    name: string;
  }
  
  export interface PersonModel {
    id: number;
    name: string;
    role?: string;
    job?: string;
    character?: string;
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
  