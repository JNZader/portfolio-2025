import { defineField, defineType } from 'sanity';
import { DocumentTextIcon } from '@sanity/icons';

/**
 * Resume/CV singleton document type
 * Stores all CV data that was previously in lib/data/resume.json
 */
export default defineType({
  name: 'resume',
  title: 'Resume / CV',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    // --- Personal Info ---
    defineField({
      name: 'personalInfo',
      title: 'Personal Information',
      type: 'object',
      fields: [
        defineField({
          name: 'name',
          title: 'Full Name',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'title',
          title: 'Professional Title',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'email_encoded',
          title: 'Email (Base64 encoded)',
          type: 'string',
          description:
            'Base64-encoded email to prevent scraping. Use btoa("your@email.com") in browser console.',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'phone',
          title: 'Phone',
          type: 'string',
        }),
        defineField({
          name: 'location',
          title: 'Location',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'website',
          title: 'Website URL',
          type: 'url',
        }),
        defineField({
          name: 'linkedin',
          title: 'LinkedIn URL',
          type: 'url',
        }),
        defineField({
          name: 'github',
          title: 'GitHub URL',
          type: 'url',
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),

    // --- Summary ---
    defineField({
      name: 'summary',
      title: 'Professional Summary',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),

    // --- Experience ---
    defineField({
      name: 'experience',
      title: 'Professional Experience',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'company',
              title: 'Company',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'position',
              title: 'Position',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'location',
              title: 'Location',
              type: 'string',
            }),
            defineField({
              name: 'startDate',
              title: 'Start Date',
              type: 'string',
              description: 'e.g., "2024" or "2024-01"',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'endDate',
              title: 'End Date',
              type: 'string',
              description: 'e.g., "2025" or "Presente"',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'highlights',
              title: 'Highlights',
              type: 'array',
              of: [{ type: 'string' }],
            }),
          ],
          preview: {
            select: {
              title: 'position',
              subtitle: 'company',
            },
          },
        },
      ],
    }),

    // --- Projects ---
    defineField({
      name: 'projects',
      title: 'Featured Projects',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Project Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 2,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'highlights',
              title: 'Highlights',
              type: 'array',
              of: [{ type: 'string' }],
            }),
          ],
          preview: {
            select: {
              title: 'name',
              subtitle: 'description',
            },
          },
        },
      ],
    }),

    // --- Education ---
    defineField({
      name: 'education',
      title: 'Education & Certifications',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'institution',
              title: 'Institution',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'degree',
              title: 'Degree / Certificate',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'location',
              title: 'Location',
              type: 'string',
            }),
            defineField({
              name: 'startDate',
              title: 'Start Date',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'endDate',
              title: 'End Date',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'details',
              title: 'Details',
              type: 'array',
              of: [{ type: 'string' }],
            }),
          ],
          preview: {
            select: {
              title: 'degree',
              subtitle: 'institution',
            },
          },
        },
      ],
    }),

    // --- Skills (array of category + items) ---
    defineField({
      name: 'skills',
      title: 'Technical Skills',
      description:
        'Each entry is a category (e.g., "Lenguajes") with a list of skills.',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'category',
              title: 'Category',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'items',
              title: 'Skills',
              type: 'array',
              of: [{ type: 'string' }],
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'category',
              items: 'items',
            },
            prepare({ title, items }) {
              return {
                title: title ?? 'Untitled category',
                subtitle: Array.isArray(items)
                  ? items.join(', ')
                  : '',
              };
            },
          },
        },
      ],
    }),

    // --- Soft Skills ---
    defineField({
      name: 'softSkills',
      title: 'Soft Skills',
      type: 'array',
      of: [{ type: 'string' }],
    }),

    // --- Languages ---
    defineField({
      name: 'languages',
      title: 'Languages',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Language',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'level',
              title: 'Level',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'name',
              subtitle: 'level',
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'personalInfo.name',
      subtitle: 'personalInfo.title',
    },
  },
});
