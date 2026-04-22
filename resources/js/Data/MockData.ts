export const dataPetani = [
  { id_petani: 1, nik: '7501010001', nama: 'Budi Santoso', jenis_kelamin: 'L', no_hp: '081234567890', alamat: 'Desa Luhu' },
  { id_petani: 2, nik: '7501010002', nama: 'Siti Aminah', jenis_kelamin: 'P', no_hp: '081298765432', alamat: 'Desa Luhu' },
  { id_petani: 3, nik: '7501010003', nama: 'Ahmad Dahlan', jenis_kelamin: 'L', no_hp: '085211223344', alamat: 'Desa Luhu' },
]

export const dataLahan = [
  {
    id_lahan: 1,
    id_petani: 1,
    luas: 2.5,
    nama_pemilik: 'Budi Santoso',
    komoditas: 'Padi Sawah',
    koordinat: {
      "type": "Feature",
      "properties": { "id_lahan": 1 },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [122.956, 0.612],
            [122.958, 0.612],
            [122.958, 0.610],
            [122.956, 0.610],
            [122.956, 0.612]
          ]
        ]
      }
    }
  },
  {
    id_lahan: 2,
    id_petani: 2,
    luas: 1.2,
    nama_pemilik: 'Siti Aminah',
    komoditas: 'Jagung',
    koordinat: {
      "type": "Feature",
      "properties": { "id_lahan": 2 },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [122.960, 0.615],
            [122.962, 0.615],
            [122.961, 0.613],
            [122.959, 0.613],
            [122.960, 0.615]
          ]
        ]
      }
    }
  }
]
