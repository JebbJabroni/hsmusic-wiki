import {input} from '#composite';
import find from '#find';
import {unique} from '#sugar';
import {isName} from '#validators';
import {sortAlbumsTracksChronologically} from '#wiki-data';

import {exitWithoutDependency, exposeDependency, exposeUpdateValueOrContinue}
  from '#composite/control-flow';

import {
  color,
  directory,
  flag,
  referenceList,
  reverseReferenceList,
  simpleString,
  name,
  urls,
  wikiData,
} from '#composite/wiki-properties';

import {withAllDescendantArtTags} from '#composite/things/art-tag';

import Thing from './thing.js';

export class ArtTag extends Thing {
  static [Thing.referenceType] = 'tag';

  static [Thing.getPropertyDescriptors] = ({Album, Track}) => ({
    // Update & expose

    name: name('Unnamed Art Tag'),
    directory: directory(),
    color: color(),
    isContentWarning: flag(false),
    extraReadingURLs: urls(),

    nameShort: [
      exposeUpdateValueOrContinue({
        validate: input.value(isName),
      }),

      {
        dependencies: ['name'],
        compute: ({name}) =>
          name.replace(/ \([^)]*?\)$/, ''),
      },
    ],

    description: simpleString(),

    directDescendantArtTags: referenceList({
      class: input.value(ArtTag),
      find: input.value(find.artTag),
      data: 'artTagData',
    }),

    // Update only

    albumData: wikiData(Album),
    artTagData: wikiData(ArtTag),
    trackData: wikiData(Track),

    // Expose only

    descriptionShort: [
      exitWithoutDependency({
        dependency: 'description',
        mode: input.value('falsy'),
      }),

      {
        dependencies: ['description'],
        compute: ({description}) =>
          description.split('<hr class="split">')[0],
      },
    ],

    directlyTaggedInThings: {
      flags: {expose: true},

      expose: {
        dependencies: ['this', 'albumData', 'trackData'],
        compute: ({this: artTag, albumData, trackData}) =>
          sortAlbumsTracksChronologically(
            [...albumData, ...trackData]
              .filter(({artTags}) => artTags.includes(artTag)),
            {getDate: o => o.coverArtDate}),
      },
    },

    indirectlyTaggedInThings: [
      withAllDescendantArtTags(),

      {
        dependencies: ['#allDescendantArtTags'],
        compute: ({'#allDescendantArtTags': allDescendantArtTags}) =>
          unique(
            allDescendantArtTags
              .flatMap(artTag => artTag.directlyTaggedInThings)),
      },
    ],

    allDescendantArtTags: [
      withAllDescendantArtTags(),
      exposeDependency({dependency: '#allDescendantArtTags'}),
    ],

    directAncestorArtTags: reverseReferenceList({
      data: 'artTagData',
      list: input.value('directDescendantArtTags'),
    }),
  });
}
