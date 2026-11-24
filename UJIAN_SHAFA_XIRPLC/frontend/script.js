
// ==========================================
// KONFIGURASI API
// ==========================================

const API_ALAT = "http://localhost:3000/api/alat";
const API_KATEGORI = "http://localhost:3000/api/kategori";
const API_PEMINJAMAN = "http://localhost:3000/api/peminjaman";

const params = new URLSearchParams(window.location.search);
const editId = params.get("id");

// ==========================================
// FUNGSI BANTU
// ==========================================

function escapeHTML(value) {
    return String(value ?? "-").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

async function requestAPI(url, options = {}) {
    const response = await fetch(url, options);

    let hasil = {};
    try {
        hasil = await response.json();
    } catch (error) {
        hasil = {};
    }

    if (!response.ok) {
        throw new Error(
            hasil.message || hasil.error || `HTTP ${response.status}`
        );
    }

    return hasil;
}

// ==========================================
// DATA ALAT
// ==========================================

async function loadAlat() {
    const tabel = document.getElementById("tabelAlat");
    if (!tabel) return;

    tabel.innerHTML = `
        <tr>
            <td colspan="8" class="text-center py-6">
                Memuat data alat...
            </td>
        </tr>
    `;

    try {
        const [hasilAlat, hasilKategori] = await Promise.all([
            requestAPI(API_ALAT),
            requestAPI(API_KATEGORI)
        ]);

        const daftarAlat = Array.isArray(hasilAlat)
            ? hasilAlat
            : hasilAlat.data || [];

        const daftarKategori = Array.isArray(hasilKategori)
            ? hasilKategori
            : hasilKategori.data || [];

        if (daftarAlat.length === 0) {
            tabel.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-6">
                        Belum ada data alat.
                    </td>
                </tr>
            `;
            return;
        }

        tabel.innerHTML = daftarAlat.map((alat, index) => {
            const kategori = daftarKategori.find(
                k => Number(k.id_kategori) === Number(alat.id_kategori)
            );

            const namaKategori =
                alat.nama_kategori ||
                kategori?.nama_kategori ||
                "-";

            return `
                <tr class="hover:bg-blue-50">
                    <td class="px-5 py-4">${index + 1}</td>
                    <td class="px-5 py-4">${escapeHTML(alat.id_alat)}</td>
                    <td class="px-5 py-4 font-semibold">
                        ${escapeHTML(alat.nama_alat)}
                    </td>
                    <td class="px-5 py-4">
                        ${escapeHTML(namaKategori)}
                    </td>
                    <td class="px-5 py-4">-</td>
                    <td class="px-5 py-4">${escapeHTML(alat.stok)}</td>
                    <td class="px-5 py-4">
                        ${escapeHTML(alat.lokasi)}
                    </td>
                    <td class="px-5 py-4 whitespace-nowrap">
                        <button onclick="editAlat(${Number(alat.id_alat)})"
                            class="bg-yellow-500 text-white px-3 py-2 rounded-lg">
                            Edit
                        </button>

                        <button onclick="hapusAlat(${Number(alat.id_alat)})"
                            class="bg-red-500 text-white px-3 py-2 rounded-lg ml-1">
                            Hapus
                        </button>
                    </td>
                </tr>
            `;
        }).join("");

    } catch (error) {
        console.error(error);
        tabel.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-red-500 py-6">
                    Gagal mengambil data alat.
                </td>
            </tr>
        `;
    }
}

function editAlat(id) {
    window.location.href = `TambahAlat.html?id=${encodeURIComponent(id)}`;
}

async function hapusAlat(id) {
    if (!confirm("Yakin ingin menghapus alat ini?")) return;

    try {
        await requestAPI(`${API_ALAT}/${id}`, {
            method: "DELETE"
        });

        alert("Data alat berhasil dihapus!");
        loadAlat();

    } catch (error) {
        alert("Gagal menghapus alat: " + error.message);
    }
}

// ==========================================
// TAMBAH DAN EDIT ALAT
// ==========================================

async function loadKategoriAlat() {
    const select = document.getElementById("id_kategori");
    if (!select) return;

    try {
        const hasil = await requestAPI(API_KATEGORI);
        const daftar = Array.isArray(hasil) ? hasil : hasil.data || [];

        select.innerHTML = '<option value="">-- Pilih Kategori --</option>';

        daftar.forEach(kategori => {
            select.innerHTML += `
                <option value="${kategori.id_kategori}">
                    ${escapeHTML(kategori.nama_kategori)}
                </option>
            `;
        });

    } catch (error) {
        console.error(error);
        alert("Kategori gagal dimuat: " + error.message);
    }
}

async function loadEditAlat() {
    if (!editId || !document.getElementById("formTambah")) return;

    try {
        const hasil = await requestAPI(API_ALAT);
        const daftar = Array.isArray(hasil) ? hasil : hasil.data || [];

        const alat = daftar.find(
            item => String(item.id_alat) === String(editId)
        );

        if (!alat) throw new Error("Data alat tidak ditemukan.");

        document.getElementById("nama_alat").value = alat.nama_alat || "";
        document.getElementById("id_kategori").value = alat.id_kategori || "";
        document.getElementById("stok").value = alat.stok ?? "";
        document.getElementById("lokasi").value = alat.lokasi || "";

        const judul = document.getElementById("judul");
        const tombol = document.getElementById("btnSimpan");

        if (judul) judul.textContent = "Edit Alat";
        if (tombol) tombol.textContent = "Update";

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

async function simpanAlat(event) {
    event.preventDefault();

    const tombol = document.getElementById("btnSimpan");

    const payload = {
        nama_alat: document.getElementById("nama_alat").value.trim(),
        id_kategori: Number(document.getElementById("id_kategori").value),
        stok: Number(document.getElementById("stok").value),
        lokasi: document.getElementById("lokasi").value.trim()
    };

    if (!payload.nama_alat || !payload.id_kategori || !payload.lokasi) {
        alert("Semua data alat wajib diisi.");
        return;
    }

    if (
        document.getElementById("stok").value === "" ||
        !Number.isInteger(payload.stok) ||
        payload.stok < 0
    ) {
        alert("Stok harus berupa bilangan bulat minimal 0.");
        return;
    }

    try {
        tombol.disabled = true;
        tombol.textContent = "Menyimpan...";

        await requestAPI(
            editId ? `${API_ALAT}/${editId}` : API_ALAT,
            {
                method: editId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            }
        );

        alert(editId ? "Data alat berhasil diperbarui!" : "Alat berhasil ditambahkan!");
        window.location.href = "DataAlat.html";

    } catch (error) {
        alert("Gagal menyimpan alat: " + error.message);
        tombol.disabled = false;
        tombol.textContent = editId ? "Update" : "Simpan";
    }
}

// ==========================================
// DATA KATEGORI
// ==========================================

let daftarKategori = [];

async function loadKategori() {
    const tabel = document.getElementById("tabelKategori");
    if (!tabel) return;

    try {
        const hasil = await requestAPI(API_KATEGORI);
        daftarKategori = Array.isArray(hasil) ? hasil : hasil.data || [];

        tampilkanKategori();

    } catch (error) {
        console.error(error);
        tabel.innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-red-500 py-6">
                    Gagal memuat kategori.
                </td>
            </tr>
        `;
    }
}

function tampilkanKategori(data = daftarKategori) {
    const tabel = document.getElementById("tabelKategori");
    if (!tabel) return;

    if (data.length === 0) {
        tabel.innerHTML = `
            <tr>
                <td colspan="3" class="text-center py-6">
                    Belum ada kategori.
                </td>
            </tr>
        `;
        return;
    }

    tabel.innerHTML = data.map((item, index) => `
        <tr class="hover:bg-blue-50">
            <td class="border px-4 py-3">${index + 1}</td>
            <td class="border px-4 py-3">
                ${escapeHTML(item.nama_kategori)}
            </td>
            <td class="border px-4 py-3 text-center">
                <button onclick="editKategori(${Number(item.id_kategori)})"
                    class="bg-yellow-500 text-white px-4 py-2 rounded-lg">
                    Edit
                </button>

                <button onclick="hapusKategori(${Number(item.id_kategori)})"
                    class="bg-red-500 text-white px-4 py-2 rounded-lg">
                    Hapus
                </button>
            </td>
        </tr>
    `).join("");
}

async function tambahKategori() {
    const nama = prompt("Masukkan nama kategori:");
    if (nama === null) return;

    if (!nama.trim()) {
        alert("Nama kategori wajib diisi.");
        return;
    }

    try {
        await requestAPI(API_KATEGORI, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nama_kategori: nama.trim(),
                deskripsi: ""
            })
        });

        alert("Kategori berhasil ditambahkan!");
        loadKategori();

    } catch (error) {
        alert("Gagal menambah kategori: " + error.message);
    }
}

async function editKategori(id) {
    const item = daftarKategori.find(
        k => Number(k.id_kategori) === Number(id)
    );

    if (!item) return;

    const nama = prompt("Masukkan nama kategori baru:", item.nama_kategori);
    if (nama === null) return;

    if (!nama.trim()) {
        alert("Nama kategori tidak boleh kosong.");
        return;
    }

    try {
        await requestAPI(`${API_KATEGORI}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nama_kategori: nama.trim(),
                deskripsi: item.deskripsi || ""
            })
        });

        alert("Kategori berhasil diperbarui!");
        loadKategori();

    } catch (error) {
        alert("Gagal mengubah kategori: " + error.message);
    }
}

