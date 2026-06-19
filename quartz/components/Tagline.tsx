import { QuartzComponent, QuartzComponentConstructor } from "./types"

const Tagline: QuartzComponent = () => {
  return (
    <p class="sidebar-tagline">
      <em>Trame</em> è un piccolo diario per testo, suoni e immagini del processo temporaneo Antonio Vigilante.
    </p>
  )
}

export default (() => Tagline) satisfies QuartzComponentConstructor
