import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"
import { FullSlug } from "../../util/path"

export const CloudflareHeaders: QuartzEmitterPlugin = () => ({
  name: "CloudflareHeaders",
  async emit(ctx) {
    const content = [
      "/audio/*",
      "  Accept-Ranges: bytes",
      "  Cache-Control: public, max-age=31536000, immutable",
      "",
    ].join("\n")

    const path = await write({
      ctx,
      content,
      slug: "_headers" as FullSlug,
      ext: "",
    })
    return [path]
  },
  async *partialEmit() {},
})
