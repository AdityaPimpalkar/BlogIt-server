import Bookmarks from "@/interfaces/bookmarks.interface";
import { Document, model, Schema, SchemaTypes } from "mongoose";

const bookmarksSchema = new Schema({
  post: {
    type: SchemaTypes.ObjectId,
    required: true,
    ref: "post",
  },
  bookmarkedBy: {
    type: Schema.Types.ObjectId,
    required: true,
  },
});

const bookmarksModel = model<Bookmarks & Document>(
  "bookmarks",
  bookmarksSchema
);
export default bookmarksModel;
