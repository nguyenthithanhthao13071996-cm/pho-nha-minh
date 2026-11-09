/* Chuyển chữ viết kiểu đơn giản thành HTML an toàn (dùng chung cho trang bài viết và xem trước trong admin).
   ## Tiêu đề mục   ### Tiêu đề nhỏ   - gạch đầu dòng   1. đánh số   > ô ghi chú
   **đậm**  *nghiêng*  [chữ](https://link)  ![mô tả ảnh](https://link-anh)  | bảng | có | cột | */
(function () {
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var slugify = function (s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'muc'; };
  var okUrl = function (u) { return /^https?:\/\/[^\s"'<>]+$/i.test(u) || /^\.?\/?[a-z0-9\-_.\/?=&#]+$/i.test(u); };
  function inline(t) {
    var s = esc(t);
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function (m, alt, u) { u = u.replace(/&amp;/g, '&'); return okUrl(u) ? '<img src="' + esc(u) + '" alt="' + alt + '" loading="lazy">' : m; });
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, txt, u) {
      u = u.replace(/&amp;/g, '&'); if (!okUrl(u)) return m;
      var ext = /^https?:/i.test(u) && !/phochipi\.net/i.test(u);
      var shop = /shopee|shp\.ee/i.test(u);
      return '<a href="' + esc(u) + '"' + (ext ? ' target="_blank" rel="' + (shop ? 'sponsored ' : '') + 'noopener noreferrer"' : '') + '>' + txt + '</a>';
    });
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
    return s;
  }
  window.PNM_MD = function (src) {
    var lines = String(src || '').replace(/\r/g, '').split('\n'), out = [], toc = [], used = {}, i = 0, para = [];
    var flush = function () { if (para.length) { out.push('<p>' + para.map(inline).join('<br>') + '</p>'); para = []; } };
    while (i < lines.length) {
      var L = lines[i], t = L.trim(), m;
      if (!t) { flush(); i++; continue; }
      if ((m = t.match(/^(#{2,3})\s+(.+)$/))) {
        flush(); var id = slugify(m[2]); while (used[id]) id += '-2'; used[id] = 1;
        if (m[1].length === 2) toc.push([id, m[2].replace(/\*/g, '')]);
        out.push('<h' + m[1].length + ' id="' + id + '">' + inline(m[2]) + '</h' + m[1].length + '>'); i++; continue;
      }
      if (/^[-*]\s+/.test(t) || /^\d+[.)]\s+/.test(t)) {
        flush(); var ol = /^\d/.test(t), items = [];
        while (i < lines.length && (ol ? /^\d+[.)]\s+/ : /^[-*]\s+/).test(lines[i].trim())) { items.push(lines[i].trim().replace(ol ? /^\d+[.)]\s+/ : /^[-*]\s+/, '')); i++; }
        out.push((ol ? '<ol>' : '<ul>') + items.map(function (x) { return '<li>' + inline(x) + '</li>'; }).join('') + (ol ? '</ol>' : '</ul>')); continue;
      }
      if (/^>\s?/.test(t)) {
        flush(); var q = [];
        while (i < lines.length && /^>\s?/.test(lines[i].trim())) { q.push(inline(lines[i].trim().replace(/^>\s?/, ''))); i++; }
        out.push('<div class="callout">' + q.join('<br>') + '</div>'); continue;
      }
      if (/^\|.*\|$/.test(t)) {
        flush(); var rows = [];
        while (i < lines.length && /^\|.*\|$/.test(lines[i].trim())) { var r = lines[i].trim(); if (!/^\|[\s:|-]+\|$/.test(r)) rows.push(r.slice(1, -1).split('|').map(function (c) { return c.trim(); })); i++; }
        if (rows.length) out.push('<div class="tbl"><table><thead><tr>' + rows[0].map(function (c) { return '<th>' + inline(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
          rows.slice(1).map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + inline(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>');
        continue;
      }
      para.push(t); i++;
    }
    flush();
    return { html: out.join('\n'), toc: toc, words: String(src || '').split(/\s+/).filter(Boolean).length };
  };
  window.PNM_FAQ = function (src) {
    return String(src || '').split('\n').map(function (l) { var k = l.indexOf('|'); return k > 0 ? [l.slice(0, k).trim(), l.slice(k + 1).trim()] : null; }).filter(function (x) { return x && x[0] && x[1]; });
  };
  window.PNM_SLUGIFY = slugify;
})();
