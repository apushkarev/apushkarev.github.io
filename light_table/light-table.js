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
  const viewer = document.getElementById('print-viewer');
  const viewerPhoto = document.getElementById('viewer-photo');
  const viewerImage = document.getElementById('viewer-image');
  const viewerFilm = document.getElementById('viewer-film');
  const viewerMedium = document.getElementById('viewer-medium');
  // A completed export sets the time. Reloading the page reuses the same image URLs.
  const printQuery = Number.isFinite(catalog.bakedAt)
    ? '?t=' + new Date(catalog.bakedAt).getTime().toString(36) : '';
  let photo = catalog.photos[0];
  let opener;

  function asset(photo, filename, query = photo.sourceVersion ? '?v=' + photo.sourceVersion : '') {
    const folder = photo.key.split('/').map(encodeURIComponent).join('/');
    return 'generated/' + folder + '/' + encodeURIComponent(filename) + query;
  }

  function unavailable(text) {
    const message = document.createElement('div');
    message.className = 'print-frame unavailable';
    message.textContent = text;
    return message;
  }

  function openViewer(button, image, film, medium) {
    opener = button;
    viewerImage.width = catalog.width;
    viewerImage.height = photo.height;
    viewerImage.alt = image.alt;
    viewerImage.src = image.src;
    viewerFilm.textContent = film;
    viewerMedium.textContent = medium;
    // Show the selected print when the frame opens underneath a stationary pointer.
    viewerPhoto.classList.add('just-opened');
    viewer.showModal();
  }

  viewerPhoto.addEventListener('pointermove', () => viewerPhoto.classList.remove('just-opened'));
  document.getElementById('viewer-close').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', event => {
    if (event.target === viewer) viewer.close();
  });
  viewer.addEventListener('close', () => {
    opener?.focus({preventScroll: true});
    opener = null;
  });

  function showLooks() {
    const medium = catalog.media[select.selectedIndex];
    const cards = document.createDocumentFragment();
    grid.style.setProperty('--photo-ratio', catalog.width + ' / ' + photo.height);
    document.body.style.setProperty('--source-preview', 'url("' + asset(photo, 'source-' + catalog.width + '.jpg') + '")');
    for (const [index, look] of medium.looks.entries()) {
      const card = document.createElement('figure');
      card.className = 'look';
      const caption = document.createElement('figcaption');
      caption.textContent = look.name;
      if (look.status === 'valid') {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'print-frame comparison-image';
        button.setAttribute('aria-haspopup', 'dialog');
        const image = new Image(catalog.width, photo.height);
        image.alt = photo.name + ' · ' + look.name + ' on ' + medium.name;
        image.loading = index < 3 ? 'eager' : 'lazy';
        image.decoding = 'async';
        image.addEventListener('error', () => button.replaceWith(unavailable('Preview unavailable')), {once: true});
        image.src = asset(photo, look.key + '.jpg', printQuery);
        button.addEventListener('click', () => openViewer(button, image, look.name, medium.name));
        button.append(image);
        card.append(button);
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
    thumbnail.src = asset(source, 'source.jpg');
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
