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
      odnikud: "https://antoniovigilante.pages.dev",
     },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs({ showCurrentPage: false }),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.ArticleTitle(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.ContentMeta(),
      condition: (page) => page.fileData.slug !== "index",
    }),
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
    Component.Explorer({
      title: "Anni, mesi, giorni",
      folderDefaultState: "collapsed",
      folderClickBehavior: "expand",
      useSavedState: false,
      sortFn: (a, b) => {
        if ((!a.isFolder && !b.isFolder) || (a.isFolder && b.isFolder)) {
          // Month folders: MM-YYYY format → sort by date descending
          const monthYear = /^(\d{2})-(\d{4})$/
          const aM = a.slugSegment.match(monthYear)
          const bM = b.slugSegment.match(monthYear)
          if (aM && bM) {
            const aDate = parseInt(aM[2]) * 100 + parseInt(aM[1])
            const bDate = parseInt(bM[2]) * 100 + parseInt(bM[1])
            return bDate - aDate
          }
          // Year folders: YYYY format → sort descending
          const year = /^\d{4}$/
          if (a.slugSegment.match(year) && b.slugSegment.match(year)) {
            return parseInt(b.slugSegment) - parseInt(a.slugSegment)
          }
          // Default: alphabetical
          return a.displayName.localeCompare(b.displayName, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        }
        return !a.isFolder && b.isFolder ? 1 : -1
      },
    }),
  ],
  right: [
    Component.Tagline(),
    Component.Graph({
      localGraph: {
        drag: true,
        zoom: true,
        depth: 1,
        scale: 1.1,
        repelForce: 0.5,
        centerForce: 0.3,
        linkDistance: 30,
        fontSize: 0.6,
        opacityScale: 1,
        removeTags: [],
        showTags: true,
        enableRadial: false,
      },
      globalGraph: {
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
      },
    }),
    Component.ConditionalRender({
      component: Component.DesktopOnly(Component.TableOfContents()),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.Backlinks(),
      condition: (page) => page.fileData.slug !== "index",
    }),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs({ showCurrentPage: false }), Component.ArticleTitle(), Component.ContentMeta()],
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
    Component.Explorer({
      title: "Anni, mesi, giorni",
      folderDefaultState: "collapsed",
      folderClickBehavior: "expand",
      useSavedState: false,
      sortFn: (a, b) => {
        if ((!a.isFolder && !b.isFolder) || (a.isFolder && b.isFolder)) {
          const monthYear = /^(\d{2})-(\d{4})$/
          const aM = a.slugSegment.match(monthYear)
          const bM = b.slugSegment.match(monthYear)
          if (aM && bM) {
            const aDate = parseInt(aM[2]) * 100 + parseInt(aM[1])
            const bDate = parseInt(bM[2]) * 100 + parseInt(bM[1])
            return bDate - aDate
          }
          const year = /^\d{4}$/
          if (a.slugSegment.match(year) && b.slugSegment.match(year)) {
            return parseInt(b.slugSegment) - parseInt(a.slugSegment)
          }
          return a.displayName.localeCompare(b.displayName, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        }
        return !a.isFolder && b.isFolder ? 1 : -1
      },
    }),
  ],
  right: [],
}


