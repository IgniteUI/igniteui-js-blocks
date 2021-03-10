import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { findMatches, replaceMatch } from '../common/tsUtils';
import { UpdateChanges } from '../common/UpdateChanges';

const version = '11.1.0';

export default (): Rule => (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);

    const update = new UpdateChanges(__dirname, host, context);
    const tsFiles = update.tsFiles;
    const targetEnum = 'GridPagingMode';
    const changes = [
        { member: 'remote', replaceWith: 'Remote', definedIn: [targetEnum] },
        { member: 'local', replaceWith: 'Local', definedIn: [targetEnum] }
    ];
    update.applyChanges();
    for (const entryPath of tsFiles) {
        const ls = update.getDefaultLanguageService(entryPath);
        let content = host.read(entryPath).toString();
        for (const change of changes) {
            const matches = findMatches(content, change);
            for (const position of matches) {
                const definition = ls.getDefinitionAndBoundSpan(entryPath, position - 1)?.definitions[0];
                if (definition
                    && definition.kind === 'enum'
                    && definition.name === targetEnum
                    && definition.fileName.includes('igniteui-angular')) {
                    content = replaceMatch(content, change.member, change.replaceWith, position);
                    host.overwrite(entryPath, content);
                }
            }
        }
    }
};
