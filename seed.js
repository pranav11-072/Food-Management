const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

(async () => {
    const db = await open({ filename: './food_system.db', driver: sqlite3.Database });

    const menuItems = [
        ['Paneer Butter Masala', 250, 'https://example.com/paneer.jpg'],
        ['Chicken Biryani', 320, 'https://example.com/biryani.jpg'],
        ['Masala Dosa', 120, 'https://example.com/dosa.jpg'],
        ['Butter Naan', 40, 'https://example.com/naan.jpg'],
        ['Dal Makhani', 180, 'https://example.com/dal.jpg'],
        ['Gulab Jamun (2pcs)', 60, 'https://example.com/gulab.jpg'],
        ['Mango Lassi', 90, 'https://example.com/lassi.jpg'],
        ['Veg Hakka Noodles', 210, 'https://example.com/noodles.jpg']
    ];

    console.log("Cleaning old menu...");
    await db.run('DELETE FROM menu');

    console.log("Adding Indian Menu items...");
    for (const [name, price, img] of menuItems) {
        await db.run('INSERT INTO menu (name, price, image) VALUES (?, ?, ?)', [name, price, img]);
    }

    console.log("Menu Updated Successfully!");
    process.exit();
})();
