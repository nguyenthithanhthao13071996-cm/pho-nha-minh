/* ===== DỮ LIỆU SẢN PHẨM & MÃ GIẢM GIÁ =====
   Sửa bằng Notepad, lưu lại rồi kéo thả thư mục website lên Netlify lần nữa.
   Mỗi sản phẩm:
     id       : mã riêng, không trùng (p1, p2, ...)
     shopId   : sieu-thi | chua | tien-loi | decor | me-be
     cat      : nhóm trong shop
                 sieu-thi: airfryer, vacuum, blender, cookware
                 chua: incense, feng, lantern
                 tien-loi: drink, snack, noodle
                 decor: light, mirror, plant
                 me-be: milk, diaper, stroller
     name, priceVnd ('1.29tr' hoặc '890k'), oldPrice, saving ('-32%'), rating
     badge    : 'Mall' chỉ khi đúng là Shopee Mall
     stock    : true còn hàng / false hết hàng
     affLink  : LINK AFFILIATE SHOPEE CỦA BẠN (bắt buộc thay)
     img      : (tuỳ chọn) link ảnh sản phẩm; để trống thì hiện emoji
     commission: chỉ để bạn ghi nhớ, khách không thấy
*/
window.PNM_PRODUCTS = [
  { id: 'p1', shopId: 'sieu-thi', cat: 'airfryer', name: 'Nồi chiên không dầu 5.5L Philips', emoji: '🍟', priceVnd: '1.29tr', oldPrice: '1.89tr', saving: '-32%', rating: 4.9, badge: 'Mall', stock: true, affLink: 'https://shopee.vn', brand: 'Philips', commission: '12%' },
  { id: 'p2', shopId: 'sieu-thi', cat: 'vacuum', name: 'Máy hút bụi cầm tay không dây Deerma', emoji: '🧹', priceVnd: '890k', oldPrice: '1.49tr', saving: '-40%', rating: 4.8, badge: 'Mall', stock: true, affLink: 'https://shopee.vn', brand: 'Deerma', commission: '15%' },
  { id: 'p3', shopId: 'sieu-thi', cat: 'cookware', name: 'Bộ nồi inox 5 đáy Elmich', emoji: '🍳', priceVnd: '1.59tr', oldPrice: '2.2tr', saving: '-28%', rating: 4.9, badge: 'Mall', stock: true, affLink: 'https://shopee.vn', brand: 'Elmich', commission: '10%' },
  { id: 'p4', shopId: 'sieu-thi', cat: 'blender', name: 'Máy xay sinh tố Sunhouse', emoji: '🥤', priceVnd: '450k', oldPrice: '650k', saving: '-31%', rating: 4.7, badge: 'Mall', stock: false, affLink: 'https://shopee.vn', brand: 'Sunhouse', commission: '12%' },
  { id: 'p5', shopId: 'chua', cat: 'incense', name: 'Nhang trầm cao cấp 100 cây', emoji: '🕯️', priceVnd: '180k', oldPrice: '240k', saving: '-25%', rating: 5.0, badge: 'Bán chạy', stock: true, affLink: 'https://shopee.vn', brand: 'An Nhiên', commission: '18%' },
  { id: 'p6', shopId: 'chua', cat: 'feng', name: 'Chuỗi hạt gỗ đàn hương', emoji: '📿', priceVnd: '250k', oldPrice: '350k', saving: '-29%', rating: 4.9, badge: 'Handmade', stock: true, affLink: 'https://shopee.vn', brand: 'Handmade', commission: '20%' },
  { id: 'p7', shopId: 'chua', cat: 'lantern', name: 'Đèn lồng đỏ đôi may mắn', emoji: '🏮', priceVnd: '120k', oldPrice: '180k', saving: '-33%', rating: 4.8, badge: 'Tết', stock: true, affLink: 'https://shopee.vn', brand: 'An Nhiên', commission: '15%' },
  { id: 'p8', shopId: 'tien-loi', cat: 'snack', name: 'Combo snack rong biển 10 gói', emoji: '🍿', priceVnd: '99k', oldPrice: '149k', saving: '-34%', rating: 4.7, badge: 'Hot', stock: true, affLink: 'https://shopee.vn', brand: 'Oishi', commission: '10%' },
  { id: 'p9', shopId: 'tien-loi', cat: 'drink', name: 'Cà phê sữa đá pack 6 lon', emoji: '☕', priceVnd: '65k', oldPrice: '89k', saving: '-27%', rating: 4.8, badge: '24h', stock: true, affLink: 'https://shopee.vn', brand: 'Nescafe', commission: '12%' },
  { id: 'p10', shopId: 'tien-loi', cat: 'noodle', name: 'Mì trộn siêu cay Samyang', emoji: '🍜', priceVnd: '35k', oldPrice: '45k', saving: '-22%', rating: 4.6, badge: 'Hot', stock: true, affLink: 'https://shopee.vn', brand: 'Samyang', commission: '8%' },
  { id: 'p11', shopId: 'decor', cat: 'light', name: 'Đèn bàn gỗ minimal scandi', emoji: '💡', priceVnd: '320k', oldPrice: '450k', saving: '-29%', rating: 4.9, badge: 'Decor', stock: true, affLink: 'https://shopee.vn', brand: 'Nhà Xinh', commission: '14%' },
  { id: 'p12', shopId: 'decor', cat: 'mirror', name: 'Gương mây tre đan 60cm', emoji: '🪞', priceVnd: '550k', oldPrice: '780k', saving: '-30%', rating: 4.8, badge: 'Xinh', stock: true, affLink: 'https://shopee.vn', brand: 'Nhà Xinh', commission: '16%' },
  { id: 'p13', shopId: 'decor', cat: 'plant', name: 'Cây monstera giả decor', emoji: '🌿', priceVnd: '180k', oldPrice: '260k', saving: '-31%', rating: 4.7, badge: 'Decor', stock: true, affLink: 'https://shopee.vn', brand: 'Nhà Xinh', commission: '12%' },
  { id: 'p14', shopId: 'me-be', cat: 'milk', name: 'Sữa Meiji 0-1 tuổi 800g', emoji: '🍼', priceVnd: '520k', oldPrice: '590k', saving: '-12%', rating: 5.0, badge: 'Mall', stock: true, affLink: 'https://shopee.vn', brand: 'Meiji', commission: '10%' },
  { id: 'p15', shopId: 'me-be', cat: 'diaper', name: 'Bỉm Moony size M 64 miếng', emoji: '👶', priceVnd: '310k', oldPrice: '380k', saving: '-18%', rating: 4.9, badge: 'Mall', stock: true, affLink: 'https://shopee.vn', brand: 'Moony', commission: '11%' },
  { id: 'p16', shopId: 'me-be', cat: 'stroller', name: 'Xe đẩy gấp gọn Vovo', emoji: '🚼', priceVnd: '2.1tr', oldPrice: '2.8tr', saving: '-25%', rating: 4.8, badge: 'Mall', stock: true, affLink: 'https://shopee.vn', brand: 'Vovo', commission: '13%' },
];

/* Mã giảm giá. shopId: tên shop ở trên, hoặc 'all' cho mọi shop.
   code: (tuỳ chọn) mã để khách bấm "Chép mã". url: link lấy mã.
   sample: true sẽ hiện chữ "Mã mẫu" — xoá dòng này khi đã là mã thật. */
window.PNM_VOUCHERS = [
  { id: 'v1', shopId: 'sieu-thi', title: 'Giảm 50k', cond: 'Đơn gia dụng từ 500k', url: 'https://shopee.vn', sample: true },
  { id: 'v2', shopId: 'sieu-thi', title: 'Freeship Xtra', cond: 'Đơn từ 0đ, tối đa 30k', url: 'https://shopee.vn', sample: true },
  { id: 'v3', shopId: 'me-be', title: 'Giảm 8%', cond: 'Sữa & bỉm, tối đa 60k', url: 'https://shopee.vn', sample: true },
  { id: 'v4', shopId: 'all', title: 'Hoàn xu 10%', cond: 'Mọi shop, tối đa 20k', url: 'https://shopee.vn', sample: true },
];
