// @ts-ignore
import clipboardScript from "./scripts/clipboard.inline"
import clipboardStyle from "./styles/clipboard.scss"
// @ts-ignore
import audioScript from "./scripts/audio.inline"
import audioStyle from "./styles/audio.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { concatenateResources } from "../util/resources"

const Body: QuartzComponent = ({ children }: QuartzComponentProps) => {
  return <div id="quartz-body">{children}</div>
}

Body.afterDOMLoaded = concatenateResources(clipboardScript, audioScript)
Body.css = concatenateResources(clipboardStyle, audioStyle)

export default (() => Body) satisfies QuartzComponentConstructor
