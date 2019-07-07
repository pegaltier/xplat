import { Tree } from '@angular-devkit/schematics';
import { getFileContent } from '@schematics/angular/utility/test';
import { Schema as GenerateOptions } from './schema';
import { createXplatWithApps } from '@nstudio/workspace/testing';
import { runSchematic } from '../../utils/testing';

describe('directive schematic', () => {
  let appTree: Tree;
  const defaultOptions: GenerateOptions = {
    name: 'active-link'
  };


  beforeEach(() => {
    appTree = Tree.empty();
    appTree = createXplatWithApps(appTree);
  });

  it('should create directive in libs by default for use across any platform and apps', async () => {
    // console.log('appTree:', appTree);
    let tree = await runSchematic(
      'xplat',
      {
        prefix: 'tt',
        platforms: 'nativescript,web'
      },
      appTree
    );
    tree = await runSchematic(
      'app.nativescript',
      {
        name: 'viewer',
        prefix: 'tt'
      },
      tree
    );
    tree = await runSchematic(
      'feature',
      {
        name: 'foo',
        platforms: 'nativescript,web'
      },
      tree
    );
    let options: GenerateOptions = { ...defaultOptions };

    // Directives without the feature option are added to the ui-feature
    tree = await runSchematic('directive', options, tree);
    let files = tree.files;
    // console.log(files.slice(91,files.length));

    // component
    expect(
      files.indexOf('/libs/features/ui/directives/active-link.directive.ts')
    ).toBeGreaterThanOrEqual(0);

    // file content
    let content = getFileContent(
      tree,
      '/libs/features/ui/directives/active-link.directive.ts'
    );
    // console.log(content);
    expect(content.indexOf(`@Directive({`)).toBeGreaterThanOrEqual(0);
    expect(content.indexOf(`selector: '[active-link]'`)).toBeGreaterThanOrEqual(
      0
    );

    let modulePath = '/libs/features/ui/ui.module.ts';
    let moduleContent = getFileContent(tree, modulePath);

    // console.log(modulePath + ':');
    // console.log(moduleContent);
    expect(moduleContent.indexOf(`...UI_DIRECTIVES`)).toBeGreaterThanOrEqual(0);

    // Directives added to the foo-feature
    options = { ...defaultOptions, feature: 'foo' };
    tree = await runSchematic('directive', options, tree);
    files = tree.files;
    // console.log(files.slice(91,files.length));

    // component
    expect(
      files.indexOf('/libs/features/foo/directives/active-link.directive.ts')
    ).toBeGreaterThanOrEqual(0);

    // file content
    content = getFileContent(
      tree,
      '/libs/features/foo/directives/active-link.directive.ts'
    );
    // console.log(content);
    expect(content.indexOf(`@Directive({`)).toBeGreaterThanOrEqual(0);
    expect(content.indexOf(`selector: '[active-link]'`)).toBeGreaterThanOrEqual(
      0
    );

    modulePath = '/libs/features/foo/foo.module.ts';
    moduleContent = getFileContent(tree, modulePath);

    // console.log(modulePath + ':');
    // console.log(moduleContent);
    expect(moduleContent.indexOf(`...FOO_DIRECTIVES`)).toBeGreaterThanOrEqual(
      0
    );
  });

  it('should create directive for specified projects only', async () => {
    // console.log('appTree:', appTree);
    let tree = await runSchematic(
      'xplat',
      {
        prefix: 'tt',
        platforms: 'nativescript,web'
      },
      appTree
    );
    tree = await runSchematic(
      'app.nativescript',
      {
        name: 'viewer',
        prefix: 'tt'
      },
      tree
    );
    tree = await runSchematic(
      'feature',
      {
        name: 'foo',
        projects: 'nativescript-viewer,web-viewer,ionic-viewer',
        onlyProject: true
      },
      tree
    );
    const options: GenerateOptions = {
      name: 'active-link',
      feature: 'foo',
      projects: 'nativescript-viewer,web-viewer,ionic-viewer'
    };
    tree = await runSchematic('directive', options, tree);
    const files = tree.files;
    // console.log(files. slice(91,files.length));

    // directive should not be setup to share
    expect(
      files.indexOf('/libs/features/ui/directives/active-link.directive.ts')
    ).toBe(-1);
    expect(
      files.indexOf(
        '/xplat/nativescript/features/foo/directives/active-link.directive.ts'
      )
    ).toBe(-1);
    expect(
      files.indexOf(
        '/xplat/web/features/foo/directives/active-link.directive.ts'
      )
    ).toBe(-1);

    // directive should be project specific
    expect(
      files.indexOf(
        '/apps/nativescript-viewer/app/features/foo/directives/active-link.directive.ts'
      )
    ).toBeGreaterThanOrEqual(0);
    expect(
      files.indexOf(
        '/apps/web-viewer/src/app/features/foo/directives/active-link.directive.ts'
      )
    ).toBeGreaterThanOrEqual(0);
    expect(
      files.indexOf(
        '/apps/ionic-viewer/src/app/features/foo/directives/active-link.directive.ts'
      )
    ).toBeGreaterThanOrEqual(0);

    // file content
    let indexPath =
      '/apps/nativescript-viewer/app/features/foo/directives/index.ts';
    let index = getFileContent(tree, indexPath);
    // console.log(barrelPath + ':');
    // console.log(barrelIndex);
    // symbol should be at end of collection
    expect(index.indexOf(`ActiveLinkDirective`)).toBeGreaterThanOrEqual(0);

    indexPath = '/apps/web-viewer/src/app/features/foo/directives/index.ts';
    index = getFileContent(tree, indexPath);
    // console.log(barrelPath + ':');
    // console.log(barrelIndex);
    expect(index.indexOf(`ActiveLinkDirective`)).toBeGreaterThanOrEqual(0);

    indexPath = '/apps/ionic-viewer/src/app/features/foo/directives/index.ts';
    index = getFileContent(tree, indexPath);
    // console.log(barrelPath + ':');
    // console.log(barrelIndex);
    expect(index.indexOf(`ActiveLinkDirective`)).toBeGreaterThanOrEqual(0);
  });
});
