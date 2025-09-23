import { GravityForms } from './nodes/GravityForms/GravityForms.node';
import { GravityFormsTrigger } from './nodes/GravityFormsTrigger/GravityFormsTrigger.node';
import { GravityFormsApi } from './credentials/GravityFormsApi.credentials';

export const nodes = [GravityForms, GravityFormsTrigger];
export const credentials = [GravityFormsApi];
