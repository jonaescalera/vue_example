import i18n from '../i18n'

class Workflow {
    normalize = (item) => {
        let props = item.assetInfo.metadata.props;
        let criteria, first, type = null;
        let tags = i18n.tc('workflow-tags-all');
        let tg = item.triggers[0] || {};
        criteria = tg.criterion;
        if(criteria.length > 0){
            first = criteria[0].properties;
            tags = criteria[1] ? criteria[1].properties.property + ': ' + (criteria[1].properties.valueName || criteria[1].properties.value) : i18n.tc('workflow-tags-all');
            if(first.operation === "IN"){
                type = i18n.tc('workflow-entry');
            }
            else{
                if(first.operation === "NOT_IN"){
                    type = i18n.tc('workflow-exit');
                }
            }
        }
        if(props.subType && props.subType === 'Delivery'){
            type = i18n.tc('workflow-delivery');
        }        
        let notifications = this.convertNotifications(tg);
        notifications = notifications.map(n=>n.value).join(', ');

        return {
            "id": item.id,
            "name": item.value, //-> configValue for PUT
            "enabled": item.assetInfo.enabled,
            "siteId": props.siteId,
            "account": item.account.href,
            "tags": tags,
            "type": type,
            "notify":  notifications,
            "criteria": (first) ? first.property + ': ' + (first.valueName || first.value) : '',
            "createdBy": props.createdBy,
            "createdAt": props.createdAt,
            "updatedBy": props.updatedBy,
            "updatedAt": props.updatedAt
        }
    };

    convertNotifications = (t) => {
        if(!t){
          return []
        }
        let a = t.actions || []
        try{
          return a.map(i=>{
            let p  = i.assetInfo.metadata.props
            return {type: p.type, value: p.value};
          })
        }catch(e){
          console.log(e)
          return []
        }
      }
}

export default Workflow;