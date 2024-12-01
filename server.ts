import { serve } from 'https://deno.land/std/http/server.ts'
import { serveDir } from 'https://deno.land/std/http/file_server.ts'

serve((req) => {
  return serveDir(req, {
    fsRoot: '.',
    urlRoot: '',
    showDirListing: true,
    enableCors: true
  })
})
