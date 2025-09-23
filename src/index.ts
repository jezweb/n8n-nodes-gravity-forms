import { GFormsApi } from './nodes/GravityForms/GravityForms.node';
import { GFormsApiTrigger } from './nodes/GravityFormsTrigger/GravityFormsTrigger.node';
import { GFormsApiAuth } from './credentials/GravityFormsApi.credentials';

export const nodes = [GFormsApi, GFormsApiTrigger];
export const credentials = [GFormsApiAuth];
