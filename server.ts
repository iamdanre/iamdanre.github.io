import { serve } from "https://deno.land/std/http/server.ts";
import { contentType } from "https://deno.land/std/media_types/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts";

const port = 8000;

async function handleRequest(request: Request): Promise<Response> {
	const url = new URL(request.url);
	let filePath = url.pathname;
	
	// Default to index.html for root path
	if (filePath === "/") {
		filePath = "/index.html";
	}

	try {
		const fullPath = join(Deno.cwd(), filePath.slice(1));
		const content = await Deno.readFile(fullPath);
		const mimeType = contentType(filePath.split(".").pop() || "") || "application/octet-stream";
		
		return new Response(content, {
			status: 200,
			headers: {
				"content-type": mimeType,
			},
		});
	} catch (e) {
		if (e instanceof Deno.errors.NotFound) {
			return new Response("404 Not Found", { status: 404 });
		}
		return new Response("500 Internal Error", { status: 500 });
	}
}

console.log(`Server running on http://localhost:${port}`);