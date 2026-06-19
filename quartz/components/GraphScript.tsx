import { QuartzComponent, QuartzComponentConstructor } from "./types"
// @ts-ignore
import script from "./scripts/graph.inline"
import style from "./styles/graph.scss"

const globalGraphConfig = {
  drag: true,
  zoom: true,
  depth: -1,
  scale: 0.9,
  repelForce: 0.5,
  centerForce: 0.3,
  linkDistance: 30,
  fontSize: 0.6,
  opacityScale: 1,
  removeTags: [],
  removeSlugs: ["/"],
  showTags: true,
  focusOnHover: true,
  enableRadial: true,
}

const GraphScript: QuartzComponent = () => (
  <div class="global-graph-outer">
    <div class="global-graph-container" data-cfg={JSON.stringify(globalGraphConfig)}></div>
  </div>
)

GraphScript.css = style
GraphScript.afterDOMLoaded = script

export default (() => GraphScript) satisfies QuartzComponentConstructor
