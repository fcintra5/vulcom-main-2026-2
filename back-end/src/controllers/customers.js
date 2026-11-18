import prisma from '../database/client.js'
import { Prisma } from '@prisma/client'

const controller = {}     // Objeto vazio

controller.create = async function(req, res) {
  try {
    const data = {
      name: req.body?.name,
      ident_document: req.body?.ident_document,
      birth_date: req.body?.birth_date ? new Date(req.body.birth_date) : null,
      street_name: req.body?.street_name,
      house_number: req.body?.house_number,
      complements: req.body?.complements || null,
      district: req.body?.district || 'Centro',
      municipality: req.body?.municipality,
      state: req.body?.state,
      phone: req.body?.phone,
      email: req.body?.email
    }

    const requiredFields = [
      'name',
      'ident_document',
      'street_name',
      'house_number',
      'municipality',
      'state',
      'phone',
      'email'
    ]

    const missingRequiredFields = requiredFields.filter(
      field => data[field] === null || data[field] === undefined
        || (typeof data[field] === 'string' && data[field].trim().length === 0)
    )

    if(missingRequiredFields.length > 0) {
      return res.status(400).json({
        error: `Campos obrigatórios ausentes ou vazios: ${missingRequiredFields.join(', ')}.`
      })
    }

    await prisma.customer.create({ data })

    // HTTP 201: Created
    res.status(201).end()
  }
  catch(error) {
    console.error(error)

    if(error instanceof Prisma.PrismaClientValidationError) {
      // HTTP 400: Bad Request (dados de entrada invalidos)
      return res.status(400).json({ error: 'Dados inválidos para o cadastro de cliente.' })
    }

    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.retrieveAll = async function(req, res) {
  try {
    const result = await prisma.customer.findMany({
      orderBy: [
        { name: 'asc' }
      ],
      include: {
        cars: req.query.include === 'cars'
      }
    })

    // HTTP 200: OK (implícito)
    res.send(result)
  }
  catch(error) {
    console.error(error)

    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.retrieveOne = async function(req, res) {
  try {
    const result = await prisma.customer.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        cars: req.query.include === 'cars'
      }
    })

    // Encontrou ~> retorna HTTP 200: OK (implícito)
    if(result) res.send(result)
    // Não encontrou ~> retorna HTTP 404: Not Found
    else res.status(404).end()
  }
  catch(error) {
    console.error(error)

    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.update = async function(req, res) {
  try {
    const result = await prisma.customer.update({
      where: { id: Number(req.params.id) },
      data: req.body
    })

    // Encontrou e atualizou ~> HTTP 204: No Content
    if(result) res.status(204).end()
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
    await prisma.customer.delete({
      where: { id: Number(req.params.id) }
    })

    // Encontrou e excluiu ~> HTTP 204: No Content
    res.status(204).end()
  }
  catch(error) {
    if(error?.code === 'P2025') {
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

export default controller