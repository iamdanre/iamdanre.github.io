import { PageProps } from "$fresh/server.ts";

export default function Home(props: PageProps) {
	return (
		<div>
			<h1>Welcome to Fresh</h1>
			<p>Your new Fresh site is ready to go!</p>
		</div>
	);
}