import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { version } from "../../package.json"
import { i18n } from "../i18n"

interface Options {
  links: Record<string, string>
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
    const year = new Date().getFullYear()
    const links = opts?.links ?? []
    return (
      <footer class={`${displayClass ?? ""}`}>
        <p>
          {i18n(cfg.locale).components.footer.createdWith}{" "}
          <a href="https://quartz.jzhao.xyz/">Quartz v{version}</a> © {year}
        </p>
        <ul>
          {Object.entries(links).map(([text, link]) => (
            <li>
              <a href={link}>{text}</a>
            </li>
          ))}
        </ul>
        <div class="license">
          <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/" rel="license" target="_blank">
            <img src="https://licensebuttons.net/l/by-nc-nd/4.0/88x31.png" alt="Licenza Creative Commons BY-NC-ND 4.0" />
          </a>
          <p>
            I contenuti di questo sito sono pubblicati sotto licenza{" "}
            <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/" rel="license" target="_blank">
              Creative Commons Attribuzione – Non commerciale – Non opere derivate 4.0 Internazionale
            </a>.
          </p>
        </div>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
