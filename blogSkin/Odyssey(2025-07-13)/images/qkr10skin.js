function enableMarkdownCss() {

    // 1. #article-view div 의 첫번째 자식 노드인 .tt_article_useless_p_margin div 를 구해서, 그 노드에 shadow dom 을 만듭니다.
    // 2. 원하는 <link> 태그를 shadow dom 에 넣습니다.
    // 3. .markdown-body div 를 만들고, .tt_article_useless_p_margin div 의 내용을 .markdown-body div 에 전부 옮깁니다.
    // 4. .markdown-body div 를 shadow dom 에 넣습니다.

    const original = document.querySelector("div#article-view > div.tt_article_useless_p_margin");
    if (!original) {
        console.log("enableMarkdownCss() : 포스트가 아님");
        return;
    }
    if (original.shadowRoot) {
        console.log("enableMarkdownCss() : shadow dom 중복 실행 오류");
        return;
    }
    const shadow = original.attachShadow({ mode: "open" });
    const template = document.createElement("template");
    template.innerHTML = `
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.8.1/github-markdown.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
    `;
    shadow.appendChild(template.content.cloneNode(true));

    const markdown = document.createElement("div");
    markdown.className = "markdown-body";
    while (original.firstChild) {
        markdown.appendChild(original.firstChild);
    }
    shadow.appendChild(markdown);

    return shadow;
}

function enableMermaidDiagramRendering(shadowRoot) {
    mermaid.initialize({ startOnLoad: false });

    const elements = shadowRoot.querySelectorAll("code.language-mermaid");
    let idCounter = 0;

    elements.forEach((codeEl) => {
        const pre = codeEl.parentElement;
        const code = codeEl.textContent.trim();

        mermaid
            .render(`mermaid-${idCounter++}`, code)
            .then(({ svg }) => {
                // wrapper
                const wrapper = document.createElement("div");
                wrapper.classList.add("mermaid-wrapper");

                // SVG 컨테이너
                const svgContainer = document.createElement("div");
                svgContainer.innerHTML = svg;
                svgContainer.classList.add("mermaid-svg");

                // 코드 블록은 기본적으로 숨김
                codeEl.style.display = "none";

                // 토글 버튼
                const toggleButton = document.createElement("button");
                toggleButton.textContent = "💡 코드 보기";
                Object.assign(toggleButton.style, {
                    position: "relative",
                    top: "6px",
                    right: "6px",
                    padding: "4px 8px",
                    fontSize: "12px",
                    cursor: "pointer",
                    background: "rgba(0, 0, 0, 0.6)",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    zIndex: "1000",
                    display: "block",
                    float: "right",
                });

                let showingCode = false;
                toggleButton.addEventListener("click", () => {
                    showingCode = !showingCode;
                    if (showingCode) {
                        svgContainer.style.display = "none";
                        codeEl.style.display = "block";
                        toggleButton.textContent = "📊 다이어그램 보기";
                    } else {
                        codeEl.style.display = "none";
                        svgContainer.style.display = "block";
                        toggleButton.textContent = "💡 코드 보기";
                    }
                });

                // 구조: wrapper → toggleButton + svg + code
                wrapper.appendChild(toggleButton);
                wrapper.appendChild(svgContainer);
                wrapper.appendChild(codeEl);

                pre.replaceWith(wrapper);
            })
            .catch((err) => console.error("Mermaid render error:", err));
    });
}

function assignEncodedHeadingIds(shadowRoot) {
    const headings = shadowRoot.querySelectorAll('h1, h2, h3, h4, h5, h6');

    headings.forEach(heading => {
        const text = heading.textContent.trim();
        if (!text) return;

        const encodedId = encodeURIComponent(text);

        let uniqueId = encodedId;
        let counter = 1;
        while (shadowRoot.getElementById(uniqueId)) {
            uniqueId = `${encodedId}-${counter++}`;
        }

        heading.id = uniqueId;
    });
}

function enableSyntaxHighlighting(shadowRoot) {
    const codeElements = shadowRoot.querySelectorAll('code[class*="language-"]');

    codeElements.forEach(codeElement => {
        hljs.highlightElement(codeElement);
    });
}

// 3번 포스트를 들어갈 수 없게 처리함.
function deletePostButton() {
    document.querySelectorAll('article').forEach(article => {
        if (article.querySelector('a[href="/3"]')) {
            article.remove();
        }
    });
}

function observeHashChangeAndScroll(shadowRoot) {
    function scrollToHashTarget() {
        const hash = window.location.hash;
        if (!hash || !hash.startsWith('#')) return;

        // 괄호가 인코딩 된 경우가 있는데, encodeURIComponent() 와 encodeURI() 는 괄호를 인코딩하므로, 일관성을 맞추기 위해 한번 decode 했다가 encode 한다. 
        const targetId = encodeURIComponent(decodeURIComponent(hash.substring(1)));
        const target = shadowRoot.getElementById(targetId);

        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    scrollToHashTarget();
    window.addEventListener('hashchange', scrollToHashTarget);
}

(function ($) {
    $(document).ready(function () {
        const shadowRoot = enableMarkdownCss();
        if (shadowRoot) {
            enableMermaidDiagramRendering(shadowRoot);
            assignEncodedHeadingIds(shadowRoot);
            enableSyntaxHighlighting(shadowRoot);
            observeHashChangeAndScroll(shadowRoot);
        }

        deletePostButton();
    })
})(tjQuery);