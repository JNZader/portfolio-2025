import { defineConfig } from 'sanity';
import type { StructureBuilder, ListItemBuilder } from 'sanity/structure';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { codeInput } from '@sanity/code-input';
import { markdownSchema } from 'sanity-plugin-markdown';
import { schemaTypes } from './schemas';
import { apiVersion, requireSanityEnv } from './env';

// El Studio EXIGE la config de Sanity: falla en arranque con mensaje claro.
const { dataset, projectId } = requireSanityEnv();

export default defineConfig({
    name: 'default',
    title: 'Portfolio 2025',

    projectId,
    dataset,

    basePath: '/studio',

    plugins: [
        structureTool({
            structure: (S: StructureBuilder) =>
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
                            (item: ListItemBuilder) =>
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