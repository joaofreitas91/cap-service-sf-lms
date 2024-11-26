const cds = require('@sap/cds')

module.exports = async (srv) => {
  const successFactor = await cds.connect.to('SFSF')

  srv.on(
    'READ',
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
    'READ',
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
    'User',
    async (req) => await successFactor.run(req.query)
  )
}
