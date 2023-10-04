import {empty} from '#sugar';

export default {
  contentDependencies: ['image', 'linkArtTagGallery'],
  extraDependencies: ['html', 'language'],

  relations(relation, artTags) {
    const relations = {};

    relations.image =
      relation('image', artTags);

    if (artTags) {
      relations.artTagLinks =
        artTags
          .filter(artTag => !artTag.isContentWarning)
          .map(artTag => relation('linkArtTagGallery', artTag));
    } else {
      relations.artTagLinks = null;
    }

    return relations;
  },

  slots: {
    path: {
      validate: v => v.validateArrayItems(v.isString),
    },

    alt: {
      type: 'string',
    },

    mode: {
      validate: v => v.is('primary', 'thumbnail'),
      default: 'primary',
    },
  },

  generate(relations, slots, {html, language}) {
    switch (slots.mode) {
      case 'primary':
        return html.tag('div', {id: 'cover-art-container'}, [
          relations.image
            .slots({
              path: slots.path,
              alt: slots.alt,
              thumb: 'medium',
              id: 'cover-art',
              reveal: true,
              link: true,
              square: true,
            }),

          !empty(relations.artTagLinks) &&
            html.tag('p',
              language.$('releaseInfo.artTags.inline', {
                tags:
                  language.formatUnitList(
                    relations.artTagLinks
                      .map(tagLink => tagLink.slot('preferShortName', true))),
              })),
          ]);

      case 'thumbnail':
        return relations.image
          .slots({
            path: slots.path,
            alt: slots.alt,
            thumb: 'small',
            reveal: false,
            link: false,
            square: true,
          });

      default:
        return html.blank();
    }
  },
};