async function hapusKategori(id) {
    if (!confirm("Yakin ingin menghapus kategori ini?")) return;

    try {
        await requestAPI(`${API_KATEGORI}/${id}`, {
            method: "DELETE"
        });

        alert("Kategori berhasil dihapus!");
        loadKategori();

    } catch (error) {
        alert("Gagal menghapus kategori: " + error.message);
    }
}

function cariKategori() {
    const input = document.getElementById("searchKategori");
    if (!input) return;

    const keyword = input.value.toLowerCase();

    const hasil = daftarKategori.filter(item =>
        (item.nama_kategori || "").toLowerCase().includes(keyword)
    );

    tampilkanKategori(hasil);
}

// ==========================================
// DATA PEMINJAMAN
// ==========================================

async function loadPeminjaman() {
    const tabel = document.getElementById("tabelPeminjaman");
    if (!tabel) return;

    try {
        const hasil = await requestAPI(API_PEMINJAMAN);
        const daftar = Array.isArray(hasil) ? hasil : hasil.data || [];

        if (daftar.length === 0) {
            tabel.innerHTML = `
                <tr>
                    <td colspan="9" class="p-5 text-center">
                        Belum ada data peminjaman.
                    </td>
                </tr>
            `;
            return;
        }

        tabel.innerHTML = daftar.map(item => `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-3">${escapeHTML(item.id_peminjaman)}</td>
                <td class="p-3">${escapeHTML(item.nama_peminjam)}</td>
                <td class="p-3">${escapeHTML(item.kelas)}</td>
                <td class="p-3">
                    ${escapeHTML(item.nama_alat || item.id_alat)}
                </td>
                <td class="p-3">${escapeHTML(item.jumlah)}</td>
                <td class="p-3">${escapeHTML(item.tanggal_pinjam)}</td>
                <td class="p-3">${escapeHTML(item.tanggal_kembali)}</td>
                <td class="p-3">${escapeHTML(item.status)}</td>
                <td class="p-3 whitespace-nowrap">
                    <button onclick="editPeminjaman(${Number(item.id_peminjaman)})"
                        class="bg-yellow-500 text-white px-3 py-1 rounded-lg">
                        Edit
                    </button>

                    <button onclick="hapusPeminjaman(${Number(item.id_peminjaman)})"
                        class="bg-red-600 text-white px-3 py-1 rounded-lg">
                        Hapus
                    </button>
                </td>
            </tr>
        `).join("");

    } catch (error) {
        console.error(error);
        tabel.innerHTML = `
            <tr>
                <td colspan="9" class="p-5 text-center text-red-600">
                    Data peminjaman gagal dimuat.
                </td>
            </tr>
        `;
    }
}

