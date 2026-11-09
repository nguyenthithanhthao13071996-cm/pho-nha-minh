/* Trang hiển thị bài viết đăng từ trang admin: bai-viet.html?s=duong-dan-bai */
(function () {
  var SHEET = (window.PNM_SHEET_URL || '').trim(), SITE = 'https://phochipi.net';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var slug = (new URLSearchParams(location.search).get('s') || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  var main = document.getElementById('post');
  window.PNM_SLUG = slug;
  function setMeta(sel, attr, val) { var el = document.head.querySelector(sel); if (!el) { el = document.createElement('meta'); var m = sel.match(/\[(\w+)="([^"]+)"\]/); el.setAttribute(m[1], m[2]); document.head.appendChild(el); } el.setAttribute(attr, val); }
  function addLd(o) { var s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(o); document.head.appendChild(s); }
  function vnDate(d) { var m = String(d || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '/' + m[2] + '/' + m[1] : ''; }
  function loadScript(src) { var s = document.createElement('script'); s.src = src; document.body.appendChild(s); }
  function notFound(msg) {
    document.title = 'Không tìm thấy bài viết | Phố Chipi';
    setMeta('meta[name="robots"]', 'content', 'noindex');
    main.innerHTML = '<div class="nf"><img src="chipi-icon.png" alt="" width="96" height="96"><h1>' + esc(msg || 'Bài viết này chưa có hoặc đã gỡ') + '</h1><p>Mời bạn xem các bài khác trong Cẩm nang nhé.</p><p><a class="btnl" href="cam-nang.html">Về Cẩm nang ›</a></p></div>';
  }
  function show(p) {
    var md = window.PNM_MD(p.body), faq = window.PNM_FAQ(p.faq), url = SITE + '/bai-viet?s=' + p.slug;
    var img = /^https:\/\//i.test(p.cover) ? p.cover : SITE + '/chipi-share.png';
    document.title = p.title + ' | Phố Chipi';
    setMeta('meta[name="description"]', 'content', p.desc);
    setMeta('meta[property="og:title"]', 'content', p.title);
    setMeta('meta[property="og:description"]', 'content', p.desc);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[property="og:image"]', 'content', img);
    var can = document.querySelector('link[rel=canonical]'); can.href = url;
    addLd({ '@context': 'https://schema.org', '@type': 'Article', headline: p.title, description: p.desc, inLanguage: 'vi', datePublished: p.date, dateModified: p.updated || p.date, mainEntityOfPage: url, image: img,
      author: { '@type': 'Organization', name: 'Phố Chipi', url: SITE + '/' }, publisher: { '@type': 'Organization', name: 'Phố Chipi', logo: { '@type': 'ImageObject', url: SITE + '/chipi-icon.png' } } });
    addLd({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Phố Chipi', item: SITE + '/' }, { '@type': 'ListItem', position: 2, name: 'Cẩm nang', item: SITE + '/cam-nang' }, { '@type': 'ListItem', position: 3, name: p.title, item: url }] });
    if (faq.length) addLd({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(function (f) { return { '@type': 'Question', name: f[0], acceptedAnswer: { '@type': 'Answer', text: f[1] } }; }) });
    var mins = Math.max(2, Math.round(md.words / 220)), ids = String(p.products || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
    main.innerHTML = '<nav class="crumbs" aria-label="Đường dẫn"><a href="./">Phố Chipi</a> › <a href="cam-nang.html">Cẩm nang</a> › <span>' + esc(p.tag) + '</span></nav><article>' +
      '<p class="eyebrow">' + esc(p.icon) + ' ' + esc(p.tag) + '</p><h1>' + esc(p.title) + '</h1>' +
      '<p class="meta">Phố Chipi · ' + (p.updated && p.updated !== p.date ? 'Cập nhật ' + vnDate(p.updated) : 'Đăng ' + vnDate(p.date)) + ' · Đọc khoảng ' + mins + ' phút</p>' +
      (p.desc ? '<p class="lead">' + esc(p.desc) + '</p>' : '') +
      (/^https:\/\//i.test(p.cover) ? '<img class="cover" src="' + esc(p.cover) + '" alt="' + esc(p.title) + '">' : '') +
      (md.toc.length > 1 ? '<nav class="toc" aria-label="Mục lục"><b>Trong bài</b><ol>' + md.toc.map(function (h) { return '<li><a href="#' + h[0] + '">' + esc(h[1]) + '</a></li>'; }).join('') + (faq.length ? '<li><a href="#hoi-dap">Hỏi đáp nhanh</a></li>' : '') + '</ol></nav>' : '') +
      '<div class="prose">' + md.html + '</div>' +
      (ids.length ? '<section class="picks"><h2>Gợi ý từ kệ hàng Phố Chipi</h2><div class="pbox" data-ids="' + esc(ids.join(',')) + '"><p class="muted">Đang tải sản phẩm…</p></div></section>' : '') +
      (faq.length ? '<section class="faq" id="hoi-dap"><h2>Hỏi đáp nhanh</h2>' + faq.map(function (f) { return '<details><summary>' + esc(f[0]) + '</summary><p>' + esc(f[1]) + '</p></details>'; }).join('') + '</section>' : '') +
      '<aside class="cta"><img src="chipi-icon.png" alt="" width="64" height="64"><div><b>Dạo phố cùng Chipi</b><span>Vào siêu thị, săn mã giảm giá, thắp hương online và chơi vòng quay nhận Xu mỗi ngày.</span></div><a href="./">Vào phố ›</a></aside>' +
      '</article><section class="related"><h2>Bài khác trong Cẩm nang</h2><div class="cards" id="bai-moi" data-skip="' + esc(p.slug) + '" data-limit="4"></div></section>';
    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
    loadScript('cam-nang.js'); loadScript('bai-moi.js');
  }
  if (!slug) { notFound(); return; }
  if (!SHEET) { notFound('Trang chưa kết nối Google Sheet'); return; }
  fetch(SHEET + '?action=post&slug=' + encodeURIComponent(slug)).then(function (r) { return r.json(); })
    .then(function (d) { d && d.post ? show(d.post) : notFound(); })
    .catch(function () { main.innerHTML = '<div class="nf"><h1>Chưa tải được bài viết</h1><p>Mạng đang chậm, bạn thử tải lại trang nhé.</p><p><a class="btnl" href="">Tải lại</a></p></div>'; });
})();
