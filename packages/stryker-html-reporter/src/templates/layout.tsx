import * as typedHtml from 'typed-html';

export function layout(title: string, depth: number, content: string) {
    const urlPrefix = Array(depth + 1).join('../');
    return <html>
        <head>
            <title>{title} - Stryker report</title>
            <link rel="stylesheet" href={`${urlPrefix}bootstrap/css/bootstrap.min.css`}></link>
            <link rel="stylesheet" href={`${urlPrefix}bootstrap/css/bootstrap-theme.min.css`}></link>
            <link rel="stylesheet" href={`${urlPrefix}highlightjs/styles/default.css`}></link>
            <link rel="stylesheet" href={`${urlPrefix}stryker.css`}></link>
        </head>

        <body>
            <img class="stryker-image" alt="Stryker" src={`${urlPrefix}stryker-80x80.png`}></img>

            <div class="container-fluid">
                <div class="row">
                    <div class="col-md-12">
                        <h1>{title} - Stryker report</h1>
                    </div>
                </div>
                <div class="row">
                    {content}
                </div>
                <footer>
                    Generated with stryker-html-reporter generator. Visit the <a href="http://stryker-mutator.github.io" target="_blank">Stryker website</a></footer>
            </div>

            <script src={`${urlPrefix}stryker.js`} defer="defer"></script>
        </body>
    </html>;
}