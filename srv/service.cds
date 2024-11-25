using { SFSF } from './external/SFSF';

service MyService @(path: '/proxy'){
  entity cust_Turmas as projection on SFSF.cust_Turmas {
    externalCode,
    lastModifiedDateTime,
    cust_INST_ID2,
    cust_END_TME,
    cust_INST_ID1,
    cust_LOCN_ID1,
    lastModifiedBy,
    createdDateTime,
    mdfSystemRecordStatus,
    cust_LOCN_DESC,
    cust_ACT_CPNT_ID,
    cust_SSG_SEG_NUM,
    cust_START_TME,
    cust_Status,
    createdBy,
    cust_CPNT_TYP_ID,
    cust_NOTACTIVE,
    externalName,
    cust_LMS,
    createdByNav: redirected to User,
    lastModifiedByNav: redirected to User,
  };
  entity cust_Cursos as projection on SFSF.cust_Cursos; 
  entity cust_Alunos as projection on SFSF.cust_Alunos;
  entity cust_ListadePresenca as projection on SFSF.cust_ListadePresenca; 
  entity cust_Instrutores as projection on SFSF.cust_Instrutores; 
  entity User as projection on SFSF.User{
    userId,
    firstName,
    displayName,
    email,
    lastName,
    username,
    assignmentUUID
  }; 
};