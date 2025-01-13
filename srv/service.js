const cds = require('@sap/cds')
const { executeHttpRequest } = require('@sap-cloud-sdk/http-client')
const { formatDate, extractGetTime } = require('./utils/formatters.js')

module.exports = async (srv) => {
  const successFactor = await cds.connect.to('SFSF')

  srv.on('CREATE', 'cust_Turmas', async (req) => {
    const payload = req.data

    // cust_ACT_CPNT_ID => ID do Curso
    const {
      externalCode,
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

      const cust_ListadePresenca = await successFactor.run(
        SELECT.from('cust_ListadePresenca').where({
          cust_Turma: externalCode,
        })
      )

      const classPayload = {
        __metadata: {
          uri: 'cust_Turmas',
        },
        externalCode: externalCode,
        cust_ListaNav: cust_ListadePresenca.map(({ externalCode }) => {
          return {
            __metadata: {
              uri: `/cust_ListadePresenca('${externalCode}')`,
            },
          }
        }),
      }

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

      const cust_ListadeDiaria = await successFactor.run(
        SELECT.from('cust_listadiaria').where({
          cust_turma: externalCode,
        })
      )

      if (cust_ListadePresenca.length) {
        await executeHttpRequest(
          {
            destinationName: 'SFSF',
          },
          {
            method: 'POST',
            url: '/upsert',
            data: {
              __metadata: {
                uri: 'cust_Turmas',
              },
              externalCode,
              cust_SegmentoNav: cust_ListadeDiaria.map(({ externalCode }) => ({
                externalCode,
              })),
            },
          }
        )

        const updateListDiaria = cust_ListadeDiaria.map(({ externalCode }) => {
          return executeHttpRequest(
            {
              destinationName: 'SFSF',
            },
            {
              method: 'POST',
              url: '/upsert',
              data: {
                __metadata: {
                  uri: 'cust_listadiaria',
                },
                externalCode,
                cust_listaNav: cust_ListadePresenca.map(({ externalCode }) => ({
                  externalCode,
                })),
              },
            }
          )
        })

        await Promise.all(updateListDiaria)
      }

      delete response.data.d.cust_Inst1Nav
      delete response.data.d.cust_Inst2Nav
      delete response.data.d.cust_CursosNav

      /* 
      cust_END_TME
      cust_START_TME
      */

      const data = {
        ...response.data.d,
        cust_START_TME: response.data.d.cust_START_TME
          ? extractGetTime(response.data.d.cust_START_TME)
          : null,
        cust_END_TME: response.data.d.cust_END_TME
          ? extractGetTime(response.data.d.cust_END_TME)
          : null,
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

  srv.after('CREATE', 'cust_Turmas', async (entity) => {
    const { externalCode: turmaID } = entity

    const listasDiaria = await successFactor.run(
      SELECT.from('cust_listadiaria').where({
        cust_turma: turmaID,
      })
    )
    const listasPresenca = await successFactor.run(
      SELECT.from('cust_ListadePresenca').where({
        cust_Turma: turmaID,
      })
    )

    const pListasDiaria = listasDiaria.map(({ externalCode }) => {
      const custListaDiariaPayload = {
        __metadata: {
          uri: 'cust_listadiaria',
        },
        externalCode,
        cust_turmanav: {
          __metadata: {
            uri: `/cust_Turmas('${turmaID}')`,
          },
        },
      }

      return executeHttpRequest(
        {
          destinationName: 'SFSF',
        },
        {
          method: 'POST',
          url: '/upsert',
          data: custListaDiariaPayload,
        }
      )
    })

    const pListasPresenca = listasPresenca.map(({ externalCode }) => {
      const custListaPresencaPayload = {
        __metadata: {
          uri: 'cust_ListadePresenca',
        },
        externalCode,
        cust_TurmaNav: {
          __metadata: {
            uri: `/cust_Turmas('${turmaID}')`,
          },
        },
      }

      return executeHttpRequest(
        {
          destinationName: 'SFSF',
        },
        {
          method: 'POST',
          url: '/upsert',
          data: custListaPresencaPayload,
        }
      )
    })

    try {
      await Promise.all(pListasDiaria)
      await Promise.all(pListasPresenca)
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
    const { externalCode, ...data } = req.data

    const payload = {
      __metadata: {
        uri: 'cust_Turmas',
      },
      externalCode: externalCode,
      ...data,
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

      const registrationForms = await successFactor.run(
        SELECT.from('cust_ListadePresenca').where({
          cust_Turma: externalCode,
        })
      )

      const attendanceLists = await successFactor.run(
        SELECT.from('cust_listadiaria').where({
          cust_turma: externalCode,
        })
      )

      if (registrationForms.length) {
        const pRegistrationForms = registrationForms.map((rf) => {
          executeHttpRequest(
            {
              destinationName: 'SFSF',
            },
            {
              method: 'POST',
              url: '/upsert',
              data: {
                __metadata: {
                  uri: 'cust_ListadePresenca',
                },
                externalCode: rf.externalCode,
                cust_LMS: data.cust_LMS,
              },
            }
          )
        })

        Promise.all(pRegistrationForms)
      }

      if (attendanceLists.length) {
        const pAttendanceLists = attendanceLists.map((al) => {
          executeHttpRequest(
            {
              destinationName: 'SFSF',
            },
            {
              method: 'POST',
              url: '/upsert',
              data: {
                __metadata: {
                  uri: 'cust_listadiaria',
                },
                externalCode: al.externalCode,
                cust_lms: data.cust_LMS,
              },
            }
          )
        })

        Promise.all(pAttendanceLists)
      }

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

      delete response.data.d.cust_AlunosNav

      const data = {
        ...response.data.d,
        cust_startdate: extractGetTime(response.data.d.cust_startdate),
        cust_enddate: extractGetTime(response.data.d.cust_enddate),
      }

      const classes = await successFactor.run(
        SELECT.from('cust_Turmas').where({
          externalCode: cust_Turma,
        })
      )

      if (classes.length) {
        const custTurmaPayload = {
          __metadata: {
            uri: 'cust_Turmas',
          },
          externalCode: cust_Turma,
        }

        const a = await successFactor.run(
          SELECT.from('cust_ListadePresenca').where({
            cust_Turma: cust_Turma,
          })
        )

        custTurmaPayload.cust_ListaNav = a.map(({ externalCode }) => {
          return {
            __metadata: {
              uri: `/cust_ListadePresenca('${externalCode}')`,
            },
          }
        })

        await executeHttpRequest(
          {
            destinationName: 'SFSF',
          },
          {
            method: 'POST',
            url: '/upsert',
            data: custTurmaPayload,
          }
        )

        const cust_ListadeDiaria = await successFactor.run(
          SELECT.from('cust_listadiaria').where({
            cust_turma: cust_Turma,
          })
        )

        const updateListDiaria = cust_ListadeDiaria.map(({ externalCode }) => {
          return executeHttpRequest(
            {
              destinationName: 'SFSF',
            },
            {
              method: 'POST',
              url: '/upsert',
              data: {
                __metadata: {
                  uri: 'cust_listadiaria',
                },
                externalCode,
                cust_listaNav: classes.map(({ externalCode }) => ({
                  externalCode,
                })),
              },
            }
          )
        })

        await Promise.all(updateListDiaria)
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

  srv.on('READ', 'cust_ListadePresenca', async (req) => {
    const data = await successFactor.run(req.query)

    return data
  })

  srv.on('UPDATE', 'cust_ListadePresenca', async (req) => {
    const { externalCode, ...data } = req.data

    const {
      cust_Turma,
      cust_sequencia,
      cust_Status,
      cust_Aluno,
      cust_startdate,
      cust_enddate,
      cust_nota,
      externalName,
      cust_LMS,
    } = await successFactor.get(`/cust_ListadePresenca('${externalCode}')`)

    const update = {
      cust_Turma,
      cust_sequencia,
      cust_Status,
      cust_Aluno,
      cust_startdate: cust_startdate
        ? cust_startdate.replace(/[+-]\d{4}/g, '')
        : null,
      cust_enddate: cust_enddate
        ? cust_enddate.replace(/[+-]\d{4}/g, '')
        : null,
      cust_nota,
      externalName,
      cust_LMS,
      ...data,
    }

    const payload = {
      __metadata: {
        uri: 'cust_ListadePresenca',
      },
      externalCode: externalCode,
      ...update,
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

      if (response.data.d.cust_nota) {
        response.data.d.cust_nota = Number(response.data.d.cust_nota)
      }

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
    'cust_ListadePresenca',
    async (req) => await successFactor.run(req.query)
  )

  srv.on('CREATE', 'cust_listadiaria', async (req) => {
    const payload = req.data

    const { cust_startdate, cust_enddate, cust_listaNav } = payload

    if (cust_startdate) {
      req.data.cust_startdate = formatDate(cust_startdate)
    }

    if (cust_enddate) {
      req.data.cust_enddate = formatDate(cust_enddate)
    }

    if (cust_listaNav) {
      req.data.cust_listaNav = cust_listaNav.map(({ externalCode }) => {
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
          url: '/cust_listadiaria',
          data: payload,
        }
      )

      const data = {
        ...response.data.d,
        cust_startdate: extractGetTime(response.data.d.cust_startdate),
        cust_enddate: extractGetTime(response.data.d.cust_enddate),
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
    'cust_listadiaria',
    async (req) => await successFactor.run(req.query)
  )

  srv.on('UPDATE', 'cust_listadiaria', async (req) => {
    const {
      externalCode,
      cust_startdate,
      cust_enddate,
      cust_listaNav,
      ...data
    } = req.data

    const payload = {
      __metadata: {
        uri: 'cust_listadiaria',
      },
      externalCode: externalCode,
      ...data,
    }

    if (cust_startdate) {
      payload.cust_startdate = formatDate(cust_startdate)
    }

    if (cust_enddate) {
      payload.cust_enddate = formatDate(cust_enddate)
    }

    if (cust_listaNav) {
      payload.cust_listaNav = cust_listaNav.map(({ externalCode }) => {
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
    'cust_listadiaria',
    async (req) => await successFactor.run(req.query)
  )

  srv.on('CREATE', 'cust_presencalms', async (req) => {
    const payload = req.data

    const {
      externalCode,
      cust_startdate,
      cust_enddate,
      cust_ficha,
      cust_turma,
      cust_segmento,
    } = payload

    if (cust_startdate) {
      req.data.cust_startdate = formatDate(cust_startdate)
    }

    if (cust_enddate) {
      req.data.cust_enddate = formatDate(cust_enddate)
    }

    if (cust_ficha) {
      req.data.cust_FichaNav = {
        __metadata: {
          uri: `/cust_ListadePresenca('${cust_ficha}')`,
        },
      }
    }

    if (cust_segmento) {
      req.data.cust_SegmentoNav = {
        __metadata: {
          uri: `/cust_listadiaria('${cust_segmento}')`,
        },
      }
    }

    if (cust_turma) {
      req.data.cust_TurmaNav = {
        __metadata: {
          uri: `/cust_Turmas('${cust_turma}')`,
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
          url: '/cust_presencalms',
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
          data: {
            __metadata: {
              uri: 'cust_listadiaria',
            },
            externalCode: cust_segmento,
            cust_presencaNav: [
              {
                __metadata: {
                  uri: `/cust_presencalms('${externalCode}')`,
                },
              },
            ],
          },
        }
      )

      delete response.data.d.cust_FichaNav
      delete response.data.d.cust_SegmentoNav
      delete response.data.d.cust_TurmaNav

      const data = {
        ...response.data.d,
        cust_startdate: extractGetTime(response.data.d.cust_startdate),
        cust_enddate: extractGetTime(response.data.d.cust_enddate),
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
    'cust_presencalms',
    async (req) => await successFactor.run(req.query)
  )

  srv.on('UPDATE', 'cust_presencalms', async (req) => {
    const {
      externalCode,
      cust_startdate,
      cust_enddate,
      cust_ficha,
      cust_segmento,
      cust_turma,
      ...data
    } = req.data

    const payload = {
      __metadata: {
        uri: 'cust_presencalms',
      },
      externalCode: externalCode,
      ...data,
    }

    if (cust_startdate) {
      payload.cust_startdate = formatDate(cust_startdate)
    }

    if (cust_enddate) {
      payload.cust_enddate = formatDate(cust_enddate)
    }

    if (cust_ficha) {
      payload.cust_FichaNav = {
        __metadata: {
          uri: `/cust_ListadePresenca('${cust_ficha}')`,
        },
      }
    }

    if (cust_segmento) {
      payload.cust_SegmentoNav = {
        __metadata: {
          uri: `/cust_listadiaria('${cust_segmento}')`,
        },
      }
    }

    if (cust_turma) {
      req.data.cust_TurmaNav = {
        __metadata: {
          uri: `/cust_Turmas('${cust_turma}')`,
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
          url: '/upsert',
          data: payload,
        }
      )

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
    'cust_presencalms',
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
