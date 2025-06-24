import {UserModel} from "./user.model";

export interface CommentDTO {
  id: number;
  movieId: number;
  user: UserModel;
  content: string;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

