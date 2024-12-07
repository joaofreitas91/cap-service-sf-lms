const cds = require('@sap/cds')
const { executeHttpRequest } = require('@sap-cloud-sdk/http-client')

module.exports = async (srv) => {
  const successFactor = await cds.connect.to('SFSF')

  srv.on('CREATE', 'cust_Turmas', async (req) => {
    const payload = req.data

    // cust_ACT_CPNT_ID => ID do Curso
    const { cust_INST_ID1, cust_INST_ID2, cust_ACT_CPNT_ID } = payload

    if (cust_INST_ID1) {
      req.data.cust_Inst1Nav = {
        __metadata: {
          uri: `/cust_Instrutores('${cust_INST_ID1}')`,
        },
      }
    }

    if (cust_INST_ID2) {
      req.data.cust_Inst2Nav = {
        __metadata: {
          uri: `/cust_Instrutores('${cust_INST_ID2}')`,
        },
      }
    }

    if (cust_ACT_CPNT_ID) {
      req.data.cust_CursosNav = {
        __metadata: {
          uri: `/cust_Cursos('${cust_ACT_CPNT_ID}')`,
        },
      }
    }

    try {
      const response = await executeHttpRequest(
        {
          destinationName: 'SFSF',
        },
        {
          method: 'POST',
          url: '/cust_Turmas',
          data: payload,
        }
      )

      return response.data
    } catch (error) {
      console.error(error)

      req.error({
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: error.message,
        target: req.target,
      })
    }
  })

  srv.on(
    'READ',
    'cust_Turmas',
    async (req) => await successFactor.run(req.query)
  )

  srv.on('UPDATE', 'cust_Turmas', async (req) => {
    console.log(req.data)

    const { externalCode, cust_ListaNav, ...data } = req.data

    const payload = {
      __metadata: {
        uri: 'cust_Turmas',
      },
      externalCode: externalCode,
      ...data,
    }

    if (cust_ListaNav) {
      payload.cust_ListaNav = cust_ListaNav.map(({ externalCode }) => {
        return {
          __metadata: {
            uri: `/cust_ListadePresenca('${externalCode}')`,
          },
        }
      })
    }

    try {
      await executeHttpRequest(
        {
          destinationName: 'SFSF',
        },
        {
          method: 'POST',
          url: '/upsert',
          data: payload,
        }
      )

      // return response.data
    } catch (error) {
      console.error(error)

      req.error({
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: error.message,
        target: req.target,
      })
    }
  })

  srv.on(
    'DELETE',
    'cust_Turmas',
    async (req) => await successFactor.run(req.query)
  )

  srv.on(
    'READ',
    'cust_Cursos',
    async (req) => await successFactor.run(req.query)
  )

  srv.on(
    'READ',
    'cust_Alunos',
    async (req) => await successFactor.run(req.query)
  )

  srv.on('CREATE', 'cust_ListadePresenca', async (req) => {
    const payload = req.data

    const { cust_Aluno } = payload

    if (cust_Aluno) {
      req.data.cust_AlunosNav = {
        __metadata: {
          uri: `/cust_Alunos('${cust_Aluno}')`,
        },
      }
    }

    try {
      const response = await executeHttpRequest(
        {
          destinationName: 'SFSF',
        },
        {
          method: 'POST',
          url: '/cust_ListadePresenca',
          data: payload,
        }
      )

      return response.data
    } catch (error) {
      console.error(error)

      req.error({
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: error.message,
        target: req.target,
      })
    }
  })

  srv.on(
    'READ',
    'cust_ListadePresenca',
    async (req) => await successFactor.run(req.query)
  )

  srv.on('UPDATE', 'cust_ListadePresenca', async (req) => {
    const { externalCode, ...data } = req.data
    await successFactor.put(`/cust_ListadePresenca('${externalCode}')`, data)
  })

  srv.on(
    'DELETE',
    'cust_ListadePresenca',
    async (req) => await successFactor.run(req.query)
  )

  srv.on(
    'READ',
    'cust_Instrutores',
    async (req) => await successFactor.run(req.query)
  )

  srv.on(
    'READ',
    'cust_Locais',
    async (req) => await successFactor.run(req.query)
  )

  srv.on('READ', 'User', async (req) => await successFactor.run(req.query))
}
