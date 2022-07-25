import { NextFunction, Request, Response } from "express";
import { RequestWithUser } from "@/interfaces/auth.interface";
import Posts, { CreatePost, UpdatePost } from "@/interfaces/posts.interface";
import PostsService from "@/services/posts.service";

class PostsController {
  private postsService = new PostsService();

  public createPost = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const post: CreatePost = req.body;
      const createdBy = req.user._id;

      const newPost = await this.postsService.createPost(createdBy, post);

      res.status(200).json(newPost);
    } catch (error) {
      next(error);
    }
  };

  public updatePost = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const post: UpdatePost = req.body;
      const createdBy = req.user._id;

      const newPost = await this.postsService.updatePost(createdBy, post);

      res.status(200).json(newPost);
    } catch (error) {
      next(error);
    }
  };

  public deletePost = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const postId: string = req.params.id;
      const createdBy = req.user._id;

      const newPost = await this.postsService.deletePost(createdBy, postId);

      res.status(200).json(newPost);
    } catch (error) {
      next(error);
    }
  };

  public getPost = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const postId: string = req.params.id;
      const createdBy = req.user._id;

      const post = await this.postsService.getPost(createdBy, postId);

      res.status(200).json(post);
    } catch (error) {
      next(error);
    }
  };

  public getPostById = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const postId: string = req.params.id;
      const userId = req.user._id;

      const post = await this.postsService.getPostById(userId, postId);

      res.status(200).json(post);
    } catch (error) {
      next(error);
    }
  };

  public getPosts = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const createdBy = req.user._id;

      const posts = await this.postsService.getPosts(createdBy);

      res.status(200).json(posts);
    } catch (error) {
      next(error);
    }
  };

  public getHomePosts = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    const userId = req.user._id;
    const posts = await this.postsService.getHomePosts(userId);
    res.status(200).send(posts);
    try {
    } catch (error) {
      next(error);
    }
  };

  public getMyDrafts = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    const userId = req.user._id;
    const posts = await this.postsService.getMyDrafts(userId);
    res.status(200).send(posts);
    try {
    } catch (error) {
      next(error);
    }
  };

  public getMyPosts = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    const userId = req.user._id;
    const posts = await this.postsService.getMyPosts(userId);
    res.status(200).send(posts);
    try {
    } catch (error) {
      next(error);
    }
  };

  public explorePostById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const postId: string = req.params.id;

      const post = await this.postsService.explorePostById(postId);

      res.status(200).json(post);
    } catch (error) {
      next(error);
    }
  };

  public explorePosts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const posts = await this.postsService.explorePosts();

      res.status(200).json(posts);
    } catch (error) {
      next(error);
    }
  };
}

export default PostsController;
