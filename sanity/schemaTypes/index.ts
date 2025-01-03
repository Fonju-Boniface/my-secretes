import { type SchemaTypeDefinition } from 'sanity'
import { home } from './home'
import { pdfFile } from './pdfFile'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [ home, pdfFile],
}
