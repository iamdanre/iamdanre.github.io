import { h } from "preact";
import { tw } from "@twind";

export default function NotFoundPage() {
  return (
    <div class={tw`flex flex-col items-center justify-center h-screen`}>
      <h1 class={tw`text-4xl font-bold mb-4`}>404 - Page Not Found</h1>
      <p class={tw`mb-4`}>Sorry, the page you are looking for does not exist.</p>
      <a href="/" class={tw`text-blue-500 hover:underline`}>
        Go back to the home page
      </a>
    </div>
  );
}
