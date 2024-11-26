using { SFSF } from './external/SFSF';

service SFSFService  @(path: '/proxy'){
  entity cust_Turmas as projection on SFSF.cust_Turmas {
    *,
    cust_CursosNav: redirected to cust_Cursos,
    cust_Inst1Nav: redirected to cust_Instrutores,
    cust_Inst2Nav: redirected to cust_Instrutores,
    cust_ListaNav: redirected to cust_ListadePresenca,
    createdByNav: redirected to User,
    lastModifiedByNav: redirected to User,
  };
  entity cust_ListadePresenca as projection on SFSF.cust_ListadePresenca {
    *,
    cust_AlunosNav: redirected to cust_Alunos,
  }; 
  entity cust_Cursos as projection on SFSF.cust_Cursos; 
  entity cust_Alunos as projection on SFSF.cust_Alunos;
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