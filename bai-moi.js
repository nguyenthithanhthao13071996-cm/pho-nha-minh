/* Danh sách bài viết mới đăng từ trang admin (hiện ở Cẩm nang và cuối mỗi bài). */
(function () {
  var SHEET = (window.PNM_SHEET_URL || '').trim(), box = document.getElementById('bai-moi');
  if (!box || !SHEET) { if (box && box.closest('.newsec')) box.closest('.newsec').hidden = true; return; }
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var skip = box.getAttribute('data-skip') || '', limit = +box.getAttribute('data-limit') || 50;
  fetch(SHEET + '?action=posts').then(function (r) { return r.json(); }).then(function (d) {
    var list = ((d && d.posts) || []).filter(function (p) { return p.slug !== skip; }).slice(0, limit);
    var sec = box.closest('.newsec');
    if (!list.length) { if (sec) sec.hidden = true; else box.closest('section').hidden = true; return; }
    if (sec) sec.hidden = false;
    box.innerHTML = list.map(function (p) {
      return '<a class="card big" href="bai-viet.html?s=' + encodeURIComponent(p.slug) + '"><span class="ic">' + esc(p.icon || '📝') + '</span><span><small>' + esc(p.tag) + '</small><b>' + esc(p.title) + '</b>' + (skip ? '' : '<em>' + esc(p.desc) + '</em>') + '</span></a>';
    }).join('');
  }).catch(function () { var sec = box.closest('.newsec'); if (sec) sec.hidden = true; });
})();
