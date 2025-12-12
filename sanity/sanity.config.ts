import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { codeInput } from '@sanity/code-input';
import { markdownSchema } from 'sanity-plugin-markdown';
import { schemaTypes } from './schemas';
import { apiVersion, dataset, projectId } from './env';

export default defineConfig({
    name: 'default',
    title: 'Portfolio 2025',

    projectId,
    dataset,

    basePath: '/studio',

    plugins: [
        structureTool({
            structure: (S) =>
                S.list()
                    .title('Content')
                    .items([
                        // Blog
                        S.listItem()
                            .title('Blog')
                            .child(
                                S.list()
                                    .title('Blog')
                                    .items([
                                        S.documentTypeListItem('post').title('Posts'),
                                        S.documentTypeListItem('category').title('Categories'),
                                    ])
                            ),
                        // Projects
                        S.listItem()
                            .title('Projects')
                            .child(S.documentTypeList('project').title('Projects')),
                        // Divider
                        S.divider(),
                        // Resto de documentos
                        ...S.documentTypeListItems().filter(
                            (item) =>
                                !['post', 'category', 'project'].includes(
                                    item.getId() as string
                                )
                        ),
                    ]),
        }),
        visionTool({ defaultApiVersion: apiVersion }),
        codeInput(),
        markdownSchema(),
    ],

    schema: {
        types: schemaTypes,
    },
});