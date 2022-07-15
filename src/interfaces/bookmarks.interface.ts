import { Schema } from "mongoose";

export default interface Bookmarks {
  post: Schema.Types.ObjectId;
  bookmarkedBy: Schema.Types.ObjectId;
}
