(() => {
  'use strict';
  const catalog = window.lightTableCatalog;
  const select = document.getElementById('medium');
  if (!catalog?.photos.length || !catalog?.media.length) {
    const notice = document.getElementById('notice');
    notice.textContent = 'Build the previews with venv/bin/python scripts/build_light_table.py, then reload the light table.';
    notice.hidden = false;
    select.disabled = true;
    return;
  }

  const strip = document.getElementById('filmstrip');
  const grid = document.getElementById('looks');
  const status = document.getElementById('selection-status');
  const photoName = document.getElementById('photo-name');
  let photo = catalog.photos[0];

  function asset(filename) {
    return 'generated/' + encodeURIComponent(photo.key) + '/' + encodeURIComponent(filename);
  }

  function unavailable(text) {
    const message = document.createElement('div');
    message.className = 'print-frame unavailable';
    message.textContent = text;
    return message;
  }

  function showLooks() {
    const medium = catalog.media[select.selectedIndex];
    const cards = document.createDocumentFragment();
    grid.style.setProperty('--photo-ratio', catalog.width + ' / ' + photo.height);
    for (const [index, look] of medium.looks.entries()) {
      const card = document.createElement('figure');
      card.className = 'look';
      const caption = document.createElement('figcaption');
      caption.textContent = look.name;
      if (look.status === 'valid') {
        const link = document.createElement('a');
        link.className = 'print-frame';
        link.href = asset(look.key + '.jpg');
        link.target = '_blank';
        link.rel = 'noopener';
        link.title = 'Open full-size preview';
        const image = new Image(catalog.width, photo.height);
        image.alt = photo.name + ' · ' + look.name + ' on ' + medium.name;
        image.loading = index < 3 ? 'eager' : 'lazy';
        image.decoding = 'async';
        image.addEventListener('error', () => link.replaceWith(unavailable('Preview unavailable')), {once: true});
        image.src = link.href;
        link.append(image);
        card.append(link);
      } else {
        const labels = {missing: 'Awaiting a bake', stale: 'Rebake needed', invalidated: 'Bake invalidated'};
        card.append(unavailable(labels[look.status] || 'Preview unavailable'));
      }
      card.append(caption);
      cards.append(card);
    }
    grid.replaceChildren(cards);
    photoName.textContent = photo.name;
    photoName.title = photo.name;
    const count = medium.looks.length + (medium.looks.length === 1 ? ' film' : ' films');
    document.getElementById('look-count').textContent = count;
    status.textContent = photo.name + ', ' + medium.name + ', ' + count;
  }

  for (const medium of catalog.media) {
    const option = new Option(medium.name, medium.id);
    select.add(option);
    if (medium.id === 'kodak_endura_premier_paper') option.selected = true;
  }
  select.addEventListener('change', showLooks);
  document.getElementById('photo-count').textContent = catalog.photos.length;
  const options = document.createDocumentFragment();
  for (const source of catalog.photos) {
    const label = document.createElement('label');
    label.className = 'photo-option';
    label.title = source.name;
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'photo';
    radio.className = 'sr-only';
    radio.checked = source === photo;
    radio.addEventListener('change', () => {
      photo = source;
      showLooks();
    });
    const frame = document.createElement('span');
    frame.className = 'thumb-frame';
    const thumbnail = new Image();
    thumbnail.alt = '';
    thumbnail.loading = 'lazy';
    thumbnail.src = 'generated/' + encodeURIComponent(source.key) + '/source.jpg';
    frame.append(thumbnail);
    const name = document.createElement('span');
    name.className = 'source-name';
    name.textContent = source.name;
    label.append(radio, frame, name);
    options.append(label);
  }
  strip.append(options);
  showLooks();
})();
