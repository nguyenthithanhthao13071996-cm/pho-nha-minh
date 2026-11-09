/* Trang quản trị Phố Chipi: đọc/ghi sản phẩm, mã giảm giá và xem thống kê qua Google Apps Script. */
(function () {
  'use strict';
  var SHEET = (window.PNM_SHEET_URL || '').trim();
  var SHOPS = [
    { id: 'sieu-thi', name: 'Siêu Thị', icon: '🏠', cats: [['airfryer', 'Nồi chiên'], ['vacuum', 'Hút bụi'], ['blender', 'Máy xay'], ['cookware', 'Đồ bếp']] },
    { id: 'chua', name: 'Góc An Nhiên', icon: '🪷', cats: [['incense', 'Nhang trầm'], ['feng', 'Phong thủy'], ['lantern', 'Đèn lồng']] },
    { id: 'tien-loi', name: 'Tạp Hóa Chipi', icon: '🍙', cats: [['drink', 'Nước'], ['snack', 'Ăn vặt'], ['noodle', 'Mì']] },
    { id: 'decor', name: 'Nhà Xinh', icon: '✨', cats: [['light', 'Đèn'], ['mirror', 'Gương'], ['plant', 'Cây']] },
    { id: 'me-be', name: 'Bé Yêu', icon: '🧸', cats: [['milk', 'Sữa'], ['diaper', 'Bỉm'], ['stroller', 'Xe đẩy']] }
  ];
  var shopById = function (id) { return SHOPS.filter(function (s) { return s.id === id; })[0]; };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var norm = function (s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd'); };
  var isUrl = function (u) { return /^https:\/\/\S+$/i.test(String(u || '').trim()); };
  var app = $('#app'), modal = $('#modal'), sheetEl = $('#sheet');
  var KEY = '', S = { tab: 'overview', products: [], vouchers: [], dirtyP: false, dirtyV: false, shop: 'all', q: '', events: null, range: 30, fromSheet: false };

  function toast(m) { var t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('on'); }, 2600); }
  function api(params) { return fetch(SHEET + '?' + new URLSearchParams(params).toString()).then(function (r) { return r.json(); }); }
  function post(body) { return fetch(SHEET, { method: 'POST', headers: { 'content-type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) }).then(function (r) { return r.json(); }); }
  function getKey() { try { return sessionStorage.getItem('pnm-admin') || ''; } catch (e) { return KEY; } }
  function setKey(k) { KEY = k; try { k ? sessionStorage.setItem('pnm-admin', k) : sessionStorage.removeItem('pnm-admin'); } catch (e) {} }
  window.addEventListener('beforeunload', function (e) { if (S.dirtyP || S.dirtyV) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- chưa cấu hình ---------- */
  if (!SHEET) {
    app.innerHTML = '<div class="card"><h2>Chưa kết nối Google Sheet</h2><p>Trang quản trị lưu sản phẩm, mã giảm giá và thống kê trong Google Sheet của bạn. Làm 1 lần:</p><ol class="steps">' +
      '<li>Tạo Google Sheet mới, vào <b>Tiện ích mở rộng › Apps Script</b>.</li><li>Dán toàn bộ file <code>google-apps-script.gs</code>, đổi <code>MAT_KHAU</code> thành mật khẩu riêng, bấm Lưu.</li>' +
      '<li><b>Triển khai › Tùy chọn triển khai mới › Ứng dụng web</b>: Thực thi với tư cách <b>Tôi</b>, Quyền truy cập <b>Bất kỳ ai</b>. Sao chép link <code>/exec</code>.</li>' +
      '<li>Trên GitHub, sửa <code>config.js</code>: dán link vào <code>window.PNM_SHEET_URL = \'...\'</code> rồi Commit.</li><li>Mở lại trang này và đăng nhập bằng mật khẩu ở bước 2.</li></ol></div>';
    return;
  }

  /* ---------- đăng nhập ---------- */
  function showLogin(msg) {
    $('#logout').hidden = true;
    app.innerHTML = '<div class="center"><form class="card login" id="lf"><img src="fa6c4139771e87d0-chipi_new-BpUtOSjk.png" alt="" onerror="this.src=\'chipi-icon.png\'"><h2>Chào chủ phố!</h2><p class="muted small">Nhập mật khẩu đã đặt trong Apps Script (dòng MAT_KHAU).</p>' +
      '<input type="password" id="pw" placeholder="Mật khẩu" autocomplete="current-password" required><p class="err" id="lerr">' + esc(msg || '') + '</p><button class="btn pri" style="width:100%">Đăng nhập</button></form></div>';
    $('#pw').focus();
    $('#lf').addEventListener('submit', function (e) {
      e.preventDefault(); var k = $('#pw').value.trim(); if (!k) return;
      $('#lerr').textContent = 'Đang kiểm tra…';
      api({ action: 'ping', key: k }).then(function (r) { if (r && r.ok) { setKey(k); start(); } else $('#lerr').textContent = 'Sai mật khẩu.'; })
        .catch(function () { $('#lerr').textContent = 'Không kết nối được Google Sheet. Kiểm tra lại link trong config.js và quyền "Bất kỳ ai".'; });
    });
  }
  $('#logout').addEventListener('click', function () { if ((S.dirtyP || S.dirtyV) && !confirmLeave()) return; setKey(''); showLogin(); });
  function confirmLeave() { return window.confirm('Có thay đổi chưa lưu. Vẫn thoát?'); }

  function start() {
    KEY = getKey(); $('#logout').hidden = false;
    app.innerHTML = '<p class="muted" style="padding:20px 0">Đang tải dữ liệu…</p>';
    api({ action: 'data' }).then(function (d) {
      S.products = (d && d.products) || []; S.vouchers = (d && d.vouchers) || []; S.fromSheet = S.products.length > 0;
      render();
    }).catch(function () { app.innerHTML = '<div class="card"><h2>Không tải được dữ liệu</h2><p>Kiểm tra kết nối mạng và link Apps Script.</p><button class="btn" onclick="location.reload()">Thử lại</button></div>'; });
  }

  /* ---------- khung chính ---------- */
  function render() {
    var tabs = [['overview', '📊 Tổng quan'], ['products', '🛍️ Sản phẩm (' + S.products.length + ')'], ['vouchers', '🎟️ Mã giảm giá (' + S.vouchers.length + ')']];
    app.innerHTML = '<nav class="tabs" role="tablist">' + tabs.map(function (t) { return '<button class="tab" role="tab" data-t="' + t[0] + '" aria-selected="' + (S.tab === t[0]) + '">' + t[1] + '</button>'; }).join('') + '</nav><div id="pane"></div>';
    app.querySelectorAll('.tab').forEach(function (b) { b.addEventListener('click', function () { S.tab = b.getAttribute('data-t'); render(); }); });
    if (S.tab === 'overview') overview(); else if (S.tab === 'products') products(); else vouchers();
  }

  /* ---------- tổng quan ---------- */
  function overview() {
    var pane = $('#pane');
    if (!S.events) {
      pane.innerHTML = '<p class="muted">Đang tải thống kê…</p>';
      api({ action: 'events', key: KEY }).then(function (r) { S.events = Array.isArray(r) ? r : []; overview(); }).catch(function () { pane.innerHTML = '<p class="err">Không tải được thống kê.</p>'; });
      return;
    }
    var since = S.range ? Date.now() - S.range * 864e5 : 0;
    var ev = S.events.filter(function (e) { var t = Date.parse(e.at); return !since || (t && t >= since); });
    var pname = function (id) { var p = S.products.filter(function (x) { return x.id === id; })[0] || (window.PNM_PRODUCTS || []).filter(function (x) { return x.id === id; })[0]; return p ? p.name : id; };
    var top = function (arr, n) { var m = {}; arr.forEach(function (k) { if (k) m[k] = (m[k] || 0) + 1; }); return Object.keys(m).map(function (k) { return [k, m[k]]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, n || 8); };
    var s = ev.filter(function (e) { return e.type === 'search' && e.q; }), v = ev.filter(function (e) { return e.type === 'view'; }), c = ev.filter(function (e) { return e.type === 'click'; });
    var block = function (title, rows, hint) {
      return '<div class="card"><h2 style="font-size:18px">' + title + '</h2>' + (hint ? '<p class="muted small" style="margin:0">' + hint + '</p>' : '') +
        (rows.length ? rows.map(function (r) { return '<div class="bar"><span>' + esc(r[0]) + '</span><i style="width:' + Math.max(8, r[1] / rows[0][1] * 90) + 'px"></i><b>' + r[1] + '</b></div>'; }).join('') : '<p class="muted small">Chưa có dữ liệu.</p>') + '</div>';
    };
    pane.innerHTML = '<div class="chips">' + [[7, '7 ngày'], [30, '30 ngày'], [0, 'Tất cả']].map(function (r) { return '<button class="chip" data-r="' + r[0] + '" aria-pressed="' + (S.range === r[0]) + '">' + r[1] + '</button>'; }).join('') +
      '<button class="chip" id="reload">↻ Tải lại</button></div>' +
      '<div class="kpis" style="margin-top:8px">' + [['Lượt tìm', s.length], ['Lượt xem món', v.length], ['Bấm sang Shopee', c.length], ['Tỷ lệ bấm/xem', v.length ? Math.round(c.length / v.length * 100) + '%' : '–']].map(function (k) { return '<div class="kpi"><span>' + k[0] + '</span><b>' + k[1] + '</b></div>'; }).join('') + '</div>' +
      '<div class="two">' +
      block('🔍 Khách tìm nhiều nhất', top(s.map(function (e) { return norm(e.q); }))) +
      block('❗ Tìm mà phố chưa có', top(s.filter(function (e) { return !Number(e.hits); }).map(function (e) { return norm(e.q); })), 'Nên nhập những món này trước') +
      block('👀 Món được xem nhiều', top(v.map(function (e) { return pname(e.pid); }))) +
      block('🛒 Món được bấm sang Shopee', top(c.map(function (e) { return pname(e.pid); }))) +
      block('🏪 Khu được ghé', top(ev.filter(function (e) { return e.type === 'enter'; }).map(function (e) { return e.shop; }))) +
      block('🧺 Món được lưu giỏ', top(ev.filter(function (e) { return e.type === 'save'; }).map(function (e) { return pname(e.pid); }))) + '</div>';
    pane.querySelectorAll('[data-r]').forEach(function (b) { b.addEventListener('click', function () { S.range = +b.getAttribute('data-r'); overview(); }); });
    $('#reload').addEventListener('click', function () { S.events = null; overview(); });
  }

  /* ---------- sản phẩm ---------- */
  function products() {
    var pane = $('#pane');
    var list = S.products.filter(function (p) { return (S.shop === 'all' || p.shopId === S.shop) && (!S.q || norm(p.name + ' ' + p.brand).indexOf(norm(S.q)) >= 0); });
    var seed = !S.products.length ? '<div class="card"><h2>Chưa có sản phẩm trong Google Sheet</h2><p class="muted">Web đang hiện ' + (window.PNM_PRODUCTS || []).length + ' sản phẩm mẫu từ <code>data.js</code>. Bấm nút dưới để chép sang đây rồi sửa tiếp.</p><button class="btn pri" id="seed">Chép sản phẩm đang có trên web</button></div>' : '';
    pane.innerHTML = seed + '<div class="row" style="margin-top:8px"><input type="text" class="grow" id="q" placeholder="Tìm sản phẩm…" value="' + esc(S.q) + '"><button class="btn pri" id="add">+ Thêm sản phẩm</button></div>' +
      '<div class="chips" style="margin-top:6px"><button class="chip" data-s="all" aria-pressed="' + (S.shop === 'all') + '">Tất cả</button>' + SHOPS.map(function (s) { return '<button class="chip" data-s="' + s.id + '" aria-pressed="' + (S.shop === s.id) + '">' + s.icon + ' ' + esc(s.name) + '</button>'; }).join('') + '</div>' +
      '<div class="items">' + (list.map(function (p) {
        var bad = !isUrl(p.affLink) || /^https:\/\/shopee\.vn\/?$/i.test(p.affLink);
        return '<div class="it"><div class="th">' + (p.img ? '<img src="' + esc(p.img) + '" alt="">' : esc(p.emoji || '🛍️')) + '</div><div class="bd"><b>' + esc(p.name) + '</b><span><span class="pr">' + esc(p.priceVnd) + '</span> · ' + esc((shopById(p.shopId) || {}).name || p.shopId) + (bad ? ' · <span class="warn">chưa có link affiliate</span>' : '') + '</span></div>' +
          '<div class="acts"><label class="tog"><input type="checkbox" data-stock="' + esc(p.id) + '"' + (p.stock ? ' checked' : '') + '>Còn hàng</label>' +
          '<button class="ic" data-edit="' + esc(p.id) + '" aria-label="Sửa ' + esc(p.name) + '">✏️</button><button class="ic" data-del="' + esc(p.id) + '" aria-label="Xoá ' + esc(p.name) + '">🗑️</button></div></div>';
      }).join('') || (S.products.length ? '<p class="muted">Không có sản phẩm khớp.</p>' : '')) + '</div>' + saveBar('P');
    $('#q').addEventListener('input', function (e) { S.q = e.target.value; var pos = e.target.selectionStart; products(); var q = $('#q'); q.focus(); q.setSelectionRange(pos, pos); });
    $('#add').addEventListener('click', function () { editProduct(null); });
    if ($('#seed')) $('#seed').addEventListener('click', function () { S.products = (window.PNM_PRODUCTS || []).map(function (p) { return Object.assign({}, p); }); S.dirtyP = true; render(); toast('Đã chép ' + S.products.length + ' sản phẩm. Bấm "Lưu lên web" để lưu.'); });
    pane.querySelectorAll('[data-s]').forEach(function (b) { b.addEventListener('click', function () { S.shop = b.getAttribute('data-s'); products(); }); });
    pane.querySelectorAll('[data-stock]').forEach(function (c) { c.addEventListener('change', function () { var p = find(c.getAttribute('data-stock')); p.stock = c.checked; S.dirtyP = true; products(); }); });
    pane.querySelectorAll('[data-edit]').forEach(function (b) { b.addEventListener('click', function () { editProduct(find(b.getAttribute('data-edit'))); }); });
    pane.querySelectorAll('[data-del]').forEach(function (b) { b.addEventListener('click', function () { var p = find(b.getAttribute('data-del')); if (window.confirm('Xoá "' + p.name + '"?')) { S.products = S.products.filter(function (x) { return x !== p; }); S.dirtyP = true; render(); } }); });
    bindSave('P');
  }
  function find(id) { return S.products.filter(function (p) { return p.id === id; })[0]; }
  function newId(list, pre) { var n = 1, ids = list.map(function (x) { return x.id; }); while (ids.indexOf(pre + n) >= 0) n++; return pre + n; }

  function editProduct(p) {
    var isNew = !p; p = p || { id: newId(S.products, 'p'), shopId: S.shop !== 'all' ? S.shop : 'sieu-thi', cat: '', name: '', emoji: '🛍️', img: '', priceVnd: '', oldPrice: '', saving: '', rating: 4.8, badge: '', stock: true, affLink: '', brand: '', commission: '' };
    var catOpts = function (sid) { var s = shopById(sid) || SHOPS[0]; return s.cats.map(function (c) { return '<option value="' + c[0] + '"' + (p.cat === c[0] ? ' selected' : '') + '>' + c[1] + '</option>'; }).join(''); };
    sheetEl.innerHTML = '<div class="row"><h3 class="grow">' + (isNew ? 'Thêm sản phẩm' : 'Sửa sản phẩm') + '</h3><button class="ic" id="mx" aria-label="Đóng">✕</button></div>' +
      '<form id="pf" novalidate>' +
      '<label class="f">Tên sản phẩm *<input type="text" name="name" value="' + esc(p.name) + '" required maxlength="90"></label>' +
      '<label class="f">Link affiliate Shopee *<small>Lấy trong Shopee Affiliate › Lấy link. Bắt đầu bằng https://</small><input type="url" name="affLink" value="' + esc(p.affLink) + '" placeholder="https://s.shopee.vn/..." required></label>' +
      '<div class="grid2"><label class="f">Khu (shop) *<select name="shopId">' + SHOPS.map(function (s) { return '<option value="' + s.id + '"' + (p.shopId === s.id ? ' selected' : '') + '>' + s.icon + ' ' + esc(s.name) + '</option>'; }).join('') + '</select></label>' +
      '<label class="f">Nhóm hàng<select name="cat">' + catOpts(p.shopId) + '</select></label></div>' +
      '<div class="grid2"><label class="f">Giá bán *<small>vd: 1.29tr hoặc 890k</small><input type="text" name="priceVnd" value="' + esc(p.priceVnd) + '" required></label>' +
      '<label class="f">Giá gốc<small>để trống nếu không giảm</small><input type="text" name="oldPrice" value="' + esc(p.oldPrice) + '"></label></div>' +
      '<div class="grid2"><label class="f">% giảm<small>để trống sẽ tự tính</small><input type="text" name="saving" value="' + esc(p.saving) + '" placeholder="-32%"></label>' +
      '<label class="f">Đánh giá (sao)<input type="number" name="rating" step="0.1" min="0" max="5" value="' + esc(p.rating) + '"></label></div>' +
      '<div class="grid2"><label class="f">Thương hiệu<input type="text" name="brand" value="' + esc(p.brand) + '"></label>' +
      '<label class="f">Nhãn<select name="badge"><option value="">Không</option>' + ['Mall', 'Bán chạy', 'Hot', 'Mới', 'Handmade', 'Decor'].map(function (b) { return '<option' + (p.badge === b ? ' selected' : '') + '>' + b + '</option>'; }).join('') + (p.badge && ['Mall', 'Bán chạy', 'Hot', 'Mới', 'Handmade', 'Decor'].indexOf(p.badge) < 0 ? '<option selected>' + esc(p.badge) + '</option>' : '') + '</select><small>Chỉ chọn "Mall" khi đúng là Shopee Mall</small></label></div>' +
      '<div class="row" style="align-items:flex-start"><div class="prev" id="pv"></div><div class="grow" style="display:grid;gap:8px"><label class="f">Link ảnh sản phẩm<small>Chuột phải vào ảnh trên Shopee › Sao chép địa chỉ hình ảnh</small><input type="url" name="img" value="' + esc(p.img) + '" placeholder="https://..."></label>' +
      '<label class="f">Biểu tượng khi chưa có ảnh<input type="text" name="emoji" value="' + esc(p.emoji) + '" maxlength="4" style="max-width:90px"></label></div></div>' +
      '<div class="grid2"><label class="f">Hoa hồng (ghi chú riêng)<small>khách không thấy</small><input type="text" name="commission" value="' + esc(p.commission) + '"></label>' +
      '<label class="tog" style="font-size:15px;align-self:end;min-height:44px"><input type="checkbox" name="stock"' + (p.stock ? ' checked' : '') + '> Còn hàng</label></div>' +
      '<p class="err" id="perr"></p><div class="row"><button type="button" class="btn ghost" id="mc">Huỷ</button><button class="btn ok grow">' + (isNew ? 'Thêm vào danh sách' : 'Cập nhật') + '</button></div></form>';
    openModal();
    var f = $('#pf');
    var pv = function () { var img = f.img.value.trim(); $('#pv').innerHTML = isUrl(img) ? '<img src="' + esc(img) + '" alt="" onerror="this.parentNode.textContent=\'⚠️\'">' : esc(f.emoji.value || '🛍️'); };
    pv(); f.img.addEventListener('input', pv); f.emoji.addEventListener('input', pv);
    f.shopId.addEventListener('change', function () { p.cat = ''; f.cat.innerHTML = catOpts(f.shopId.value); });
    $('#mx').addEventListener('click', closeModal); $('#mc').addEventListener('click', closeModal);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var g = function (n) { return f[n].value.trim(); }, err = '';
      if (!g('name')) err = 'Nhập tên sản phẩm.'; else if (!isUrl(g('affLink'))) err = 'Link affiliate phải bắt đầu bằng https://'; else if (!g('priceVnd')) err = 'Nhập giá bán.'; else if (g('img') && !isUrl(g('img'))) err = 'Link ảnh phải bắt đầu bằng https://';
      if (err) { $('#perr').textContent = err; return; }
      var saving = g('saving');
      if (!saving && g('oldPrice')) { var a = vnd(g('priceVnd')), b = vnd(g('oldPrice')); if (a && b && b > a) saving = '-' + Math.round((1 - a / b) * 100) + '%'; }
      var o = { id: p.id, shopId: g('shopId'), cat: g('cat'), name: g('name'), emoji: g('emoji') || '🛍️', img: g('img'), priceVnd: g('priceVnd'), oldPrice: g('oldPrice'), saving: saving, rating: Number(g('rating')) || 0, badge: g('badge'), stock: f.stock.checked, affLink: g('affLink'), brand: g('brand'), commission: g('commission') };
      if (isNew) S.products.unshift(o); else S.products[S.products.indexOf(p)] = o;
      S.dirtyP = true; closeModal(); render(); toast(isNew ? 'Đã thêm. Nhớ bấm "Lưu lên web".' : 'Đã cập nhật. Nhớ bấm "Lưu lên web".');
    });
  }
  function vnd(s) { s = String(s).toLowerCase().replace(/\s/g, '').replace(',', '.'); var n = parseFloat(s); if (isNaN(n)) return 0; if (s.indexOf('tr') >= 0) return n * 1e6; if (s.indexOf('k') >= 0) return n * 1e3; return n > 1000 ? n : n * 1e3; }

  /* ---------- mã giảm giá ---------- */
  function vouchers() {
    var pane = $('#pane');
    var seed = !S.vouchers.length ? '<div class="card"><h2>Chưa có mã trong Google Sheet</h2><p class="muted">Web đang hiện các mã mẫu từ <code>data.js</code>.</p><button class="btn pri" id="vseed">Chép mã mẫu đang có</button></div>' : '';
    pane.innerHTML = seed + '<div class="row" style="margin-top:8px"><span class="grow muted small">Mã hiện ở đầu phố, trong từng shop, khung sản phẩm và giỏ hàng.</span><button class="btn pri" id="vadd">+ Thêm mã</button></div>' +
      '<div class="items">' + S.vouchers.map(function (v) {
        return '<div class="it"><div class="th">🎟️</div><div class="bd"><b>' + esc(v.title) + (v.sample ? ' <span class="warn small">(mã mẫu)</span>' : '') + '</b><span>' + esc(v.shopId === 'all' ? 'Mọi shop' : ((shopById(v.shopId) || {}).name || v.shopId)) + ' · ' + esc(v.cond) + (v.code ? ' · mã ' + esc(v.code) : '') + '</span></div>' +
          '<div class="acts"><button class="ic" data-vedit="' + esc(v.id) + '" aria-label="Sửa">✏️</button><button class="ic" data-vdel="' + esc(v.id) + '" aria-label="Xoá">🗑️</button></div></div>';
      }).join('') + '</div>' + saveBar('V');
    if ($('#vseed')) $('#vseed').addEventListener('click', function () { S.vouchers = (window.PNM_VOUCHERS || []).map(function (v) { return Object.assign({}, v); }); S.dirtyV = true; render(); });
    $('#vadd').addEventListener('click', function () { editVoucher(null); });
    pane.querySelectorAll('[data-vedit]').forEach(function (b) { b.addEventListener('click', function () { editVoucher(S.vouchers.filter(function (v) { return v.id === b.getAttribute('data-vedit'); })[0]); }); });
    pane.querySelectorAll('[data-vdel]').forEach(function (b) { b.addEventListener('click', function () { var v = S.vouchers.filter(function (x) { return x.id === b.getAttribute('data-vdel'); })[0]; if (window.confirm('Xoá mã "' + v.title + '"?')) { S.vouchers = S.vouchers.filter(function (x) { return x !== v; }); S.dirtyV = true; render(); } }); });
    bindSave('V');
  }
  function editVoucher(v) {
    var isNew = !v; v = v || { id: newId(S.vouchers, 'v'), shopId: 'all', title: '', cond: '', code: '', url: '', sample: false };
    sheetEl.innerHTML = '<div class="row"><h3 class="grow">' + (isNew ? 'Thêm mã giảm giá' : 'Sửa mã giảm giá') + '</h3><button class="ic" id="mx" aria-label="Đóng">✕</button></div><form id="vf" novalidate>' +
      '<label class="f">Tên mã *<small>vd: Giảm 50k, Freeship Xtra</small><input type="text" name="title" value="' + esc(v.title) + '" required maxlength="40"></label>' +
      '<label class="f">Điều kiện<small>vd: Đơn từ 500k, tối đa 30k</small><input type="text" name="cond" value="' + esc(v.cond) + '" maxlength="80"></label>' +
      '<label class="f">Áp dụng cho<select name="shopId"><option value="all">Mọi shop</option>' + SHOPS.map(function (s) { return '<option value="' + s.id + '"' + (v.shopId === s.id ? ' selected' : '') + '>' + s.icon + ' ' + esc(s.name) + '</option>'; }).join('') + '</select></label>' +
      '<div class="grid2"><label class="f">Mã (nếu có)<small>khách bấm "Chép mã"</small><input type="text" name="code" value="' + esc(v.code) + '"></label>' +
      '<label class="f">Link lấy mã<small>bắt đầu bằng https://</small><input type="url" name="url" value="' + esc(v.url) + '"></label></div>' +
      '<label class="tog" style="font-size:15px"><input type="checkbox" name="sample"' + (v.sample ? ' checked' : '') + '> Đây là mã mẫu (hiện chữ "Mã mẫu")</label>' +
      '<p class="err" id="verr"></p><div class="row"><button type="button" class="btn ghost" id="mc">Huỷ</button><button class="btn ok grow">' + (isNew ? 'Thêm' : 'Cập nhật') + '</button></div></form>';
    openModal();
    $('#vf').querySelector('[name=shopId]').value = v.shopId;
    $('#mx').addEventListener('click', closeModal); $('#mc').addEventListener('click', closeModal);
    $('#vf').addEventListener('submit', function (e) {
      e.preventDefault(); var f = e.target, g = function (n) { return f[n].value.trim(); };
      if (!g('title')) { $('#verr').textContent = 'Nhập tên mã.'; return; }
      if (!g('code') && !isUrl(g('url'))) { $('#verr').textContent = 'Cần mã hoặc link lấy mã (https://).'; return; }
      if (g('url') && !isUrl(g('url'))) { $('#verr').textContent = 'Link phải bắt đầu bằng https://'; return; }
      var o = { id: v.id, shopId: g('shopId'), title: g('title'), cond: g('cond'), code: g('code'), url: g('url') || 'https://shopee.vn', sample: f.sample.checked };
      if (isNew) S.vouchers.unshift(o); else S.vouchers[S.vouchers.indexOf(v)] = o;
      S.dirtyV = true; closeModal(); render();
    });
  }

  /* ---------- lưu ---------- */
  function saveBar(t) { var dirty = t === 'P' ? S.dirtyP : S.dirtyV; return '<div class="savebar"><span>' + (dirty ? '● Có thay đổi chưa lưu' : '✓ Đã lưu trên web') + '</span><button class="btn ' + (dirty ? 'pri' : '') + '" id="save' + t + '"' + (dirty ? '' : ' disabled') + '>Lưu lên web</button></div>'; }
  function bindSave(t) {
    var b = $('#save' + t); if (!b) return;
    b.addEventListener('click', function () {
      b.disabled = true; b.textContent = 'Đang lưu…';
      post({ action: t === 'P' ? 'saveProducts' : 'saveVouchers', key: KEY, items: t === 'P' ? S.products : S.vouchers }).then(function (r) {
        if (r && r.ok) { if (t === 'P') S.dirtyP = false; else S.dirtyV = false; render(); toast('Đã lưu ' + r.count + (t === 'P' ? ' sản phẩm' : ' mã') + '. Web cập nhật trong vài phút.'); }
        else { b.disabled = false; b.textContent = 'Lưu lên web'; toast((r && r.error) || 'Lưu không thành công'); if (r && r.error === 'Sai mật khẩu') { setKey(''); showLogin('Phiên đăng nhập hết hạn, đăng nhập lại.'); } }
      }).catch(function () { b.disabled = false; b.textContent = 'Lưu lên web'; toast('Không kết nối được Google Sheet, thử lại.'); });
    });
  }

  function openModal() { modal.classList.add('on'); document.body.style.overflow = 'hidden'; var i = sheetEl.querySelector('input'); if (i) setTimeout(function () { i.focus(); }, 50); }
  function closeModal() { modal.classList.remove('on'); document.body.style.overflow = ''; }
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  if (getKey()) start(); else showLogin();
})();
