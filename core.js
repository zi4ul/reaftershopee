// PWA core: pengaturan (localStorage) + klien API hub. UMD: require() di Node, <script> di browser.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PostHubCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var KEY_HUB = 'ph_hub';
  var KEY_TOK = 'ph_tok';

  // Baca pengaturan; storage boleh melempar error (mode privat, dll) → nilai kosong.
  function loadSettings(storage) {
    function get(k) {
      try { return (storage && storage.getItem(k)) || ''; } catch (e) { return ''; }
    }
    return { hubUrl: get(KEY_HUB).trim(), token: get(KEY_TOK).trim() };
  }

  // Simpan pengaturan; mengembalikan true bila kedua nilai tersimpan, false bila storage gagal.
  function saveSettings(storage, s) {
    s = s || {};
    try {
      storage.setItem(KEY_HUB, String(s.hubUrl || '').trim());
      storage.setItem(KEY_TOK, String(s.token || '').trim());
      return true;
    } catch (e) {
      return false;
    }
  }

  // POST text/plain (tanpa preflight CORS) ke hub Apps Script.
  function hubCall(fetchFn, settings, action, body) {
    var url = settings && settings.hubUrl, token = settings && settings.token;
    if (!url || !token) return Promise.reject(new Error('Isi URL hub dan token dulu.'));
    var payload = JSON.stringify(Object.assign({ token: token, action: action }, body || {}));
    return Promise.resolve(fetchFn(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: payload,
      redirect: 'follow'
    })).then(function (r) { return r.text(); })
      .then(function (t) {
        try { return JSON.parse(t); }
        catch (e) { throw new Error('Respons hub bukan JSON: ' + String(t).slice(0, 120)); }
      });
  }

  // ---------- caption & validasi (cermin hub/Logic.gs; hub tetap otoritas akhir) ----------
  var CAPTION_LIMIT = { shopee: 150, tiktok: 4000, instagram: 2200 };
  var MAX_PRODUCTS = { shopee: 6, tiktok: 1, instagram: 0 };
  var PLATFORMS = ['shopee', 'tiktok', 'instagram'];
  var PNAMES = { shopee: 'Shopee Video', tiktok: 'TikTok', instagram: 'Instagram' };

  function parseTags(input) {
    var arr = Array.isArray(input) ? input : String(input == null ? '' : input).split(/[\s,]+/);
    var seen = {}, out = [];
    for (var i = 0; i < arr.length; i++) {
      var t = String(arr[i]).replace(/^#+/, '').replace(/[^\p{L}\p{N}_]/gu, '');
      var key = t.toLowerCase();
      if (t && !seen[key]) { seen[key] = 1; out.push(t); }
    }
    return out;
  }
  function buildCaption(description, tags) {
    return String(description || '') + (tags.length ? '\n\n' + tags.map(function (t) { return '#' + t; }).join(' ') : '');
  }
  // Shopee & Instagram: deskripsi + hashtag. TikTok: hanya deskripsi.
  function captionLength(platform, description, tags) {
    return platform === 'tiktok' ? String(description || '').length : buildCaption(description, tags).length;
  }

  // form: {video:{name,mime,width,height,durationSec}, description, hashtags, platforms:{shopee:{enabled,products:[{id}]},...}}
  function validateForm(form) {
    var errors = [], warnings = [];
    var err = function (code, msg, platform) { errors.push({ code: code, msg: msg, platform: platform || null }); };
    var warn = function (code, msg, platform) { warnings.push({ code: code, msg: msg, platform: platform || null }); };
    form = form || {};
    var v = form.video;
    if (!v || typeof v !== 'object') err('no_video', 'Video belum dipilih.');
    var plats = form.platforms && typeof form.platforms === 'object' ? form.platforms : {};
    var enabled = PLATFORMS.filter(function (p) { return plats[p] && plats[p].enabled; });
    if (!enabled.length) err('no_platform', 'Pilih minimal satu platform.');

    var desc = typeof form.description === 'string' ? form.description : '';
    var tags = parseTags(form.hashtags);
    enabled.forEach(function (p) {
      var len = captionLength(p, desc, tags);
      if (len > CAPTION_LIMIT[p]) err('caption_too_long', 'Caption ' + p + ' ' + len + '/' + CAPTION_LIMIT[p] + ' karakter, terlalu panjang.', p);
      if (MAX_PRODUCTS[p] > 0) {
        var prods = Array.isArray(plats[p].products) ? plats[p].products : [];
        if (prods.length > MAX_PRODUCTS[p]) err('too_many_products', 'Maksimal ' + MAX_PRODUCTS[p] + ' produk untuk ' + p + ', dipilih ' + prods.length + '.', p);
        if (prods.length === 0) {
          // T39: bila katalog ada (requireProducts[p]), produk WAJIB dipilih sebelum video diunggah
          if (form.requireProducts && form.requireProducts[p]) err('products_required', 'Pilih produk dulu untuk ' + PNAMES[p] + '.', p);
          else warn('no_products', 'Belum ada produk dipilih untuk ' + p + '.', p);
        }
      }
    });

    if (v && typeof v === 'object') {
      var isMp4 = /mp4/i.test(String(v.mime || '')) || /\.mp4$/i.test(String(v.name || ''));
      if (!isMp4) warn('not_mp4', 'Video bukan .mp4. Di iPhone pilih "Paling Kompatibel" agar jadi .mp4.', 'shopee');
      if (Number(v.width) > 0 && Number(v.height) > 0 && (enabled.indexOf('shopee') >= 0 || enabled.indexOf('instagram') >= 0) &&
          Math.abs(v.width / v.height - 9 / 16) > 0.02) warn('bad_ratio', 'Rasio ' + v.width + 'x' + v.height + ', Shopee dan Instagram butuh 9:16.');
      if (Number(v.durationSec) > 0 && enabled.indexOf('shopee') >= 0 && (v.durationSec < 10 || v.durationSec > 60)) warn('bad_duration', 'Durasi ' + Math.round(v.durationSec) + ' dtk, Shopee butuh 10 sampai 60 dtk.', 'shopee');
    }
    return { errors: errors, warnings: warnings };
  }

  // ---------- pilih produk (batas MAX_PRODUCTS; fungsi murni, tidak mengubah masukan) ----------
  // selected: [{id,name}] untuk SATU platform. Ketuk produk terpilih → dilepas.
  // Batas 1 (TikTok): produk baru menggantikan. Batas > 1 (Shopee): penuh → ditolak dengan pesan.
  // Mengembalikan {selected, error|null}.
  function pickProduct(selected, platform, id, name) {
    var cur = Array.isArray(selected) ? selected.slice() : [];
    var max = MAX_PRODUCTS[platform] || 0;
    id = String(id == null ? '' : id);
    if (!max) return { selected: cur, error: 'Platform ' + platform + ' tidak memakai produk.' };
    if (!id) return { selected: cur, error: 'Produk tidak valid.' };
    for (var i = 0; i < cur.length; i++) {
      if (String(cur[i].id) === id) { cur.splice(i, 1); return { selected: cur, error: null }; }
    }
    var item = { id: id, name: name == null ? '' : String(name) };
    if (max === 1) return { selected: [item], error: null };
    if (cur.length >= max) return { selected: cur, error: 'Maksimal ' + max + ' produk untuk ' + platform + '.' };
    cur.push(item);
    return { selected: cur, error: null };
  }

  // ---------- payload job.create (SPEC 5.1; hub membuat id/status, PWA hanya mengirim input) ----------
  function normSchedule(x) {
    if (x == null || x === '') return null;
    if (x instanceof Date) return isNaN(x.getTime()) ? String(x) : x.toISOString();
    if (typeof x === 'number') return new Date(x).toISOString();
    return String(x);
  }
  // form: {description, hashtags, platforms, scheduledAt, deleteAfter, note}
  // videoInfo: {name, size, mime, durationSec, width, height}; fileId: id berkas di Drive.
  function buildJobPayload(form, videoInfo, fileId) {
    form = form || {};
    var vi = videoInfo || null;
    var video = vi ? {
      driveFileId: fileId, name: vi.name, size: Number(vi.size),
      mime: vi.mime || 'video/mp4', durationSec: Number(vi.durationSec) || 0,
      width: Number(vi.width) || 0, height: Number(vi.height) || 0
    } : null;
    var platforms = {};
    var src = form.platforms && typeof form.platforms === 'object' ? form.platforms : {};
    PLATFORMS.forEach(function (p) {
      var cfg = src[p] || {};
      var e = { enabled: !!cfg.enabled };
      if (MAX_PRODUCTS[p] > 0) {
        e.products = (Array.isArray(cfg.products) ? cfg.products : []).map(function (x) {
          return x && typeof x === 'object' ? { id: x.id, name: x.name == null ? '' : x.name } : x;
        });
      }
      platforms[p] = e;
    });
    return {
      job: {
        video: video,
        description: typeof form.description === 'string' ? form.description : '',
        hashtags: parseTags(form.hashtags),
        platforms: platforms,
        scheduledAt: normSchedule(form.scheduledAt),
        deleteAfter: form.deleteAfter === false ? false : true,
        note: typeof form.note === 'string' ? form.note : ''
      }
    };
  }

  // ---------- alur Kirim (T08): upload.init → unggah → upload.finish → job.create ----------
  // deps: {hub(action, body)→Promise<json>, upload(file, session, onProgress)→Promise<fileId>, onStatus?, onProgress?}
  // resume (opsional, dari hasil gagal sebelumnya): {session, fileId, finished} → tahap yang sudah beres dilewati.
  // Hasil: {ok, stage, message, jobId?, resume?}; berhenti di tahap pertama yang gagal.
  function errText(r, fallback) {
    if (!r) return fallback;
    return (r.error || fallback) + (r.detail ? ' — ' + r.detail : '') + (r.status ? ' (HTTP ' + r.status + ')' : '');
  }
  async function submitFlow(deps, form, file, resume) {
    var st = Object.assign({ session: null, fileId: null, finished: false }, resume || {});
    var say = deps.onStatus || function () {};
    function fail(stage, message) {
      return { ok: false, stage: stage, message: message + ' Anda bisa menekan Kirim lagi untuk mengulang.', resume: st };
    }
    var v = validateForm(form || {});
    if (v.errors.length) return { ok: false, stage: 'validate', message: v.errors[0].msg, resume: st };
    // T40: video dari pustaka (sudah di Drive) → form.video.driveFileId terisi, tanpa berkas lokal; lewati upload.init/unggah
    var reuse = !file && form && form.video && /^[\w-]{10,}$/.test(String(form.video.driveFileId || ''));
    if (!file && !reuse) return { ok: false, stage: 'validate', message: 'Pilih video dulu.', resume: st };
    var fileSize = reuse ? Number(form.video.size) : file.size;
    if (reuse) { st.fileId = form.video.driveFileId; st.session = st.session || { reused: true }; }

    if (!st.fileId) {
      if (!st.session) {
        say('Menyiapkan unggahan …');
        var mime = (form.video && form.video.mime) || file.type || 'video/mp4';
        var init;
        try { init = await deps.hub('upload.init', { name: file.name, size: file.size, mime: mime, origin: deps.origin || '' }); }
        catch (e) { return fail('init', 'Gagal menghubungi hub: ' + e.message + '.'); }
        if (!init || !init.ok) return fail('init', 'Hub menolak unggahan: ' + errText(init, 'tidak diketahui') + '.');
        st.session = { sessionUri: init.sessionUri, fileId: init.fileId };
      }
      say('Mengunggah video …');
      try { st.fileId = await deps.upload(file, st.session, deps.onProgress); }
      catch (e) { return fail('upload', 'Unggahan gagal: ' + e.message + '.'); }
    }
    if (!st.finished) {
      say('Memeriksa berkas di Drive …');
      var fin;
      try { fin = await deps.hub('upload.finish', { fileId: st.fileId, size: fileSize }); }
      catch (e) { return fail('finish', 'Gagal memverifikasi unggahan: ' + e.message + '.'); }
      if (fin && fin.error === 'file_trashed') return { ok: false, stage: 'finish', message: 'Video ini sudah dihapus dari Drive. Pilih video lain atau unggah ulang dari HP.', resume: null };
      if (!fin || !fin.ok) return fail('finish', 'Verifikasi unggahan ditolak: ' + errText(fin, 'tidak diketahui') + '.');
      st.finished = true;
    }
    say('Membuat job …');
    var made;
    try { made = await deps.hub('job.create', buildJobPayload(form, form.video, st.fileId)); }
    catch (e) { return fail('job', 'Video sudah terunggah, tetapi job gagal dibuat: ' + e.message + '.'); }
    if (!made || !made.ok) return fail('job', 'Video sudah terunggah, tetapi hub menolak job: ' + errText(made, 'tidak diketahui') + '.');
    return { ok: true, stage: 'done', message: 'Terkirim. Job masuk antrean.', jobId: made.jobId || (made.job && made.job.id) || null, fileId: st.fileId, resume: null };
  }

  // ---------- Daftar Job (T09): status → teks Indonesia + warna (cls: ok/bad/warn/mut) ----------
  var STATUS = {
    queued: ['Menunggu giliran', 'mut'], claimed: ['Diambil Reafter', 'warn'], running: ['Sedang diposting', 'warn'],
    needsAction: ['Perlu tindakan Anda', 'bad'], done: ['Selesai', 'ok'], partial: ['Sebagian berhasil', 'warn'],
    error: ['Gagal', 'bad'], cancelled: ['Dibatalkan', 'mut'], skipped: ['Tidak dipakai', 'mut']
  };
  function statusInfo(state) {
    var x = STATUS[state];
    return x ? { text: x[0], cls: x[1] } : { text: 'Status tidak dikenal (' + String(state) + ')', cls: 'mut' };
  }
  // Pilihan untuk platform needsAction (D16). retry berisiko posting ganda → peringatan wajib tampil.
  var RESUME_CHOICES = [
    { decision: 'retry', label: 'Coba lagi', warning: 'Awas: video mungkin SUDAH terposting. Coba lagi bisa membuat posting ganda. Cek akun dulu.' },
    { decision: 'markDone', label: 'Sudah terposting', warning: '' },
    { decision: 'close', label: 'Tutup tanpa coba lagi', warning: '' }
  ];
  // T64c: waktu ringkas untuk kartu job (zona waktu HP)
  function jobFmtDT(iso) {
    var d = new Date(iso); if (!iso || isNaN(d.getTime())) return '';
    return d.getDate() + '/' + (d.getMonth() + 1) + ' ' + (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
  }
  function formatJob(job) {
    job = job || {};
    var si = statusInfo(job.status), plats = [], needs = [];
    ['shopee', 'tiktok', 'instagram'].forEach(function (p) {
      var e = job.platforms && job.platforms[p];
      if (!e || !e.enabled) return;
      var pi = statusInfo(e.state);
      var prods = (Array.isArray(e.products) ? e.products : []).filter(function (x) { return x && x.id; }).map(function (x) { return { id: String(x.id), name: String(x.name || '') }; });
      plats.push({ key: p, label: PNAMES[p], state: e.state, text: pi.text, cls: pi.cls, msg: e.msg || '', products: prods });
      if (e.state === 'needsAction') needs.push(p);
    });
    var closed = job.status === 'done' || job.status === 'partial' || job.status === 'error' || job.status === 'cancelled';
    return {
      id: job.id || '', title: (job.video && job.video.name) || job.id || '(tanpa nama)',
      statusText: si.text, cls: si.cls, platforms: plats,
      videoId: (job.video && job.video.driveFileId) || '',
      when: jobFmtDT(job.scheduledAt) ? 'Dijadwalkan ' + jobFmtDT(job.scheduledAt) : (jobFmtDT(job.createdAt) ? 'Dibuat ' + jobFmtDT(job.createdAt) : ''),
      sizeText: job.video && Number(job.video.size) > 0 ? (Number(job.video.size) / 1048576).toFixed(1) + ' MB' : '',
      canCancel: !!job.id && !closed, needsAction: needs, canResume: job.status === 'needsAction' && needs.length > 0
    };
  }

  // ---------- T40: pustaka video ----------
  // Thumbnail dibuat di HP saat video dipilih (Drive tak bisa memberi gambar tanpa login), disimpan di penyimpanan browser per id Drive.
  var KEY_VMETA = 'posthub.vmeta', MAX_VMETA = 60, MAX_THUMB = 20000;
  function loadVideoMeta(storage) {
    try { var o = JSON.parse(storage.getItem(KEY_VMETA) || '{}'); return o && typeof o === 'object' && !Array.isArray(o) ? o : {}; } catch (e) { return {}; }
  }
  // meta: {thumb?, width?, height?, durationSec?}. Mengembalikan false bila gagal simpan. Tertua dibuang bila > MAX_VMETA.
  function saveVideoMeta(storage, id, meta, nowMs) {
    id = String(id || ''); if (!id || !meta || typeof meta !== 'object') return false;
    var all = loadVideoMeta(storage);
    var thumb = typeof meta.thumb === 'string' && /^data:image\/jpeg;base64,/.test(meta.thumb) && meta.thumb.length <= MAX_THUMB ? meta.thumb : '';
    all[id] = { t: Number(nowMs) || Date.now(), thumb: thumb, width: Number(meta.width) || 0, height: Number(meta.height) || 0, durationSec: Number(meta.durationSec) || 0 };
    var ids = Object.keys(all).sort(function (a, b) { return all[b].t - all[a].t; });
    ids.slice(MAX_VMETA).forEach(function (k) { delete all[k]; });
    try { storage.setItem(KEY_VMETA, JSON.stringify(all)); return true; } catch (e) { return false; }
  }
  // driveVideos: hasil hub video.list; meta: hasil loadVideoMeta. Data HP menang atas Drive bila lebih lengkap.
  function mergeLibrary(driveVideos, meta) {
    meta = meta || {};
    return (Array.isArray(driveVideos) ? driveVideos : []).filter(function (v) { return v && v.id; }).map(function (v) {
      var m = meta[v.id] || {};
      return { id: String(v.id), name: String(v.name || ''), size: Number(v.size) || 0, mime: v.mime || 'video/mp4', createdAt: v.createdAt || '',
               width: Number(m.width) || Number(v.width) || 0, height: Number(m.height) || Number(v.height) || 0,
               durationSec: Number(m.durationSec) || Number(v.durationSec) || 0, thumb: m.thumb || '' };
    });
  }
  function describeVideo(v) {
    var parts = [(Number(v.size) / 1048576).toFixed(1) + ' MB'];
    if (v.width > 0 && v.height > 0) parts.push(v.width + '×' + v.height);
    if (v.durationSec > 0) parts.push(Math.round(v.durationSec) + ' dtk');
    var d = v.createdAt ? new Date(v.createdAt) : null;
    if (d && !isNaN(d.getTime())) parts.push(d.getUTCDate() + '/' + (d.getUTCMonth() + 1) + '/' + d.getUTCFullYear());
    return parts.join(' · ');
  }
  var VIDEO_ERRORS = { video_in_use: 'Video masih dipakai job yang belum selesai.', not_in_library: 'Berkas ini bukan bagian pustaka video.', file_not_found: 'Video sudah tidak ada di Drive.',
    trash_failed: 'Drive gagal membuang video, coba lagi.', drive_list_failed: 'Hub gagal membaca Drive.', unknown_action: 'Hub belum diperbarui (tempel ulang Api.gs + Upload.gs lalu Deploy versi baru).' };
  function videoErrorText(code) { return VIDEO_ERRORS[code] || ('ditolak hub: ' + code); }

  // T64b: hashtag otomatis saat mengetik. SALINAN `typeInto` dari reafter-app/src/mu/hashtag.js (T62a); paritas dijaga tests/pwa-core.test.js.
  // Bertambah (ketik/tempel): tiap kata diberi '#', '##' dirapikan; berkurang (Backspace): tidak diubah supaya tidak macet.
  function typeInto(prev, next, caret) {
    prev = String(prev == null ? '' : prev); next = String(next == null ? '' : next);
    var c0 = caret == null ? next.length : Math.max(0, Math.min(Number(caret), next.length));
    if (next.length <= prev.length) return { value: next, caret: c0 };
    var out = '', last = 0, c = c0, re = /[^\s,]+/g, m;
    while ((m = re.exec(next))) {
      var start = m.index, end = start + m[0].length, hashes = (m[0].match(/^#*/) || [''])[0].length;
      var fixed = '#' + m[0].slice(hashes);
      out += next.slice(last, start) + fixed; last = end;
      var delta = fixed.length - m[0].length;
      if (!delta) continue;
      if (c >= end) c += delta;
      else if (c > start) c += hashes ? -Math.min(c - start, hashes - 1) : 1;
    }
    out += next.slice(last);
    return { value: out, caret: Math.max(0, Math.min(c, out.length)) };
  }

  return { typeInto: typeInto, loadVideoMeta: loadVideoMeta, saveVideoMeta: saveVideoMeta, mergeLibrary: mergeLibrary, describeVideo: describeVideo, videoErrorText: videoErrorText, pickProduct: pickProduct, submitFlow: submitFlow, statusInfo: statusInfo, formatJob: formatJob, RESUME_CHOICES: RESUME_CHOICES, buildJobPayload: buildJobPayload, parseTags: parseTags, buildCaption: buildCaption, captionLength: captionLength, validateForm: validateForm,
    CAPTION_LIMIT: CAPTION_LIMIT, MAX_PRODUCTS: MAX_PRODUCTS, loadSettings: loadSettings, saveSettings: saveSettings, hubCall: hubCall, KEY_HUB: KEY_HUB, KEY_TOK: KEY_TOK };
});
