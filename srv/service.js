const cds = require('@sap/cds')

module.exports = async (srv) => {
  const successFactor = await cds.connect.to('SFSF')
  srv.on(
    'CREATE',
    'cust_Turmas',
    async (req) => {
      console.log(req.data)
      return await successFactor.post(`/cust_Turmas`, req.data)
    }
  )

  srv.on(
    'READ',
    'cust_Turmas',
    async (req) => await successFactor.run(req.query)
  )

  srv.on('UPDATE', 'cust_Turmas', async (req) => {
    console.log(req.data)
    
    const { externalCode, ...data } = req.data
    await successFactor.put(`/cust_Turmas('${externalCode}')`, data)
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

  srv.on(
    'CREATE',
    'cust_ListadePresenca',
    async (req) => await successFactor.run(req.query)
  )

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
