# 📘 API Documentation

Bienvenue dans la documentation de l’API **NomDuProjet**.

## 🛠️ Base URL

http://localhost:8080/

## 📂 Endpoints

### 👤 Utilisateur: /user

#### `GET /user/{id}`

- **Description :** Récupère un utilisateur par son ID
- **Auth requise :** ✅ Oui
- **Réponse UserDTO:**
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
- **Body UserDTO:**
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
- **Réponse UserDTO modifie:**
  
#### `DELETE /user/{id}`
- **Description :** Supprime un utilisateur par son ID
- **Auth requise :** ✅ Oui

### 👤 Movies: /movies

#### `GET /movies/{movie_id}`

- **Description :** Récupère un utilisateur par son ID
- **Auth requise :** ✅ Oui
- **Réponse MovieDTO:**
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
    "vote_average": 7.231, # IMDb rating
    "release_date": "1989",
    "poster_path": "/cij4dd21v2Rk2YtUQbV5kW69WB2.jpg",
    "genre_ids": null
}
```

#### `POST /movies/sort-by`

- **Description :** Renvoie une liste de film trier par les genres et le sortBy (now_playing, popular, top_rating, upcoming)
- **Auth requise :** ✅ Oui
- **Body SortByDTO:**
```json
{
    "sortBy": "popular",
    "page": 1,
    "genresIds": []
}
```
- **Réponse List\<MovieDTO\>:**
- 
#### `POST /movies/search`

- **Description :** Renvoie une liste de film trier par la recherche et les genres
- **Auth requise :** ✅ Oui
- **Body SearchDTO:**
```json
{
    "query": "Batman",
    "page": 1,
    "genresIds": []
}
```
- **Réponse List\<MovieDTO\>:**

#### `GET /movies/{movie_id}/comments`
- **Description :** Renvoie une liste des commentaire en fonction du film ID
- **Auth requise :** ✅ Oui
- **Réponse List\<CommentDTO\>:**
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
- **Body WatchedMoviesDTO:**
```json
{
    "movieId": 950387,
    "stoppedAt": "02:38:16"
}
```
- **Réponse WatchedMoviesDTO:**

#### `PUT /movies/watched`
- **Description :** Met a jour le temps ou l'utilisateur s'est arreter de regarder le film
- **Auth requise :** ✅ Oui
- **Body WatchedMoviesDTO:**
- **Réponse WatchedMoviesDTO:**

### 👤 Commentaires: /comment
#### `POST /comment`
- **Description :** Ajoute un commentaire a un film et le renvoie
- **Auth requise :** ✅ Oui
- **Body CommentDTO:**
```json
{
    "movieId": 268,
    "userId": 3,
    "content": "Batman il fait trop l'ancien le joker il va le djoufara"
}
```
- **Réponse CommentDTO:**

#### `PUT /comment`

- **Description :** Met a jour un commentaire et le renvoie
- **Auth requise :** ✅ Oui
- **Body CommentDTO:**
- **Réponse CommentDTO:**

#### `DELETE /comment/{comment_id}`

- **Description :** Supprime un commentaire par son id
- **Auth requise :** ✅ Oui

#### `POST /comment/like/{comment_id}`
- **Description :** Like un commentaire et le renvoie
- **Auth requise :** ✅ Oui
- **Response CommentDTO:**

#### `DELETE /comment/unlike/{comment_id}`
- **Description :** Unlike un commentaire et le renvoie
- **Auth requise :** ✅ Oui