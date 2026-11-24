DROP TABLE IF EXISTS peminjaman, alat, kategori_alat;
DROP TYPE IF EXISTS status_kembali;

CREATE TYPE status_kembali AS ENUM
('Dipinjam','Dikembalikan','Terlambat');

CREATE TABLE kategori_alat(
    id_kategori SERIAL PRIMARY KEY,
    nama_kategori VARCHAR(100),
    deskripsi TEXT
);

CREATE TABLE alat(
    id_alat SERIAL PRIMARY KEY,
    id_kategori INT REFERENCES kategori_alat(id_kategori),
    nama_alat VARCHAR(100),
    stok INT CHECK(stok >= 0),
    lokasi VARCHAR(100)
);

CREATE TABLE peminjaman(
    id_peminjaman SERIAL PRIMARY KEY,
    id_alat INT REFERENCES alat(id_alat),
    nama_peminjam VARCHAR(100),
    kelas VARCHAR(30),
    tanggal_pinjam DATE DEFAULT CURRENT_DATE,
    tanggal_kembali DATE,
    jumlah INT CHECK(jumlah > 0),
    status status_kembali DEFAULT 'Dipinjam'
);

INSERT INTO kategori_alat(nama_kategori) VALUES
('Komputer'),('Multimedia'),('Elektronika');

INSERT INTO alat(id_kategori,nama_alat,stok,lokasi) VALUES
(1,'Komputer',10,'Lemari A'),
(1,'Mouse',25,'Lemari B'),
(2,'Camera',8,'Lemari C'),
(3,'Soldwr',20,'Ruang Elektronika');

CREATE OR REPLACE FUNCTION update_stok()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Dipinjam' THEN
        UPDATE alat
        SET stok = stok - NEW.jumlah
        WHERE id_alat = NEW.id_alat AND stok >= NEW.jumlah;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Stok tidak cukup';
        END IF;
    END IF;

    IF OLD.status = 'Dipinjam'
       AND NEW.status = 'Dikembalikan' THEN
        UPDATE alat
        SET stok = stok + NEW.jumlah
        WHERE id_alat = NEW.id_alat;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stok_alat
AFTER INSERT OR UPDATE ON peminjaman
FOR EACH ROW
EXECUTE FUNCTION update_stok();
SELECT * FROM kategori_alat;