using { SFSF } from './external/SFSF';

service SFSFService {
  entity cust_Turmas as projection on SFSF.cust_Turmas {
    *,
    cust_CursosNav: redirected to cust_Cursos,
    cust_Inst1Nav: redirected to cust_Instrutores,
    cust_Inst2Nav: redirected to cust_Instrutores,
    cust_SegmentoNav: Composition of many SFSF.cust_listadiaria
    on cust_SegmentoNav.externalCode,
    cust_ListaNav: Composition of many SFSF.cust_ListadePresenca
    on cust_ListaNav.externalCode,
    createdByNav: redirected to User,
    lastModifiedByNav: redirected to User,
  };
  entity cust_ListadePresenca as projection on SFSF.cust_ListadePresenca {
    *,
    cust_nota: String,
    cust_SegmentoNav: Composition of many SFSF.cust_listadiaria
    on cust_SegmentoNav.externalCode,
    createdByNav: redirected to User,
    lastModifiedByNav: redirected to User,
    cust_AlunosNav: redirected to cust_Alunos,
    cust_TurmaNav: redirected to cust_Turmas,
  };
  entity cust_listadiaria as projection on SFSF.cust_listadiaria {
    *,
    cust_listaNav: Composition of many SFSF.cust_ListadePresenca
    on cust_listaNav.externalCode,
    cust_presencaNav: Composition of many SFSF.cust_presencalms
    on cust_presencaNav.externalCode,
    cust_turmanav: redirected to cust_Turmas,
    createdByNav: redirected to User,
    lastModifiedByNav: redirected to User,
  };
  entity cust_presencalms as projection on SFSF.cust_presencalms {
    *,
    cust_FichaNav: redirected to cust_ListadePresenca,
    cust_SegmentoNav: redirected to cust_listadiaria,
    cust_TurmaNav: redirected to cust_Turmas,
    createdByNav: redirected to User,
    lastModifiedByNav: redirected to User,
  }
  entity cust_Cursos as projection on SFSF.cust_Cursos {
    *,
    cust_InstrutorNav: redirected to cust_Instrutores,
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