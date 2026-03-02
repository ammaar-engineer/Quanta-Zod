import {qguard_setup, ds} from './engine q-guard/zod-mini.ts'

// =====================
// SETUP — define once, use everywhere
// =====================
const guard = new qguard_setup(
    // Security layer — must return boolean
    // Layer custom yg dibuat harus return boolean ya

    // Raw: adalah data mentah nya
    // Expect: adalah data yg kamu harapkan
    {
        type:        (raw, expect) => typeof raw === expect,
        min:         (raw, expect) => raw.toString().length > expect,
        max:         (raw, expect) => raw.toString().length < expect,
        isEmail:     (raw, _) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw),
        noSpace:     (raw, _) => !raw.toString().includes(' '),
        isPositive:  (raw, _) => raw > 0,
        isInt:       (raw, _) => Number.isInteger(raw),
    },
    // Transformer layer — must return data
    // Layer custom yang dibuat harus return data hasil transform nya ya

    // Into: adalah custom data yang ingin ditambahkan saat transform
    // Curr: adalah data dari proses transformer sebelum nya
    {
        trim:        (_, curr) => curr.toString().trim(),
        toLowerCase: (_, curr) => curr.toString().toLowerCase(),
        toUpperCase: (_, curr) => curr.toString().toUpperCase(),
        replace:     (into, curr) => curr.toString().replaceAll(into[0], into[1]),
        append:      (into, curr) => curr + into,
        prepend:     (into, curr) => into + curr,
        customText:  (into, _) => into,
    }
)

// Berikut berbagai sample percobaan :3

console.log('=== EXAMPLE 1: Register user ===')
console.log(guard.oz(
    // Ini tempat dimana data mentah/raw diletakkan
    { username: 'ammaar', email: 'ammaar@gmail.com', age: 15 },
    [
        // Disini tempat layer security nya dibuat ya, sudah ada snippet helper nya
        // jadi jangan khawatir kalo lupa apa saja yg sudah di setup :3

        // Untuk security layer, gunakan ds dengan parameter ds(ekspektasi data, pesan error nya)
        // Kalo setup yang kamu buat udah bisa cek sendiri tanpa butuh ekspektasi data, dibuat null aja
        {
            username: { type: ds('string', 'Must be string'), min: ds(3, 'Min 4 chars'), noSpace: ds(null, 'No spaces') },
            email:    { type: ds('string', 'Must be string'), isEmail: ds(null, 'Invalid email') },
            age:      { isInt: ds(null, 'Must be integer'), isPositive: ds(null, 'Must be positive') }
        },
        // Disini tempat layer transformer nya ya, sudah ada snippet helper nya juga
        // Jangan takut lupa setup nya :3
        // Jika setup transformer nya ga butuh data dan bisa transformer sendiri sesuai data yg ditentukan
        // Semasa setup, dibikin null aja gan :3
        {
            username: { trim: null, toLowerCase: null },
            email:    { trim: null, toLowerCase: null },
        }
    ]
))

console.log('=== EXAMPLE 2: Format display name ===')
console.log(guard.oz(
    { displayName: 'ammaar dev' },
    [
        { displayName: { type: ds('string', 'Must be string'), min: ds(2, 'Too short'), max: ds(30, 'Too long') } },
        { displayName: { trim: null, replace: [' ', '_'], toUpperCase: null } }
    ]
))

console.log('=== EXAMPLE 3: Override value dengan customText ===')
console.log(guard.oz(
    { nama: 'amar' },
    [
        { nama: { type: ds('string', 'Must be string') } },
        { nama: { customText: 'amaru' } }
    ]
))

console.log('=== EXAMPLE 4: Security fail ===')
console.log(guard.oz(
    { username: 'am' },
    [
        { username: { type: ds('string', 'Must be string'), min: ds(3, 'Min 4 chars') } },
        { username: { toUpperCase: null, append: '_user' } }
    ]
))

console.log('=== EXAMPLE 5: Transform only ===')
console.log(guard.oz(
    { title: 'hello world' },
    [
        {},
        { title: { trim: null, replace: [' ', '_'], toUpperCase: null } }
    ]
))