import {UserModel} from "./user.model";

export interface CommentDTO {
  id: number;
  movieId: number;
  user: UserModel;
  content: String;
  likes: number;
  createdAt: String;
  updatedAt: String;
}
