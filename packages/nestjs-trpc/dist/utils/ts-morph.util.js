export async function saveOrOverrideFile(sourceFile) {
    sourceFile.formatText({ indentSize: 2 });
    await sourceFile.save();
}
//# sourceMappingURL=ts-morph.util.js.map