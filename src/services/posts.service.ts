import { HttpException } from "@/exceptions/HttpException";
import Posts, { CreatePost, UpdatePost } from "@/interfaces/posts.interface";
import postsModel, {
  validateCreatePost,
  validateUpdatePost,
} from "@/models/posts.model";
import { isEmpty } from "@/utils/util";
import { mongo, Schema } from "mongoose";

class PostsService {
  private posts = postsModel;

  public createPost = async (
    createdBy: Schema.Types.ObjectId,
    post: CreatePost
  ): Promise<Posts> => {
    if (isEmpty(post)) throw new HttpException(400, "No post details in body.");

    const validation = validateCreatePost(post);
    if (validation.error)
      throw new HttpException(
        400,
        `Invalid post details - ${validation.error}`
      );

    if (post.isPublished && !post.publishedOn) post.publishedOn = Date.now();

    const newPost = await this.posts.create({ ...post, createdBy });

    return newPost;
  };

  public updatePost = async (
    createdBy: Schema.Types.ObjectId,
    post: UpdatePost
  ): Promise<Posts> => {
    if (isEmpty(post)) throw new HttpException(400, "No post details in body.");

    const validation = validateUpdatePost(post);
    if (validation.error)
      throw new HttpException(
        400,
        `Invalid post details - ${validation.error}`
      );

    const postExist = await this.posts.findById(post._id);
    if (!postExist) throw new HttpException(409, "Post does not exist.");

    if (JSON.stringify(createdBy) !== JSON.stringify(postExist.createdBy))
      throw new HttpException(403, "Not authorized to update this post.");

    if (post.isPublished && !post.publishedOn) post.publishedOn = Date.now();

    const updatedPost = await this.posts
      .findByIdAndUpdate(post._id, post, {
        new: true,
        upsert: true,
      })
      .populate("createdBy", "fullName avatar")
      .select({ __v: 0 });

    return updatedPost;
  };

  public deletePost = async (
    createdBy: Schema.Types.ObjectId,
    postId: string
  ): Promise<Posts> => {
    if (isEmpty(postId))
      throw new HttpException(400, "No post id found in request.");

    if (!mongo.ObjectId.isValid(postId))
      throw new HttpException(400, "Invalid id.");

    const postExist = await this.posts.findById(postId);
    if (!postExist) throw new HttpException(409, "Post does not exist.");

    if (JSON.stringify(createdBy) !== JSON.stringify(postExist.createdBy))
      throw new HttpException(403, "Not authorized to delete this post.");

    const updatedPost = await this.posts
      .findByIdAndRemove(postId)
      .select({ createdBy: 0, __v: 0 });

    return updatedPost;
  };

  public getPostById = async (postId: string): Promise<Posts> => {
    if (isEmpty(postId))
      throw new HttpException(400, "No post id found in request.");

    if (!mongo.ObjectId.isValid(postId))
      throw new HttpException(400, "Invalid id.");

    const postExist = await this.posts.findById(postId);
    if (!postExist) throw new HttpException(409, "Post does not exist.");

    const post = await this.posts
      .findById(postId)
      .populate("createdBy", "fullName avatar")
      .select({
        __v: 0,
      });

    return post;
  };

  public getPosts = async (
    createdBy: Schema.Types.ObjectId
  ): Promise<Posts[]> => {
    const Posts = await this.posts
      .find({ createdBy })
      .select({ createdBy: 0, __v: 0 });

    return Posts;
  };

  public explorePosts = async (): Promise<Posts[]> => {
    const Posts = await this.posts
      .where({ isPublished: true })
      .populate("createdBy", "fullName avatar")
      .select({ __v: 0, subTitle: 0 });

    return Posts;
  };
}

export default PostsService;
