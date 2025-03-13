import { __decorate } from "tslib";
import { Injectable } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
/**
 * For this specific file, using a static reference is desirable since `getCallerFilePath` uses a stack-trace to figure out the caller.
 * If this class is injected through dependency injection, that stack-trace will vary!
 */
let FileScanner = class FileScanner {
    getCallerFilePath(skip = 2) {
        const originalPrepareStackTrace = Error.prepareStackTrace;
        Error.prepareStackTrace = (_, stack) => stack;
        const error = new Error();
        const stack = error.stack;
        Error.prepareStackTrace = originalPrepareStackTrace;
        const caller = stack[skip];
        const jsFilePath = caller?.getFileName();
        if (jsFilePath == null) {
            throw new Error(`Could not find caller file: ${caller}`);
        }
        try {
            // Attempt to find the source map file and extract the original TypeScript path
            const sourceMap = this.getSourceMapFromJSPath(jsFilePath);
            return this.normalizePath(path.resolve(jsFilePath, '..', sourceMap.sources[0]));
        }
        catch (error) {
            // Suppress the warning if in test environment
            if (process.env.NODE_ENV !== 'test') {
                console.warn(`Warning: Could not resolve source map for ${jsFilePath}. Falling back to default path resolution.`);
            }
            return this.normalizePath(jsFilePath);
        }
    }
    normalizePath(p) {
        return path.resolve(p.replace(/\\/g, '/'));
    }
    getPlatformPath(p) {
        const exec = /^\/(\w*):(.*)/.exec(p);
        return /^win/.test(process.platform) && exec
            ? `${exec[1]}:\\${exec[2].replace(/\//g, '\\')}`
            : p;
    }
    getSourceMapFromJSPath(sourcePath) {
        const SOURCE_MAP_REGEX = /\/\/# sourceMappingURL=(.*\.map)$/m;
        const filePath = this.getPlatformPath(sourcePath);
        let content;
        try {
            content = fs.readFileSync(filePath, { encoding: 'utf8' });
        }
        catch (error) {
            throw new Error(`Could not read source file at path: ${filePath}`);
        }
        const exec = SOURCE_MAP_REGEX.exec(content);
        if (exec == null) {
            throw new Error(`Could not find source map comment in file at path ${sourcePath}. Make sure "sourceMap" is enabled in your tsconfig.`);
        }
        const sourceMapPath = path.resolve(filePath, '..', exec[1]);
        let sourceMapContent;
        try {
            sourceMapContent = fs.readFileSync(sourceMapPath, { encoding: 'utf8' });
        }
        catch (error) {
            throw new Error(`Could not read source map file at path: ${sourceMapPath}`);
        }
        try {
            return JSON.parse(sourceMapContent);
        }
        catch (error) {
            throw new Error(`Failed to parse source map content from: ${sourceMapPath}`);
        }
    }
};
FileScanner = __decorate([
    Injectable()
], FileScanner);
export { FileScanner };
//# sourceMappingURL=file.scanner.js.map