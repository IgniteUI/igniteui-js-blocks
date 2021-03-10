import { workspaces } from '@angular-devkit/core';
import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { Options } from '../interfaces/options';
import { installPackageJsonDependencies } from '../utils/package-handler';
import {
  logSuccess, addDependencies, getConfigFile
} from '../utils/dependency-handler';
import { addResetCss } from './add-normalize';
import { createHost } from '../utils/util';

const enableIESupport = (tree: Tree, context: SchematicContext) => {
  const targetFile = '/.browserslistrc';
  let updateFile = false;
  let content = (tree.read(targetFile)?.toString());
  while (content?.includes('not IE')) {
    content = content.replace('not IE', 'IE');
    updateFile = true;
  }
  if (updateFile) {
    tree.overwrite(targetFile, content);
  } else {
    context.logger.warn(`Either IE support is already enabled OR you may need to update ${targetFile} file manually.`);
  }
};

// Only required if AnimationBuilder is used (igniteui-angular does) & using IE/Edge or Safari
const updatePolyfillsForIESupport = (tree: Tree, targetFile: string, polyfillsData: any): void => {
  // Target the web-animations-js commented import statement and uncomment it.
  const webAnimationsLine = '// import \'web-animations-js\';';
  const classlistLine = '// import \'classlist.js\';';
  polyfillsData = polyfillsData.replace(webAnimationsLine,
    webAnimationsLine.substring(3, webAnimationsLine.length));

  polyfillsData = polyfillsData.replace(classlistLine,
    classlistLine.substring(3, classlistLine.length));

  tree.overwrite(targetFile, polyfillsData);
};

const readInput = (options: Options): Rule =>
  async (tree: Tree, context: SchematicContext) => {
    const workspaceHost = createHost(tree);
    const { workspace } = await workspaces.readWorkspace(tree.root.path, workspaceHost);
    if (options.polyfills) {
      const project = workspace.projects.get(workspace.extensions['defaultProject'] as string);
      const polyfillsFilePath = getConfigFile(project, 'polyfills', context);
      const browserslistrcFile = (tree.read('/.browserslistrc'));
      const animationsWarn = 'You may want to manually uncomment \'// import \'web-animations-js\' in polyfills.ts';
      // .browserslistrc --> If project targets angular cli version >= 10.0
      if (browserslistrcFile) {
        enableIESupport(tree, context);
      } else {
        context.logger.warn('.browserslistrc file not found. You may want to manually add it and enable IE support.');
      }
      if (polyfillsFilePath) {
        const polyfillsData = tree.read(polyfillsFilePath)?.toString();
        if (polyfillsData) {
          updatePolyfillsForIESupport(tree, polyfillsFilePath, polyfillsData);
        } else {
          context.logger.warn('polyfills.ts file not found OR empty. ' + animationsWarn);
        }
      } else {
        context.logger.warn('polyfills.ts file path not found. ' + animationsWarn);
      }
    }
  };

const addNormalize = (options: Options): Rule =>
  async (tree: Tree, context: SchematicContext) => {
    if (options.resetCss) {
    const workspaceHost = createHost(tree);
      const { workspace } = await workspaces.readWorkspace(tree.root.path, createHost(tree));
      const result = addResetCss(workspace, tree);
      await workspaces.writeWorkspace(workspace, workspaceHost);
      if (!result) {
        context.logger.warn(`Could not complete adding reset styles. Those may need to be added manually.`);
      }
    }
  };

export default (options: Options): Rule => chain([
  readInput(options),
  addNormalize(options),
  addDependencies(options),
  installPackageJsonDependencies(options),
  logSuccess(options)
]);
