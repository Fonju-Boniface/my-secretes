import { defineField, defineType } from 'sanity';

export const fileAsset = defineType({
  name: 'fileAsset',
  title: 'File Asset',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'File Name',
      type: 'string',
      description: 'Name of the file',
    }),
    defineField({
      name: 'type',
      title: 'File Type',
      type: 'string',
      description: 'MIME type of the file',
    }),
    defineField({
      name: 'size',
      title: 'File Size',
      type: 'string',
      description: 'Size of the file',
    }),
    defineField({
      name: 'resolution',
      title: 'Resolution',
      type: 'string',
      description: 'Resolution (if applicable)',
    }),
    defineField({
      name: 'length',
      title: 'Duration',
      type: 'string',
      description: 'Length for audio/video files',
    }),
    defineField({
      name: 'preview',
      title: 'Preview URL',
      type: 'url',
      description: 'URL for the file preview (if available)',
    }),
    defineField({
      name: 'file',
      title: 'File Upload',
      type: 'file',
      description: 'Upload the actual file',
      options: {
        storeOriginalFilename: true,
      },
    }),
    defineField({
      name: 'uploadedAt',
      title: 'Uploaded At',
      type: 'datetime',
      description: 'Timestamp for when the file was uploaded',
      initialValue: () => new Date().toISOString(),
    }),
  ],
});
