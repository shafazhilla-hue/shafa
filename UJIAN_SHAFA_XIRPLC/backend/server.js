
const express = require("express");
const cors = require("cors");
const pool = require("./db.js");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());


// ===============================
// HOME
// ===============================
app.get("/", (req, res) => {
    res.json({
        message: "Server Peminjaman Alat berjalan"
    });
});


// ===============================
// DATA ALAT
// ===============================

// GET semua alat
app.get("/api/alat", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                alat.id_alat,
                alat.id_kategori,
                kategori_alat.nama_kategori,
                alat.nama_alat,
                alat.stok,
                alat.lokasi
            FROM alat
            LEFT JOIN kategori_alat
            ON alat.id_kategori = kategori_alat.id_kategori
            ORDER BY alat.id_alat
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("GET alat:", error.message);

        res.status(500).json({
            message: "Gagal mengambil data alat",
            error: error.message
        });
    }
});


// POST tambah alat
app.post("/api/alat", async (req, res) => {
    const {
        id_kategori,
        nama_alat,
        stok,
        lokasi
    } = req.body;

    try {
        const result = await pool.query(
            `
            INSERT INTO alat
            (id_kategori, nama_alat, stok, lokasi)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `,
            [
                id_kategori,
                nama_alat,
                stok,
                lokasi
            ]
        );

        res.status(201).json({
            message: "Alat berhasil ditambahkan",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("POST alat:", error.message);

        res.status(500).json({
            message: "Gagal menambahkan alat",
            error: error.message
        });
    }
});


// PUT edit alat
app.put("/api/alat/:id", async (req, res) => {
    const id = Number(req.params.id);

    const {
        id_kategori,
        nama_alat,
        stok,
        lokasi
    } = req.body;

    if (Number.isNaN(id)) {
        return res.status(400).json({
            message: "ID alat tidak valid"
        });
    }

    try {
        const result = await pool.query(
            `
            UPDATE alat
            SET
                id_kategori = $1,
                nama_alat = $2,
                stok = $3,
                lokasi = $4
            WHERE id_alat = $5
            RETURNING *
            `,
            [
                id_kategori,
                nama_alat,
                stok,
                lokasi,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Alat tidak ditemukan"
            });
        }

        res.json({
            message: "Alat berhasil diperbarui",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("PUT alat:", error.message);

        res.status(500).json({
            message: "Gagal memperbarui alat",
            error: error.message
        });
    }
});


// DELETE alat
app.delete("/api/alat/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
        const result = await pool.query(
            `
            DELETE FROM alat
            WHERE id_alat = $1
            RETURNING *
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Alat tidak ditemukan"
            });
        }

        res.json({
            message: "Alat berhasil dihapus",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("DELETE alat:", error.message);

        res.status(500).json({
            message: "Gagal menghapus alat",
            error: error.message
        });
    }
});


// ===============================
// KATEGORI
// ===============================

// GET semua kategori
app.get("/api/kategori", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM kategori_alat ORDER BY id_kategori"
        );

        res.json(result.rows);

    } catch (error) {
        res.status(500).json({
            message: "Gagal mengambil kategori",
            error: error.message
        });
    }
});


// GET kategori berdasarkan ID
app.get("/api/kategori/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
        const result = await pool.query(
            "SELECT * FROM kategori_alat WHERE id_kategori = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Kategori tidak ditemukan"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        res.status(500).json({
            message: "Gagal mengambil kategori",
            error: error.message
        });
    }
});


// POST kategori
app.post("/api/kategori", async (req, res) => {
    const {
        nama_kategori,
        deskripsi
    } = req.body;

    try {
        const result = await pool.query(
            `
            INSERT INTO kategori_alat
            (nama_kategori, deskripsi)
            VALUES ($1, $2)
            RETURNING *
            `,
            [
                nama_kategori,
                deskripsi
            ]
        );

        res.status(201).json({
            message: "Kategori berhasil ditambahkan",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("POST kategori:", error.message);

        res.status(500).json({
            message: "Gagal menambahkan kategori",
            error: error.message
        });
    }
});


// PUT kategori
app.put("/api/kategori/:id", async (req, res) => {
    const id = Number(req.params.id);

    const {
        nama_kategori,
        deskripsi
    } = req.body;

    try {
        const result = await pool.query(
            `
            UPDATE kategori_alat
            SET
                nama_kategori = $1,
                deskripsi = $2
            WHERE id_kategori = $3
            RETURNING *
            `,
            [
                nama_kategori,
                deskripsi,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Kategori tidak ditemukan"
            });
        }

        res.json({
            message: "Kategori berhasil diperbarui",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("PUT kategori:", error.message);

        res.status(500).json({
            message: "Gagal memperbarui kategori",
            error: error.message
        });
    }
});


// DELETE kategori
app.delete("/api/kategori/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
        const result = await pool.query(
            `
            DELETE FROM kategori_alat
            WHERE id_kategori = $1
            RETURNING *
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Kategori tidak ditemukan"
            });
        }

        return res.json({
            message: "Kategori berhasil dihapus",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("DELETE kategori:", error.code, error.message);

        if (error.code === "23503") {
            return res.status(400).json({
                message: "Kategori tidak bisa dihapus karena masih digunakan oleh data alat."
            });
        }

        return res.status(500).json({
            message: "Gagal menghapus kategori",
            error: error.message
        });
    }
});


// ===============================
// PEMINJAMAN
// ===============================

// GET peminjaman
app.get("/api/peminjaman", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                peminjaman.*,
                alat.nama_alat
            FROM peminjaman
            LEFT JOIN alat
            ON peminjaman.id_alat = alat.id_alat
            ORDER BY id_peminjaman
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("GET peminjaman:", error.message);

        res.status(500).json({
            message: "Gagal mengambil data peminjaman",
            error: error.message
        });
    }
});


