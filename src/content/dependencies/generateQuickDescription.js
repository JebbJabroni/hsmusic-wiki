export default {
  contentDependencies: ['transformContent'],
  extraDependencies: ['html', 'language'],

  relations: (relation, thing) =>
    ({description:
        (thing.descriptionShort || thing.description
          ? relation('transformContent',
              thing.descriptionShort ?? thing.description)
          : null)}),

  data: (thing) =>
    ({hasLongerDescription:
        thing.description &&
        thing.descriptionShort &&
        thing.descriptionShort !== thing.description}),

  slots: {
    infoPageLink: {type: 'html'},
  },

  generate(data, relations, slots, {html, language}) {
    return html.tag('p',
      {
        [html.joinChildren]: html.tag('br'),
        [html.onlyIfContent]: true,
        class:' quick-info',
      },
      [
        relations.description?.slot('mode', 'inline'),

        data.hasLongerDescription &&
        slots.infoPageLink &&
          language.$('misc.quickDescription.moreInfo', {
            link:
              slots.infoPageLink
                .slot('content', language.$('misc.quickDescription.moreInfo.link')),
          }),
      ]);
  },
};
