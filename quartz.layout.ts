// quartz.layout.ts
import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/jackyzha0/quartz",
      "Discord Community": "https://discord.gg/cRFFHYye7t",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer({ title: "Giorni" }), // ⬅️ MODIFICA APPORTATA QUI
  ],
  // All'interno del tuo file quartz.layout.ts, nella sezione defaultContentPageLayout
  right: [
    Component.Graph({
      localGraph: false,
      // Parametri ottimizzati per visualizzare un Grafo Globale più grande:
      globalGraph: {
        scale: 0.5, // Zoom Out: mostra un'area più grande all'avvio
        repelForce: 1, // Aumenta la repulsione per distribuire meglio i nodi
        drag: true,
        zoom: true,
        depth: -1, // Profondità illimitata
        centerForce: 0.3,
        linkDistance: 30,
        fontSize: 0.6,
        opacityScale: 1,
        removeTags: [],
        showTags: true,
        enableRadial: true,
      }
    }),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer({ title: "Giorni" }), // ⬅️ MODIFICA APPORTATA QUI
  ],
  right: [],
}

// ⚠️ NOTA BENE: Ho rimosso l'istanza finale di Component.Graph(...)
// che avevi nel file originale, in quanto non faceva nulla (era fuori
// dalla definizione di un layout). Le sue impostazioni predefinite sono
// già incluse in Quartz. Se vuoi usare delle impostazioni globali specifiche,
// le devi includere qui sopra, all'interno di Component.Graph({ localGraph: false, globalGraph: { ... } })
