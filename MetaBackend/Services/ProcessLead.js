import { FetchLeads } from "./FetchLead.js";
import { FlattenField } from "./Flatten.js";
const leads = [];
const seenLeadIds = new Set();

export const ProcessLeads=async(value)=>{
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
     
}