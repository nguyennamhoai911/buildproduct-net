import { db } from "../db";
import { inspirations } from "../db/schema";

const data = [
  // Doanh nghiệp Việt Nam
  { name: "Sun Group", website: "sungroup.com.vn", category: "Product", style: "Giao diện giàu cảm xúc, hiệu ứng scroll mượt mà", field: "Du lịch & Bất động sản", rating: "4", country: "Việt Nam" },
  { name: "Petrolimex", website: "www.petrolimex.com.vn", category: "Product", style: "", field: "Dầu khí", rating: "4", country: "Việt Nam" },
  { name: "Vinamilk", website: "www.vinamilk.com.vn", category: "Product", style: "Thân thiện, màu sắc tươi sáng, tương tác người dùng tốt", field: "Thực phẩm & Sữa", rating: "3", country: "Việt Nam" },
  { name: "Vingroup", website: "vingroup.net", category: "Product", style: "Hiện đại, hình ảnh tràn viền, video background ấn tượng", field: "Tập đoàn đa ngành", rating: "2", country: "Việt Nam" },
  { name: "FPT Corporation", website: "fpt.com.vn", category: "Product", style: "Đậm chất công nghệ, bố cục thẻ (card-based) khoa học", field: "Công nghệ & Viễn thông", rating: "2", country: "Việt Nam" },
  { name: "Novaland", website: "www.novaland.com.vn", category: "Product", style: "Sang trọng, tập trung vào hình ảnh bất động sản chất lượng cao", field: "Bất động sản", rating: "1", country: "Việt Nam" },
  { name: "Masan Group", website: "masangroup.com", category: "Product", style: "Tối giản (Minimalism), tập trung vào các mảng kinh doanh cốt lõi", field: "Tiêu dùng & Bán lẻ", rating: "", country: "Việt Nam" },
  { name: "Vietjet Air", website: "vietjetair.com", category: "Product", style: "Giao diện booking tiện lợi, tối ưu hóa di động xuất sắc", field: "Vận tải hàng không", rating: "", country: "Việt Nam" },
  { name: "Hòa Phát", website: "hoaphat.com.vn", category: "Product", style: "Cấu trúc truyền thống nhưng cực kỳ vững chãi và rõ ràng", field: "Công nghiệp & Thép", rating: "", country: "Việt Nam" },
  { name: "Viettel", website: "viettel.vn", category: "Product", style: "Hiện đại, sử dụng tốt các yếu tố đồ họa vector và icon", field: "Công nghệ & Viễn thông", rating: "", country: "Việt Nam" },
  { name: "Trung Nguyên Legend", website: "trungnguyenlegend.com", category: "Product", style: "Giao diện mang đậm bản sắc văn hóa và tính nghệ thuật", field: "F&B / Cà phê", rating: "", country: "Việt Nam" },
  { name: "Thế Giới Di Động", website: "thegioididong.com", category: "Product", style: "Tối ưu trải nghiệm mua sắm (E-commerce UI), bố cục rõ ràng", field: "Bán lẻ thiết bị số", rating: "", country: "Việt Nam" },
  { name: "PNJ", website: "pnj.com.vn", category: "Product", style: "Sang trọng, tập trung vào độ chi tiết của sản phẩm", field: "Trang sức", rating: "", country: "Việt Nam" },
  { name: "Vinpearl", website: "vinpearl.com", category: "Product", style: "Lifestyle, hình ảnh nghỉ dưỡng cao cấp, màu sắc trang nhã", field: "Nghỉ dưỡng", rating: "", country: "Việt Nam" },
  { name: "Highlands Coffee", website: "highlandscoffee.com.vn", category: "Product", style: "Hiện đại, trẻ trung, sử dụng tone màu đỏ thương hiệu mạnh mẽ", field: "F&B", rating: "", country: "Việt Nam" },
  { name: "The Coffee House", website: "thecoffeehouse.com", category: "Product", style: "Kể chuyện (Storytelling), typography đẹp, thân thiện", field: "F&B", rating: "", country: "Việt Nam" },
  { name: "Tiki", website: "tiki.vn", category: "Product", style: "Giao diện TMĐT hiện đại, tập trung vào tìm kiếm và lọc", field: "Thương mại điện tử", rating: "", country: "Việt Nam" },
  { name: "Shopee Vietnam", website: "shopee.vn", category: "Product", style: "Năng động, nhiều thành phần tương tác (Gamification)", field: "Thương mại điện tử", rating: "", country: "Việt Nam" },
  { name: "MoMo", website: "momo.vn", category: "Product", style: "App-like interface, sử dụng nhiều icon và màu sắc vui tươi", field: "Fintech", rating: "", country: "Việt Nam" },
  { name: "Zalo Pay", website: "zalopay.vn", category: "Product", style: "Flat design (thiết kế phẳng), tập trung vào sự tinh gọn", field: "Ví điện tử", rating: "", country: "Việt Nam" },
  
  // Nguồn Cảm Hứng (Global)
  { name: "Pinterest", website: "pinterest.com", category: "Source", style: "Ideas, Moodboard, Inspiration", field: "Graphic, UI/UX", rating: "5", country: "Global" },
  { name: "Behance", website: "behance.net", category: "Source", style: "Portfolio, UI/UX, Branding", field: "Graphic, UI/UX", rating: "5", country: "Global" },
  { name: "Webdesignclip", website: "sp.webdesignclip.com", category: "Source", style: "", field: "UI/UX", rating: "4", country: "Japan" },
  { name: "Responsive JP", website: "responsive-jp.com", category: "Source", style: "Web responsive Nhật", field: "UI/UX", rating: "4", country: "Japan" },
  { name: "Huaban", website: "huaban.com", category: "Source", style: "Pinterest bản Trung", field: "Graphic, UI/UX", rating: "5", country: "China" },
  { name: "Zcool", website: "zcool.com.cn", category: "Source", style: "Thiết kế sáng tạo, nhiều phong cách", field: "Graphic, UI/UX", rating: "5", country: "China" },
  { name: "Notefolio", website: "notefolio.net", category: "Source", style: "Portfolio Hàn", field: "Graphic, UI/UX", rating: "5", country: "Korea" },
  { name: "Dribbble", website: "dribbble.com", category: "Source", style: "Showcase UI/UX, animation, web & app design", field: "UI/UX, Animation, Web Design", rating: "5", country: "Global" },
  { name: "Awwwards", website: "awwwards.com", category: "Source", style: "Nơi tôn vinh các website đẹp và sáng tạo", field: "Web Design, Animation, Concept", rating: "5", country: "Global" },
  { name: "Muzli", website: "muz.li", category: "Source", style: "Cập nhật ý tưởng thiết kế từ nhiều nguồn khác nhau", field: "Inspiration, Feed, UI", rating: "5", country: "Global" },
  { name: "Landbook", website: "land-book.com", category: "Source", style: "Bộ sưu tập các landing page ấn tượng", field: "Landing Page, Web Design", rating: "5", country: "Global" },
  { name: "Mobbin", website: "mobbin.com", category: "Source", style: "Giao diện thực tế của các app nổi tiếng", field: "UX/UI, iOS/Android Patterns", rating: "5", country: "Global" },
  { name: "Lapa Ninja", website: "lapa.ninja", category: "Source", style: "Hơn 5000+ landing page chất lượng cao", field: "UI, Landing Page, Gallery", rating: "5", country: "Global" },
  { name: "Designsystems", website: "designsystems.com/open-design-systems/", category: "Source", style: "Tham khảo các design system nổi tiếng", field: "Variables, Design system", rating: "5", country: "Global" }
];

async function seed() {
  console.log("Seeding inspirations...");
  try {
    // Check if data already exists to avoid duplicates
    const existing = await db.select().from(inspirations).limit(1);
    if (existing.length > 0) {
        console.log("Data seed skipped (data already exists)");
        process.exit(0);
    }

    // Bulk insert (split into chunks if necessary, but 100 items is fine for one go)
    await db.insert(inspirations).values(data.map(item => ({
        ...item,
        // Ensure default values are handled if needed, usually drizzle handles them
    })));
    
    console.log("Seeding complete!");
  } catch (error) {
    console.error("Error seeding:", error);
  } finally {
    process.exit(0);
  }
}

seed();
