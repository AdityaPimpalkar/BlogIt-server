import { HttpException } from "@/exceptions/HttpException";
import Posts, { CreatePost, UpdatePost } from "@/interfaces/posts.interface";
import postsModel, {
  validateCreatePost,
  validateUpdatePost,
} from "@/models/posts.model";
import { isEmpty } from "@/utils/util";
import { Schema } from "mongoose";

class PostsService {
  private posts = postsModel;

  public createPost = async (
    createdBy: Schema.Types.ObjectId,
    post: CreatePost
  ): Promise<Posts> => {
    if (isEmpty(post)) throw new HttpException(400, "No post details in body");

    const validation = validateCreatePost(post);
    if (validation.error)
      throw new HttpException(400, `Invalid post data - ${validation.error}`);

    if (post.isPublished && !post.publishedOn) post.publishedOn = Date.now();

    const newPost = await this.posts.create({ ...post, createdBy });

    return newPost;
  };

  public updatePost = async (
    createdBy: Schema.Types.ObjectId,
    post: UpdatePost
  ): Promise<Posts> => {
    if (isEmpty(post)) throw new HttpException(400, "No post details in body");

    const validation = validateUpdatePost(post);
    if (validation.error)
      throw new HttpException(400, `Invalid post data - ${validation.error}`);

    const postExist = await this.posts.findById(post._id);
    if (!postExist) throw new HttpException(409, "Post does not exist.");

    if (JSON.stringify(createdBy) !== JSON.stringify(postExist.createdBy))
      throw new HttpException(403, "Not authorized to update this post.");

    if (post.isPublished && !post.publishedOn) post.publishedOn = Date.now();

    const updatedPost = await this.posts.findByIdAndUpdate(post._id, post, {
      new: true,
      upsert: true,
    });

    return updatedPost;
  };

  public deletePost = async (
    createdBy: Schema.Types.ObjectId,
    postId: string
  ): Promise<Posts> => {
    if (isEmpty(postId))
      throw new HttpException(400, "No post id found in request.");

    const postExist = await this.posts.findById(postId);
    if (!postExist) throw new HttpException(409, "Post does not exist.");

    if (createdBy !== postExist.createdBy)
      throw new HttpException(403, "Not authorized to delete this post.");

    const updatedPost = await this.posts.findByIdAndRemove(postId);

    return updatedPost;
  };

  public getPostById = async (postId: string): Promise<Posts> => {
    if (isEmpty(postId))
      throw new HttpException(400, "No post id found in request.");

    const postExist = await this.posts.findById(postId);
    if (!postExist) throw new HttpException(409, "Post does not exist.");

    const updatedPost = await this.posts.findById(postId);

    return updatedPost;
  };

  public getPosts = async (
    createdBy: Schema.Types.ObjectId
  ): Promise<Posts[]> => {
    const updatedPost = await this.posts.find({ createdBy });

    return updatedPost;
  };
}

export default PostsService;
