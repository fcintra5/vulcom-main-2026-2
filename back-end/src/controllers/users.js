import prisma from '../database/client.js'
import jwt from 'jsonwebtoken'
import argon2 from 'argon2'

const controller = {}     // Objeto vazio

controller.create = async function(req, res) {
  try {
    if (req.body.password) {
      req.body.password = await argon2.hash(req.body.password, {
        type: argon2.argon2id
      })
    }

    await prisma.user.create({ data: req.body })

    // HTTP 201: Created
    res.status(201).end()
  }
  catch(error) {
    console.error(error)

    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.retrieveAll = async function(req, res) {
  try {
    const result = await prisma.user.findMany()
    const safeUsers = result.map(({ password, ...user }) => user)

    res.send(safeUsers)
  }
  catch(error) {
    console.error(error)

    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.retrieveOne = async function(req, res) {
  try {
    const result = await prisma.user.findUnique({
      where: { id: Number(req.params.id) }
    })

    // Encontrou ~> retorna HTTP 200: OK (implícito)
    if (result) {
      const { password, ...safeUser } = result
      res.send(safeUser)
    } else {
      res.status(404).end()
    }
  }
  catch(error) {
    console.error(error)

    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.update = async function(req, res) {
  try {
    if (req.body.password) {
      req.body.password = await argon2.hash(req.body.password, {
        type: argon2.argon2id
      })
    }

    const result = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: req.body
    })

    // Encontrou e atualizou ~> HTTP 204: No Content
    if (result) res.status(204).end()
    // Não encontrou (e não atualizou) ~> HTTP 404: Not Found
    else res.status(404).end()
  }
  catch(error) {
    console.error(error)

    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.delete = async function(req, res) {
  try {
    await prisma.user.delete({
      where: { id: Number(req.params.id) }
    })

    // Encontrou e excluiu ~> HTTP 204: No Content
    res.status(204).end()
  }
  catch(error) {
    if (error?.code === 'P2025') {
      // Não encontrou e não excluiu ~> HTTP 404: Not Found
      res.status(404).end()
    }
    else {
      // Outros tipos de erro
      console.error(error)

      // HTTP 500: Internal Server Error
      res.status(500).end()
    }
  }
}

controller.login = async function(req, res) {
  try {
    // Busca o usuário no BD usando o valor dos campos "username" OU "email"
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: req.body?.username },
          { email: req.body?.email }
        ]
      }
    })

    // Se o usuário não for encontrado ou não houver senha, retorna HTTP 401
    if (!user || !user.password || !req.body?.password) {
      return res.status(401).end()
    }

    // Verifica se a senha armazenada é um hash Argon2 válido e confere com a digitada
    let passwordIsValid = false
    if (user.password.startsWith('$argon2')) {
      passwordIsValid = await argon2.verify(user.password, req.body.password)
    }

    if (!passwordIsValid) {
      return res.status(401).end()
    }

    // Remove o campo password antes de assinar o JWT e enviar na resposta
    const { password, ...safeUser } = user

    // Usuário e senha OK, passamos ao procedimento de gerar o token
    const token = jwt.sign(
      safeUser,                     // Dados do usuário (sem a senha)
      process.env.TOKEN_SECRET,     // Senha para criptografar o token
      { expiresIn: '24h' }          // Prazo de validade do token
    )

    // Formamos o cookie para enviar ao front-end
    res.cookie(process.env.AUTH_COOKIE_NAME, token, {
      httpOnly: true, // O cookie ficará inacessível para o JS no front-end
      secure: true,   // O cookie será criptografado em conexões https (e permitido em localhost)
      sameSite: 'None',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000  // 24h
    })

    // Retorna o token e o usuário autenticado com HTTP 200: OK
    res.send({ token, user: safeUser })
  }
  catch(error) {
    console.error(error)

    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.me = function(req, res) {
  // Retorna as informações do usuário autenticado
  // HTTP 200: OK (implícito)
  res.send(req?.authUser)
}

controller.logout = function(req, res) {
  // Apaga no front-end o cookie que armazena o token de autorização
  res.clearCookie(process.env.AUTH_COOKIE_NAME, {
    path: '/',
    secure: true,
    sameSite: 'None'
  })
  // HTTP 204: No Content
  res.status(204).end()
}

export default controller