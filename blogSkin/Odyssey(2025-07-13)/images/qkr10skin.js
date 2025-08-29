function enableMarkdownCss() {

    // 1. #article-view div 의 첫번째 자식 노드인 .tt_article_useless_p_margin div 를 구해서, 그 노드에 shadow dom 을 만듭니다.
    // 2. 원하는 <link> 태그를 shadow dom 에 넣습니다.
    // 3. .markdown-body div 를 만들고, .tt_article_useless_p_margin div 의 내용을 .markdown-body div 에 전부 옮깁니다.
    // 4. .markdown-body div 를 shadow dom 에 넣습니다.

    const original = document.querySelector("div#article-view > div.tt_article_useless_p_margin");
    if (!original) {
        console.log("enableMarkdownCss() : 선택자 오류");
        return;
    }
    if (original.shadowRoot) {
        console.log("enableMarkdownCss() : shadow dom 중복 실행 오류");
        return;
    }
    const shadow = original.attachShadow({ mode: "open" });

    const html = `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.8.1/github-markdown.min.css" integrity="sha512-BrOPA520KmDMqieeM7XFe6a3u3Sb3F1JBaQnrIAmWg3EYrciJ+Qqe6ZcKCdfPv26rGcgTrJnZ/IdQEct8h3Zhw==" crossorigin="anonymous" referrerpolicy="no-referrer" />`;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    shadow.appendChild(doc.head.firstChild);

    const markdown = document.createElement("div");
    markdown.className = "markdown-body";
    while (original.firstChild) {
        markdown.appendChild(original.firstChild);
    }
    shadow.appendChild(markdown);
}

function enableMermaidCodeToDiagram() {
    const elements = $('code.language-mermaid');

    elements.parent('pre').css('text-align', 'center');
    elements.contents().unwrap().wrap('<div class="mermaid"></div>');
}

(function ($) {
    $(document).ready(function () {
        enableMarkdownCss();
    })
})(tjQuery);