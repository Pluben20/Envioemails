const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const dotenv = require('dotenv').config();
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Servir a página HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); 
});

// Endpoint para envio de e-mails
app.post('/sendemails', upload.single('file'), async (req, res) => {
    const { to, subject, text } = req.body;
    const file = req.file;

    if (!to || !subject || !text) {
        return res.status(400).json({ error: "Os campos 'to', 'subject' e 'text' são obrigatórios." });
    }

    try {
        const transportmail = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.User_email,
                pass: process.env.User_senha,
            },
        });

        const mailOptions = {
            from: process.env.User_email,
            to,
            subject,
            text,
            attachments: file
                ? [
                      {
                          filename: file.originalname,
                          path: file.path,
                      },
                  ]
                : [],
        };

        const send = await transportmail.sendMail(mailOptions);

        if (file) {
            fs.unlink(file.path, (err) => {
                if (err) console.error('Erro ao apagar o arquivo:', err);
            });
        }

        res.status(200).json({ message: 'E-mail enviado', send });
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        res.status(500).json({ error: 'Erro ao enviar o e-mail.' });
    }
});

// Inicializar o servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
