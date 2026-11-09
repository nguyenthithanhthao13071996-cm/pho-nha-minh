/* Hiện ô sản phẩm trong bài viết từ data.js (cùng nguồn với web chính) và ghi lượt bấm vào Google Sheet nếu đã cấu hình. */
(function () {
  var P = window.PNM_PRODUCTS || [], SHEET = (window.PNM_SHEET_URL || '').trim();
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var send = function (v) { if (!SHEET) return; try { v.at = new Date().toISOString(); fetch(SHEET, { method: 'POST', mode: 'no-cors', headers: { 'content-type': 'text/plain' }, body: JSON.stringify(v) }); } catch (e) {} };
  document.querySelectorAll('.pbox').forEach(function (box) {
    var ids = (box.getAttribute('data-ids') || '').split(',');
    var list = ids.map(function (id) { return P.filter(function (p) { return p.id === id; })[0]; }).filter(Boolean);
    if (!list.length) { box.innerHTML = '<p class="muted">Chưa có sản phẩm gợi ý cho bài này.</p>'; return; }
    box.innerHTML = list.map(function (p) {
      var ph = p.img ? '<img src="' + esc(p.img) + '" alt="' + esc(p.name) + '" loading="lazy">' : esc(p.emoji);
      return '<div class="prod"><div class="ph">' + ph + (p.saving ? '<span class="off">' + esc(p.saving) + '</span>' : '') + '</div><div class="bd"><b>' + esc(p.name) + '</b>' +
        '<span class="rt">⭐ ' + esc(p.rating) + (p.brand ? ' · ' + esc(p.brand) : '') + '</span>' +
        '<span class="pr">' + esc(p.priceVnd) + (p.oldPrice ? '<s>' + esc(p.oldPrice) + '</s>' : '') + '</span>' +
        (p.stock ? '<a class="buy" href="' + esc(p.affLink) + '" target="_blank" rel="sponsored noopener noreferrer" data-pid="' + esc(p.id) + '">Xem giá trên Shopee ↗</a>' : '<span class="na">Tạm hết hàng</span>') +
        '</div></div>';
    }).join('');
  });
  document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a.buy'); if (a) send({ type: 'click', pid: a.getAttribute('data-pid'), shop: 'cam-nang' }); });
  var slug = location.pathname.split('/').pop().replace('.html', '') || 'cam-nang';
  send({ type: 'enter', shop: 'bai-' + slug });
})();
