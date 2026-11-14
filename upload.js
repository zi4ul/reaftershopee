// PWA: unggah resumable ke Google Drive (logika dari pwa/spike.html, sudah teruji iPhone/PC; hanya DOM → parameter).
// UMD: require() di Node, <script> di browser. XHR dan sleep disuntikkan agar bisa dites.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PostHubUpload = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var CHUNK = 4 * 1024 * 1024;           // kelipatan 256 KiB
  var MAX_RETRY = 6;

  function mb(n) { return (n / 1048576).toFixed(1) + ' MB'; }

  function nextFromRange(range, fallback) { // "bytes=0-12345" → 12346
    var m = /bytes=0-(\d+)/.exec(range || '');
    return m ? Number(m[1]) + 1 : fallback;
  }

  // deps: { XHR (kelas XMLHttpRequest), sleep(ms)→Promise, log(msg), chunk, maxRetry }
  function create(deps) {
    deps = deps || {};
    var XHR = deps.XHR || (typeof XMLHttpRequest !== 'undefined' ? XMLHttpRequest : null);
    var sleep = deps.sleep || function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
    var log = deps.log || function () {};
    var chunk = deps.chunk || CHUNK;
    var maxRetry = deps.maxRetry == null ? MAX_RETRY : deps.maxRetry;

    function put(uri, blob, start, endIncl, total, onProg) {
      return new Promise(function (resolve, reject) {
        var x = new XHR();
        x.open('PUT', uri);
        x.setRequestHeader('Content-Range', blob ? ('bytes ' + start + '-' + endIncl + '/' + total) : ('bytes */' + total));
        x.upload.onprogress = function (e) { if (onProg && e.lengthComputable) onProg(e.loaded); };
        x.onload = function () { resolve({ status: x.status, range: x.getResponseHeader('Range'), text: x.responseText }); };
        x.onerror = function () { reject(new Error('jaringan/CORS gagal')); };
        x.ontimeout = function () { reject(new Error('timeout')); };
        x.timeout = 120000;
        x.send(blob || null);
      });
    }

    // f: Blob/File; session: {sessionUri, fileId?}; onProgress({sent,total,pct,mbps,etaSec}) opsional.
    async function upload(f, session, onProgress) {
      var total = f.size, offset = 0, t0 = Date.now(), fileId = session.fileId, fails = 0;
      function show(sent) {
        if (!onProgress) return;
        var p = Math.min(100, sent / total * 100), sec = (Date.now() - t0) / 1000, spd = sent / 1048576 / Math.max(sec, 0.5);
        onProgress({ sent: sent, total: total, pct: p, mbps: spd, etaSec: spd > 0 ? Math.max(0, Math.round((total - sent) / 1048576 / spd)) : 0 });
      }
      async function resync() { // tanya Drive sudah menerima sampai mana
        try {
          var r = await put(session.sessionUri, null, 0, 0, total);
          if (r.status === 308) { offset = nextFromRange(r.range, 0); log('resume dari ' + mb(offset)); }
          else if (r.status === 200 || r.status === 201) { offset = total; log('Drive sudah menerima seluruh berkas.'); }
        } catch (e) { log('cek status gagal: ' + e.message); }
      }
      while (true) {
        if (offset >= total) {
          if (fileId) return fileId;
          throw new Error('selesai tetapi fileId tidak diketahui');
        }
        var end = Math.min(offset + chunk, total) - 1, base = offset;
        try {
          var r = await put(session.sessionUri, f.slice(offset, end + 1), offset, end, total, function (loaded) { show(base + loaded); });
          if (r.status === 308) { fails = 0; offset = nextFromRange(r.range, end + 1); log('potongan OK → ' + mb(offset)); show(offset); continue; }
          if (r.status === 200 || r.status === 201) {
            try { var j = JSON.parse(r.text); if (j.id) fileId = j.id; } catch (e) {}
            show(total); log('unggahan selesai (HTTP ' + r.status + ').');
            if (!fileId) { var fe = new Error('selesai tetapi respons tidak memuat id berkas'); fe.fatal = true; throw fe; }
            return fileId;
          }
          throw new Error('HTTP ' + r.status + ' ' + (r.text || '').slice(0, 150));
        } catch (e) {
          if (e.fatal) throw e;
          fails++; log('✗ potongan gagal (' + fails + '/' + maxRetry + '): ' + e.message);
          if (fails > maxRetry) throw e;
          await sleep(Math.min(30000, 1000 * Math.pow(2, fails)));
          await resync();
        }
      }
    }

    return { put: put, upload: upload };
  }

  return { create: create, nextFromRange: nextFromRange, mb: mb, CHUNK: CHUNK, MAX_RETRY: MAX_RETRY };
});
