import { ProcessLeads } from "../Services/ProcessLead.js";

export const WebhookGet=  (req,res)=>{
    const Mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log(Mode);
    console.log(token);
    console.log(challenge)
    try{
        if(Mode=='subscribe' && token == process.env.VERIFY_TOKEN){
            res.status(200).send(challenge);
        }else{
            res.status(400).send('challenge failed');
           
        }
    }catch(err){
        console.error(err)
        res.status(500).send('Server Error');
    }
}

 export const WebhookPost=(req,res)=>{
    res.status(200).send('EVENT_RECEIVED');
 
  const body = req.body;
  console.log(' Webhook event revieved');
  console.log(JSON.stringify(body, null, 2));
 
  if (body.object !== 'page') return;
  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field === 'leadgen') {
        ProcessLeads(change.value,req.io)
      }
    }
}
}