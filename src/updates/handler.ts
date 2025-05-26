import { Context, FilterQuery, Middleware } from "grammy"

export interface IUpdateHandler {
  updateName: FilterQuery | FilterQuery[],
  middlewares?: Array<Middleware<Context>>;
  run: (ctx: Context) => Promise<void> | void;
}