// GET peminjaman berdasarkan ID
app.get("/api/peminjaman/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
        const result = await pool.query(`
            SELECT
                peminjaman.*,
                alat.nama_alat
            FROM peminjaman
            LEFT JOIN alat
            ON peminjaman.id_alat = alat.id_alat
            WHERE peminjaman.id_peminjaman = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Peminjaman tidak ditemukan"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        res.status(500).json({
            message: "Gagal mengambil data peminjaman",
            error: error.message
        });
    }
});


// POST peminjaman
app.post("/api/peminjaman", async (req, res) => {
    const {
        id_alat,
        nama_peminjam,
        kelas,
        tanggal_pinjam,
        tanggal_kembali,
        jumlah,
        status
    } = req.body;

    try {
        const result = await pool.query(
            `
            INSERT INTO peminjaman
            (
                id_alat,
                nama_peminjam,
                kelas,
                tanggal_pinjam,
                tanggal_kembali,
                jumlah,
                status
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            RETURNING *
            `,
            [
                id_alat,
                nama_peminjam,
                kelas,
                tanggal_pinjam,
                tanggal_kembali,
                jumlah,
                status || "Dipinjam"
            ]
        );

        res.status(201).json({
            message: "Peminjaman berhasil ditambahkan",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("POST peminjaman:", error.message);

        res.status(500).json({
            message: "Gagal menambahkan peminjaman",
            error: error.message
        });
    }
});


// PUT peminjaman
app.put("/api/peminjaman/:id", async (req, res) => {
    const id = Number(req.params.id);

    const {
        id_alat,
        nama_peminjam,
        kelas,
        tanggal_pinjam,
        tanggal_kembali,
        jumlah,
        status
    } = req.body;

    try {
        const result = await pool.query(
            `
            UPDATE peminjaman
            SET
                id_alat = $1,
                nama_peminjam = $2,
                kelas = $3,
                tanggal_pinjam = $4,
                tanggal_kembali = $5,
                jumlah = $6,
                status = $7
            WHERE id_peminjaman = $8
            RETURNING *
            `,
            [
                id_alat,
                nama_peminjam,
                kelas,
                tanggal_pinjam,
                tanggal_kembali,
                jumlah,
                status,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Peminjaman tidak ditemukan"
            });
        }

        res.json({
            message: "Peminjaman berhasil diperbarui",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("PUT peminjaman:", error.message);

        res.status(500).json({
            message: "Gagal memperbarui peminjaman",
            error: error.message
        });
    }
});


// DELETE peminjaman
app.delete("/api/peminjaman/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
        const result = await pool.query(
            `
            DELETE FROM peminjaman
            WHERE id_peminjaman = $1
            RETURNING *
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Peminjaman tidak ditemukan"
            });
        }

        res.json({
            message: "Peminjaman berhasil dihapus",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("DELETE peminjaman:", error.message);

        res.status(500).json({
            message: "Gagal menghapus peminjaman",
            error: error.message
        });
    }
});
// ===============================
// JALANKAN SERVER
// ===============================

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
