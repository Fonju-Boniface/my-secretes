
  import {defineType} from 'sanity';

export const pdfFile = defineType({
  name: 'pdfFile',
  title: 'PDF File',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Provide a title for the PDF file.',
    },
    {
      name: 'file',
      title: 'File',
      type: 'file',
      description: 'Upload the PDF file.',
      options: {
        accept: '.pdf', // Restricts the file input to only accept PDFs
      },
    },
  ],
});

