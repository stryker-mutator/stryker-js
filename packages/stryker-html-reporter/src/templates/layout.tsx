import * as typedHtml from 'typed-html';
import Breadcrumb from '../Breadcrumb';
import { RESOURCES_DIR_NAME } from '../HtmlReporter';

function printBreadcrumbLinks(breadcrumb: Breadcrumb | undefined, pageDepth: number): string {
    if (breadcrumb) {
        // First, print previous items
        const previousItems = printBreadcrumbLinks(breadcrumb.previousItem, pageDepth);
        return previousItems +
            <li class="breadcrumb-item"><a href={new Array(pageDepth - breadcrumb.depth + 1).join('../') + 'index.html'}>{breadcrumb.title}</a></li>;
    } else {
        return '';
    }
}

function printBreadcrumb(breadcrumb: Breadcrumb) {
    return <ol class="breadcrumb">
        {printBreadcrumbLinks(breadcrumb.previousItem, breadcrumb.depth)}
        <li class="breadcrumb-item active">{breadcrumb.title}</li>
    </ol>;
}

export function layout(breadcrumb: Breadcrumb, content: string) {
    const urlPrefix = Array(breadcrumb.depth + 1).join('../') + RESOURCES_DIR_NAME + '/';
    return '<!DOCTYPE html>\n' + <html>
        <head>
            <title>{breadcrumb.title} - Stryker report</title>
            <meta charset="utf-8"></meta>
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"></meta>
            <link rel="stylesheet" href={`${urlPrefix}bootstrap/css/bootstrap.min.css`}></link>
            <link rel="stylesheet" href={`${urlPrefix}highlightjs/styles/default.css`}></link>
            <link rel="stylesheet" href={`${urlPrefix}stryker.css`}></link>
        </head>

        <body>
            <img class="stryker-image" alt="Stryker" src={`${urlPrefix}stryker-80x80.png`}></img>

            <div class="container-fluid">
                <div class="row">
                    <div class="col-lg-12">
                        <h1 class="display-4">{breadcrumb.title} <small class="text-muted">- Stryker report</small></h1>
                    </div>
                </div>
                {printBreadcrumb(breadcrumb)}
                <div class="row">
                    {content}
                </div>
                <footer>
                    Generated with stryker-html-reporter generator. Visit the <a href="https://stryker-mutator.io" target="_blank">Stryker website</a></footer>
            </div>

            <script src={`${urlPrefix}popper.js/dist/umd/popper.min.js`} defer="defer"></script>
            <script src={`${urlPrefix}jquery/dist/jquery.slim.min.js`} defer="defer"></script>
            <script src={`${urlPrefix}bootstrap/js/bootstrap.min.js`} defer="defer"></script>
            <script src={`${urlPrefix}stryker.js`} defer="defer"></script>
        </body>
    </html>;
}