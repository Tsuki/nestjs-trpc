import { __decorate } from "tslib";
import { Module } from '@nestjs/common';
import { FileScanner } from './file.scanner';
import { ImportsScanner } from './imports.scanner';
let ScannerModule = class ScannerModule {
};
ScannerModule = __decorate([
    Module({
        imports: [],
        providers: [FileScanner, ImportsScanner],
        exports: [FileScanner, ImportsScanner],
    })
], ScannerModule);
export { ScannerModule };
//# sourceMappingURL=scanner.module.js.map