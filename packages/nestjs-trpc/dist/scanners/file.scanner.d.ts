/**
 * For this specific file, using a static reference is desirable since `getCallerFilePath` uses a stack-trace to figure out the caller.
 * If this class is injected through dependency injection, that stack-trace will vary!
 */
export declare class FileScanner {
    getCallerFilePath(skip?: number): string;
    private normalizePath;
    private getPlatformPath;
    private getSourceMapFromJSPath;
}
//# sourceMappingURL=file.scanner.d.ts.map