function editPeminjaman(id) {
    window.location.href =
        `TambahPeminjaman.html?id=${encodeURIComponent(id)}`;
}

async function hapusPeminjaman(id) {
    if (!confirm("Yakin ingin menghapus data peminjaman ini?")) return;

    try {
        await requestAPI(`${API_PEMINJAMAN}/${id}`, {
            method: "DELETE"
        });

        alert("Data peminjaman berhasil dihapus!");
        loadPeminjaman();

    } catch (error) {
        alert("Gagal menghapus peminjaman: " + error.message);
    }
}

// ==========================================
// TAMBAH DAN EDIT PEMINJAMAN
// ==========================================

async function loadPilihanAlat() {
    const select = document.getElementById("id_alat");
    if (!select) return;

    const hasil = await requestAPI(API_ALAT);
    const daftar = Array.isArray(hasil) ? hasil : hasil.data || [];

    select.innerHTML = '<option value="">-- Pilih Alat --</option>';

    daftar.forEach(alat => {
        select.innerHTML += `
            <option value="${alat.id_alat}">
                ${escapeHTML(alat.nama_alat)} (Stok: ${escapeHTML(alat.stok)})
            </option>
        `;
    });
}

async function loadEditPeminjaman() {
    if (!editId || !document.getElementById("formPeminjaman")) return;

    const hasil = await requestAPI(`${API_PEMINJAMAN}/${editId}`);
    const item = hasil.data || hasil;

    document.getElementById("id_alat").value = item.id_alat || "";
    document.getElementById("nama_peminjam").value = item.nama_peminjam || "";
    document.getElementById("kelas").value = item.kelas || "";
    document.getElementById("tanggal_pinjam").value =
        String(item.tanggal_pinjam || "").slice(0, 10);
    document.getElementById("tanggal_kembali").value =
        String(item.tanggal_kembali || "").slice(0, 10);
    document.getElementById("jumlah").value = item.jumlah ?? "";
    document.getElementById("status").value = item.status || "";

    const judul = document.getElementById("judul");
    const tombol = document.getElementById("btnSimpan");

    if (judul) judul.textContent = "Edit Peminjaman";
    if (tombol) tombol.textContent = "Update Peminjaman";
}

