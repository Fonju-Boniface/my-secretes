import type { StructureResolver } from 'sanity/structure';

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.documentTypeListItem('home').title('Home Images'),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() && item.getId() !== 'home',
      ),
    ]);
