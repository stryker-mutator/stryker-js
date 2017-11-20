import * as path from "path"
import {Rule} from "webpack";

export const typescriptLoader: any = {
    test: /\.ts$/,
    loaders: [
        {
            loader: 'awesome-typescript-loader',
            options: { 
                configFileName: path.join('stryker', 'config', 'tsconfig.json') 
            }
        }, 'angular2-template-loader'
    ]
};

export const htmlLoader: Rule = {
    test: /\.html$/,
    loader: 'html-loader'
};

export const imageLoader: Rule = {
    test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
    loader: 'file-loader?name=assets/[name].[hash].[ext]'
};

const ExtractTextPlugin = require('extract-text-webpack-plugin');
export const cssStyleLoader: Rule = {
    test: /\.css$/,
    exclude: path.join('src', 'app'),
    loader: ExtractTextPlugin.extract({ fallbackLoader: 'style-loader', loader: 'css-loader?sourceMap' })
};

export const cssRawLoader: Rule = {
    test: /\.css$/,
    include: path.join('src', 'app'),
    loader: 'raw-loader'
};