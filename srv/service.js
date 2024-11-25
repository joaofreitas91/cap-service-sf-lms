const cds = require('@sap/cds')

module.exports = async (srv) => {
  const successFactor = await cds.connect.to('SFSF')

  srv.on(
    'READ',
    'cust_Turmas',
    async (req) => await successFactor.run(req.query)
  )
}
