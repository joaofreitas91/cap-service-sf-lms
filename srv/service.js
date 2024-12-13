const cds = require('@sap/cds')
const { executeHttpRequest } = require('@sap-cloud-sdk/http-client')
const { formatDate, extractGetTime } = require('./utils/formatters.js')

module.exports = async (srv) => {
  const successFactor = await cds.connect.to('SFSF')

  srv.on('CREATE', 'cust_Turmas', async (req) => {
    const payload = req.data

    // cust_ACT_CPNT_ID => ID do Curso
    const {
      cust_INST_ID1,
      cust_INST_ID2,
      cust_ACT_CPNT_ID,
      cust_START_TME,
      cust_END_TME,
    } = payload

    if (cust_START_TME) {
      req.data.cust_START_TME = formatDate(cust_START_TME)
    }

    if (cust_END_TME) {
      req.data.cust_END_TME = formatDate(cust_END_TME)
    }

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

      delete response.data.d.cust_Inst1Nav
      delete response.data.d.cust_Inst2Nav
      delete response.data.d.cust_CursosNav

      /* 
      cust_END_TME
      cust_START_TME
      */

      const data = {
        ...response.data.d,
        cust_START_TME: extractGetTime(response.data.d.cust_START_TME),
        cust_END_TME: extractGetTime(response.data.d.cust_END_TME),
      }

      return data
    } catch (error) {
      req.error({
        code: error.status || '500',
        message:
          error?.response?.data?.error?.message?.value ||
          'INTERNAL_SERVER_ERROR',
      })
    }
  })

  srv.on(
    'READ',
    'cust_Turmas',
    async (req) => await successFactor.run(req.query)
  )

  srv.on('UPDATE', 'cust_Turmas', async (req) => {
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
      const response = await executeHttpRequest(
        {
          destinationName: 'SFSF',
        },
        {
          method: 'POST',
          url: '/upsert',
          data: payload,
        }
      )

      debugger
      return response.data.d
    } catch (error) {
      req.error({
        code: error.status || '500',
        message:
          error?.response?.data?.error?.message?.value ||
          'INTERNAL_SERVER_ERROR',
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

    const {
      cust_Aluno,
      externalCode,
      cust_Turma,
      cust_startdate,
      cust_enddate,
    } = payload

    if (cust_startdate) {
      req.data.cust_startdate = formatDate(cust_startdate)
    }

    if (cust_enddate) {
      req.data.cust_enddate = formatDate(cust_enddate)
    }

    if (cust_Aluno) {
      req.data.cust_AlunosNav = {
        __metadata: {
          uri: `/cust_Alunos('${cust_Aluno}')`,
        },
      }
    }

    const classPayload = {
      __metadata: {
        uri: 'cust_Turmas',
      },
      externalCode: cust_Turma,
      cust_ListaNav: [
        {
          __metadata: {
            uri: `/cust_ListadePresenca('${externalCode}')`,
          },
        },
      ],
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

      await executeHttpRequest(
        {
          destinationName: 'SFSF',
        },
        {
          method: 'POST',
          url: '/upsert',
          data: classPayload,
        }
      )

      delete response.data.d.cust_AlunosNav
      return response.data.d
    } catch (error) {
      req.error({
        code: error.status || '500',
        message:
          error?.response?.data?.error?.message?.value ||
          'INTERNAL_SERVER_ERROR',
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
