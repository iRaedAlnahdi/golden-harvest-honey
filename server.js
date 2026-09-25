const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'demo-jwt-secret-do-not-use-in-production';

// --- Database helpers (JSON file-based for demo/portfolio) ---
const DB_DIR = path.join(__dirname, 'db');
const USERS_FILE = path.join(DB_DIR, 'users.json');
const CONTACTS_FILE = path.join(DB_DIR, 'contacts.json');
const PRODUCTS_FILE = path.join(DB_DIR, 'products.json');

// Ensure DB directory and initial files exist
function ensureDB() {
    if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (!fs.existsSync(PRODUCTS_FILE)) {
        const defaultProducts = [
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
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(defaultProducts, null, 2));
    }

    if (!fs.existsSync(USERS_FILE)) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync('admin123', salt);
        const defaultUsers = [
            {
                id: 1,
                name: 'Admin',
                email: 'admin@goldenharvest.com',
                password: hashedPassword,
                role: 'admin',
                created_at: new Date().toISOString()
            }
        ];
        fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
    }

    if (!fs.existsSync(CONTACTS_FILE)) {
        fs.writeFileSync(CONTACTS_FILE, JSON.stringify([], null, 2));
    }
}

ensureDB();

function readJSON(file) {
    try {
        if (!fs.existsSync(file)) return [];
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
        console.error(`Error reading ${file}:`, err.message);
        return [];
    }
}

function writeJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Auth middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
}

// ==========================================
//  API Routes
// ==========================================

// --- Register ---
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters.' });
        }

        const users = readJSON(USERS_FILE);

        // Check if email exists
        const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
            return res.status(400).json({ error: 'Email already registered.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: 'customer',
            created_at: new Date().toISOString()
        };

        users.push(newUser);
        writeJSON(USERS_FILE, users);

        // Generate token
        const token = jwt.sign(
            { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Account created successfully!',
            token,
            user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// --- Login ---
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const users = readJSON(USERS_FILE);
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful!',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// --- Get Profile (Protected) ---
app.get('/api/profile', authenticateToken, (req, res) => {
    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
        user: { id: user.id, name: user.name, email: user.email, role: user.role, created_at: user.created_at }
    });
});

// --- Get Products ---
app.get('/api/products', (req, res) => {
    const products = readJSON(PRODUCTS_FILE);
    res.json({ products });
});

// --- Submit Contact Form ---
app.post('/api/contact', (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const contacts = readJSON(CONTACTS_FILE);

        const newContact = {
            id: contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 1,
            name,
            email,
            message,
            created_at: new Date().toISOString(),
            read: false
        };

        contacts.push(newContact);
        writeJSON(CONTACTS_FILE, contacts);

        res.status(201).json({ message: 'Message sent successfully!' });
    } catch (err) {
        console.error('Contact error:', err);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// --- Get Contacts (Admin only) ---
app.get('/api/contacts', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required.' });
    }

    const contacts = readJSON(CONTACTS_FILE);
    res.json({ contacts: contacts.reverse() });
});

// --- Serve pages ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err.message);
    res.status(500).json({ error: 'Internal server error.' });
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log('');
    console.log('=================================');
    console.log('   Golden Harvest Honey Server');
    console.log('=================================');
    console.log(`Website:  http://localhost:${PORT}`);
    console.log(`Login:    http://localhost:${PORT}/login`);
    console.log(`API:      http://localhost:${PORT}/api`);
    console.log('=================================');
    console.log('');
});
