import * as path from "path"
import {Rule} from "webpack";

export const typescriptLoader = (root: string): any => {
    return {
        test: /\.ts$/,
        loaders: [
            {
                loader: 'awesome-typescript-loader',
                options: { 
                    configFileName: path.join(root, 'tsconfig.json') 
                }
            }, 'angular2-template-loader'
        ]
    };
};

export const htmlLoader = (root: string): Rule => {
    return {
        test: /\.html$/,
        loader: 'html-loader'
    };
};

export const imageLoader = (root: string): Rule => {
    return {
        test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
        loader: 'null-loader'
    };
};

export const cssStyleLoader = (root: string): Rule => {
    return {
        test: /\.css$/,
        exclude: path.join(root, 'src', 'app'),
        loader: 'null-loader'
    };
};

export const cssRawLoader = (root: string): Rule => {
    return {
        test: /\.css$/,
        include: path.join(root, 'src', 'app'),
        loader: 'raw-loader'
    };
};

