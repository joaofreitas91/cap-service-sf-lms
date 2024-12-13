using { SFSF } from './external/SFSF';

service SFSFService {
  entity cust_Turmas as projection on SFSF.cust_Turmas {
    *,
    cust_CursosNav: redirected to cust_Cursos,
    cust_Inst1Nav: redirected to cust_Instrutores,
    cust_Inst2Nav: redirected to cust_Instrutores,
    cust_ListaNav: Composition of many SFSF.cust_ListadePresenca
    on cust_ListaNav.externalCode,
    createdByNav: redirected to User,
    lastModifiedByNav: redirected to User,
  };
  entity cust_ListadePresenca as projection on SFSF.cust_ListadePresenca {
    *,
    createdByNav: redirected to User,
    lastModifiedByNav: redirected to User,
    cust_AlunosNav: redirected to cust_Alunos,
  }; 
  entity cust_Cursos as projection on SFSF.cust_Cursos {
    *,
    createdByNav: redirected to User,
    lastModifiedByNav: redirected to User,
  }; 
  entity cust_Alunos as projection on SFSF.cust_Alunos {
    *,
    createdByNav: redirected to User,
    lastModifiedByNav: redirected to User,
  };
  entity cust_Instrutores as projection on SFSF.cust_Instrutores {
    *,
    createdByNav: redirected to User,
    lastModifiedByNav: redirected to User,
  }; 
  entity cust_Locais as projection on SFSF.cust_Locais {
    *,
    createdByNav: redirected to User,
    lastModifiedByNav: redirected to User,
  }; 
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