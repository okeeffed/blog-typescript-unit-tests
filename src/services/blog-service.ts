import { ok, err } from "neverthrow";
import { ILoggerService } from "./logger-service";

export class BlogService {
	private logger: ILoggerService;
	private blogRepository: BlogRepository;

	constructor(logger: ILoggerService,) {
		this.logger = logger;
	}

	async createBlog() {
		// TODO
	}

	async deleteBlog() {
		// TODO
	}

	async getBlogs() {
		// TODO
	}

	async getBloggers() {
		// TODO
		const bloggers = 
	}
}
