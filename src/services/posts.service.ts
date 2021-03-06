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

    if (post.isPublished && !postExist.publishedOn)
      post.publishedOn = Date.now();

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

  public getPost = async (
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
      throw new HttpException(403, "Not authorized to view this post.");

    const post = await this.posts
      .findById(postId)
      .populate("createdBy", "fullName avatar")
      .select({
        __v: 0,
      });

    return post;
  };

  public getPostById = async (
    userId: Schema.Types.ObjectId,
    postId: string
  ): Promise<Posts> => {
    if (isEmpty(postId))
      throw new HttpException(400, "No post id found in request.");

    if (!mongo.ObjectId.isValid(postId))
      throw new HttpException(400, "Invalid id.");

    const postExist = await this.posts.findById(postId);
    if (!postExist) throw new HttpException(409, "Post does not exist.");

    const [post] = await this.posts
      .aggregate()
      .match({ _id: postExist._id })
      .lookup({
        from: "bookmarks",
        pipeline: [
          {
            $match: { post: postExist._id, bookmarkedBy: userId },
          },
        ],
        as: "bookmarked",
      })
      .lookup({
        from: "users",
        let: {
          id: "$createdBy",
        },
        pipeline: [
          { $match: { _id: userId } },
          { $match: { $expr: { $in: ["$$id", "$following"] } } },
        ],
        as: "isFollowing",
      })
      .lookup({
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
      })
      .project({
        _id: 1,
        title: 1,
        subTitle: 1,
        description: 1,
        publishedOn: 1,
        isPublished: 1,
        createdBy: { $arrayElemAt: ["$createdBy", 0] },
        bookmarked: { $arrayElemAt: ["$bookmarked", 0] },
        isFollowing: {
          $cond: {
            if: { $arrayElemAt: ["$isFollowing", 0] },
            then: true,
            else: false,
          },
        },
      })
      .project({
        createdBy: {
          following: 0,
          password: 0,
          email: 0,
          firstName: 0,
          lastName: 0,
          __v: 0,
        },
        bookmarked: {
          post: 0,
          bookmarkedBy: 0,
          __v: 0,
        },
      });

    return post;
  };

  public getPosts = async (userId: Schema.Types.ObjectId): Promise<Posts[]> => {
    const Posts = await this.posts
      .aggregate()
      .match({ isPublished: true })
      .sort({ publishedOn: -1 })
      .lookup({
        from: "bookmarks",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: { $expr: { $eq: ["$$id", "$post"] }, bookmarkedBy: userId },
          },
        ],
        as: "bookmarked",
      })
      .lookup({
        from: "users",
        let: {
          id: "$createdBy",
        },
        pipeline: [
          { $match: { _id: userId } },
          { $match: { $expr: { $in: ["$$id", "$following"] } } },
        ],
        as: "isFollowing",
      })
      .lookup({
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
      })
      .project({
        _id: 1,
        title: 1,
        subTitle: 1,
        description: 1,
        publishedOn: 1,
        createdBy: { $arrayElemAt: ["$createdBy", 0] },
        bookmarked: { $arrayElemAt: ["$bookmarked", 0] },
        isFollowing: {
          $cond: {
            if: { $arrayElemAt: ["$isFollowing", 0] },
            then: true,
            else: false,
          },
        },
      })
      .project({
        createdBy: {
          following: 0,
          password: 0,
          email: 0,
          firstName: 0,
          lastName: 0,
          __v: 0,
        },
        bookmarked: {
          post: 0,
          bookmarkedBy: 0,
          __v: 0,
        },
      });

    return Posts;
  };

  public getHomePosts = async (
    userId: Schema.Types.ObjectId
  ): Promise<Posts[]> => {
    const postFields = {
      _id: 1,
      title: 1,
      subTitle: 1,
      description: 1,
      publishedOn: 1,
      isPublished: 1,
    };
    const myPosts = await this.posts
      .aggregate()
      .lookup({
        from: "users",
        let: {
          id: "$createdBy",
        },
        pipeline: [
          { $match: { _id: userId } },
          { $match: { $expr: { $in: ["$$id", "$following"] } } },
        ],
        as: "isFollowing",
      })
      .lookup({
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
      })
      .lookup({
        from: "bookmarks",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: { $expr: { $eq: ["$$id", "$post"] }, bookmarkedBy: userId },
          },
        ],
        as: "bookmarked",
      })
      .project({
        ...postFields,
        createdBy: { $arrayElemAt: ["$createdBy", 0] },
        bookmarked: { $arrayElemAt: ["$bookmarked", 0] },
        isFollowing: {
          $cond: {
            if: { $arrayElemAt: ["$isFollowing", 0] },
            then: true,
            else: false,
          },
        },
      })
      .match({ isFollowing: true, isPublished: true })
      .project({
        ...postFields,
        createdBy: {
          _id: 1,
          fullName: 1,
          avatar: 1,
        },
        bookmarked: {
          _id: 1,
        },
      })
      .sort({ publishedOn: -1 });

    return myPosts;
  };

  public getMyDrafts = async (
    userId: Schema.Types.ObjectId
  ): Promise<Posts[]> => {
    const drafts = this.posts
      .find({ createdBy: userId })
      .where({ isPublished: false });
    return drafts;
  };

  public getMyPosts = async (
    userId: Schema.Types.ObjectId
  ): Promise<Posts[]> => {
    const myPosts = this.posts
      .find({ createdBy: userId })
      .where({ isPublished: true });

    return myPosts;
  };

  public explorePostById = async (postId: string): Promise<Posts> => {
    if (isEmpty(postId))
      throw new HttpException(400, "No post id found in request.");

    if (!mongo.ObjectId.isValid(postId))
      throw new HttpException(400, "Invalid id.");

    const postExist = await this.posts.findById(postId);
    if (!postExist) throw new HttpException(409, "Post does not exist.");

    const [post] = await this.posts
      .aggregate()
      .match({ _id: postExist._id })
      .lookup({
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
      })
      .project({
        _id: 1,
        title: 1,
        subTitle: 1,
        description: 1,
        publishedOn: 1,
        isPublished: 1,
        createdBy: { $arrayElemAt: ["$createdBy", 0] },
      })
      .project({
        createdBy: {
          following: 0,
          password: 0,
          email: 0,
          firstName: 0,
          lastName: 0,
          __v: 0,
        },
      });

    return post;
  };

  public explorePosts = async (): Promise<Posts[]> => {
    const Posts = await this.posts
      .aggregate()
      .match({ isPublished: true })
      .sort({ publishedOn: -1 })
      .lookup({
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
      })
      .project({
        _id: 1,
        title: 1,
        subTitle: 1,
        description: 1,
        publishedOn: 1,
        createdBy: { $arrayElemAt: ["$createdBy", 0] },
      })
      .project({
        createdBy: {
          following: 0,
          password: 0,
          email: 0,
          firstName: 0,
          lastName: 0,
          __v: 0,
        },
      });

    return Posts;
  };
}

export default PostsService;
