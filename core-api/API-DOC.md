# 📘 API Documentation

Bienvenue dans la documentation de l’API **Hypertube**.

- [📘 API Documentation](#-api-documentation)
  - [🛠️ Base URL](#️-base-url)
  - [📂 Endpoints](#-endpoints)
    - [Authentification: /auth](#authentification-auth)
      - [`POST /auth/register`](#post-authregister)
      - [`POST /auth/login`](#post-authlogin)
      - [`GET /auth/omniauth`](#get-authomniauth)
      - [`GET /auth/verify-email?token={token}`](#get-authverify-emailtokentoken)
      - [`GET /auth/forgot-password?email={email}`](#get-authforgot-passwordemailemail)
      - [`GET /auth/reset-password?token={token}`](#get-authreset-passwordtokentoken)
      - [`POST /auth/update-password?token={token}`](#post-authupdate-passwordtokentoken)
      - [`POST /auth/old-password-verify`](#post-authold-password-verify)
    - [Utilisateur: /user](#utilisateur-user)
      - [`GET /user`](#get-user)
      - [`GET /user/{id}`](#get-userid)
      - [`PUT /user`](#put-user)
      - [`DELETE /user/{id}`](#delete-userid)
    - [Movies: /movies](#movies-movies)
      - [`GET /movies/{movie_id}`](#get-moviesmovie_id)
      - [`POST /movies/sort-by`](#post-moviessort-by)
      - [`POST /movies/tmdb-search`](#post-moviessearch)
      - [`GET /movies/{movie_id}/comments`](#get-moviesmovie_idcomments)
      - [`POST /movies/watched`](#post-movieswatched)
      - [`GET /movies/{tmdb_id}/subtitles`](#get-moviestmdb_idsubtitles)
      - [`GET /movies/{tmdb_id}/trailer`](#get-moviestmdb_idtrailer)
    - [Commentaires: /comment](#commentaires-comment)
      - [`POST /comment`](#post-comment)
      - [`PUT /comment`](#put-comment)
      - [`DELETE /comment/{comment_id}`](#delete-commentcomment_id)
      - [`POST /comment/like/{comment_id}`](#post-commentlikecomment_id)
      - [`DELETE /comment/unlike/{comment_id}`](#delete-commentunlikecomment_id)
    - [Traduction: /translate](#traduction-translate)
      - [`GET /translate/lang`](#get-translatelang)
      - [`POST /translate`](#post-translate)

## 🛠️ Base URL

http://localhost:8080/

## 📂 Endpoints

### Authentification: /auth

#### `POST /auth/register`

- **Description :** Enregistre un nouveau utilisateur
- **Auth requise :** ❌​ Non
- **Body UserEntity:**


#### `POST /auth/login`

- **Description :** Connecte un utilisateur
- **Auth requise :** ❌​ Non
- **Body UserEntity:**

#### `GET /auth/omniauth`

- **Description :** Renvoie true si un utilisateur est connecte depuis une omniauth
- **Response:**
```json
{
    "response": "true"
}
```

#### `GET /auth/verify-email?token={token}`

- **Description :** Route pour mettre l'email en tant que verifier
- **Auth requise :** ❌​ Non


#### `GET /auth/forgot-password?email={email}`

- **Description :** Route pour envoyer un mail pour reset le mdp
- **Auth requise :** ❌​ Non

#### `GET /auth/reset-password?token={token}`

- **Description :** Route pour dire que le mdp a etait reset
- **Auth requise :** ❌​ Non
- **Response:**
```json
{
    "response": "Password changed"
}
```
#### `POST /auth/update-password?token={token}`
- **Description :** met a jour le mot de passe
- **Auth requise :** ✅ Oui et Si Non ❌ : envoyer le token en query param sinon ne pas l'envoyer
- **Body String (new pwd):**
- **Response:**
```json
{
    "response": "Password changed"
}
```
#### `POST /auth/old-password-verify`
- **Description :** renvoie ok si le mot de passe dans le body est le meme que celui de l'utilisateur
- **Auth requise :** ✅ Oui
- **Body String (old pwd):**
- **Response:**
```json
{
    "response": "true"
}
```

### Utilisateur: /user

#### `GET /user`

- **Description :** Récupère tout les utilisateurs
- **Auth requise :** ✅ Oui
- **Réponse `List<UserDTO>`:**

#### `GET /user/{id}`

- **Description :** Récupère un utilisateur par son ID
- **Auth requise :** ✅ Oui
- **Réponse `UserDTO`:**
```json
{
    "id": 3,
    "username": "t",
    "email": "t",
    "firstName": "t",
    "lastName": "t",
    "language": null,
    "profilePicture": null
}
```

#### `PUT /user`
- **Description :** Met a jour un utilisateur
- **Auth requise :** ✅ Oui
- **Body `UserDTO`:**
```json
{
    "id": 3,
    "username": "not_t",
    "email": "not_t@gmail.com",
    "firstName": "not_t",
    "lastName": "not_t",
    "language": null,
    "profilePicture": null
}
```
- **Réponse `UserDTO` modifie:**
  
#### `DELETE /user/{id}`
- **Description :** Supprime un utilisateur par son ID
- **Auth requise :** ✅ Oui

### Movies: /movies

#### `GET /movies/{movie_id}`

- **Description :** Récupère un utilisateur par son ID
- **Auth requise :** ✅ Oui
- **Réponse `MovieDTO`:**
```json
{
    "id": 268,
    "title": "Batman",
    "overview": "Batman must face his most ruthless nemesis.",
    "runtime": 126,
    "genres": [ List<GenreModel>
        {
            "id": 14,
            "name": "Fantasy"
        },
        ...
    ],
    "credits": {
        "cast": [ # List<PersonModel>
            {
                "id": 2232,
                "name": "Michael Keaton",
                "character": "Bruce Wayne / Batman",
                "profile_path": "/baeHNv3qrVsnApuKbZXiJOhqMnw.jpg"
            },
            ...
        ],
        "crew": [ # List<PersonModel>
            {
                "id": 3804,
                "name": "Peter Guber",
                "character": null,
                "profile_path": "/6QILn3KDqoJrRMz8rRzTYS3igCc.jpg"
            },
            ...
        ]
    },
    "subtitles": null,
    "stoppedAt": "01:28:16", # null si jamais vu
    "vote_average": 7.231,
    "release_date": "1989",
    "poster_path": "/cij4dd21v2Rk2YtUQbV5kW69WB2.jpg",
    "genre_ids": null
}
```

#### `POST /movies/sort-by`

- **Description :** Renvoie une liste de film trier par les genres et le sortBy (now_playing, popular, top_rating, upcoming)
- **Auth requise :** ✅ Oui
- **Body `SortByModel`:**
```json
{
    "sortBy": "popular",
    "page": 1,
    "genresIds": []
}
```
- **Réponse `List<MovieDTO>`:**
- 
#### `POST /movies/tmdb-search`

- **Description :** Renvoie une liste de film trier par la recherche et les genres
- **Auth requise :** ✅ Oui
- **Body SearchModel:**
```json
{
    "query": "Batman",
    "genresIds": [15, 600],
    "minStars": 8,
    "page": 1,
    "genresIds": []
}
```
- **Réponse `List<MovieDTO>`:**

#### `POST /movies/omdb-search`

- **Description :** Renvoie une liste de film trier par la recherche et les genres
- **Auth requise :** ✅ Oui
- **Body SearchModel:**
```json
{
    "query": "Batman",
    "genresIds": [15, 600],
    "minStars": 8,
    "page": 1,
    "genresIds": []
}
```
- **Réponse `List<MovieDTO>`:**

#### `GET /movies/{movie_id}/comments`
- **Description :** Renvoie une liste des commentaire en fonction du film ID
- **Auth requise :** ✅ Oui
- **Réponse `List<CommentDTO>`:**
```json
{
    "id": 13,
    "movieId": 268,
    "user": { # UserDTO
        "id": 3,
        "username": "t",
        "email": "t",
        "firstName": "t",
        "lastName": "t",
        "language": null,
        "profilePicture": null
    },
    "content": "Batman il fait trop l'ancien le joker il va le djoufara",
    "likes": 0,
    "createdAt": "2025-04-11T10:47:38.44801",
    "updatedAt": "2025-04-11T10:47:38.44801"
}
```

#### `POST /movies/watched`
- **Description :** Sauvegarde le temps ou l'utilisateur s'est arreter de regarder le film
- **Auth requise :** ✅ Oui
- **Body `WatchedMoviesDTO`:**
```json
{
    "movieId": 950387,
    "stoppedAt": "02:38:16"
}
```
- **Réponse `WatchedMoviesDTO`:**

#### `GET /movies/{tmdb_id}/subtitles`
- **Description :** Recupere les sous-titres associe au tmdb_id
- **Auth requise :** ✅ Oui
- **Réponse `List<SubtitlesDTO>`:**
```json
[
    {
        "title": "A.Minecraft.Movie.2025.1080p.HD-CAM.DDP2.0.H.264-MEOO",
        "language": "Romanian",
        "url": "https://www.opensubtitles.org/en/subtitleserve/sub/13058108"
    },
    {
        "title": "A.Minecraft.Movie.2025.1080p.TeleSync.Brighter.Version.X_cs",
        "language": "Czech",
        "url": "https://www.opensubtitles.org/en/subtitleserve/sub/13057116"
    },
]
```

#### `GET /movies/{movie_id}/trailer`
- **Description :** Renvoie un lien du trailer dans la langue de l'utilisateur ou Anglais si pas de resultat
- **Auth requise :** ✅ Oui
- **Réponse :**
```json
{
    "link": "https://www.youtube.com/embed/xitSoRbHJ50"
}
```

#### `GET /movies/genres`
- **Description :** Renvoie une list de tout les genres disponble
- **Auth requise :** ✅ Oui
- **Réponse `List<GenreModel>`:**
```json
[
    {
        "id": 28,
        "name": "Action"
    },
    {
        "id": 12,
        "name": "Adventure"
    },
]
```

### Commentaires: /comment
#### `POST /comment`
- **Description :** Ajoute un commentaire a un film et le renvoie
- **Auth requise :** ✅ Oui
- **Body `CommentDTO`:**
```json
{
    "movieId": 268,
    "userId": 3,
    "content": "Batman il fait trop l'ancien le joker il va le djoufara"
}
```
- **Réponse `CommentDTO`:**

#### `PUT /comment`

- **Description :** Met a jour un commentaire et le renvoie
- **Auth requise :** ✅ Oui
- **Body `CommentDTO`:**
- **Réponse `CommentDTO`:**

#### `DELETE /comment/{comment_id}`

- **Description :** Supprime un commentaire par son id
- **Auth requise :** ✅ Oui

#### `POST /comment/like/{comment_id}`
- **Description :** Like un commentaire et le renvoie
- **Auth requise :** ✅ Oui
- **Response `CommentDTO`:**

#### `DELETE /comment/unlike/{comment_id}`
- **Description :** Unlike un commentaire et le renvoie
- **Auth requise :** ✅ Oui

### Traduction: /translate

#### `GET /translate/lang`

- **Description :** Renvoie la list des lang disponible 
- **Auth requise :** ✅ Oui
- **Réponse `List<LanguageModel>`:**
```json
[
    {
        "iso_639_1": "az",
        "flag": "https://flagcdn.com/w80/az.png",
        "english_name": "Azerbaijani"
    },
    {
        "iso_639_1": "bn",
        "flag": "https://flagcdn.com/w80/bn.png",
        "english_name": "Bengali"
    }
]
```

#### `POST /translate`

- **Description :** Prend une liste de text a traduire dans une langue et renvoie la traduction
- **Auth requise :** ✅ Oui
- **Body `TranslateModel`:**
```json
{
    "text": ["Bonjour", "Bonne journee"],
    "source": "fr",
    "target": "en"
}
```

- **Réponse `List<String>`:**
```json
{
    "translations": [
        "Hello",
        "Good day"
    ]
}
```