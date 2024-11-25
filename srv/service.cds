using { SFSF } from './external/SFSF';

service MyService @(path: '/proxy'){
  entity cust_Turmas as projection on SFSF.cust_Turmas; 
};