import { type SchemaTypeDefinition } from 'sanity'
import { home } from './home'
import { fileAsset } from './fileAsset'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [ home, fileAsset],
}