async function simpanPeminjaman(event) {
    event.preventDefault();

    const payload = {
        id_alat: Number(document.getElementById("id_alat").value),
        nama_peminjam: document.getElementById("nama_peminjam").value.trim(),
        kelas: document.getElementById("kelas").value.trim(),
        tanggal_pinjam: document.getElementById("tanggal_pinjam").value,
        tanggal_kembali: document.getElementById("tanggal_kembali").value,
        jumlah: Number(document.getElementById("jumlah").value),
        status: document.getElementById("status").value
    };

    if (
        !payload.id_alat ||
        !payload.nama_peminjam ||
        !payload.kelas ||
        !payload.tanggal_pinjam ||
        !payload.tanggal_kembali ||
        !payload.status ||
        !Number.isInteger(payload.jumlah) ||
        payload.jumlah < 1
    ) {
        alert("Periksa kembali semua data peminjaman.");
        return;
    }

    if (payload.tanggal_kembali < payload.tanggal_pinjam) {
        alert("Tanggal kembali tidak boleh sebelum tanggal pinjam.");
        return;
    }

    const tombol = document.getElementById("btnSimpan");

    try {
        if (tombol) {
            tombol.disabled = true;
            tombol.textContent = "Menyimpan...";
        }

        await requestAPI(
            editId ? `${API_PEMINJAMAN}/${editId}` : API_PEMINJAMAN,
            {
                method: editId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            }
        );

        alert(
            editId
                ? "Data peminjaman berhasil diperbarui!"
                : "Peminjaman berhasil ditambahkan!"
        );

        window.location.href = "Peminjaman.html";

    } catch (error) {
        console.error(error);
        alert("Gagal menyimpan peminjaman: " + error.message);

        if (tombol) {
            tombol.disabled = false;
            tombol.textContent = editId ? "Update Peminjaman" : "Simpan";
        }
    }
}

// ==========================================
// MENJALANKAN SCRIPT SESUAI HALAMAN
// ==========================================

document.addEventListener("DOMContentLoaded", async function () {

    // Halaman Data Alat
    if (document.getElementById("tabelAlat")) {
        loadAlat();
    }

    // Halaman Tambah/Edit Alat
    if (document.getElementById("formTambah")) {
        await loadKategoriAlat();
        await loadEditAlat();

        document.getElementById("formTambah")
            .addEventListener("submit", simpanAlat);
    }

    // Halaman Data Kategori
    if (document.getElementById("tabelKategori")) {
        loadKategori();
    }

    // Halaman Peminjaman
    if (document.getElementById("tabelPeminjaman")) {
        loadPeminjaman();
    }

    // Halaman Tambah/Edit Peminjaman
    if (document.getElementById("formPeminjaman")) {
        try {
            await loadPilihanAlat();
            await loadEditPeminjaman();
        } catch (error) {
            console.error(error);
            alert("Gagal memuat data formulir: " + error.message);
        }

        document.getElementById("formPeminjaman")
            .addEventListener("submit", simpanPeminjaman);
    }

    // Pencarian kategori
    const pencarian = document.getElementById("searchKategori");
    if (pencarian) {
        pencarian.addEventListener("input", cariKategori);
    }
});
