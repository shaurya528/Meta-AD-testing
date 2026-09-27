import { FetchLeads } from "./FetchLead.js";
import { FlattenField } from "./Flatten.js";
import { leads } from "../Server.js";
const seenLeadIds = new Set();

export const ProcessLeads=async(value,io)=>{
    const id = value.leadgen_id;
    if (!id || seenLeadIds.has(id)) return;
    seenLeadIds.add(id);
   
    const details = await FetchLeads(id);
    const lead = {
        id,
        formId: value.form_id,
        pageId: value.page_id,
        adId: value.ad_id ?? null,
        fields: details ? FlattenField(details.field_data) : {},
      };

    
      leads.unshift(lead);
      if (io) {
        io.emit('new_lead', lead);
        console.log('Lead successfully emitted through socket:', lead.id);
      } else {
        console.warn('Socket.io instance error');
      }
     
}