# Hà Trọng Vũ — Portfolio

> Senior Java Backend Developer · Spring Boot · System Design
> Portfolio song ngữ (VI/EN), tĩnh, không framework, dữ liệu tách rời trong `data/data.json`.

🔗 **Live:** https://hatrongvu13.github.io/

![HTML](https://img.shields.io/badge/HTML5-orange) ![CSS](https://img.shields.io/badge/CSS3-blue) ![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-yellow) ![License](https://img.shields.io/badge/license-MIT-green)

## Tính năng

- **Data-driven**: toàn bộ nội dung nằm trong `data/data.json` — sửa hồ sơ không cần đụng code.
- **Song ngữ VI/EN**: chuyển ngôn ngữ tức thời (`js/i18n.js`), giá trị `{ "vi": ..., "en": ... }`.
- **CV động**: nút *Tải CV* dựng CV từ `data.json` rồi in ra PDF (không cần file PDF tĩnh). Cấu hình ở `settings.cv`.
- **Dark / Light + theme preset**: lưu vào `localStorage`.
- **Chuyển động GSAP tùy chỉnh**: `js/animations.js`, bật/tắt & chọn preset ở `settings.motion`; tôn trọng `prefers-reduced-motion`.
- **Liên hệ qua GitHub Issue (miễn phí, không backend)**: form mở sẵn trang *New Issue* với nội dung điền sẵn.
- **SEO/PWA**: Open Graph, Twitter Card, JSON-LD `Person`, `sitemap.xml`, `robots.txt`, web manifest.

## Cấu trúc

```
.
├── index.html              # Layout + các section rỗng, nội dung nạp từ JSON
├── data/data.json          # Nguồn dữ liệu duy nhất (single source of truth)
├── css/                    # theme (tokens) · layout · components · cv
├── js/
│   ├── i18n.js             # Engine đa ngôn ngữ
│   ├── renderer.js         # Nạp + validate + render data.json
│   ├── roadmap.js          # Roadmap & career matrix
│   ├── cv.js               # Dựng & in CV động
│   ├── github.js           # Tạo URL GitHub Issue
│   ├── contact.js          # Form liên hệ + chống spam
│   ├── animations.js       # Lớp chuyển động GSAP (progressive enhancement)
│   └── app.js              # Bootstrap: theme, nav, scroll
└── assets/                 # avatar (png + webp), favicon
```

## Chạy local

```bash
# cần chạy qua HTTP server vì dùng fetch() cho data.json
python3 -m http.server 8000 --bind 127.0.0.1
# mở http://127.0.0.1:8000
```

## Cập nhật nội dung

Sửa `data/data.json`:

| Mục | Khóa |
|-----|------|
| Thông tin cá nhân | `personal` |
| Kinh nghiệm | `experience[]` |
| Dự án | `projects[]` — `visibility: "public" \| "private"` |
| Kỹ năng | `skills[]` |
| Roadmap | `roadmap[]`, `capabilities[]` |
| CV | `settings.cv` |
| Chuyển động | `settings.motion` |
| Liên hệ | `contact.github` |

**Dự án ẩn/hiện:** đặt `"visibility": "private"` và để trống `source` → nút mã nguồn tự ẩn, thay bằng badge *Private* và ghi chú. `"visibility": "public"` + `source` là URL repo → hiện nút *Mã nguồn*.

## Liên hệ qua GitHub Issue

`contact.github.mode = "issue-url"` (mặc định): khi khách gửi form, một trang *New Issue* của repo `contact.github.repository` mở ra với title/body điền sẵn. Khách bấm **Submit new issue** → issue xuất hiện trong tab **Issues** của repo. Hoàn toàn miễn phí, không cần server hay token.

## License

[MIT](./LICENSE) © Hà Trọng Vũ
