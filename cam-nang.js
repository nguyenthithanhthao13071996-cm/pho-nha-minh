/* Hiện ô sản phẩm trong bài viết. Ưu tiên dữ liệu từ Google Sheet (trang admin), dự phòng data.js. Ghi lượt bấm về Sheet. */
(function () {
  var SHEET = (window.PNM_SHEET_URL || '').trim();
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var send = function (v) { if (!SHEET) return; try { v.at = new Date().toISOString(); fetch(SHEET, { method: 'POST', mode: 'no-cors', headers: { 'content-type': 'text/plain' }, body: JSON.stringify(v) }); } catch (e) {} };
  var safeUrl = function (u) { return /^https?:\/\//i.test(String(u || '')) ? u : 'https://shopee.vn'; };
  function render(P) {
    document.querySelectorAll('.pbox').forEach(function (box) {
      var ids = (box.getAttribute('data-ids') || '').split(',');
      var list = ids.map(function (id) { return P.filter(function (p) { return p.id === id; })[0]; }).filter(Boolean);
      if (!list.length) { box.innerHTML = '<p class="muted">Chưa có sản phẩm gợi ý cho bài này.</p>'; return; }
      box.innerHTML = list.map(function (p) {
        var ph = p.img ? '<img src="' + esc(safeUrl(p.img)) + '" alt="' + esc(p.name) + '" loading="lazy">' : esc(p.emoji);
        return '<div class="prod"><div class="ph">' + ph + (p.saving ? '<span class="off">' + esc(p.saving) + '</span>' : '') + '</div><div class="bd"><b>' + esc(p.name) + '</b>' +
          '<span class="rt">⭐ ' + esc(p.rating) + (p.brand ? ' · ' + esc(p.brand) : '') + '</span>' +
          '<span class="pr">' + esc(p.priceVnd) + (p.oldPrice ? '<s>' + esc(p.oldPrice) + '</s>' : '') + '</span>' +
          (p.stock ? '<a class="buy" href="' + esc(safeUrl(p.affLink)) + '" target="_blank" rel="sponsored noopener noreferrer" data-pid="' + esc(p.id) + '">Xem giá trên Shopee ↗</a>' : '<span class="na">Tạm hết hàng</span>') +
          '</div></div>';
      }).join('');
    });
  }
  function fallback() { render(window.PNM_PRODUCTS || []); }
  if (!SHEET) fallback();
  else {
    var done = false, t = setTimeout(function () { if (!done) { done = true; fallback(); } }, 2500);
    fetch(SHEET + '?action=data').then(function (r) { return r.json(); }).then(function (d) {
      if (done) return; done = true; clearTimeout(t);
      render(d && d.products && d.products.length ? d.products : (window.PNM_PRODUCTS || []));
    }).catch(function () { if (!done) { done = true; clearTimeout(t); fallback(); } });
  }
  document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a.buy'); if (a) send({ type: 'click', pid: a.getAttribute('data-pid'), shop: 'cam-nang' }); });
  var slug = window.PNM_SLUG || location.pathname.split('/').pop().replace('.html', '') || 'cam-nang';
  send({ type: 'enter', shop: 'bai-' + slug });
})();
