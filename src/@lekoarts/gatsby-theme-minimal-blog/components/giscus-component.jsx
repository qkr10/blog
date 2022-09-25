import React, { useEffect } from 'react'

const Giscus = () => {
  const rootElm = React.createRef()

  useEffect(() => {
    const giscus = document.createElement('script')
    const giscusConfig = {
        'src': "https://giscus.app/client.js",
        'data-repo': "qkr10/blog",
        'data-repo-id': "R_kgDOH-6GBA",
        'data-category': "Announcements",
        'data-category-id': "DIC_kwDOH-6GBM4CRnwx",
        'data-mapping': "pathname",
        'data-strict': "0",
        'data-reactions-enabled': "1",
        'data-emit-metadata': "0",
        'data-input-position': "bottom",
        'data-theme': "preferred_color_scheme",
        'data-lang': "ko",
        'data-loading': "lazy",
        'crossorigin': "anonymous",
        'async': true
    }

    Object.keys(giscusConfig).forEach(configKey => {
      giscus.setAttribute(configKey, giscusConfig[configKey])
    })
    rootElm.current.appendChild(giscus)
  }, [])

  return <div className="giscus" ref={rootElm} />
}

export default Giscus