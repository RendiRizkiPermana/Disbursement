const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const bodyParser = require('body-parser')
const db = require('./connection')
const response = require('./response')
const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid');


app.use(bodyParser.json())

app.get('/', (req, res) => {
  response(200, 'Wilujeng Sumping Akang & Eteh', 'SUCCESS', res)
})  

app.post('/register', (req, res) => {
  const { username, email, password, created_date } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!username || !email || !password) {
    return response(400, null, 'Form Register tidak boleh kosong!', res);
  } else if (username.includes(' ')) {
    return response(400, null, 'Username tidak boleh mengandung spasi', res);
  } else if (!emailRegex.test(email)) {
    return response(400, null, 'Format email tidak valid', res);
  }

  const accountFolder = username; // Nama folder file
  const folderPath = path.join(__dirname, 'account', accountFolder);
  const filePath = path.join(folderPath, 'registerData.json');

  // Membuat folder akun jika belum ada
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`Folder ${accountFolder} berhasil dibuat.`);
  }

  // Membuat file registerData.json jika belum ada
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]', 'utf8');
    console.log(`File JSON registerData.json untuk ${accountFolder} berhasil dibuat.`);
  }

  fs.readFile(filePath, 'utf8', (err, fileData) => {
    if (err) {
      console.log('Terjadi kesalahan saat membaca file:', err);
      return response(500, null, 'Internal Server Error', res);
    }

    let registerArray = [];

    if (fileData) {
      registerArray = JSON.parse(fileData);
    }

    const existingUser = registerArray.find((user) => user.username === username);
    if (existingUser) {
      return response(400, null, 'Username telah digunakan!', res);
    }

    // Dapatkan ID terakhir yang digunakan
    const lastId = registerArray.length > 0 ? registerArray[registerArray.length - 1].id : 0;

    // Buat ID baru dengan menambahkan 1
    const newId = lastId + 1;

    // Simpan data register ke file JSON
    const registerData = {
      id: newId,
      username,
      email,
      password,
      created_date,
    };

    registerArray.push(registerData);
    const registerJson = JSON.stringify({ lastId: newId, users: registerArray });

    fs.writeFile(filePath, registerJson, 'utf8', (err) => {
      if (err) {
        console.log('Terjadi kesalahan saat menyimpan file:', err);
        return response(500, null, 'Internal Server Error', res);
      }

      console.log(`File JSON registerData.json untuk ${accountFolder} berhasil disimpan.`);

      const data = {
        isSuccess: 1,
      };
      return response(200, data, 'Register berhasil', res);
    });
  });
});


// login
app.post('/login', (req, res) => {
  const { email, password } = req.body
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // Validasi input
  if (!email || !password) {
    return response(400, null, 'Email dan password harus diisi', res)
  } else if (!emailRegex.test(email)) {
    return response(400, null, 'Format email tidak valid', res)
  }

  const accountFolderPath = path.join(__dirname, 'account')

  fs.readdir(accountFolderPath, (err, folders) => {
    if (err) {
      console.log('Terjadi kesalahan saat membaca folder:', err)
      return response(500, null, 'Internal Server Error', res)
    }

    let userFound = false

    folders.forEach((folder) => {
      const userFolderPath = path.join(accountFolderPath, folder)
      const registerFilePath = path.join(userFolderPath, 'registerData.json')

      if (fs.statSync(userFolderPath).isDirectory() && fs.existsSync(registerFilePath)) {
        try {
          const data = fs.readFileSync(registerFilePath, 'utf8')
          const registerData = JSON.parse(data)
          console.log(registerData)

          const user = registerData.find((user) => user.email === email)

          if (user && user.password === password) {
            userFound = true
            const session = { email: user.email, loggedIn: true }
            req.session = session
            return response(200, session, 'Login berhasil', res)
          }
        } catch (err) {
          console.log('Terjadi kesalahan saat membaca file:', err)
        }
      }
    })

    if (!userFound) {
      return response(400, null, 'Email atau password salah', res)
    }
  })
})


// get users
app.get('/users', (req, res) => {
  const accountFolderPath = path.join(__dirname, 'account')

  // Membaca daftar folder pengguna dalam folder "account"
  fs.readdir(accountFolderPath, (err, folders) => {
    if (err) {
      console.log('Terjadi kesalahan saat membaca folder:', err)
      return response(500, null, 'Internal Server Error', res)
    }

    const users = []
    let totalUsers = 0 

    // Mengiterasi setiap folder pengguna
    folders.forEach((folder) => {
      const userFolderPath = path.join(accountFolderPath, folder)
      const registerFilePath = path.join(userFolderPath, 'registerData.json')

      // Mengecek apakah folder pengguna adalah direktori
      if (fs.statSync(userFolderPath).isDirectory()) {
        // Mengecek apakah file registerData.json ada di dalam folder pengguna
        if (fs.existsSync(registerFilePath)) {
          try {
            const data = fs.readFileSync(registerFilePath, 'utf8')
            const registerData = JSON.parse(data)
            users.push(registerData)
            totalUsers++
          } catch (err) {
            console.log('Terjadi kesalahan saat membaca file:', err)
          }
        }
      }
    })

    const responseObj = {
      totalUsers: totalUsers,
      users: users,
    }

    return response(200, responseObj, 'Menampilkan data users', res)
  })
})

// update
app.get('/update', (req, res) => {
  fs.readdir(account)
} )

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
