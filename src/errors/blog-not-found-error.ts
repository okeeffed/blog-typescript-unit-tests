export class BlogNotFoundError {
  readonly _tag = "BlogNotFoundError";
  readonly id: string;

  constructor(id: string) {
    this.id = id;
  }
}
