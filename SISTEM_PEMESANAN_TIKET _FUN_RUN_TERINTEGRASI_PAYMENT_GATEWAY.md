1. Tolong pelajari struktur starter-kit pada workspace ini, sudah ada role untuk sistem ini jadi nanti anda tinggal memasukan ke dalam route di middleware, lihat contoh pada route/master.php
2. Buatkan saya sistem pemesanan Tiket yang terintegrasi dengan Payment Gateway Xendit, pada bagian admin akan ada seperti berikut :
    - Pembuatan tiket, jadi kita bisa menambahkan tiket dengan nama apapun.
    - Pengelolaan tiket, jadi kita bisa mengedit atau menghapus tiket yang sudah ada.
    - Kita bisa memasukan stok untuk tiket yang dapat dibeli.
3. Untuk user, buatkan public URL dengan tampilan seperti web company dimana akan ada tombol ditengah untuk membeli tiket, setelah tiket dibeli maka nanti akan otomatis mengirim nomor tiket ke email pengguna. buatkan juga form untuk mengisi data diri pengguna sebelum melakukan pembayaran. dimana tombol pembayaran akan disable jika ada form yang belum diisi.
4. untuk integrasi payment gateway kita kesampingkan dahulu karena saya harus melakukan set up pada xendit, kita fokus pada alur sistem ini.
5. Buat struktur direktory yang rapi
6. Tetap gunakan komponen dari shadcn ui


## ALUR BARU
1. Buatkan Form yang bisa disesuaikan dari admin, jadi admin bisa menambahkan field pada form yang akan diisi user.
2. Hilangkan modul payment gateway.
3. Buat harga tiket tetap ada namun allow free jika admin menginginkan.
4. Setelah user mengisi form, maka akan ada nomor tiket yang muncul di layar dan dapat didownload dalam bentuk PDF.