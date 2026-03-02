# Q-Guard 🛡️

> **Safe. Informative. Scalable.**

Q-Guard adalah library TypeScript yang bekerja sebagai **gatekeeper** untuk data mentah. Sebelum data menyentuh business logic atau database, Q-Guard memastikan data tersebut aman, valid, dan siap digunakan.

---

## Filosofi

> *"Code should work like Lego."*

Q-Guard dibangun di atas satu prinsip: validasi dan transformasi data harus **modular, composable, dan transparan**.

- **Modular** — bawa validator dan transformer kamu sendiri, plug-in di mana saja
- **Composable** — tiap validator cuma perlu return `boolean`, tiap transformer cuma perlu return data
- **Transparan** — setiap kegagalan memberi tahu *di mana* dan *kenapa*, bukan hanya *bahwa ada yang salah*

---

## Cara Kerja

Data mentah melewati dua layer secara berurutan:

```
raw data → [ Security Layer ] → [ Transformer Layer ] → clean data
```

### Layer 1: Security Layer
Data mentah masuk ke layer ini dan melewati semua pengecekan yang telah disetup secara berurutan. Jika ada satu pengecekan yang gagal, sistem berhenti dan mengembalikan informasi error yang detail. Jika semua pengecekan berhasil, data dilanjutkan ke layer berikutnya.

### Layer 2: Transformer Layer
Data yang sudah aman dari security layer diolah di sini. Setiap transformer menerima hasil dari transformer sebelumnya, membentuk sebuah pipeline transformasi yang bersih dan predictable.

> **Catatan:** Security layer memvalidasi data apa adanya (*raw*). Pastikan data sudah dalam kondisi yang siap divalidasi sebelum masuk ke Q-Guard.

---

## Instalasi

```bash
 belum upload npm ya...
```

---

## Quick Start

```typescript
import { qguard_setup, ds } from 'q-guard'

// Setup sekali, gunakan di mana saja
const guard = new qguard_setup(
    // Security layer — harus return boolean
    {
        type:    (raw, expect) => typeof raw === expect,
        min:     (raw, expect) => raw.toString().length > expect,
        max:     (raw, expect) => raw.toString().length < expect,
        isEmail: (raw, _) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw),
        noSpace: (raw, _) => !raw.toString().includes(' '),
    },
    // Transformer layer — harus return data
    {
        trim:        (_, curr) => curr.toString().trim(),
        toLowerCase: (_, curr) => curr.toString().toLowerCase(),
        toUpperCase: (_, curr) => curr.toString().toUpperCase(),
        replace:     (into, curr) => curr.toString().replaceAll(into[0], into[1]),
        append:      (into, curr) => curr + into,
    }
)

const result = guard.oz(
    { username: 'ammaar', email: 'AMMAAR@GMAIL.COM' },
    [
        // Security schema
        {
            username: { type: ds('string', 'Must be string'), min: ds(3, 'Min 4 chars') },
            email:    { type: ds('string', 'Must be string'), isEmail: ds(null, 'Invalid email') },
        },
        // Transformer schema
        {
            username: { toUpperCase: null, append: '_user' },
            email:    { toLowerCase: null },
        }
    ]
)

console.log(result)
// { isSuccess: true, data: { username: 'AMMAAR_user', email: 'ammaar@gmail.com' } }
```

---

## API

### `new qguard_setup(securityMiddleware, transformerMiddleware)`

Membuat instance Q-Guard dengan security dan transformer yang sudah didefinisikan.

| Parameter | Type | Deskripsi |
|---|---|---|
| `securityMiddleware` | `Record<string, (raw, expect) => boolean>` | Kumpulan fungsi validator |
| `transformerMiddleware` | `Record<string, (into, curr) => any>` | Kumpulan fungsi transformer |

### `guard.oz(data, [securitySchema, transformerSchema?])`

Menjalankan data melalui pipeline Q-Guard.

| Parameter | Type | Deskripsi |
|---|---|---|
| `data` | `object` | Data mentah yang akan divalidasi |
| `securitySchema` | `object` | Aturan validasi per field |
| `transformerSchema` | `object` (opsional) | Aturan transformasi per field |

**Return value:**
```typescript
// Sukses
{ isSuccess: true, data: { ...cleanData } }

// Gagal
{ isSuccess: false, issue: [{ loc, onCheck, errmsg, layer }] }
```

### `ds(expectedValue, errmsg)`

Helper untuk mendefinisikan aturan validasi.

```typescript
ds('string', 'Must be a string')
ds(8, 'Minimum 8 characters')
ds(null, 'No spaces allowed')
```

---

## Contoh Penggunaan

### Register User

```typescript
const result = guard.oz(req.body, [
    {
        username: { type: ds('string', 'Must be string'), min: ds(3, 'Min 4 chars'), noSpace: ds(null, 'No spaces') },
        email:    { type: ds('string', 'Must be string'), isEmail: ds(null, 'Invalid email') },
    },
    {
        username: { trim: null, toLowerCase: null },
        email:    { trim: null, toLowerCase: null },
    }
])

if (!result.isSuccess) {
    return res.status(400).json({ errors: result.issue })
}

await db.users.create(result.data) // data sudah clean ✅
```

### Transform Only (tanpa security)

```typescript
const result = guard.oz(
    { title: 'hello world' },
    [
        {}, // security kosong = skip
        { title: { trim: null, replace: [' ', '-'], toUpperCase: null } }
    ]
)
// { isSuccess: true, data: { title: 'HELLO-WORLD' } }
```

### Express Middleware

```typescript
const qGuard = (scheme) => (req, res, next) => {
    const check = guard.oz(req.body, scheme)
    if (!check.isSuccess) {
        return res.status(400).json({ success: false, errors: check.issue })
    }
    req.body = check.data
    next()
}

// Pemakaian
app.post('/register', qGuard([securitySchema, transformerSchema]), async (req, res) => {
    await db.users.create(req.body) // req.body sudah clean ✅
    res.status(201).json({ success: true })
})
```

---

## Error Response

Ketika validasi gagal, Q-Guard mengembalikan informasi yang detail:

```json
{
  "isSuccess": false,
  "issue": [
    {
      "loc": "username",
      "onCheck": "min",
      "errmsg": "Min 4 chars",
      "layer": "security_check"
    }
  ]
}
```

| Field | Deskripsi |
|---|---|
| `loc` | Field mana yang gagal |
| `onCheck` | Check apa yang gagal |
| `errmsg` | Pesan error yang kamu definisikan |
| `layer` | Di layer mana kegagalan terjadi |

---