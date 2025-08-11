
export class BlogData {
  readonly _tag = "BlogData"

  title: string;
  content: string | null;
  id: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(input: {
    title: string;
    content: string | null;
    id: string;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.title = input.title;
    this.content = input.content;
    this.id = input.id;
    this.published = input.published;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }
}
