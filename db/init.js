const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_DIR = path.join(__dirname);
const USERS_FILE = path.join(DB_DIR, 'users.json');
const CONTACTS_FILE = path.join(DB_DIR, 'contacts.json');
const PRODUCTS_FILE = path.join(DB_DIR, 'products.json');

// Initial products data
const products = [
    {
        id: 1,
        name_en: "Raw Wildflower Honey",
        name_ar: "عسل الزهور البرية الخام",
        desc_en: "A rich blend from diverse wildflowers. Unprocessed and full of natural enzymes.",
        desc_ar: "مزيج غني من الزهور البرية المتنوعة. غير معالج ومليء بالإنزيمات الطبيعية.",
        weight: "500g",
        price: 12.99,
        image: "/images/wildflower-honey.jpg",
        badge_en: "Best Seller",
        badge_ar: "الأكثر مبيعاً",
        badge_class: ""
    },
    {
        id: 2,
        name_en: "Organic Acacia Honey",
        name_ar: "عسل السنط العضوي",
        desc_en: "Light, delicate, and slow to crystallize. Perfect for tea and desserts.",
        desc_ar: "خفيف ورقيق وبطيء التبلور. مثالي للشاي والحلويات.",
        weight: "500g",
        price: 15.99,
        image: "/images/acacia-honey.jpg",
        badge_en: "Organic",
        badge_ar: "عضوي",
        badge_class: "badge-green"
    },
    {
        id: 3,
        name_en: "Manuka Honey",
        name_ar: "عسل المانوكا",
        desc_en: "World-renowned for its unique properties. Rich, earthy flavor with powerful benefits.",
        desc_ar: "مشهور عالمياً بخصائصه الفريدة. نكهة غنية وترابية مع فوائد قوية.",
        weight: "250g",
        price: 29.99,
        image: "/images/manuka-honey.jpg",
        badge_en: "Premium",
        badge_ar: "فاخر",
        badge_class: "badge-gold"
    },
    {
        id: 4,
        name_en: "Honey Gift Box",
        name_ar: "صندوق هدايا العسل",
        desc_en: "A curated collection of our finest honeys. The perfect gift for any occasion.",
        desc_ar: "مجموعة منتقاة من أجود أنواع العسل لدينا. الهدية المثالية لأي مناسبة.",
        weight_en: "Assorted",
        weight_ar: "متنوع",
        price: 39.99,
        image: "/images/gift-box.jpg",
        badge_en: "Gift Set",
        badge_ar: "طقم هدية",
        badge_class: "badge-red"
    },
    {
        id: 5,
        name_en: "Honeycomb",
        name_ar: "شمع العسل",
        desc_en: "Pure honeycomb straight from the hive. A natural delicacy to savor.",
        desc_ar: "شمع عسل نقي مباشرة من الخلية. طعام طبيعي شهي للاستمتاع.",
        weight: "400g",
        price: 18.99,
        image: "/images/honeycomb.jpg",
        badge_en: "",
        badge_ar: "",
        badge_class: ""
    },
    {
        id: 6,
        name_en: "Lavender Infused Honey",
        name_ar: "عسل اللافندر",
        desc_en: "Delicately infused with French lavender. A floral, aromatic experience.",
        desc_ar: "ممزوج بعناية مع اللافندر الفرنسي. تجربة عطرية زهرية.",
        weight: "350g",
        price: 14.99,
        image: "/images/lavender-honey.jpg",
        badge_en: "New",
        badge_ar: "جديد",
        badge_class: "badge-purple"
    }
];

function initDB() {
    console.log('Initializing database...');

    // Create default admin user
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('admin123', salt);

    const users = [
        {
            id: 1,
            name: 'Admin',
            email: 'admin@goldenharvest.com',
            password: hashedPassword,
            role: 'admin',
            created_at: new Date().toISOString()
        }
    ];

    // Write files
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify([], null, 2));
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));

    console.log('Database initialized successfully!');
    console.log('Products:', products.length);
    console.log('Default admin: admin@goldenharvest.com / admin123');
}

initDB();
